import { Schema, model } from "mongoose";

const ServiceSchema = new Schema(
  {
    title: { type: String, required: true },
    walletAddress: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    paymentCurrency: { type: String, default: "USDC" },
    deliveryTime: { type: String, required: true },
    revisions: { type: String, required: true },
    description: { type: String, required: true },
    includes: {
      type: [String],
      validate: [
        (arr: string | any[]) => arr.length > 0,
        "Includes must have at least 1 item",
      ],
      default: [],
    },
    imageUrl: { type: String, required: true },
    imagePublicId: { type: String, required: true },
  },
  { timestamps: true }
);

export const Service = model("Service", ServiceSchema);
