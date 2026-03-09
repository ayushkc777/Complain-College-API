import { Router, Request, Response } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/upload.middleware";
import { UserService } from "../services/user.service";

const router = Router();
const userService = new UserService();

const MOBILE_BATCHES = [
  { _id: "697c386aefc41580fa63f74c", batchName: "35A", status: "active" },
  { _id: "697c386aefc41580fa63f74d", batchName: "35B", status: "active" },
  { _id: "697c386aefc41580fa63f74e", batchName: "36A", status: "active" },
  { _id: "697c386aefc41580fa63f74f", batchName: "36B", status: "active" },
];

router.get("/batches", (_req: Request, res: Response) => {
  return res.status(200).json({ success: true, data: MOBILE_BATCHES });
});

router.post("/students", async (req: Request, res: Response) => {
  try {
    const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please provide an email and password" });
    }

    const [firstName, ...rest] = name.split(/\s+/).filter(Boolean);
    const lastName = rest.join(" ");
    const usernameFromEmail = email.split("@")[0];

    const created = await userService.createUser({
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      email,
      username:
        typeof req.body?.username === "string" && req.body.username.trim()
          ? req.body.username.trim()
          : usernameFromEmail,
      password,
      confirmPassword:
        typeof req.body?.confirmPassword === "string" && req.body.confirmPassword
          ? req.body.confirmPassword
          : password,
    });

    return res.status(201).json({ success: true, data: created });
  } catch (error: Error | any) {
    return res.status(error.statusCode ?? 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
});

router.post("/students/login", async (req: Request, res: Response) => {
  try {
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please provide an email and password" });
    }

    const { token, user } = await userService.loginUser({ email, password });
    return res.status(200).json({ success: true, token, data: user });
  } catch (error: Error | any) {
    return res.status(error.statusCode ?? 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
});

router.post(
  "/items/upload-photo",
  authenticate,
  upload.single("itemPhoto"),
  (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please upload a photo file" });
    }

    const fileName = req.file.filename;
    const url = `/uploads/${fileName}`;
    const absoluteUrl = `${req.protocol}://${req.get("host")}${url}`;

    return res.status(200).json({
      success: true,
      message: "Item photo uploaded successfully",
      fileName: absoluteUrl,
      url,
      data: {
        fileName: absoluteUrl,
        url: absoluteUrl,
      },
    });
  }
);

export default router;
