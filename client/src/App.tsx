import React, { useEffect, useState } from "react";
import { Page, PageProps, RoleInfo, GameStateUpdate } from "types";

import Home from "pages/Home";
import Lobby from "pages/Lobby";
import Game from "pages/Game";
import { attachOnUpdate } from "services/game";

function renderPage(page: Page, pageProps: PageProps) {
  switch (page) {
    case "home":
      return <Home {...pageProps} />;
    case "lobby":
      return <Lobby {...pageProps} />;
    case "game":
      return <Game {...pageProps} />;
  }
}

function App() {
  const [page, setPage] = useState<Page>("home");
  const [roleInfo, setRoleInfo] = useState<RoleInfo>({ role: "unknown" });
  const [gameState, setGameState] = useState<GameStateUpdate | null>(null);

  useEffect(() => {
    attachOnUpdate((state) => {
      setGameState(state);
    });
    // TODO: Probably need to change this if they leave the game or something
  }, []);

  const pageProps: PageProps = {
    setPage,
    roleInfo,
    setRoleInfo,
    gameState,
    setGameState,
  };

  return (
    <div className="container max-w-screen-lg mx-auto">
      {renderPage(page, pageProps)}
    </div>
  );
}

export default App;
