import { createContext, FC, PropsWithChildren, useContext } from "react";

import tasks_auto from "../data/auto.json";
import resources_board from "../data/resources_board.json";
import resources_cell from "../data/resources_cell.json";
import resources_game from "../data/resources_game.json";
import resources_time from "../data/resources_time.json";
import { emptyContext, wrapContext } from "../model/Context";
import * as GameAutomation from "../model/GameAutomation";
import * as GameFormulas from "../model/GameFormulas";

const _context = emptyContext<boolean>();
const GameReactContext = createContext(_context);

export const GameContextProvider: FC<PropsWithChildren<{}>> = (props) => (
  <GameReactContext.Provider value={_context}>
    {props.children}
  </GameReactContext.Provider>
);

export default function useGameContext() {
  return wrapContext(useContext(GameReactContext));
}

window.addEventListener(
  "load",
  function () {
    const loadResources = [
      resources_time,
      resources_board,
      resources_game,
      resources_cell,
      tasks_auto,
    ];

    Object.assign(_context, { ...GameAutomation, ...GameFormulas });

    loadResources
      .flat()
      .forEach((props: any) => _context.resourceManager.upsert(props));
  },
  false,
);
