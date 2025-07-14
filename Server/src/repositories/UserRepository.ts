import { promises as fs } from "fs";
import { usersDir, defaultImagesDir } from "../config/env";
import { User } from "../models/User";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";

const filePath = `../${usersDir}`;
export class UserRepository {
  static async getAllUsers(): Promise<User[]> {
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  }

  static async findByEmail(email: string): Promise<User | null> {
    const users = await this.getAllUsers();
    return users.find((user) => user.email === email) || null;
  }

  static async create(user: {
    username: string;
    email: string;
    password: string;
  }): Promise<User> {
    const users = await this.getAllUsers();

    const hashedPassword = await bcrypt.hash(user.password, 10);
    const newUser: User = {
      userId: uuidv4(),
      username: user.username,
      email: user.email,
      password: hashedPassword,
      profilePhoto: `${defaultImagesDir}/userImgDefault.png`,
      pinnedChats: [],
      selectedProducts: [],
    };

    users.push(newUser);
    await fs.writeFile(filePath, JSON.stringify(users, null, 2));
    return newUser;
  }

  static async remove(userId: string): Promise<boolean> {
    const targetUser = await this.findById(userId);
    if (!targetUser) {
      throw new Error(`User with ID ${userId} not found.`);
    }

    const users = await this.getAllUsers();
    const updatedUsers = users.filter((u) => u.userId !== userId);

    await fs.writeFile(filePath, JSON.stringify(updatedUsers, null, 2));
    return true;
  }

  static async findById(id: string): Promise<User | null> {
    const users = await this.getAllUsers();
    return users.find((user) => user.userId === id) || null;
  }

  static async saveUsers(users: User[]): Promise<void> {
    await fs.writeFile(filePath, JSON.stringify(users, null, 2), "utf-8");
  }

  static async saveUser(updatedUser: User): Promise<User | null> {
    const users = await this.getAllUsers();
    const index = users.findIndex((u) => u.userId === updatedUser.userId);

    if (index === -1) return null;

    users[index] = updatedUser;
    await this.saveUsers(users);

    return updatedUser;
  }
}
