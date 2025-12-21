import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: "uploads",
      resource_type: "auto",
    } as {
      folder: string;
      resource_type: "auto";
    };
  },
});

export const upload = multer({ storage });
