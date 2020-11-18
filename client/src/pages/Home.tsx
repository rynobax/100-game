import React, { useState } from "react";
import { joinGame, hostGame } from "services/game";
import { PageProps } from "types";

type HomeProps = PageProps;

const Home: React.FC<HomeProps> = ({ setPage, setRoleInfo }) => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  function submitJoin() {
    setLoading(true);
    joinGame(code, name).then(() => {
      setRoleInfo({ role: "guest", code });
      setPage("lobby");
    });
  }

  function submitHost() {
    setLoading(true);
    hostGame(name).then((code) => {
      setRoleInfo({ role: "host", code });
      setPage("lobby");
    });
  }

  const nameIsValid = name.length >= 1;
  const codeIsValid = code.length === 4;

  return (
    <div>
      <div>
        name:
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
        />
      </div>
      <div>
        Join a Game{" "}
        <input
          maxLength={4}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={loading}
        />
        <button
          onClick={submitJoin}
          disabled={loading || !nameIsValid || !codeIsValid}
        >
          join
        </button>
      </div>
      <div>or</div>
      <button onClick={submitHost} disabled={loading || !nameIsValid}>
        Host a Game
      </button>
    </div>
  );
};

export default Home;
