const express = require("express");
const http = require("http");
import dotenv from "dotenv";
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const router = require("./routers/index");
const errorHandler = require("./middleware/errorHandlingMiddleware");
import { socketController } from "./controllers/ChatsController";

// Create an Express app
const app = express();

dotenv.config();

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "localhost";

app.use(express.json());
app.use(require("morgan")("combined"));
app.use(
  cors({
    origin: "http://localhost:3000", // Разрешаем доступ с React
    credentials: true, // Если используешь сессии или куки
  })
);

app.use("/imgs", express.static(path.join(__dirname, "../data/default/imgs")));
app.use(
  "/profilePhotos",
  express.static(path.join(__dirname, "../data/profilePhotos"))
);
app.use(
  "/productPhotos",
  express.static(path.join(__dirname, "../data/productPhotos"))
);
app.use(
  "/uploads",
  express.static(path.join(__dirname, "dataFolder", "uploads"))
);

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "..", "client", "build")));
app.use("/api", router);
app.use(errorHandler);

const server = http.createServer(app);
socketController(server);

// Start the server
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at http://${HOST}:${PORT}/`);
});
