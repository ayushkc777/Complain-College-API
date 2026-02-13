import { AdminCreateUserDTO, CreateUserDTO, LoginUserDTO, UpdateUserDTO } from "../dtos/user.dto";
import { UserRepository } from "../repositories/user.repository";
import  bcryptjs from "bcryptjs"
import { HttpError } from "../errors/http-error";
import jwt from "jsonwebtoken";
import { FRONTEND_URL, JWT_SECRET } from "../config";
import crypto from "crypto";
import { sendResetPasswordEmail } from "./email.service";

let userRepository = new UserRepository();

export class UserService {
    async createUser(data: CreateUserDTO){
        // business logic before creating user
        const emailCheck = await userRepository.getUserByEmail(data.email);
        if(emailCheck){
            throw new HttpError(403, "Email already in use");
        }
        const usernameCheck = await userRepository.getUserByUsername(data.username);
        if(usernameCheck){
            throw new HttpError(403, "Username already in use");
        }
        // hash password
        const hashedPassword = await bcryptjs.hash(data.password, 10); // 10 - complexity
        data.password = hashedPassword;

        // create user
        const newUser = await userRepository.createUser(data);
        return newUser;
    }

    async createUserByAdmin(data: AdminCreateUserDTO){
        const emailCheck = await userRepository.getUserByEmail(data.email);
        if(emailCheck){
            throw new HttpError(403, "Email already in use");
        }
        const usernameCheck = await userRepository.getUserByUsername(data.username);
        if(usernameCheck){
            throw new HttpError(403, "Username already in use");
        }
        const hashedPassword = await bcryptjs.hash(data.password, 10);
        data.password = hashedPassword;
        const newUser = await userRepository.createUser(data);
        return newUser;
    }

    async loginUser(data: LoginUserDTO){
        const user =  await userRepository.getUserByEmail(data.email);
        if(!user){
            throw new HttpError(404, "User not found");
        }
        // compare password
        const validPassword = await bcryptjs.compare(data.password, user.password);
        // plaintext, hashed
        if(!validPassword){
            throw new HttpError(401, "Invalid credentials");
        }
        // generate jwt
        const payload = { // user identifier
            id: user._id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
        }
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' }); // 30 days
        return { token, user }
    }

    async getAllUsers(page: number, limit: number) {
        const [users, total] = await Promise.all([
            userRepository.getAllUsers(page, limit),
            userRepository.countUsers(),
        ]);

        return {
            users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit) || 1,
            },
        };
    }

    async getUserById(id: string) {
        const user = await userRepository.getUserById(id);
        if(!user){
            throw new HttpError(404, "User not found");
        }
        return user;
    }

    async updateUser(id: string, data: UpdateUserDTO) {
        if (data.password) {
            data.password = await bcryptjs.hash(data.password, 10);
        }
        const updated = await userRepository.updateUser(id, data);
        if(!updated){
            throw new HttpError(404, "User not found");
        }
        return updated;
    }

    async deleteUser(id: string) {
        const success = await userRepository.deleteUser(id);
        if(!success){
            throw new HttpError(404, "User not found");
        }
        return success;
    }

    async forgotPassword(email: string) {
        const user = await userRepository.getUserByEmail(email);
        // Avoid account enumeration by always returning success message.
        if (!user) {
            return { message: "If an account exists for this email, reset instructions were sent." };
        }

        const token = crypto.randomBytes(24).toString("hex");
        const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes

        await userRepository.updateUser(String(user._id), {
            resetPasswordToken: token,
            resetPasswordExpires: expiresAt,
        });

        const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;
        await sendResetPasswordEmail(email, resetUrl);

        return {
            message: "If an account exists for this email, reset instructions were sent.",
            token,
        };
    }

    async resetPassword(token: string, password: string) {
        const user = await userRepository.getUserByResetToken(token);
        if (!user) {
            throw new HttpError(400, "Invalid or expired reset token");
        }

        const hashedPassword = await bcryptjs.hash(password, 10);
        await userRepository.updateUser(String(user._id), {
            password: hashedPassword,
            resetPasswordToken: undefined,
            resetPasswordExpires: undefined,
        });

        return { message: "Password reset successful" };
    }
}
