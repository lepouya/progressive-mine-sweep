import clamp from "../utils/clamp";
import { genResourceManager, ResourceManager } from "./ResourceManager";

export function initGameResources(
  resourceManager?: ResourceManager,
): ResourceManager {
  const rm = resourceManager ?? genResourceManager();

  rm.upsert({
    name: "clicks",
    icon: "hand-click",
    extra: { left: 0, right: 0, useless: 0 },
  });
  rm.upsert({
    name: "cells",
    icon: "darkgreen square",
    extra: { auto: 0, manual: 0, hidden: 0 },
  });
  rm.upsert({
    name: "hints",
    icon: "green eye",
    extra: { auto: 0, manual: 0 },
  });
  rm.upsert({
    name: "flags",
    icon: "darkblue flag-2",
    extra: { auto: 0, manual: 0, unflags: 0 },
  });
  rm.upsert({
    name: "explosions",
    icon: "red alert-triangle",
    extra: { auto: 0, manual: 0 },
  });
  rm.upsert({
    name: "wins",
    icon: "darkgreen square-check",
    extra: { auto: 0, manual: 0 },
  });
  rm.upsert({
    name: "losses",
    icon: "darkred square-x",
    extra: { auto: 0, manual: 0 },
  });
  rm.upsert({
    name: "resets",
    icon: "refresh-dot",
    extra: { auto: 0, manual: 0 },
  });

  rm.upsert({
    name: "rows",
    icon: "arrows-vertical",
    count: 3,
    value: () => Math.max(3, rm.get("rows").count),
    cost: (n) => [{ resource: "cells", count: n ** 2 }],
  });

  rm.upsert({
    name: "cols",
    icon: "arrows-horizontal",
    count: 3,
    value: () => Math.max(3, rm.get("cols").count),
    cost: (n) => [{ resource: "cells", count: n ** 2 }],
  });

  rm.upsert({
    name: "difficulty",
    icon: "adjustments-horizontal",
    count: 0.15,
    value: () => clamp(rm.get("difficulty").count),
  });

  rm.upsert({
    name: "hintQuality",
    icon: "bulb",
    count: 0,
    value: () => clamp(rm.get("hintQuality").count),
  });

  const tt = rm.upsert({ name: "totalTime", icon: "clock" });
  tt.tick = (dt) => (tt.count += dt);

  const at = rm.upsert({
    name: "activeTime",
    icon: "alarm",
    extra: { current: 0, max: 0 },
  });
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

  const ot = rm.upsert({
    name: "offlineTime",
    icon: "user-off",
    extra: { current: 0, max: 0 },
  });
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
