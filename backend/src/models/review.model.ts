import mongoose, { Document, Schema } from "mongoose";

export interface IReview extends Document {
    serviceId: mongoose.Types.ObjectId;
    reviewerWallet: string;
    rating: number;
    comment: string;
    createdAt: Date;
}

const ReviewSchema: Schema = new Schema(
    {
        serviceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Service",
            required: true,
            index: true,
        },
        reviewerWallet: {
            type: String,
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            required: true,
            minlength: 10,
        },
    },
    {
        timestamps: true,
    }
);

// Ensure a user can only review a service once
ReviewSchema.index({ serviceId: 1, reviewerWallet: 1 }, { unique: true });

// Optimize fetching reviews for a service (filter by serviceId, sort by createdAt)
ReviewSchema.index({ serviceId: 1, createdAt: -1 });

export const Review = mongoose.model<IReview>("Review", ReviewSchema);
