import express from "express";
import dotenv from "dotenv";
dotenv.config();
import userRoutes from "./routes/userRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import adminRoutes from "./routes/adminRoutes.js";
import trainerRoutes from "./routes/trainerRoutes.js"; // Add the missing semicolon here
import cors from "cors";

const port = process.env.PORT || 5000;
connectDB();
const app = express();

app.use(cors({ origin: "https://stayfitfrontend-thomas-josephs-projects.vercel.app/", credentials: true }));



app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/trainer", trainerRoutes); // Add the forward slash before api/trainer

app.get("/", (req, res) => res.send("server is ready"));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Health check passed' });
});



app.use(notFound);
app.use(errorHandler);

const server = app.listen(port, () => {
  console.log(`server started successfully on port  ${port}`);
});

import { Server } from "socket.io";

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: ["https://stayfitfrontend-thomas-josephs-projects.vercel.app/"],
  },
});

io.on("connection", (socket) => {
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageReceived) => {
    var chat = newMessageReceived.room;
    if (!chat.user || !chat.trainer) {
      return console.log("chat.users not defined");
    }

    if (chat.user._id === newMessageReceived.sender._id) {
      socket.to(chat.trainer._id).emit("message received", newMessageReceived);
    }

    if (chat.trainer._id === newMessageReceived.sender._id) {
      socket.to(chat.user._id).emit("message received", newMessageReceived);
    }
  });
  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});

export  default app;
export {io};
