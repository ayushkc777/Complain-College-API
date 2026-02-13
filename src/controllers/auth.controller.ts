import { UserService } from "../services/user.service";
import {
    CreateUserDTO,
    ForgotPasswordDTO,
    LoginUserDTO,
    ResetPasswordDTO,
    UpdateUserDTO
} from "../dtos/user.dto";
import { Request, Response } from "express";
import z from "zod";
let userService = new UserService();
export class AuthController {
    async register(req: Request, res: Response) {
        try {
            const parsedData = CreateUserDTO.safeParse(req.body); // validate request body
            if (!parsedData.success) { // validation failed
                return res.status(400).json(
                    { success: false, message: z.prettifyError(parsedData.error) }
                )
            }
            const userData: CreateUserDTO = parsedData.data;
            const newUser = await userService.createUser(userData);
            return res.status(201).json(
                { success: true, message: "User Created", data: newUser }
            );
        } catch (error: Error | any) { // exception handling
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }

    async login(req: Request, res: Response) {
        try {
            const parsedData = LoginUserDTO.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json(
                    { success: false, message: z.prettifyError(parsedData.error) }
                )
            }
            const loginData: LoginUserDTO = parsedData.data;
            const { token, user } = await userService.loginUser(loginData);
            return res.status(200).json(
                { success: true, message: "Login successful", data: user, token }
            );

        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }

    async update(req: Request, res: Response) {
        try {
            const authUser = (req as any).user;
            if (authUser?.id !== req.params.id && authUser?.role !== "admin") {
                return res.status(403).json({ success: false, message: "Forbidden" });
            }
            const image = req.file ? `/uploads/${req.file.filename}` : undefined;
            const payload = { ...req.body, image };
            delete (payload as any).role;
            const parsedData = UpdateUserDTO.safeParse(payload);
            if (!parsedData.success) {
                return res.status(400).json(
                    { success: false, message: z.prettifyError(parsedData.error) }
                )
            }
            const updated = await userService.updateUser(req.params.id, parsedData.data);
            return res.status(200).json(
                { success: true, message: "User Updated", data: updated }
            );
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }

    async forgotPassword(req: Request, res: Response) {
        try {
            const parsedData = ForgotPasswordDTO.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json(
                    { success: false, message: z.prettifyError(parsedData.error) }
                );
            }

            const result = await userService.forgotPassword(parsedData.data.email);
            return res.status(200).json({
                success: true,
                message: result.message,
                data: process.env.NODE_ENV !== "production" ? { token: result.token } : undefined,
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }

    async resetPassword(req: Request, res: Response) {
        try {
            const parsedData = ResetPasswordDTO.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json(
                    { success: false, message: z.prettifyError(parsedData.error) }
                );
            }

            const result = await userService.resetPassword(
                parsedData.data.token,
                parsedData.data.password
            );
            return res.status(200).json({
                success: true,
                message: result.message,
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }
}
