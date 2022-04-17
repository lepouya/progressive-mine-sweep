import React from "react";
import { createRoot } from "react-dom/client";

import Loader from "./components/Loader";
import { GameContextProvider } from "./utils/GameContext";

window.onload = () => {
  const main = document.getElementById("main");
  const root = createRoot(main!);
  root.render(
    <GameContextProvider>
      <Loader />
    </GameContextProvider>,
  );
};
