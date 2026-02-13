import { Router } from "express";
import { ComplaintController } from "../controllers/complaint.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/upload.middleware";

const router = Router();
const controller = new ComplaintController();

router.post("/", authenticate, upload.single("image"), controller.create.bind(controller));
router.get("/", authenticate, controller.list.bind(controller));
router.get("/:id", authenticate, controller.getById.bind(controller));
router.put("/:id", authenticate, upload.single("image"), controller.update.bind(controller));
router.delete("/:id", authenticate, controller.remove.bind(controller));

export default router;
