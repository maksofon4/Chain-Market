import { promises as fs } from "fs";
import path from "path";
import { User } from "../models/User";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";

const filePath = path.join(__dirname, "..", "data", "users.json");

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
      id: uuidv4(),
      username: user.username,
      email: user.email,
      password: hashedPassword,
    };

    users.push(newUser);
    await fs.writeFile(filePath, JSON.stringify(users, null, 2));

    return newUser;
  }

  static async findById(id: string): Promise<User | null> {
    const users = await this.getAllUsers();
    return users.find((user) => user.id === id) || null;
  }
}
