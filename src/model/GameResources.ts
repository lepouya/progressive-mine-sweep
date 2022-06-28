import tasks_auto from "../data/auto.json";
import resources_board from "../data/resources_board.json";
import resources_cell from "../data/resources_cell.json";
import resources_game from "../data/resources_game.json";
import resources_time from "../data/resources_time.json";
import tickTimer from "../utils/tickTimer";
import { Context } from "./Context";
import * as Auto from "./GameAutomation";
import { ResourceManager } from "./ResourceManager";

const loadResources = [
  resources_time,
  resources_board,
  resources_game,
  resources_cell,
  tasks_auto,
];

export function initGameResources(
  rm: ResourceManager<Context<boolean>, boolean>,
): ResourceManager<Context<boolean>, boolean> {
  loadResources.flat().forEach((props: any) => rm.upsert(props));

  tickTimer(rm.get("resetSpeed"), { kind: "remainingTime" });
  tickTimer(rm.get("totalTime"), { direction: 1 });
  tickTimer(rm.get("activeTime"), {
    direction: 1,
    source: "tick",
    streakKind: "current",
    maxStreakKind: "max",
    resetStreakSource: "load",
  });
  tickTimer(rm.get("offlineTime"), {
    direction: 1,
    source: "load",
    streakKind: "current",
    maxStreakKind: "max",
    resetStreakSource: "tick",
  });

  tasks_auto
    .map((res) => rm.get(res.name))
    .forEach((res) => {
      res.shouldTick = Auto.shouldTick;
    });

  rm.get("autoRevealNeighbors").tick = () =>
    Auto.revealNeighborsTask(rm.context);
  rm.get("autoResetGame").tick = () => Auto.resetGameTask(rm.context);
  rm.get("autoFlagMines").tick = () => Auto.flagMinesTask(rm.context);
  rm.get("autoRevealHints").tick = () => Auto.revealHintsTask(rm.context);
  rm.get("autoPurchaseHints").tick = () => Auto.purchaseHintsTask(rm.context);
  rm.get("autoBoardUpgrade").tick = () => Auto.expandBoardDims(rm.context);

  return rm;
}
