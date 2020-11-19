interface JoinClient {
  code: string;
  name: string;
}

interface JoinServer {
  success: boolean;
  error: string;
}

interface HostClient {
  name: string;
}

interface HostServer {
  code: string;
}

interface StartClient {}

interface StartServer {}

export type PlayerAction = "play_card" | "end_turn";

export type Pile = "A" | "B" | "C" | "D";

export type GameStateUpdate = {
  actions: PlayerAction[];
  hand: number[];
  piles: Record<Pile, number[]>;
  players: string[];
  started: boolean;
};

interface UpdateServer {
  state: GameStateUpdate;
}

export type Messages = {
  join: { client: JoinClient; server: JoinServer };
  host: { client: HostClient; server: HostServer };
  start: { client: StartClient; server: StartServer };
  update: { client: never; server: UpdateServer };
};
