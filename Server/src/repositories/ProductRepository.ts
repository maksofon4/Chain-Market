import { promises as fs } from "fs";
import { productsDir } from "../config/env";
import { Product } from "../models/Product";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";

const filePath = productsDir;
export class ProductRepository {
  static async getAllProducts(): Promise<Product[]> {
    const data = await fs.readFile(filePath, "utf-8");

    return JSON.parse(data);
  }

  static async findById(id: string): Promise<Product | null> {
    const products = await this.getAllProducts();

    return products.find((product) => product.productId === id) || null;
  }

  static async create(product: {
    userId: string;
    name: string;
    category: string;
    description: string;
    location: string;
    priceUSD: string;
    condition: string;
    tradePossible: boolean;
    contactDetails: {
      email: string;
      phoneNumber: string;
    };
    images: string[];
    formattedDateTime: string;
  }): Promise<Product> {
    const products = await this.getAllProducts();

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
}
