import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

import connectDB from "./db.js";

dotenv.config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  socket.on("join-poll", (pollId) => {
    socket.join(pollId);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected");
  });
});

app.get("/", (req, res) => {
  res.send("Polling API Running");
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});