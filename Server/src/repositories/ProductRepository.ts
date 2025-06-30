import { promises as fs } from "fs";
import { productsDir } from "../config/env";
import { Product } from "../models/Product";
import { v4 as uuidv4 } from "uuid";

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
    price: string;
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
    const newProduct: Product = {
      productId: uuidv4(),
      userId: product.userId,
      name: product.name,
      category: product.category,
      description: product.description,
      location: product.location,
      priceUSD: product.price,
      condition: product.condition,
      tradePossible: product.tradePossible,
      contactDetails: {
        email: product.contactDetails.email,
        phoneNumber: product.contactDetails.phoneNumber,
      },
      images: product.images,
      formattedDateTime: product.formattedDateTime,
    };

    products.push(newProduct);
    await fs.writeFile(filePath, JSON.stringify(products, null, 2));
    return newProduct;
  }
}
