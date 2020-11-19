import { Server, Socket } from "socket.io";
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

// TODO: Do I need to close the on listeners if socket drops?
io.on("connection", (socket: Socket) => {
  console.log("new connection");
  let gameCode: string;
  let game: Game;
  let name: string;
  const id = socket.id;

  function initializeServerToClient() {
    game.onTransition((view) => {
      // TODO: Might want to check view.changed
      console.log(view);
      if (view) socket.emit("update", { state: view });
    }, name);
    socket.emit("update", { state: game.getCurrentView(name) });
  }

  socket.on("host", (msg: Messages["host"]["client"], cb) => {
    const code = createGame();
    const res: Messages["host"]["server"] = { code };
    cb(res);
    gameCode = code;
    name = msg.name;
    game = getGame(code);
    game.transition({ type: "PLAYER_JOIN", name, id });
    initializeServerToClient();
  });

  // TODO: joining will not always work, need to handle failure
  socket.on("join", (msg: Messages["join"]["client"], cb) => {
    console.log(msg.code);
    gameCode = msg.code;
    name = msg.name;
    game = getGame(msg.code);
    if (!game) {
      const res: Messages["join"]["server"] = {
        success: false,
        error: `Game ${msg.code} does not exist`,
      };
      cb(res);
    } else {
      game.transition({ type: "PLAYER_JOIN", name, id });
      const error = game.getError(id);
      const res: Messages["join"]["server"] = { success: !error, error };
      cb(res);
      if (!error) initializeServerToClient();
    }
  });

  socket.on("start", (msg: Messages["start"]["client"], cb) => {
    const res: Messages["start"]["server"] = { success: true };
    cb(res);
    game.transition({ type: "START_GAME", name, id });
  });
});
