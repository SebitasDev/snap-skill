import { Request, Response } from "express";
import {
  refreshTransfers,
  getCachedTransfersForRelationship,
} from "../utils/refreshTransfers";
import { Purchase } from "../models/purchase.model";

// Get cached transfers for a buyer-seller relationship (instant)
export const getTransfers = async (req: Request, res: Response) => {
  try {
    const { buyerWallet, sellerWallet } = req.params;

    if (!buyerWallet || !sellerWallet) {
      return res.status(400).json({ message: "Missing wallet addresses" });
    }

    const result = await getCachedTransfersForRelationship(
      buyerWallet.toLowerCase(),
      sellerWallet.toLowerCase()
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching transfers:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

// Refresh transfers from the blockchain (may be slow)
export const refreshTransfersEndpoint = async (req: Request, res: Response) => {
  try {
    const { buyerWallet, sellerWallet } = req.params;

    if (!buyerWallet || !sellerWallet) {
      return res.status(400).json({ message: "Missing wallet addresses" });
    }

    const result = await refreshTransfers(buyerWallet.toLowerCase(), sellerWallet.toLowerCase());

    if (result.error) {
      return res.status(200).json({
        ...result,
        warning: result.error,
      });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error refreshing transfers:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

// Get on-site purchases for a buyer-seller relationship
export const getPurchases = async (req: Request, res: Response) => {
  try {
    const { buyerWallet, sellerWallet } = req.params;

    if (!buyerWallet || !sellerWallet) {
      return res.status(400).json({ message: "Missing wallet addresses" });
    }

    const purchases = await Purchase.find({
      buyerWallet: buyerWallet.toLowerCase(),
      sellerWallet: sellerWallet.toLowerCase(),
    })
      .populate("serviceId", "title imageUrl price")
      .sort({ createdAt: -1 });

    return res.status(200).json({ purchases });
  } catch (error) {
    console.error("Error fetching purchases:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

// Get all sellers a buyer has worked with
export const getBuyerRelationships = async (req: Request, res: Response) => {
  try {
    const { buyerWallet } = req.params;

    if (!buyerWallet) {
      return res.status(400).json({ message: "Missing buyer wallet" });
    }

    // Get unique sellers from purchases
    const sellerWallets = await Purchase.find({
      buyerWallet: buyerWallet.toLowerCase(),
    }).distinct("sellerWallet");

    return res.status(200).json({ sellers: sellerWallets });
  } catch (error) {
    console.error("Error fetching buyer relationships:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

