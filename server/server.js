import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

import connectDB from "./db.js";

import Poll from "./models/Poll.js";
import Vote from "./models/Vote.js";
import pollRoutes from "./routes/pollRoutes.js";

dotenv.config();

const app = express();

connectDB();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://real-time-polling-engine.onrender.com",
    ],
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/polls", pollRoutes);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

export { io };

io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  socket.on("join-poll", (pollId) => {
    socket.join(pollId);

    console.log(
        `Socket ${socket.id} joined poll room ${pollId}`
    );
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