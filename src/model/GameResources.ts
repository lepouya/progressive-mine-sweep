import resources_board from "../data/resources_board.json";
import resources_cell from "../data/resources_cell.json";
import resources_game from "../data/resources_game.json";
import resources_time from "../data/resources_time.json";
import tasks_cell from "../data/tasks_cell.json";
import tickTimer from "../utils/tickTimer";
import { Resource } from "./Resource";
import { ResourceManager } from "./ResourceManager";

const loadResources = [
  resources_time,
  resources_board,
  resources_game,
  resources_cell,
  tasks_cell,
];

export function initGameResources<Context, Result>(
  rm: ResourceManager<Context, Result>,
): ResourceManager<Context, Result> {
  (loadResources as Partial<Resource<Context, Result>>[][])
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
  rm.get("resetSpeed").cost = (n) => [
    { resource: "resets", count: 1 },
    { resource: "cells", count: n },
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

  return rm;
}
