import { Request, Response } from "express";
import { Profile } from "../models/profile.model";
import { Purchase } from "../models/purchase.model";
import { Service } from "../models/service.model";
import { Review } from "../models/review.model";
import cloudinary from "../config/cloudinary";
import { isEvmAddress } from "../utils/address";

interface CreateProfileBody {
    name: string;
    bio: string;
    skills: string; // JSON string array
    walletAddress: string;
    whatsapp?: string;
    telegram?: string;
}

export const createUpdateProfile = async (
    req: Request<{}, {}, CreateProfileBody>,
    res: Response
) => {
    try {
        console.log("Headers:", req.headers);
        console.log("Body:", req.body);
        console.log("File:", req.file);

        const body = req.body || {};
        const { name, bio, skills, walletAddress, whatsapp, telegram } = body;

        if (!walletAddress) {
            return res.status(400).json({ message: "Wallet address is required" });
        }

        if (!name || !bio) {
            return res.status(400).json({ message: "Name and Bio are required" });
        }

        if ((!whatsapp || whatsapp.trim() === "") && (!telegram || telegram.trim() === "")) {
            return res.status(400).json({ message: "You must provide at least one contact method (WhatsApp or Telegram)" });
        }

        let parsedSkills: string[] = [];
        try {
            parsedSkills = JSON.parse(skills);
        } catch (e) {
            parsedSkills = [];
        }

        let imageUrl = "";
        let imagePublicId = "";

        const existingProfile = await Profile.findOne({ walletAddress });

        if (req.file) {
            // Upload new image
            const uploadedImage = await cloudinary.uploader.upload(req.file.path, {
                folder: "profiles",
            });
            imageUrl = uploadedImage.secure_url;
            imagePublicId = uploadedImage.public_id;
        } else {
            if (existingProfile) {
                imageUrl = existingProfile.imageUrl;
                imagePublicId = existingProfile.imagePublicId;
            } else {
                return res.status(400).json({ message: "Image is required for new profile" });
            }
        }

        const profileData = {
            walletAddress,
            name,
            bio,
            skills: parsedSkills,
            imageUrl,
            imagePublicId,
            whatsapp,
            telegram
        };

        const profile = await Profile.findOneAndUpdate(
            { walletAddress },
            profileData,
            { new: true, upsert: true }
        );

        return res.status(200).json({
            message: "Profile saved successfully",
            profile,
        });

    } catch (error) {
        console.error("ERROR CREATE/UPDATE PROFILE:", error);
        return res.status(500).json({ message: "Server error", error });
    }
};

export const getProfile = async (req: Request, res: Response) => {
    try {
        const { walletAddress } = req.params;

        const profile = await Profile.findOne({ walletAddress });

        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }

        return res.status(200).json({ profile });

    } catch (error) {
        console.error("ERROR GET PROFILE:", error);
        return res.status(500).json({ message: "Server error", error });
    }
};

export const getProfileStats = async (req: Request, res: Response) => {
    try {
        const { walletAddress } = req.params;

        // 1. Calculate Total Earnings & Sales by Category & Unique Clients
        // Find purchases where this user is the seller
        const purchases = await Purchase.find({ sellerWallet: walletAddress });

        let totalEarnings = 0;
        const serviceSalesCount: Record<string, number> = {};
        const uniqueClients = new Set<string>();
        const salesByCategory: Record<string, number> = {};

        // To get price and category, we need to look up the services
        const sales = await Purchase.aggregate([
            { $match: { sellerWallet: walletAddress } },
            {
                $lookup: {
                    from: "services",
                    localField: "serviceId",
                    foreignField: "_id",
                    as: "service"
                }
            },
            { $unwind: "$service" },
            { $sort: { createdAt: -1 } } // Sort by newest for recent sales
        ]);

        const recentSales = sales.slice(0, 5).map(sale => ({
            _id: sale._id,
            serviceTitle: sale.service.title,
            price: sale.service.price,
            buyerWallet: sale.buyerWallet,
            createdAt: sale.createdAt
        }));

        sales.forEach(sale => {
            // Earnings
            totalEarnings += (sale.service.price || 0);

            // Most Purchased Service
            const title = sale.service.title;
            serviceSalesCount[title] = (serviceSalesCount[title] || 0) + 1;

            // Unique Clients
            if (sale.buyerWallet) {
                uniqueClients.add(sale.buyerWallet);
            }

            // Sales by Category
            const category = sale.service.category || "Uncategorized";
            salesByCategory[category] = (salesByCategory[category] || 0) + 1;
        });

        const totalUniqueClients = uniqueClients.size;


        let mostPurchasedService = "None";
        let maxSales = 0;

        for (const [title, count] of Object.entries(serviceSalesCount)) {
            if (count > maxSales) {
                maxSales = count;
                mostPurchasedService = title;
            }
        }

        // 3. Fetch Last 3 Reviews (across all services owned by this wallet)
        // First find all services by this wallet
        const myServices = await Service.find({ walletAddress }).select("_id");
        const myServiceIds = myServices.map(s => s._id);

        const recentReviews = await Review.find({ serviceId: { $in: myServiceIds } })
            .sort({ createdAt: -1 })
            .limit(3)
            .populate("serviceId", "title");

        // 4. Calculate Average Rating
        const allReviews = await Review.find({ serviceId: { $in: myServiceIds } });
        const totalRating = allReviews.reduce((acc, r) => acc + r.rating, 0);
        const averageRating = allReviews.length > 0 ? (totalRating / allReviews.length).toFixed(1) : "0";

        return res.status(200).json({
            stats: {
                totalEarnings,
                mostPurchasedService,
                averageRating: Number(averageRating),
                totalReviews: allReviews.length,
                recentReviews,
                totalUniqueClients,
                recentSales,
                salesByCategory
            }
        });

    } catch (error) {
        console.error("ERROR GET PROFILE STATS:", error);
        return res.status(500).json({ message: "Server error", error });
    }
};


