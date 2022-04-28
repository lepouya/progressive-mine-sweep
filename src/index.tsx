import React from "react";
import { createRoot } from "react-dom/client";

import Loader from "./components/Loader";
import { GameContextProvider } from "./components/GameContext";

window.onload = () => {
  const app = document.getElementById("app");
  const root = createRoot(app!);
  root.render(
    <GameContextProvider>
      <Loader />
    </GameContextProvider>,
  );
};
