import { Router } from "express";
import { upload } from "../middleware/upload.middleware";
import {
  createService,
  getServices,
  getServiceById,
} from "../controllers/service.controller";

const router = Router();

router.post("/", upload.single("imageFile"), createService);
router.get("/", getServices);
router.get("/:id", getServiceById);
export default router;
