import React from "react";
import { startGame } from "services/game";
import { PageProps } from "types";

type LobbyProps = PageProps;

const Lobby: React.FC<LobbyProps> = ({ roleInfo }) => {
  if (roleInfo.role === "unknown")
    throw Error("In lobby without choosing role");

  function submitStart() {
    startGame();
  }

  return (
    <div>
      <div>In lobby {roleInfo.code}</div>
      <button onClick={submitStart}>start game</button>
    </div>
  );
};

export default Lobby;
