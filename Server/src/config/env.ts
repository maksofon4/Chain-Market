import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.join(__dirname, ".env") });

const dataDir = process.env.DATA_DIR || "src/data";

// 🧠 универсальный путь от корня проекта
const getPath = (...parts: string[]) =>
  path.join(process.cwd(), dataDir, ...parts);

// 👇 конкретные функции под каждый файл
export const getUsersDataPath = () => getPath("users.json");
export const getMessagesDataPath = () => getPath("messages.json");
export const getChatsDataPath = () => getPath("chats.json");
// и т. д.
