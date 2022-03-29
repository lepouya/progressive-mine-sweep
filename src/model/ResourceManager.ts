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
  lastUpdate: number;

  upsert: (props: Optional<Resource>) => Resource;
  get: (resource: Resource | string) => Resource;
  update: (now?: number) => void;
  purchase: (toBuy: ResourceCount[], style?: PurchaseStyle) => ResourceCount[];
};

export function genResourceManager(): ResourceManager {
  const rm: ResourceManager = {
    resources: {},
    lastUpdate: Date.now(),

    upsert: (props) => upsert(rm, props),
    get: (resource) => resolve(rm, resource),
    update: (now) => update(rm, now),
    purchase: (toBuy, style) => purchase(rm, toBuy, style),
  };

  return rm;
}

export function mergeResourceManagers(
  rm: ResourceManager,
  toLoad: Optional<ResourceManager>,
): ResourceManager {
  let k: keyof ResourceManager;
  for (k in toLoad) {
    if (k === "resources") {
      Object.values(toLoad[k] ?? {}).forEach((res) => rm.upsert(res));
    } else {
      assign(rm, k, toLoad[k]);
    }
  }

  return rm;
}

function upsert(rm: ResourceManager, props: Optional<Resource>): Resource {
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

function resolve(rm: ResourceManager, resource: Resource | string): Resource {
  return typeof resource === "string" ? rm.resources[resource] : resource;
}

function update(rm: ResourceManager, now?: number) {
  // TODO: move to settings
  const minUpdate = 0.001; // 1 ms
  const maxUpdate = 86400.0; // 1 day
  const maxTickDelta = 1; // Max granularity 1s per tick
  const timeDilation = 1; // Regular speed
  const rateUpdateWindow = 1; // Update the rates every 1s

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

  Object.values(rm.resources).forEach((res) => {
    const rateDt = (rm.lastUpdate - (res._rate.lastCheck ?? 0)) / 1000.0;
    if (rateDt >= rateUpdateWindow) {
      if (res._rate.lastCount !== undefined) {
        res.rate = (res.count - res._rate.lastCount) / rateDt;
      } else {
        res.rate = 0;
      }
    }

    if (
      res._rate.lastCheck === undefined ||
      res._rate.lastCount === undefined ||
      rateDt >= rateUpdateWindow
    ) {
      res._rate.lastCheck = rm.lastUpdate;
      res._rate.lastCount = res.count;
    }
  });
}

function purchase(
  rm: ResourceManager,
  toBuy: ResourceCount[],
  style?: PurchaseStyle,
): ResourceCount[] {
  return combineResources(
    resolveAll(rm, toBuy)
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

function resolveAll(
  rm: ResourceManager,
  rcs: ResourceCount[],
): {
  resource: Resource;
  count: number;
  kind: string;
}[] {
  return rcs
    .map(({ resource, count, kind }) => ({
      resource: resolve(rm, resource),
      count,
      kind: kind ?? "",
    }))
    .filter(({ resource, count }) => resource !== undefined && count !== 0);
}

function canAfford(rm: ResourceManager, cost: ResourceCount[]): boolean {
  return resolveAll(rm, combineResources(cost)).every((rc) =>
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
        resolveAll(rm, resource.cost(partialCount + 1)),
      );
      if (!canAfford(rm, partialCost)) {
        break;
      }
    }

    partialCount++;
    cost = combineResources(cost, resolveAll(rm, resource.cost(partialCount)));
  }

  if (
    !canAfford(rm, cost) ||
    (style === "full" && start + partialCount !== target)
  ) {
    return [{ resource, count: 0, kind }, []];
  }

  return [{ resource, count: partialCount, kind }, cost];
}
