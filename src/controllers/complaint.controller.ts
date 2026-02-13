import { Request, Response } from "express";
import z from "zod";
import { CreateComplaintDTO, UpdateComplaintDTO } from "../dtos/complaint.dto";
import { ComplaintService } from "../services/complaint.service";

const service = new ComplaintService();

export class ComplaintController {
  async create(req: Request, res: Response) {
    try {
      const image = req.file ? `/uploads/${req.file.filename}` : undefined;
      const payload = { ...req.body, image, userId: (req as any).user?.id };
      const parsed = CreateComplaintDTO.safeParse(payload);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ success: false, message: z.prettifyError(parsed.error) });
      }
      const complaint = await service.create(parsed.data);
      return res
        .status(201)
        .json({ success: true, message: "Complaint submitted", data: complaint });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async list(_req: Request, res: Response) {
    try {
      const complaints = await service.list();
      return res.status(200).json({ success: true, data: complaints });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const complaint = await service.getById(req.params.id);
      return res.status(200).json({ success: true, data: complaint });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const image = req.file ? `/uploads/${req.file.filename}` : undefined;
      const payload = { ...req.body, image };
      const parsed = UpdateComplaintDTO.safeParse(payload);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ success: false, message: z.prettifyError(parsed.error) });
      }
      const updated = await service.update(req.params.id, parsed.data);
      return res
        .status(200)
        .json({ success: true, message: "Complaint updated", data: updated });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async remove(req: Request, res: Response) {
    try {
      await service.remove(req.params.id);
      return res
        .status(200)
        .json({ success: true, message: "Complaint deleted" });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
