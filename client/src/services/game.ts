import env from "env";
import { io } from "socket.io-client";
import { Messages } from "types";

const wsURL = `ws://${env.WS_SERVER}`;
const socket = io(wsURL, { path: "/ws" });

export function joinGame(code: string) {
  return new Promise((resolve, reject) => {
    const msg: Messages["join"]["client"] = { code };
    socket.emit("join", msg, (res: Messages["join"]["server"]) => {
      console.log(res.success);
    });
  });
}
