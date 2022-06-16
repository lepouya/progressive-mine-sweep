import { createRoot } from "react-dom/client";

import { GameContextProvider } from "./components/GameContext";
import Loader from "./components/Loader";
import { getHTMLElement } from "./utils/document";

window.addEventListener(
  "load",
  () =>
    createRoot(getHTMLElement("app")).render(
      <GameContextProvider>
        <Loader />
      </GameContextProvider>,
    ),
  false,
);
