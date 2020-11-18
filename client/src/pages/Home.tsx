import React, { useState } from "react";
import { joinGame, hostGame } from "services/game";
import { PageProps } from "types";

type HomeProps = PageProps;

const Home: React.FC<HomeProps> = ({ setPage, setRoleInfo }) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  function submitJoin() {
    setLoading(true);
    joinGame(code).then(() => setLoading(false));
  }

  function submitHost() {
    setLoading(true);
    hostGame().then((code) => {
      setLoading(false);
      setRoleInfo({ role: "host", code });
      setPage("host");
    });
  }

  return (
    <div className="">
      <div>
        Join a Game{" "}
        <input
          maxLength={4}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={loading}
        />
        <button onClick={submitJoin} disabled={loading}>
          submit
        </button>
      </div>
      <div>or</div>
      <button onClick={submitHost} disabled={loading}>
        Host a Game
      </button>
    </div>
  );
};

export default Home;
