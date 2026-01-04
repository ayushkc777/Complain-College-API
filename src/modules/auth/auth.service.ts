import { createUser, findUserByEmail } from './auth.repository';
import { hashPassword, comparePassword } from '../../utils/hash';
import { generateToken } from '../../utils/jwt';

export const registerUserService = async (email: string, password: string) => {
  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new Error('Email already exists');
  }

  const hashedPassword = await hashPassword(password);

  const user = await createUser({
    email,
    password: hashedPassword,
  });

  return user;
};

export const loginUserService = async (email: string, password: string) => {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isMatch = await comparePassword(password, user.password);

  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  const token = generateToken({
    userId: user._id,
    role: user.role,
  });

  return token;
};
