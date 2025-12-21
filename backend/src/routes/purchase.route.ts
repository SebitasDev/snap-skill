import express from "express";
import { createPurchase, checkPurchaseStatus } from "../controllers/purchase.controller";

const router = express.Router();

router.post("/", createPurchase);
// router.get("/status/:serviceId/:buyerWallet", checkPurchaseStatus);

export default router;
