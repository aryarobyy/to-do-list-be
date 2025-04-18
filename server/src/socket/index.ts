import { Server } from "socket.io";
import { handleUserSocket } from "./user.socket";

export const initSocket = (io: Server) => {
  io.on("connection", (socket) => {
    console.log("🟢 New client connected");

    handleUserSocket(socket);
  });
};
