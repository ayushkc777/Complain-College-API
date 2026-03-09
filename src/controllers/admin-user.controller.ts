import { Request, Response } from "express";
import { AdminCreateUserDTO, PaginationQueryDTO, UpdateUserDTO } from "../dtos/user.dto";
import { UserService } from "../services/user.service";
import z from "zod";

const userService = new UserService();

export class AdminUserController {
  async create(req: Request, res: Response) {
    try {
      const image = req.file ? `/uploads/${req.file.filename}` : undefined;
      const payload = { ...req.body, image };
      const parsed = AdminCreateUserDTO.safeParse(payload);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ success: false, message: z.prettifyError(parsed.error) });
      }
      const newUser = await userService.createUserByAdmin(parsed.data);
      return res
        .status(201)
        .json({ success: true, message: "User Created", data: newUser });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const parsedQuery = PaginationQueryDTO.safeParse(req.query);
      if (!parsedQuery.success) {
        return res
          .status(400)
          .json({ success: false, message: z.prettifyError(parsedQuery.error) });
      }

      const { page, limit } = parsedQuery.data;
      const result = await userService.getAllUsers(page, limit);
      return res.status(200).json({
        success: true,
        data: result.users,
        pagination: result.pagination,
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const user = await userService.getUserById(req.params.id);
      return res.status(200).json({ success: true, data: user });
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
      const parsed = UpdateUserDTO.safeParse(payload);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ success: false, message: z.prettifyError(parsed.error) });
      }
      const updated = await userService.updateUser(req.params.id, parsed.data, {
        isAdmin: true,
      });
      return res
        .status(200)
        .json({ success: true, message: "User Updated", data: updated });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async remove(req: Request, res: Response) {
    try {
      await userService.deleteUser(req.params.id);
      return res
        .status(200)
        .json({ success: true, message: "User Deleted" });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
