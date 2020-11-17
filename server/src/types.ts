import type { ActionStartGame } from "./actions/startGame";

export type RoomCode = string;
export type State = { started: boolean; players: string[], error: string; };
export type Game = { state: State };
export type Action = ActionStartGame;
export type BaseAction<K, T = {}> = T & { type: K, code: RoomCode };
export type ClientState = {};
