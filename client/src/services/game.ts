import env from "env";
import { io } from "socket.io-client";
import { Messages, GameStateUpdate } from "types";

const wsURL = `ws://${env.WS_SERVER}`;
const socket = io(wsURL, { path: "/ws" });

let VERBOSE = true;
if (VERBOSE) socket.onAny(console.log);

// TODO: Have sensible timeout and reject
// TODO: Reject if server is not running

export function joinGame(code: string, name: string) {
  return new Promise((resolve) => {
    const msg: Messages["join"]["client"] = { code, name };
    socket.emit("join", msg, (res: Messages["join"]["server"]) => {
      resolve(res.success);
    });
  });
}

export function hostGame(name: string): Promise<string> {
  return new Promise((resolve) => {
    const msg: Messages["host"]["client"] = { name };
    socket.emit("host", msg, (res: Messages["host"]["server"]) => {
      resolve(res.code);
    });
  });
}

export function startGame(): Promise<unknown> {
  return new Promise((resolve) => {
    const msg: Messages["start"]["client"] = {};
    socket.emit("start", msg, (res: Messages["start"]["server"]) => {
      resolve(res);
    });
  });
}

export function attachOnUpdate(fn: (update: GameStateUpdate) => void) {
  socket.on("update", (res: Messages["update"]["server"]) => {
    fn(res.state);
  });
}
