import mongoose, { Document, Schema } from "mongoose";

export interface IProfile extends Document {
    walletAddress: string;
    name: string;
    bio: string;
    skills: string[];
    imageUrl: string;
    imagePublicId: string;
    whatsapp?: string;
    telegram?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ProfileSchema: Schema = new Schema(
    {
        walletAddress: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        bio: {
            type: String,
            required: true,
        },
        skills: {
            type: [String],
            default: [],
        },
        imageUrl: {
            type: String,
            required: true,
        },
        imagePublicId: {
            type: String,
            required: true,
        },
        whatsapp: {
            type: String,
            required: false,
        },
        telegram: {
            type: String,
            required: false,
        },
    },
    {
        timestamps: true,
    }
);

export const Profile = mongoose.model<IProfile>("Profile", ProfileSchema);
