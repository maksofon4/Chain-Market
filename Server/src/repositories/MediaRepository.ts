// src/middleware/uploadMiddleware.ts
import multer, { StorageEngine } from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { profilePhotosDir } from "../config/env"; // e.g., 'uploads/profiles'

// Full absolute path to upload folder
const destination = path.join(__dirname, "..", "..", profilePhotosDir);

const storage: StorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, destination);
  },

  filename: (req, file, cb) => {
    const uniqueName = uuidv4() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

export const upload = multer({ storage });
