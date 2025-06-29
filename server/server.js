// env
import dotenv from "dotenv";
dotenv.config();

// SSL
import fs from "fs";
const options = {
  key: fs.readFileSync(process.env.SSL_KEY_PATH),
  cert: fs.readFileSync(process.env.SSL_CERT_PATH),
};

// Express
import express from "express";
import { Server } from "https";
import cors from "cors";
import api from "./services/api/main.js";
const app = express();
app.use(cors());
app.use("/api", api);
const https = Server(options, app);
const port = process.env.PORT || 3000;

// socket.io
import init_scoket from "./services/socketio/main.js";
init_scoket(https);

https.listen(port, () => {
  console.log(`Server running at https://localhost:${port}/`);
});
