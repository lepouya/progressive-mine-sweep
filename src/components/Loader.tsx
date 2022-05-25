import React, { useEffect, useState } from "react";

import Spinner from "./Spinner";
import Game from "./Game";
import useGameContext from "./GameContext";
import Reset from "../pages/Reset";

const Loader: React.FC = () => {
  const { load } = useGameContext();
  const [isLoaded, setLoaded] = useState(false);
  const [isFailed, setFailed] = useState(false);

  useEffect(() => {
    if (!isLoaded && !isFailed) {
      setTimeout(initialize, 1);
    }
  }, [isLoaded, isFailed]);

  function initialize() {
    try {
      load();
      setLoaded(true);
    } catch (ex) {
      setFailed(true);
      throw ex;
    }
  }

  if (isLoaded) {
    return <Game />;
  } else if (isFailed) {
    return <Reset />;
  } else {
    return <Spinner />;
  }
};

export default Loader;
