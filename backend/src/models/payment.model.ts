import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
  userAddress: { type: String, required: true },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    required: true,
  },
  txHash: { type: String, unique: true, required: true },
  amount: { type: Number, required: true },
  receiver: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "success", "failed"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Payment", PaymentSchema);
