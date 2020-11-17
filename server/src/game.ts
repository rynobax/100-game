import {
  Machine,
  MachineConfig,
  StateMachine,
  StatesConfig,
  assign,
} from "xstate";

const MAX_HAND_SIZE = 6;

type BaseEvent<K, T = {}> = T & { type: K; code: RoomCode; playerId: string };

type Pile = "A" | "B" | "C" | "D";

type EventPlayCard = BaseEvent<"PLAY_CARD", { card: number; pile: Pile }>;
type EventEndTurn = BaseEvent<"END_TURN">;

type EventStartGame = BaseEvent<"START_GAME">;
type EventEndGame = BaseEvent<"END_GAME">;

type GameEvent = EventStartGame | EventEndGame | EventPlayCard | EventEndTurn;

type RoomCode = string;
type ClientState = {};

interface PlayingSchema {
  states: {
    next_player: {};
    play_required: {};
    play_optional: {};
  };
}

interface GameSchema {
  states: {
    lobby: {};
    playing: PlayingSchema;
    finished: {};
  };
}

interface Player {
  id: string;
  name: string;
  hand: number[];
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
  const initializeGame = assign<GameContext>({
    // players: (c) => c.players.map(p => ({ ...p, hand: }))
  });

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
        return { ...p, hand: [...p.hand, ...drawnCards] };
      }),
    };
  });

  const incPlayer = assign<GameContext>({
    activePlayer: (c) => (c.activePlayer + 1) % c.players.length,
  });

  const playingStates: StatesConfig<GameContext, PlayingSchema, GameEvent> = {
    next_player: {
      entry: [drawCards, incPlayer],
      on: {
        "": [
          // TODO: Checks for win / loss
          {
            target: "play_required",
          },
        ],
      },
    },
    play_required: {
      on: {
        PLAY_CARD: [
          {
            target: "play_optional",
            cond: (ctx) => {
              const requiredCardsPlayed = ctx.drawPile.length > 0 ? 2 : 1;
              return ctx.cardsPlayed >= requiredCardsPlayed;
            },
            actions: [incCardsPlayed, playCard],
          },
        ],
      },
    },
    play_optional: {
      on: {
        PLAY_CARD: {
          target: "play_optional",
          actions: [incCardsPlayed, playCard],
        },
        END_TURN: { target: "next_player" },
      },
    },
  };

  const rootStates: StatesConfig<GameContext, GameSchema, GameEvent> = {
    lobby: {
      on: {
        START_GAME: { target: "playing", actions: initializeGame },
      },
    },
    playing: {
      on: {
        END_GAME: "finished",
      },
      initial: "play_required",
      states: playingStates,
    },
    finished: {
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
    initial: "lobby",
    states: rootStates,
  };

  return Machine(config);
};

export function createGame() {
  const roomCode = createRoomCode();
  const newGame: Game = { machine: createGameMachine(roomCode) };
  games.set(roomCode, newGame);
}

console.log(JSON.stringify(createGameMachine("123").config));

// export function handleEvent(action: Action) {
//   const game = games.get(action.code);
//   if (!game) throw Error(`Could not find game ${action.code}`);
//   game.state = reducer(game.state, action);
//   return createClientView(game.state);
// }

// function createClientView(state: Machine): ClientState {
//   return { players: state.players };
// }
