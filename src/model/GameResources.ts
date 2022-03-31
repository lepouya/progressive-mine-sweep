import clamp from "../utils/clamp";
import { genResourceManager, ResourceManager } from "./ResourceManager";

export default function initGameResources(
  resourceManager?: ResourceManager,
): ResourceManager {
  const rm = resourceManager ?? genResourceManager();

  rm.upsert({ name: "clicks", extra: { left: 0, right: 0, useless: 0 } });
  rm.upsert({ name: "cells", extra: { auto: 0, manual: 0, hidden: 0 } });
  rm.upsert({ name: "hints", extra: { auto: 0, manual: 0 } });
  rm.upsert({ name: "flags", extra: { auto: 0, manual: 0, unflags: 0 } });
  rm.upsert({ name: "explosions", extra: { auto: 0, manual: 0 } });
  rm.upsert({ name: "wins", extra: { auto: 0, manual: 0 } });
  rm.upsert({ name: "losses", extra: { auto: 0, manual: 0 } });
  rm.upsert({ name: "resets", extra: { auto: 0, manual: 0 } });

  rm.upsert({
    name: "rows",
    count: 3,
    value: () => Math.max(3, rm.get("rows").count),
    cost: (n) => [{ resource: "cells", count: n ** 2 }],
  });

  rm.upsert({
    name: "cols",
    count: 3,
    value: () => Math.max(3, rm.get("cols").count),
    cost: (n) => [{ resource: "cells", count: n ** 2 }],
  });

  rm.upsert({
    name: "difficulty",
    count: 0.15,
    value: () => clamp(rm.get("difficulty").count),
  });

  rm.upsert({
    name: "hintQuality",
    count: 0,
    value: () => clamp(rm.get("hintQuality").count),
  });

  const tt = rm.upsert("totalTime");
  tt.tick = (dt) => (tt.count += dt);

  const at = rm.upsert({ name: "activeTime", extra: { current: 0, max: 0 } });
  at.tick = (dt, src) => {
    if (src === "tick") {
      // Count online time and max session
      at.count += dt;
      at.extra.current += dt;
      if (at.extra.current > at.extra.max) {
        at.extra.max = at.extra.current;
      }
    } else if (src === "load") {
      // Went offline, so reset this
      at.extra.current = 0;
    }
  };

  const ot = rm.upsert({ name: "offlineTime", extra: { current: 0, max: 0 } });
  ot.tick = (dt, src) => {
    if (src === "load") {
      // Count offline time and max session
      ot.count += dt;
      ot.extra.current += dt;
      if (ot.extra.current > ot.extra.max) {
        ot.extra.max = ot.extra.current;
      }
    } else if (src === "tick") {
      // Came online, so reset this
      ot.extra.current = 0;
    }
  };

  return rm;
}
