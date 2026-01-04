import { UserModel } from './auth.model';

/**
 * Find user by email
 */
export const findUserByEmail = (email: string) => {
  return UserModel.findOne({ email });
};

/**
 * Create new user
 */
export const createUser = (data: {
  email: string;
  password: string;
  role?: string;
}) => {
  return UserModel.create(data);
};
