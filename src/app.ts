import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.route";
import adminUserRoutes from "./routes/admin-user.route";
import complaintRoutes from "./routes/complaint.route";
import mobileCompatRoutes from "./routes/mobile-compat.route";
import { ALLOWED_ORIGINS, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS } from "./config";

export function createApp(): Application {
  const app: Application = express();

  app.use(
    helmet({
      // Allow frontend app on a different origin/port to render /uploads images.
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || ALLOWED_ORIGINS.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
    })
  );
  app.use(
    rateLimit({
      windowMs: RATE_LIMIT_WINDOW_MS,
      max: RATE_LIMIT_MAX,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true, limit: "2mb" }));
  app.use(cookieParser());
  app.use("/uploads", express.static("uploads"));

  app.use("/api/auth", authRoutes);
  app.use("/api/admin/users", adminUserRoutes);
  app.use("/api/complaints", complaintRoutes);
  app.use("/api/v1", mobileCompatRoutes);

  app.get("/", (_req: Request, res: Response) => {
    return res.status(200).json({ success: "true", message: "Welcome to the API" });
  });
  app.get("/health", (_req: Request, res: Response) => {
    return res.status(200).json({
      success: true,
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  });

  return app;
}
