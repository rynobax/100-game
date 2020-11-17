import { BaseAction, State } from "../types";

export type ActionStartGame = BaseAction<"START_GAME">;

export const START_GAME = "START_GAME";

export function startGame(state: State, action: ActionStartGame): State {
  if (state.players.length < 2)
    return { ...state, error: "You need at least 2 players to start" };
  return { ...state, started: true };
}
