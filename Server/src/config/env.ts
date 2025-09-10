import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.join(__dirname, "../../.env") });

const dataDir = process.env.DATA_DIR;
export const usersDir = `${dataDir}/users/users.json`;
export const productsDir = `${dataDir}/products/products.json`;
export const defaultImagesDir = `${dataDir}/default/imgs`;
export const profilePhotosDir = `${dataDir}/profilePhotos`;
export const productPhotosDir = `${dataDir}/productPhotos`;
export const chatsPhotosDir = `${dataDir}/chatsPhotos`;
