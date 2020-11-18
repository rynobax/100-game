interface JoinClient {
  code: string;
  name: string;
}

interface JoinServer {
  success: boolean;
}

interface HostClient {
  name: string;
}

interface HostServer {
  code: string;
}

interface StartClient {}

interface StartServer {}

export type GameStateUpdate = { players: string[]; hand: number[] };

interface UpdateServer {
  state: GameStateUpdate;
}

export type Messages = {
  join: { client: JoinClient; server: JoinServer };
  host: { client: HostClient; server: HostServer };
  start: { client: StartClient; server: StartServer };
  update: { client: never; server: UpdateServer };
};
