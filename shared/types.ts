interface JoinMessage {
  code: string;
  name: string;
}

interface JoinResponse {
  success: boolean;
}

interface HostMessage {
  name: string;
}

interface HostResponse {
  code: string;
}

interface StartMessage {}

interface StartResponse {}

export type Messages = {
  join: { client: JoinMessage; server: JoinResponse };
  host: { client: HostMessage; server: HostResponse };
  start: { client: StartMessage; server: StartResponse };
};
