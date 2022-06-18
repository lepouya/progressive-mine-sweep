import resources_board from "../data/resources_board.json";
import resources_cell from "../data/resources_cell.json";
import resources_game from "../data/resources_game.json";
import resources_time from "../data/resources_time.json";
import clamp from "../utils/clamp";
import tickTimer from "../utils/tickTimer";
import { Resource } from "./Resource";
import { ResourceManager } from "./ResourceManager";

const loadResources = [
  resources_time,
  resources_board,
  resources_game,
  resources_cell,
];

export function initGameResources<Context, Result>(
  rm: ResourceManager<Context, Result>,
): ResourceManager<Context, Result> {
  (loadResources as Partial<Resource<Context, Result>>[][])
    .flat()
    .forEach((props) => rm.upsert(props));

  setValueFunction(rm.get("rows"), (v) => clamp(v, 3, 100));
  setValueFunction(rm.get("cols"), (v) => clamp(v, 3, 100));
  setValueFunction(rm.get("difficulty"), (v) => clamp(v, 0, 100));
  setValueFunction(rm.get("hintQuality"), (v) => clamp(v, 0, 100));
  setValueFunction(rm.get("resetSpeed"), (v, k) => (k ? v : clamp(v, 0, 100)));

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
  activeTimeTicker(rm.get("activeTime"), "tick", "load");
  activeTimeTicker(rm.get("offlineTime"), "load", "tick");

  return rm;
}

function setValueFunction<Context, Result>(
  res: Resource<Context, Result>,
  fn: (val: number, kind?: string) => number,
) {
  res.value = (kind) => fn((kind ? res.extra[kind] : res.count) ?? 0, kind);
}

function activeTimeTicker<Context, Result>(
  res: Resource<Context, Result>,
  count: string,
  reset: string,
) {
  res.tick = (dt: number, source?: string) => {
    if (source === count) {
      res.count += dt;
      res.extra.current += dt;
      if (res.extra.current > res.extra.max) {
        res.extra.max = res.extra.current;
      }
    } else if (source === reset) {
      res.extra.current = 0;
    }

    return null;
  };
}
