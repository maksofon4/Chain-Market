// src/middleware/uploadMiddleware.ts
import multer, { StorageEngine } from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { profilePhotosDir } from "../config/env"; // e.g., 'uploads/profiles'
import { singleFileRequest } from "../models/mediaReq";

// Full absolute path to upload folder
const destination = `../${profilePhotosDir}`;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, destination);
  },
  filename: function (req: singleFileRequest, file, cb) {
    const uniqueName = uuidv4() + path.extname(file.originalname);
    req.fileName = uniqueName;
    cb(null, uniqueName);
  },
});

export const upload = multer({ storage: storage });
