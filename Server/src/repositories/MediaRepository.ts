// src/middleware/uploadMiddleware.ts
import multer, { StorageEngine } from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { profilePhotosDir } from "../config/env"; // e.g., 'uploads/profiles'
import { productPhotosDir } from "../config/env";
import { singleFileRequest } from "../models/mediaReq";

// Full absolute path to upload folder
const profilePhotoDest = `../${profilePhotosDir}`;
const productPhotosDest = `../${productPhotosDir}`;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let destination: string;
    if (req.body.type === "product") {
      destination = productPhotosDest;
    } else if (req.body.type === "profilePhoto") {
      destination = profilePhotoDest;
    } else {
      return cb(new Error("Unknown upload type"), "");
    }
    cb(null, destination);
  },
  filename: function (req: singleFileRequest, file, cb) {
    const uniqueName = uuidv4() + path.extname(file.originalname);
    req.fileName = uniqueName;
    cb(null, uniqueName);
  },
});

export const upload = multer({ storage: storage });
