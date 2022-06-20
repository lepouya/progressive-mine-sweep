import tasks_auto from "../data/auto.json";
import resources_board from "../data/resources_board.json";
import resources_cell from "../data/resources_cell.json";
import resources_game from "../data/resources_game.json";
import resources_time from "../data/resources_time.json";
import tickTimer from "../utils/tickTimer";
import { Context } from "./Context";
import { automatorShouldTick, autoRevealNeighborsTask } from "./GameAutomation";
import { Resource } from "./Resource";
import { ResourceManager } from "./ResourceManager";

const loadResources = [
  resources_time,
  resources_board,
  resources_game,
  resources_cell,
  tasks_auto,
];

export function initGameResources(
  rm: ResourceManager<Context, boolean>,
): ResourceManager<Context, boolean> {
  (loadResources as Partial<Resource<Context, boolean>>[][])
    .flat()
    .forEach((props) => rm.upsert(props));

  rm.get("rows").cost = (n) => [{ resource: "cells", count: n ** 2 }];
  rm.get("cols").cost = (n) => [{ resource: "cells", count: n ** 2 }];
  rm.get("hints").cost = () => [{ resource: "wins", count: 1 }];
  rm.get("difficulty").cost = (n) => [
    { resource: "flags", count: Math.floor(n / 2) },
  ];
  rm.get("hintQuality").cost = (n) => [
    { resource: "wins", count: 1 },
    { resource: "cells", count: n - 1 },
  ];
  rm.get("hintsCount").cost = (n) => [
    { resource: "wins", count: (n + 2) ** 2 },
    { resource: "cells", count: 2 ** (n + 2) },
  ];
  rm.get("resetSpeed").cost = (n) => [
    { resource: "resets", count: 1 },
    { resource: "cells", count: n },
  ];

  rm.get("revealNeighbors").cost = (n) => [
    { resource: "cols", count: 1 },
    { resource: "rows", count: 1 },
    { resource: "wins", count: n + 1 },
  ];

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

  const autoRevealNeighbors = rm.get("autoRevealNeighbors");
  autoRevealNeighbors.cost = (n) => [{ resource: "automation", count: n * 2 }];
  autoRevealNeighbors.shouldTick = automatorShouldTick(autoRevealNeighbors);
  autoRevealNeighbors.tick = () => autoRevealNeighborsTask(rm.context);

  return rm;
}
