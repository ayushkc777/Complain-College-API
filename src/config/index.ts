import dotenv from "dotenv";
dotenv.config();

export const PORT: number = 
    process.env.PORT ? parseInt(process.env.PORT) : 3000;
export const MONGODB_URI: string = 
    process.env.MONGODB_URI || 'mongodb://localhost:27017/defaultdb';
// Application level constants, with fallbacks 
// if .env variables are not set

export const JWT_SECRET: string = 
    process.env.JWT_SECRET || 'default';

export const FRONTEND_URL: string =
    process.env.FRONTEND_URL || "http://localhost:3000";

const defaultOrigins = [FRONTEND_URL, "http://localhost:3000", "http://127.0.0.1:3000"];
export const ALLOWED_ORIGINS: string[] = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((item) => item.trim()).filter(Boolean)
    : defaultOrigins;

export const RATE_LIMIT_WINDOW_MS: number =
    process.env.RATE_LIMIT_WINDOW_MS ? parseInt(process.env.RATE_LIMIT_WINDOW_MS) : 15 * 60 * 1000;
export const RATE_LIMIT_MAX: number =
    process.env.RATE_LIMIT_MAX ? parseInt(process.env.RATE_LIMIT_MAX) : 300;

export const SMTP_HOST: string | undefined = process.env.SMTP_HOST;
export const SMTP_PORT: number = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
export const SMTP_USER: string | undefined = process.env.SMTP_USER;
export const SMTP_PASS: string | undefined = process.env.SMTP_PASS;
export const SMTP_FROM: string =
    process.env.SMTP_FROM || "no-reply@complain-college.local";
