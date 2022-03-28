import clamp from "../utils/clamp";
import Optional from "../utils/Optional";
import {
  applyToResource,
  genEmptyResource,
  Resource,
  ResourceCount,
} from "./Resource";

export type ResourceManager = {
  resources: Record<string, Resource>;
  lastUpdate?: number;

  create: (props: Optional<Resource>) => Resource;
  update: (now?: number) => void;
  purchase: (toBuy: ResourceCount[]) => ResourceCount[];
};

export function genResourceManager(): ResourceManager {
  const rm: ResourceManager = {
    resources: {},
    lastUpdate: Date.now(),
    create: (props) => create(rm, props),
    update: (now) => update(rm, now),
    purchase: (toBuy) => purchase(rm, toBuy),
  };

  return rm;
}

function create(rm: ResourceManager, props: Optional<Resource>): Resource {
  const name = props.name ?? "";
  let res = rm.resources[name] ?? genEmptyResource(name);
  res = { ...res, ...props };

  if (name) {
    rm.resources[name] = res;
  }

  return res;
}

function update(rm: ResourceManager, now?: number) {
  // TODO: move to settings
  const minUpdate = 0.001; // 1 ms
  const maxUpdate = 86400.0; // 1 day
  const maxTickDelta = 1; // Max granularity 1s per tick
  const timeDilation = 1; // Regular speed

  if (!now) {
    now = Date.now();
  }

  let dt = clamp((now - (rm.lastUpdate ?? now)) / 1000.0, 0, maxUpdate);
  if (dt < minUpdate) {
    return;
  }
  rm.lastUpdate = now;

  while (dt > 0) {
    const tick = clamp(dt, minUpdate, maxTickDelta);
    Object.values(rm.resources).forEach((res) => res.tick(tick / timeDilation));
    dt -= tick;
  }

  // TODO: rate calculations
}

function purchase(
  rm: ResourceManager,
  toBuy: ResourceCount[],
): ResourceCount[] {
  toBuy.forEach((rc) =>
    applyToResource(
      typeof rc.resource === "string" ? rm.resources[rc.resource] : rc.resource,
      [rc],
    ),
  );
  return toBuy;
}
