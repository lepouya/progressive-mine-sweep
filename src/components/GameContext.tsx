import { createContext, PropsWithChildren, useContext } from "react";

import achievements_normal from "../data/achievements_normal.json";
import achievements_secret from "../data/achievements_secret.json";
import tasks_auto from "../data/auto.json";
import resources_board from "../data/resources_board.json";
import resources_cell from "../data/resources_cell.json";
import resources_game from "../data/resources_game.json";
import resources_time from "../data/resources_time.json";
import { emptyContext, wrapContext } from "../model/Context";
import * as GameAchievements from "../model/GameAchievements";
import * as GameAutomation from "../model/GameAutomation";
import * as GameFormulas from "../model/GameFormulas";
import { compileAllResources } from "../model/Resource";

const context = emptyContext<boolean>();
const GameReactContext = createContext(context);

export function GameContextProvider(props: PropsWithChildren) {
  return (
    <GameReactContext.Provider value={context}>
      {props.children}
    </GameReactContext.Provider>
  );
}

export default function useGameContext() {
  return wrapContext(useContext(GameReactContext));
}

const _load_resources = [
  resources_time,
  resources_board,
  resources_game,
  resources_cell,
  tasks_auto,
  achievements_normal,
  achievements_secret,
];

Object.assign(context, {
  ...GameAchievements,
  ...GameAutomation,
  ...GameFormulas,
  init: function (this: typeof context) {
    this.resourceManager.gainMultiplier = GameFormulas.gainMultiplier;
    this.resourceManager.costMultiplier = GameFormulas.costMultiplier;

    _load_resources
      .flat()
      .forEach((props: any) => this.resourceManager.upsert(props));
    compileAllResources(this.resourceManager);
  },
});
