import { UserModel, IUser } from "../models/user.model";
export interface IUserRepository {
    getUserByEmail(email: string): Promise<IUser | null>;
    getUserByUsername(username: string): Promise<IUser | null>;
    // Additional
    // 5 common database queries for entity
    createUser(userData: Partial<IUser>): Promise<IUser>;
    getUserById(id: string): Promise<IUser | null>;
    getAllUsers(page: number, limit: number): Promise<IUser[]>;
    countUsers(): Promise<number>;
    getUserByResetToken(token: string): Promise<IUser | null>;
    updateUser(id: string, updateData: Partial<IUser>): Promise<IUser | null>;
    deleteUser(id: string): Promise<boolean>;
}
// MongoDb Implementation of UserRepository
export class UserRepository implements IUserRepository {
    async createUser(userData: Partial<IUser>): Promise<IUser> {
        const user = new UserModel(userData); 
        return await user.save();
    }
    async getUserByEmail(email: string): Promise<IUser | null> {
        const user = await UserModel.findOne({ "email": email })
        return user;
    }
    async getUserByUsername(username: string): Promise<IUser | null> {
        const user = await UserModel.findOne({ "username": username })
        return user;
    }

    async getUserById(id: string): Promise<IUser | null> {
        // UserModel.findOne({ "_id": id });
        const user = await UserModel.findById(id);
        return user;
    }
    async getAllUsers(page: number, limit: number): Promise<IUser[]> {
        const skip = (page - 1) * limit;
        const users = await UserModel.find().skip(skip).limit(limit).sort({ createdAt: -1 });
        return users;
    }
    async countUsers(): Promise<number> {
        return UserModel.countDocuments();
    }
    async getUserByResetToken(token: string): Promise<IUser | null> {
        return UserModel.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() },
        });
    }
    async updateUser(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
        // UserModel.updateOne({ _id: id }, { $set: updateData });
        const updatedUser = await UserModel.findByIdAndUpdate(
            id, updateData, { new: true } // return the updated document
        );
        return updatedUser;
    }
    async deleteUser(id: string): Promise<boolean> {
        // UserModel.deleteOne({ _id: id });
        const result = await UserModel.findByIdAndDelete(id);
        return result ? true : false;
    }
}
