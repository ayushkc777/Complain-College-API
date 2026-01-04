import { ZodObject, ZodRawShape } from 'zod';
import { Request, Response, NextFunction } from 'express';

/**
 * Zod validation middleware
 * Validates request body against a Zod schema
 */
export const validate =
  (schema: ZodObject<ZodRawShape>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body); // Validate request body
      next(); // Proceed if valid
    } catch (error: any) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: error.errors, // Zod error details
      });
    }
  };
