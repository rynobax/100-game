import { RoomCode, Game, State, Action, ClientState } from "./types";
import { START_GAME, startGame } from "./actions/startGame";

const games = new Map<RoomCode, Game>();

function generateID(length: number) {
  let result = "";
  const characters = "ABCDEFGHJKMNPQRSTUVWXYZ";
  const charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function createRoomCode() {
  let code = generateID(4);
  while (games.has(code)) code = generateID(4);
  return code;
}

const initialState: State = { started: false, players: [], error: "" };

export function createGame() {
  const newGame: Game = { state: { ...initialState } };
  const roomCode = createRoomCode();
  games.set(roomCode, newGame);
}

export function handleAction(action: Action) {
  const game = games.get(action.code);
  if (!game) throw Error(`Could not find game ${action.code}`);
  game.state = reducer(game.state, action);
  return createClientView(game.state);
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case START_GAME:
      return startGame(state, action);
  }
}

function createClientView(state: State): ClientState {
  return { players: state.players };
}
