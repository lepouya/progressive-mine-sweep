import { useEffect, useState } from "react";

import Reset from "../pages/Reset";
import Game from "./Game";
import useGameContext from "./GameContext";
import Spinner from "./Spinner";

export default function Loader() {
  const { context, load } = useGameContext();
  const [isLoaded, setLoaded] = useState(false);
  const [isFailed, setFailed] = useState(false);

  useEffect(() => {
    if (!isLoaded && !isFailed) {
      setTimeout(initialize, 1);
    }
  }, [isLoaded, isFailed]);

  function initialize() {
    try {
      context.init();
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
}
