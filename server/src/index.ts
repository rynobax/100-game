import { Server } from "socket.io";
require("dotenv").config();

import type { Messages } from "../../shared/types";
import { createGame, Game, getGame } from "./game";

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
  let gameCode: string;
  let game: Game;
  let name: string;

  socket.on("host", (msg: Messages["host"]["client"], cb) => {
    const code = createGame();
    const res: Messages["host"]["server"] = { code };
    cb(res);
    gameCode = code;
    name = msg.name;
    game = getGame(code);
  });

  socket.on("join", (msg: Messages["join"]["client"], cb) => {
    console.log(msg.code);
    const res: Messages["join"]["server"] = { success: true };
    cb(res);
    gameCode = msg.code;
    name = msg.name;
    game = getGame(msg.code);
  });

  socket.on("start", (msg: Messages["start"]["client"], cb) => {
    const res: Messages["start"]["server"] = { success: true };
    cb(res);
    game.transition({ type: "START_GAME", name });
  });
});
