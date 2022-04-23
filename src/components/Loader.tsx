import React, { useEffect, useState } from "react";

import Spinner from "./Spinner";
import Game from "./Game";
import useGameContext from "./GameContext";

const Loader: React.FC = () => {
  const { load } = useGameContext();
  const [isLoaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!isLoaded) {
      setTimeout(initialize, 1);
    }
  }, []);

  function initialize() {
    load();
    setLoaded(true);
  }

  return isLoaded ? <Game /> : <Spinner />;
};

export default Loader;
