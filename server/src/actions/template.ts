import { BaseAction, State } from "../types";

export type ActionREPLACE = BaseAction<"ACTION_TYPE", {}>;

export const ACTION_TYPE = "ACTION_TYPE";

export function REPLACE(state: State, action: ActionREPLACE): State {
  return { ...state };
}
