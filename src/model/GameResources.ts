import clamp from "../utils/clamp";
import { Resource } from "./Resource";
import { genResourceManager, ResourceManager } from "./ResourceManager";
import tickTimer from "../utils/tickTimer";

import { default as resources_time } from "../data/resources_time.json";
import { default as resources_board } from "../data/resources_board.json";
import { default as resources_game } from "../data/resources_game.json";
import { default as resources_cell } from "../data/resources_cell.json";
const loadResources = <Partial<Resource>[][]>[
  resources_time,
  resources_board,
  resources_game,
  resources_cell,
];

export function initGameResources(
  resourceManager?: ResourceManager,
): ResourceManager {
  const rm = resourceManager ?? genResourceManager();
  loadResources.flat().forEach((props) => rm.upsert(props));

  setValueFunction(rm.get("rows"), (v) => Math.max(3, v));
  setValueFunction(rm.get("cols"), (v) => Math.max(3, v));
  setValueFunction(rm.get("difficulty"), (v) => clamp(v));
  setValueFunction(rm.get("hintQuality"), (v) => clamp(v));
  setValueFunction(rm.get("resetSpeed"), (v, k) => (k ? v : clamp(v)));

  rm.get("rows").cost = (n) => [{ resource: "cells", count: n ** 2 }];
  rm.get("cols").cost = (n) => [{ resource: "cells", count: n ** 2 }];
  rm.get("hints").cost = () => [{ resource: "wins", count: 1 }];

  tickTimer(rm.get("resetSpeed"), { kind: "remainingTime" });
  tickTimer(rm.get("totalTime"), { direction: 1 });
  activeTimeTicker(rm.get("activeTime"), "tick", "load");
  activeTimeTicker(rm.get("offlineTime"), "load", "tick");

  return rm;
}

function setValueFunction(
  res: Resource,
  fn: (val: number, kind?: string) => number,
) {
  res.value = (kind) => fn((kind ? res.extra[kind] : res.count) ?? 0, kind);
}

function activeTimeTicker(res: Resource, count: string, reset: string) {
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
  };
}
