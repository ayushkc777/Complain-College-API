import { Router } from "express";
import { AdminUserController } from "../controllers/admin-user.controller";
import { authenticate, requireAdmin } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/upload.middleware";

const router = Router();
const controller = new AdminUserController();

router.post("/", authenticate, requireAdmin, upload.single("image"), controller.create.bind(controller));
router.get("/", authenticate, requireAdmin, controller.list.bind(controller));
router.get("/:id", authenticate, requireAdmin, controller.getById.bind(controller));
router.put("/:id", authenticate, requireAdmin, upload.single("image"), controller.update.bind(controller));
router.delete("/:id", authenticate, requireAdmin, controller.remove.bind(controller));

export default router;
