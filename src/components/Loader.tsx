import React, { useEffect, useState } from "react";

import Spinner from "../utils/Spinner";
import Game from "./Game";
import Settings from "../model/Settings";

const Loader: React.FC = () => {
  const [isLoaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!isLoaded) {
      setTimeout(load, 1);
    }
  }, []);

  function load() {
    Settings.Load();
    setLoaded(true);
  }

  return isLoaded ? <Game /> : <Spinner />;
};

export default Loader;
