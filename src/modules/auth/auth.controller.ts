import { Request, Response } from 'express';
import { registerUserService, loginUserService } from './auth.service';

export const registerUser = async (req: Request, res: Response) => {
  try {
    const user = await registerUserService(req.body.email, req.body.password);

    res.status(201).json({
      message: 'User registered successfully',
      data: {
        id: user._id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const token = await loginUserService(req.body.email, req.body.password);

    res.status(200).json({
      message: 'Login successful',
      token,
    });
  } catch (error: any) {
    res.status(401).json({ message: error.message });
  }
};
