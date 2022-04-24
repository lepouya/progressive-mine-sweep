import clamp from "../utils/clamp";
import { Resource } from "./Resource";
import { genResourceManager, ResourceManager } from "./ResourceManager";

export function initGameResources(
  resourceManager?: ResourceManager,
): ResourceManager {
  const rm = resourceManager ?? genResourceManager();

  loadResources(rm).then((_) => {
    rm.get("rows").value = () => Math.max(3, rm.get("rows").count);
    rm.get("cols").value = () => Math.max(3, rm.get("cols").count);
    rm.get("difficulty").value = () => clamp(rm.get("difficulty").count);
    rm.get("hintQuality").value = () => clamp(rm.get("hintQuality").count);

    rm.get("rows").cost = (n) => [{ resource: "cells", count: n ** 2 }];
    rm.get("cols").cost = (n) => [{ resource: "cells", count: n ** 2 }];

    rm.get("totalTime").tick = (dt) => (rm.get("totalTime").count += dt);
    rm.get("activeTime").tick = counter(rm.get("activeTime"), "tick", "load");
    rm.get("offlineTime").tick = counter(rm.get("offlineTime"), "load", "tick");
  });

  return rm;
}

async function loadResources(rm: ResourceManager) {
  const data = await Promise.all([
    import("../data/resources_time.json"),
    import("../data/resources_board.json"),
    import("../data/resources_game.json"),
    import("../data/resources_cell.json"),
  ]);
  return data
    .map((module) => <Partial<Resource>[]>module.default)
    .flat()
    .map((props) => rm.upsert(props));
}

function counter(res: Resource, countSource: string, resetSource: string) {
  return (dt: number, source?: string) => {
    if (source === countSource) {
      res.count += dt;
      res.extra.current += dt;
      if (res.extra.current > res.extra.max) {
        res.extra.max = res.extra.current;
      }
    } else if (source === resetSource) {
      res.extra.current = 0;
    }
  };
}
