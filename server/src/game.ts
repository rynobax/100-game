import {
  Machine,
  MachineConfig,
  StateMachine,
  StatesConfig,
  assign,
} from "xstate";

const MAX_HAND_SIZE = 6;
const MIN_ALLOWED_PLAYERS = 2;
const MAX_ALLOWED_PLAYERS = 10;

type BaseEvent<K, T = {}> = T & { type: K; code: RoomCode; playerId: string };

type Pile = "A" | "B" | "C" | "D";

type EventPlayCard = BaseEvent<"PLAY_CARD", { card: number; pile: Pile }>;
type EventEndTurn = BaseEvent<"END_TURN">;

type EventStartGame = BaseEvent<"START_GAME">;
type EventEndGame = BaseEvent<"END_GAME">;

type EventPlayerJoin = BaseEvent<"PLAYER_JOIN", { player: Player }>;

type GameEvent =
  | EventStartGame
  | EventEndGame
  | EventPlayCard
  | EventEndTurn
  | EventPlayerJoin;

type RoomCode = string;

interface PlayingSchema {
  states: {
    next_player: {};
    card_played: {};
    play_required: {};
    play_optional: {};
  };
}

interface GameSchema {
  states: {
    player_joined: {};
    lobby_not_ready: {};
    lobby_ready: {};
    lobby_full: {};
    playing: PlayingSchema;
    finished_loss: {};
    finished_win: {};
  };
}

interface Player {
  id: string;
  name: string;
  hand: number[];
  drawnInitialHand: boolean;
}

type GameContext = {
  activePlayer: number;
  cardsPlayed: number;
  drawPile: number[];
  players: Player[];
  piles: Record<Pile, number[]>;
};
type GameMachine = StateMachine<GameContext, GameSchema, GameEvent>;

type Game = { machine: GameMachine };

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

const createGameMachine = (id: string): GameMachine => {
  const incCardsPlayed = assign<GameContext>({
    cardsPlayed: (c) => c.cardsPlayed + 1,
  });

  const playCard = assign<GameContext, EventPlayCard>({
    piles: (c, e) => ({ ...c.piles, [e.pile]: [...c.piles[e.pile], e.card] }),
    players: (c, e) =>
      c.players.map((p) => {
        if (p.id !== e.playerId) return p;
        return { ...p, hand: p.hand.filter((c) => c !== e.card) };
      }),
  });

  const drawCards = assign<GameContext>((c) => {
    const player = c.players[c.activePlayer];
    const cardsNeeded = MAX_HAND_SIZE - player.hand.length;
    const drawnCards = c.drawPile.slice(0, cardsNeeded);
    const newDrawPile = c.drawPile.slice(cardsNeeded, c.drawPile.length);
    return {
      drawPile: newDrawPile,
      players: c.players.map((p, i) => {
        if (i !== c.activePlayer) return p;
        return {
          ...p,
          hand: [...p.hand, ...drawnCards],
          drawnInitialHand: true,
        };
      }),
    };
  });

  const incPlayer = assign<GameContext>({
    activePlayer: (c) => (c.activePlayer + 1) % c.players.length,
  });

  const addPlayer = assign<GameContext, EventPlayerJoin>({
    players: (c, e) => [...c.players, e.player],
  });

  const playingStates: StatesConfig<GameContext, PlayingSchema, GameEvent> = {
    next_player: {
      entry: [drawCards, incPlayer],
      on: {
        "": [
          {
            target: "next_player",
            cond: (ctx) => !ctx.players.every((p) => p.drawnInitialHand),
          },
          {
            target: "play_required",
          },
        ],
      },
    },
    card_played: {
      on: {
        "": [
          {
            target: "finished_win",
            cond: (ctx) => {
              const playerCards = ctx.players.reduce(
                (p, c) => p + c.hand.length,
                0
              );
              return ctx.drawPile.length + playerCards === 0;
            },
          },
          {
            target: "play_optional",
            cond: (ctx) => {
              const requiredCardsPlayed = ctx.drawPile.length > 0 ? 2 : 1;
              return ctx.cardsPlayed >= requiredCardsPlayed;
            },
          },
          { target: "play_required" },
        ],
      },
      entry: [incCardsPlayed, playCard],
    },
    play_required: {
      on: {
        PLAY_CARD: "card_played",
      },
    },
    play_optional: {
      on: {
        PLAY_CARD: "card_played",
        END_TURN: "next_player",
      },
    },
  };

  const rootStates: StatesConfig<GameContext, GameSchema, GameEvent> = {
    player_joined: {
      on: {
        "": [
          {
            target: "lobby_full",
            cond: (ctx) => ctx.players.length >= MAX_ALLOWED_PLAYERS,
          },
          {
            target: "lobby_ready",
            cond: (ctx) => ctx.players.length >= MIN_ALLOWED_PLAYERS,
          },
          {
            target: "lobby_not_ready",
          },
        ],
      },
      entry: addPlayer,
    },
    lobby_not_ready: {
      on: {
        PLAYER_JOIN: "player_joined",
      },
    },
    lobby_ready: {
      on: {
        PLAYER_JOIN: "player_joined",
      },
    },
    lobby_full: {
      on: {
        START_GAME: "playing",
      },
    },
    playing: {
      on: {
        END_GAME: "finished",
      },
      initial: "next_player",
      states: playingStates,
    },
    finished_loss: {
      type: "final",
    },
    finished_win: {
      type: "final",
    },
  };
  const config: MachineConfig<GameContext, GameSchema, GameEvent> = {
    context: {
      activePlayer: 0,
      cardsPlayed: 0,
      drawPile: new Array(99).fill(0).map((_, i) => i + 1),
      piles: { A: [], B: [], C: [], D: [] },
      players: [],
    },
    id,
    initial: "lobby_not_ready",
    states: rootStates,
  };

  return Machine(config);
};

export function createGame() {
  const roomCode = createRoomCode();
  const newGame: Game = { machine: createGameMachine(roomCode) };
  games.set(roomCode, newGame);
}

// export function handleEvent(action: Action) {
//   const game = games.get(action.code);
//   if (!game) throw Error(`Could not find game ${action.code}`);
//   game.state = reducer(game.state, action);
//   return createClientView(game.state);
// }

// function createClientView(state: Machine): ClientState {
//   return { players: state.players };
// }
