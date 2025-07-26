import { promises as fs } from "fs";
import { productsDir } from "../config/env";
import { Product } from "../models/Product";
import { v4 as uuidv4 } from "uuid";

const filePath = `../${productsDir}`;
export class ProductRepository {
  static async getAllProducts(): Promise<Product[]> {
    const data = await fs.readFile(filePath, "utf-8");

    return JSON.parse(data);
  }

  static async getRecentProducts(quantity: number): Promise<Product[]> {
    const products = await this.getAllProducts();
    const slicedProducts = products.slice(-quantity);
    const newProducts = slicedProducts.map((product) => {
      const validLinksImages = product.images.map(
        (image) => `http://localhost:3001/productPhotos/${image}`
      );

      return {
        ...product,
        images: validLinksImages,
      };
    });

    return newProducts;
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
    price: number;
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
      price: product.price,
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
  static async remove(productId: string): Promise<boolean> {
    const targetProduct = await this.findById(productId);
    console.log(targetProduct);
    if (!targetProduct) {
      throw new Error(`Product with ID ${productId} not found.`);
    }

    const products = await this.getAllProducts();
    const updatedProducts = products.filter((p) => p.productId !== productId);

    await fs.writeFile(filePath, JSON.stringify(updatedProducts, null, 2));
    return true;
  }

  static async findProducts(
    category?: string,
    location?: string,
    condition?: string,
    tradePossible?: boolean,
    priceMin?: number,
    priceMax?: number,
    name?: string
  ): Promise<Product[]> {
    const products = await this.getAllProducts();

    let filtered = products;

    if (category) {
      filtered = filtered.filter(
        (p) => p.category.toLowerCase() === String(category).toLowerCase()
      );
    }

    if (location) {
      filtered = filtered.filter((p) =>
        p.location.toLowerCase().includes(String(location).toLowerCase())
      );
    }

    if (condition) {
      filtered = filtered.filter(
        (p) => p.condition.toLowerCase() === String(condition).toLowerCase()
      );
    }

    if (tradePossible) {
      filtered = filtered.filter((p) => p.tradePossible === true);
    }

    if (tradePossible === false) {
      filtered = filtered.filter((p) => p.tradePossible === false);
    }

    if (priceMin) {
      filtered = filtered.filter((p) => p.price >= Number(priceMin));
    }

    if (priceMax) {
      filtered = filtered.filter((p) => p.price <= Number(priceMax));
    }

    if (name) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(String(name).toLowerCase())
      );
    }

    return filtered;
  }
}
