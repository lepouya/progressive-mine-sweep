import React from "react";
import ReactDOM from "react-dom";

import Loader from "./components/Loader";
import { GameContextProvider } from "./utils/GameContext";

window.onload = () => {
  const main = document.getElementById("main");
  ReactDOM.render(
    <GameContextProvider>
      <Loader />
    </GameContextProvider>,
    main,
  );
};
