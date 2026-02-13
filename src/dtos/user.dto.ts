import z from "zod";
import { UserSchema } from "../types/user.type";
// re-use UserSchema from types
export const CreateUserDTO = UserSchema.pick(
    {
        firstName: true,
        lastName: true,
        email: true,
        username: true,
        password: true
    }
).extend( // add new attribute to zod
    {
        confirmPassword: z.string().min(6)
    }
).refine( // extra validation for confirmPassword
    (data) => data.password === data.confirmPassword,
    {
        message: "Passwords do not match",
        path: ["confirmPassword"]
    }
)
export type CreateUserDTO = z.infer<typeof CreateUserDTO>;

export const AdminCreateUserDTO = UserSchema.pick(
    {
        firstName: true,
        lastName: true,
        email: true,
        username: true,
        password: true,
        role: true,
        image: true
    }
).extend(
    {
        confirmPassword: z.string().min(6)
    }
).refine(
    (data) => data.password === data.confirmPassword,
    {
        message: "Passwords do not match",
        path: ["confirmPassword"]
    }
)
export type AdminCreateUserDTO = z.infer<typeof AdminCreateUserDTO>;

export const LoginUserDTO = z.object({
    email: z.email(),
    password: z.string().min(6)
});
export type LoginUserDTO = z.infer<typeof LoginUserDTO>;

export const ForgotPasswordDTO = z.object({
    email: z.email(),
});
export type ForgotPasswordDTO = z.infer<typeof ForgotPasswordDTO>;

export const ResetPasswordDTO = z.object({
    token: z.string().min(8),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
}).refine(
    (data) => data.password === data.confirmPassword,
    {
        message: "Passwords do not match",
        path: ["confirmPassword"]
    }
);
export type ResetPasswordDTO = z.infer<typeof ResetPasswordDTO>;

export const PaginationQueryDTO = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
});
export type PaginationQueryDTO = z.infer<typeof PaginationQueryDTO>;

export const UpdateUserDTO = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.email().optional(),
    username: z.string().optional(),
    password: z.string().min(6).optional(),
    role: z.enum(["user", "admin"]).optional(),
    image: z.string().optional()
});
export type UpdateUserDTO = z.infer<typeof UpdateUserDTO>;
