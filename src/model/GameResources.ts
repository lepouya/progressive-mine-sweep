import tasks_auto from "../data/auto.json";
import resources_board from "../data/resources_board.json";
import resources_cell from "../data/resources_cell.json";
import resources_game from "../data/resources_game.json";
import resources_time from "../data/resources_time.json";
import tickTimer from "../utils/tickTimer";
import { Context } from "./Context";
import * as Auto from "./GameAutomation";
import { Resource } from "./Resource";
import { compileResourceCost, ResourceManager } from "./ResourceManager";

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
  const resources = (
    loadResources as Partial<Resource<Context<boolean>, boolean>>[][]
  )
    .flat()
    .map((props) => rm.upsert(props));

  resources.forEach((res) => {
    if (typeof res.cost === "string") {
      res.cost = compileResourceCost(rm, res.cost);
    }
  });

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
    .map((res) => rm.get((res as any).name as string))
    .map((res) => (res.shouldTick = Auto.shouldTick(res)));

  rm.get("autoRevealNeighbors").tick = () =>
    Auto.revealNeighborsTask(rm.context);
  rm.get("autoResetGame").tick = () => Auto.resetGameTask(rm.context);
  rm.get("autoFlagMines").tick = () => Auto.flagMinesTask(rm.context);
  rm.get("autoRevealHints").tick = () => Auto.revealHintsTask(rm.context);
  rm.get("autoPurchaseHints").tick = () => Auto.purchaseHintsTask(rm.context);

  return rm;
}
