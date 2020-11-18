import React, { useState } from "react";
import { joinGame } from "services/game";
import { PageProps } from "types";

type HomeProps = PageProps;

const Home: React.FC<HomeProps> = ({ setPage }) => {
  const [code, setCode] = useState("");

  function submitJoin() {
    joinGame(code);
  }

  function submitHost() {
    // hostGame();
  }

  return (
    <div className="">
      <div>
        Join a Game{" "}
        <input
          maxLength={4}
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button onClick={submitJoin}>submit</button>
      </div>
      <div>or</div>
      <button>Host a Game</button>
    </div>
  );
};

export default Home;
