import React, { useState } from "react";
import { Page, PageProps } from "types";

import Home from "pages/Home";
import Host from "pages/Host";
import Join from "pages/Join";

function renderPage(page: Page, pageProps: PageProps) {
  switch (page) {
    case "home":
      return <Home {...pageProps} />;
    case "host":
      return <Host {...pageProps} />;
    case "join":
      return <Join {...pageProps} />;
  }
}

function App() {
  const [page, setPage] = useState<Page>("home");
  const pageProps: PageProps = { setPage };

  return (
    <div className="container max-w-screen-lg mx-auto">
      {renderPage(page, pageProps)}
    </div>
  );
}

export default App;
