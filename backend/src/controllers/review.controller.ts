import { Request, Response } from "express";
import { Review } from "../models/review.model";
import { Service } from "../models/service.model";
import { Purchase } from "../models/purchase.model";
import mongoose from "mongoose";

// Add a Review
export const addReview = async (req: Request, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { serviceId, reviewerWallet, rating, comment } = req.body;

        if (!serviceId || !reviewerWallet || !rating || !comment) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // 1. Check if Purchased
        const purchase = await Purchase.findOne({ serviceId, buyerWallet: reviewerWallet });
        if (!purchase) {
            await session.abortTransaction();
            session.endSession();
            return res.status(403).json({ message: "You must purchase this service to review it." });
        }

        // 2. Check for Duplicate Review
        const existingReview = await Review.findOne({ serviceId, reviewerWallet });
        if (existingReview) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: "You have already reviewed this service." });
        }

        // 3. Create Review
        const review = await Review.create([{
            serviceId,
            reviewerWallet,
            rating,
            comment
        }], { session });

        // 4. Update Service Stats
        // Recalculate average
        const stats = await Review.aggregate([
            { $match: { serviceId: new mongoose.Types.ObjectId(serviceId) } }, // Match all reviews including new one (BUT creating in txn might hide it from agg? Let's assume consistent read or manual math)
        ]).session(session);

        // Aggregation inside transaction usually works on committed data or current session data if passed properly, 
        // but sometimes it's complex with Mongo versions. 
        // Simpler approach for consistent stats: Get current stats, add new rating, update.

        // Actually, let's just use the current service data + new review for simple math updates.
        const service = await Service.findById(serviceId).session(session);
        if (!service) throw new Error("Service not found");

        const currentTotal = service.get("totalReviews") || 0;
        const currentAvg = service.get("averageRating") || 0;

        const newTotal = currentTotal + 1;
        // New Avg = ((Old Avg * Old Total) + New Rating) / New Total
        const newAvg = ((currentAvg * currentTotal) + rating) / newTotal;

        await Service.findByIdAndUpdate(serviceId, {
            averageRating: newAvg,
            totalReviews: newTotal
        }, { session });

        await session.commitTransaction();
        session.endSession();

        return res.status(201).json({ message: "Review added successfully", review: review[0] });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Error adding review:", error);
        return res.status(500).json({ message: "Server error", error });
    }
};

// Get Reviews
export const getReviews = async (req: Request, res: Response) => {
    try {
        const { serviceId } = req.params;

        // Use aggregation to join with profiles collection
        const reviews = await Review.aggregate([
            { $match: { serviceId: new mongoose.Types.ObjectId(serviceId) } },
            { $sort: { createdAt: -1 } },
            {
                $lookup: {
                    from: "profiles", // Ensure this matches your collection name in MongoDB (usually lowercase plural of model name)
                    localField: "reviewerWallet",
                    foreignField: "walletAddress",
                    as: "reviewerProfile"
                }
            },
            {
                $unwind: {
                    path: "$reviewerProfile",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 1,
                    rating: 1,
                    comment: 1,
                    createdAt: 1,
                    reviewerWallet: 1,
                    "reviewerProfile.name": 1,
                    "reviewerProfile.imageUrl": 1
                }
            }
        ]);

        return res.status(200).json({ reviews });
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return res.status(500).json({ message: "Server error", error });
    }
};
