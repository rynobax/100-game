interface JoinMessage {
  code: string;
}

interface JoinResponse {
  success: boolean;
}

export type Messages = {
  join: { client: JoinMessage; server: JoinResponse };
};
