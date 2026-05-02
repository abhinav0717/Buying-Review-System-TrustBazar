import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { demo, getRoomId as getDemoRoomId, populateMessage } from "./demo/data.js";
import { ChatMessage } from "./models/ChatMessage.js";
import { User } from "./models/User.js";
import { getRoomId } from "./routes/chatRoutes.js";

export function configureSocket(io) {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Missing auth token"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user =
        process.env.DEMO_MODE === "true"
          ? demo.users.find((item) => item._id === decoded.id)
          : await User.findById(decoded.id);
      if (!user) return next(new Error("Invalid user"));

      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Socket authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    socket.join(String(socket.user._id));

    socket.on("chat:join", ({ receiverId }) => {
      socket.join(process.env.DEMO_MODE === "true" ? getDemoRoomId(socket.user._id, receiverId) : getRoomId(socket.user._id, receiverId));
    });

    socket.on("chat:send", async ({ receiverId, text }, ack) => {
      try {
        const cleanText = String(text || "").trim();
        if (!cleanText) return;

        const roomId = process.env.DEMO_MODE === "true" ? getDemoRoomId(socket.user._id, receiverId) : getRoomId(socket.user._id, receiverId);
        let populated;

        if (process.env.DEMO_MODE === "true") {
          const message = {
            _id: randomUUID(),
            roomId,
            sender: socket.user._id,
            receiver: receiverId,
            text: cleanText,
            createdAt: new Date().toISOString()
          };
          demo.messages.push(message);
          populated = populateMessage(message);
        } else {
          const message = await ChatMessage.create({
            roomId,
            sender: socket.user._id,
            receiver: receiverId,
            text: cleanText
          });

          populated = await message.populate([
            { path: "sender", select: "name avatarUrl" },
            { path: "receiver", select: "name avatarUrl" }
          ]);
        }

        io.to(roomId).emit("chat:message", populated);
        io.to(String(receiverId)).emit("chat:notification", populated);
        ack?.({ ok: true });
      } catch (error) {
        ack?.({ ok: false, message: error.message });
      }
    });
  });
}
