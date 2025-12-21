import express from "express";
import {
    createUpdateProfile,
    getProfile,
} from "../controllers/profile.controller";
import upload from "../config/multer";

const router = express.Router();

router.post("/", upload.single("image"), createUpdateProfile);
router.put("/", upload.single("image"), createUpdateProfile);
router.get("/:walletAddress", getProfile);

export default router;
