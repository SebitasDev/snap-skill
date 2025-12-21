import { Request, Response } from "express";
import { Profile } from "../models/profile.model";
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
