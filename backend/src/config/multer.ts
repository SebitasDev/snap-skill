import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary";

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        return {
            folder: "profiles",
            allowed_formats: ["jpg", "png", "jpeg"],
        };
    },
});

const upload = multer({ storage: storage });

export default upload;
