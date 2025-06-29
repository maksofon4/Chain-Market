import { UserRepository } from "../repositories/UserRepository";
import bcrypt from "bcrypt";
import { User } from "../models/User";

export class AuthService {
  static async register(data: {
    username: string;
    email: string;
    password: string;
  }): Promise<User> {
    const newUser = await UserRepository.create({
      username: data.username,
      email: data.email,
      password: data.password,
    });

    return newUser;
  }

  static async login(data: {
    email: string;
    password: string;
  }): Promise<{ token: string }> {
    const user = await UserRepository.findByEmail(data.email);
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    return { token };
  }
}
