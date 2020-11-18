import express from "express";
import http from "http";
import { Server } from "socket.io";

import { createGame } from "./game";
createGame();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { path: "ws", serveClient: false });

io.attach(server);

io.on('connection', (socket) => {
  socket.emit('test', { some: 'data' });
})

server.listen(3000, () => {
  console.log("listening on *:3000");
});
