import express, { Application, Request, Response } from "express";
import bodyParser from "body-parser";
import authRoutes from "./routes/auth.route";
import adminUserRoutes from "./routes/admin-user.route";
import complaintRoutes from "./routes/complaint.route";

export function createApp(): Application {
  const app: Application = express();

  app.use((req: Request, res: Response, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use("/uploads", express.static("uploads"));

  app.use("/api/auth", authRoutes);
  app.use("/api/admin/users", adminUserRoutes);
  app.use("/api/complaints", complaintRoutes);

  app.get("/", (_req: Request, res: Response) => {
    return res.status(200).json({ success: "true", message: "Welcome to the API" });
  });

  return app;
}
