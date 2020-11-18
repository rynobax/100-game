import env from "env";
import { io } from "socket.io-client";
import { Messages } from "types";

const wsURL = `ws://${env.WS_SERVER}`;
const socket = io(wsURL, { path: "/ws" });

// TODO: Have sensible timeout and reject
// TODO: Reject if server is not running

export function joinGame(code: string) {
  return new Promise((resolve) => {
    const msg: Messages["join"]["client"] = { code };
    socket.emit("join", msg, (res: Messages["join"]["server"]) => {
      resolve(res.success);
    });
  });
}

export function hostGame(): Promise<string> {
  return new Promise((resolve) => {
    const msg: Messages["host"]["client"] = {};
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
