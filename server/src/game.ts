import {
  Machine,
  MachineConfig,
  StateMachine,
  StatesConfig,
  assign,
  interpret,
  State,
} from "xstate";
import type { GameStateUpdate, PlayerAction } from "../../shared/types";
import { generateID, shuffle } from "./util";

const MAX_HAND_SIZE = 6;
const MIN_ALLOWED_PLAYERS = 2;
const MAX_ALLOWED_PLAYERS = 3;

type BaseEvent<K, T = {}> = T & { type: K; name: string; id: string };

type Pile = "A" | "B" | "C" | "D";

type EventPlayCard = BaseEvent<"PLAY_CARD", { card: number; pile: Pile }>;
type EventEndTurn = BaseEvent<"END_TURN">;

type EventStartGame = BaseEvent<"START_GAME">;
type EventEndGame = BaseEvent<"END_GAME">;

type EventPlayerJoin = BaseEvent<"PLAYER_JOIN">;

type GameEvent =
  | EventStartGame
  | EventEndGame
  | EventPlayCard
  | EventEndTurn
  | EventPlayerJoin;

type RoomCode = string;

interface GameSchema {
  states: {
    player_joined: {};
    lobby_not_ready: {};
    lobby_ready: {};
    lobby_full: {};
    finished_loss: {};
    finished_win: {};
    next_player: {};
    card_played: {};
    play_required: {};
    play_optional: {};
    start_game: {};
  };
}

interface Player {
  name: string;
  hand: number[];
  drawnInitialHand: boolean;
}

type GameContext = {
  activePlayer: number;
  cardsPlayed: number;
  drawPile: number[];
  errors: Record<string, string>;
  players: Player[];
  piles: Record<Pile, number[]>;
  started: boolean;
};
type GameMachine = StateMachine<GameContext, GameSchema, GameEvent>;

export type Game = {
  getCurrentView: (name: string) => GameStateUpdate;
  getError: (id: string) => string;
  onTransition: (fn: (view: GameStateUpdate) => void, name: string) => void;
  transition: (event: GameEvent) => void;
};

const games = new Map<RoomCode, Game>();

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
        if (p.name !== e.name) return p;
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

  const addPlayer = assign<GameContext, EventPlayerJoin>((c, e) => {
    if (c.players.find((p) => p.name === e.name)) {
      return {};
    }
    return {
      players: [
        ...c.players,
        { drawnInitialHand: false, hand: [], name: e.name },
      ],
    };
  });

  const shuffleDeck = assign<GameContext>({
    drawPile: (c) => shuffle(c.drawPile),
  });

  const errorMessage = (msg: string) =>
    assign<GameContext, GameEvent>({
      errors: (c, e) => ({ ...c.errors, [e.id]: msg }),
    });

  const startGame = assign<GameContext>({
    started: () => true,
  });

  const rootStates: StatesConfig<GameContext, GameSchema, GameEvent> = {
    player_joined: {
      always: [
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
        START_GAME: "start_game",
      },
    },
    lobby_full: {
      on: {
        START_GAME: "start_game",
        PLAYER_JOIN: {
          target: "lobby_full",
          actions: errorMessage("Lobby is full"),
        },
      },
    },
    finished_loss: {
      type: "final",
    },
    finished_win: {
      type: "final",
    },

    // During the game
    start_game: {
      entry: [shuffleDeck, startGame],
      always: "next_player",
    },
    next_player: {
      entry: [drawCards, incPlayer],
      always: [
        {
          target: "next_player",
          cond: (ctx) => !ctx.players.every((p) => p.drawnInitialHand),
        },
        {
          target: "play_required",
        },
      ],
    },
    card_played: {
      always: [
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
  const config: MachineConfig<GameContext, GameSchema, GameEvent> = {
    context: {
      activePlayer: 0,
      cardsPlayed: 0,
      drawPile: new Array(99).fill(0).map((_, i) => i + 1),
      errors: {},
      piles: { A: [], B: [], C: [], D: [] },
      players: [],
      started: false,
    },
    id,
    initial: "lobby_not_ready",
    states: rootStates,
  };

  return Machine(config);
};

export function createGame() {
  const roomCode = createRoomCode();
  const machine = createGameMachine(roomCode);
  const service = interpret(machine);
  service.start();
  // TODO: stop machine sometime

  const newGame: Game = {
    getError: (id) => service.state.context.errors[id] || "",
    getCurrentView: (name) => generateGameStateUpdate(service.state, name),
    onTransition: (fn, name) => {
      service.onTransition((state) => {
        console.log(state.value, state.context);
        fn(generateGameStateUpdate(state, name));
      });
    },
    transition: (event) => {
      service.send(event);
    },
  };
  games.set(roomCode, newGame);
  return roomCode;
}

export function getGame(code: string) {
  const game = games.get(code);
  if (!game) return null;
  return game;
}

// TODO: Doing this for every client, might be better to only compute once
// TODO: Might be best to only send diffs
function generateGameStateUpdate(
  state: State<GameContext, GameEvent, GameSchema>,
  name: string
): GameStateUpdate | null {
  const { activePlayer, piles, players, started } = state.context;
  const currentState = state.value as keyof GameSchema["states"];

  const playerIndex = players.findIndex((p) => p.name === name);
  const player = players[playerIndex];

  if (!player) return null;

  const isTurn = activePlayer === playerIndex;

  const actions: PlayerAction[] = [];
  if (isTurn) {
    actions.push("play_card");
    if (currentState === "play_optional") {
      actions.push("end_turn");
    }
  }

  return {
    actions,
    hand: player.hand,
    piles,
    players: players.map((p) => p.name),
    started,
  };
}
