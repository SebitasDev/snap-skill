import { Request, Response } from "express";
import { Service } from "../models/service.model";
import cloudinary from "../config/cloudinary";
import { isEvmAddress } from "../utils/address";

interface CreateServiceBody {
  title: string;
  category: string;
  price: string;
  deliveryTime: string;
  revisions: string;
  description: string;
  walletAddress: string;
  includes: string;
}

export const createService = async (
  req: Request<{}, {}, CreateServiceBody>,
  res: Response
) => {
  try {
    const {
      title,
      category,
      price,
      deliveryTime,
      revisions,
      description,
      walletAddress,
      includes: includesJson,
    } = req.body;

    if (!walletAddress || !isEvmAddress(walletAddress)) {
      return res.status(400).json({
        message: "Invalid or missing walletAddress",
      });
    }

    if (!title || title.length < 5) {
      return res.status(400).json({
        message: "Title must be at least 5 characters",
      });
    }

    if (!category) {
      return res.status(400).json({
        message: "Category is required",
      });
    }

    if (!revisions) {
      return res.status(400).json({
        message: "Revisions field is required",
      });
    }

    const parsedPrice = Number(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({
        message: "Invalid price: must be a positive number",
      });
    }

    if (!deliveryTime) {
      return res.status(400).json({
        message: "Delivery time is required",
      });
    }

    if (!description || description.length < 100) {
      return res.status(400).json({
        message: "Description too short (minimum 100 characters)",
      });
    }

    let includes: string[] = [];
    try {
      const parsedIncludes = JSON.parse(includesJson);
      if (!Array.isArray(parsedIncludes) || parsedIncludes.length === 0) {
        return res.status(400).json({
          message: "At least one 'include' is required and must be an array",
        });
      }
      includes = parsedIncludes;
    } catch (e) {
      return res
        .status(400)
        .json({ message: "Invalid JSON format for 'includes'" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Image file is required" });
    }

    const uploadedImage = await cloudinary.uploader.upload(req.file.path, {
      folder: "services",
    });

    const service = await Service.create({
      title,
      category,
      price: parsedPrice,
      deliveryTime,
      revisions,
      description,
      walletAddress,
      includes,
      imageUrl: uploadedImage.secure_url,
      imagePublicId: uploadedImage.public_id,
    });

    return res.status(201).json({
      message: "Service created successfully",
      service,
    });
  } catch (error) {
    console.error("ERROR CREATE SERVICE:", error);
    return res.status(500).json({ message: "Server error", details: error });
  }
};

export const getServices = async (req: Request, res: Response) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    return res.status(200).json({ services });
  } catch (error) {
    console.error("ERROR GET SERVICES:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

export const getServiceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const service = await Service.findById(id);

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    return res.status(200).json({ service });
  } catch (error) {
    console.error("ERROR GET SERVICE BY ID:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};
