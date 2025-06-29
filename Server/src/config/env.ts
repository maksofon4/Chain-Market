import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.join(__dirname, ".env") });

const dataDir = process.env.DATA_DIR || "src/data";
export const usersDir = `${dataDir}/users/users.json`;
export const productsDir = `${dataDir}/products/products.json`;
