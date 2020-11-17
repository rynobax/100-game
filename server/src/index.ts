import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { path: "ws" });

server.listen(3000, () => {
  console.log("listening on *:3000");
});
