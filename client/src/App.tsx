import React, { useState } from "react";
import { Page, PageProps, RoleInfo } from "types";

import Home from "pages/Home";
import Lobby from "pages/Lobby";
import Game from "pages/Game";

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

  const pageProps: PageProps = { setPage, roleInfo, setRoleInfo };

  return (
    <div className="container max-w-screen-lg mx-auto">
      {renderPage(page, pageProps)}
    </div>
  );
}

export default App;
