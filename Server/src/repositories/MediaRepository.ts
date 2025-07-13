// import path from "path";
// import { promises as fs } from "fs";
// import multer, { StorageEngine } from "multer";
// import { v4 as uuidv4 } from "uuid";
// import { profilePhotosDir } from "../config/env"; // пример: 'uploads/profiles'

// // Абсолютный путь к директории сохранения
// const filePath = path.join(__dirname, "..", "..", profilePhotosDir);

// // Multer Storage
// const storage: StorageEngine = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, filePath); // сохранить файл в нужную папку
//   },
//   filename: (req, file, cb) => {
//     const uniqueName = uuidv4() + path.extname(file.originalname);
//     cb(null, uniqueName);
//   },
// });

// export const upload = multer({ storage });

// // Репозиторий
// export class MediaRepository {

//   static async uploadPriflePhoto(): Promise<string> {
//    upload.single("photo");
//   }
// }

не работает multer как функция. Это MiddleWare
