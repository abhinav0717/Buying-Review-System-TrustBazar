import "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import { createApp } from "./app.js";
import { connectDb } from "./config/db.js";
import { loadDemoData } from "./demo/data.js";
import { configureSocket } from "./socket.js";

const port = process.env.PORT || 5000;
const app = createApp();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL?.split(",") || "http://localhost:5173",
    credentials: true
  }
});

configureSocket(io);

const boot = process.env.DEMO_MODE === "true" ? loadDemoData : connectDb;

boot()
  .then(() => {
    httpServer.listen(port, () => {
      console.log(`API running on port ${port}`);
      if (process.env.DEMO_MODE === "true") console.log("Demo mode enabled: MongoDB is not required");
    });
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
