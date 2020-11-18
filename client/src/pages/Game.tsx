import React from "react";
import { PageProps } from "types";

type GameProps = PageProps;

const Game: React.FC<GameProps> = ({ gameState }) => {
  if (!gameState) throw Error("Missing game state");

  return (
    <div>
      {JSON.stringify(gameState)}
    </div>
  );
};

export default Game;
