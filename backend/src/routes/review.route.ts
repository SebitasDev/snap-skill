import express from "express";
import { addReview, getReviews } from "../controllers/review.controller";

const router = express.Router();

router.post("/", addReview);
router.get("/:serviceId", getReviews);

export default router;
