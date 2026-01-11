import mongoose, { Document, Schema } from "mongoose";

export interface IPurchase extends Document {
    serviceId: mongoose.Types.ObjectId;
    buyerWallet: string;
    sellerWallet: string;
    txHash: string;
    blockNumber: string;
    chainId: number;
    createdAt: Date;
}

const PurchaseSchema: Schema = new Schema(
    {
        serviceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Service",
            required: true,
            index: true,
        },
        buyerWallet: {
            type: String,
            required: true,
            index: true,
        },
        sellerWallet: {
            type: String,
            required: true,
        },
        txHash: {
            type: String,
            required: true,
            unique: true,
        },
        blockNumber: {
            type: String,
            required: true,
        },
        chainId: {
            type: Number,
            required: true,
            default: 8453, // Base mainnet
        },
    },
    {
        timestamps: true,
    }
);

export const Purchase = mongoose.model<IPurchase>("Purchase", PurchaseSchema);
