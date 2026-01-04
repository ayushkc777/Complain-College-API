import { z } from 'zod';

/**
 * Register User DTO
 */
export const registerDto = z.object({
  email: z
    .string()
    .email('Invalid email format'),

  password: z
    .string()
    .min(6, 'Password must be at least 6 characters'),
});

/**
 * Login User DTO
 */
export const loginDto = z.object({
  email: z
    .string()
    .email('Invalid email format'),

  password: z
    .string()
    .min(1, 'Password is required'),
});
