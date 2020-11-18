import { Server } from "socket.io";
require("dotenv").config();

import type { Messages } from "../../shared/types";
import { createGame } from "./game";
createGame();

const io = new Server({
  path: "/ws",
  serveClient: false,
});

const PORT = 4000;
io.listen(PORT, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("new connection");
  socket.on("join", (msg: Messages["join"]["client"], cb) => {
    console.log(msg.code);
    const res: Messages["join"]["server"] = { success: true };
    cb(res);
  });
});
