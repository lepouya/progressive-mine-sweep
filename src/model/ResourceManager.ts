import assign from "../utils/assign";
import clamp from "../utils/clamp";
import Optional from "../utils/Optional";
import {
  applyToResource,
  checkHasResources,
  combineResources,
  genEmptyResource,
  Resource,
  ResourceCount,
} from "./Resource";

export type PurchaseStyle = "full" | "partial" | "free";

export type ResourceManager = {
  resources: Record<string, Resource>;
  lastUpdate?: number;

  create: (props: Optional<Resource>) => Resource;
  update: (now?: number) => void;
  purchase: (toBuy: ResourceCount[], style?: PurchaseStyle) => ResourceCount[];
};

export function genResourceManager(): ResourceManager {
  const rm: ResourceManager = {
    resources: {},
    lastUpdate: Date.now(),
    create: (props) => create(rm, props),
    update: (now) => update(rm, now),
    purchase: (toBuy, style) => purchase(rm, toBuy, style),
  };

  return rm;
}

function create(rm: ResourceManager, props: Optional<Resource>): Resource {
  const name = props.name ?? "";
  const res = rm.resources[name] ?? genEmptyResource(name);

  let k: keyof Resource;
  for (k in props) {
    assign(res, k, props[k]);
  }

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
  style?: PurchaseStyle,
): ResourceCount[] {
  return combineResources(
    resolve(rm, toBuy)
      .map((rc) => {
        const [gain, cost] = getPurchaseCost(
          rm,
          rc.resource,
          rc.count,
          rc.kind,
          style ?? (rc.kind === "" ? "partial" : "free"),
        );

        applyToResource(rc.resource, [gain]);
        cost.forEach(({ resource, count, kind }) =>
          applyToResource(
            typeof resource === "string" ? rm.resources[resource] : resource,
            [{ resource, count: -count, kind }],
          ),
        );

        return [gain];
      })
      .flat(),
  );
}

function resolve(
  rm: ResourceManager,
  rcs: ResourceCount[],
): {
  resource: Resource;
  count: number;
  kind: string;
}[] {
  return rcs
    .map(({ resource, count, kind }) => ({
      resource:
        typeof resource === "string" ? rm.resources[resource] : resource,
      count,
      kind: kind ?? "",
    }))
    .filter(({ resource, count }) => resource !== undefined && count !== 0);
}

function canAfford(rm: ResourceManager, cost: ResourceCount[]): boolean {
  return resolve(rm, combineResources(cost)).every((rc) =>
    checkHasResources(rc.resource, [rc]),
  );
}

function getPurchaseCost(
  rm: ResourceManager,
  resource: Resource,
  count: number,
  kind: string,
  style: PurchaseStyle,
): [ResourceCount, ResourceCount[]] {
  if (!resource || count <= 0) {
    return [{ resource, count: 0, kind }, []];
  }

  let [start, target] = [0, 0];
  if (!kind || kind === "") {
    start = resource.count;
    target = Math.max(0, start + count);
    if (resource.maxCount !== undefined && target > resource.maxCount) {
      target = resource.maxCount;
    }
  } else {
    start = resource.extra[kind] ?? 0;
    target = Math.max(0, start + count);
  }

  if (style === "free") {
    return [{ resource, count: target - start, kind }, []];
  }

  let cost: ResourceCount[] = [];
  let partialCost = cost;
  let partialCount = 0;
  for (let i = start; i < target; i++) {
    if (style === "partial") {
      partialCost = combineResources(
        partialCost,
        resolve(rm, resource.cost(partialCount + 1)),
      );
      if (!canAfford(rm, partialCost)) {
        break;
      }
    }

    partialCount++;
    cost = combineResources(cost, resolve(rm, resource.cost(partialCount)));
  }

  if (
    !canAfford(rm, cost) ||
    (style === "full" && start + partialCount !== target)
  ) {
    return [{ resource, count: 0, kind }, []];
  }

  return [{ resource, count: partialCount, kind }, cost];
}
