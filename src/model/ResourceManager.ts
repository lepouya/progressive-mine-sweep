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
import { Settings } from "./Settings";

export type ResourceManager = {
  resources: Record<string, Resource & ResourceHelper>;

  upsert: (props: Optional<Resource> | string) => Resource & ResourceHelper;
  get: (resource: Resource | string) => Resource & ResourceHelper;
  purchase: (toBuy: ResourceCount[], style?: PurchaseStyle) => ResourceCount[];

  update: (
    now?: number,
    settings?: Optional<Settings>,
    source?: string,
  ) => void;
};

export type PurchaseStyle = "full" | "partial" | "free" | "dry";

export type ResourceHelper = {
  buy: (count?: number, style?: PurchaseStyle, kind?: string) => number;
  add: (count?: number, kind?: string) => number;
  canBuy: (count?: number, kind?: string) => number;
};

export function genResourceManager(): ResourceManager {
  const rm: ResourceManager = {
    resources: {},
    upsert: (props) => upsert(rm, props),
    get: (resource) => resolve(rm, resource),
    purchase: (toBuy, style) => purchase(rm, toBuy, style),
    update: (now, settings, source) =>
      update(rm, now, settings ?? {}, source ?? "unknown"),
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

function resolve(
  rm: ResourceManager,
  resource: Resource | string,
): Resource & ResourceHelper {
  return rm.resources[typeof resource === "string" ? resource : resource.name];
}

function upsert(
  rm: ResourceManager,
  props: Optional<Resource> | string,
): Resource & ResourceHelper {
  const name = typeof props === "string" ? props : props.name ?? "";
  const res = rm.resources[name] ?? genEmptyResource(name);

  if (typeof props !== "string") {
    let k: keyof Resource;
    for (k in props) {
      assign(res, k, props[k]);
    }
  }

  res.buy = (count = 1, style = "partial", kind = "") =>
    getCountOf(
      purchase(rm, [{ resource: res, count, kind }], style),
      res.name,
      kind,
    );
  res.add = (count, kind) => res.buy(count, "free", kind);
  res.canBuy = (count, kind) => res.buy(count, "dry", kind);

  if (res.name) {
    rm.resources[res.name] = res;
  }

  return res;
}

function update(
  rm: ResourceManager,
  now: number | undefined,
  settings: Optional<Settings>,
  source: string,
) {
  const {
    rateUpdateSecs = 1.0,
    minResourceUpdateSecs = 0.001,
    maxResourceUpdateSecs = 86400.0,
    maxResourceTickSecs = 1.0,
    timeDilation = 1.0,
  } = settings;

  if (!now) {
    now = Date.now();
  }

  let dt = clamp(
    (now - (settings.lastUpdate ?? now)) / 1000.0,
    0,
    maxResourceUpdateSecs,
  );
  if (dt < minResourceUpdateSecs) {
    return;
  }
  settings.lastUpdate = now;

  while (dt > 0) {
    const tick = clamp(dt, minResourceUpdateSecs, maxResourceTickSecs);
    Object.values(rm.resources).forEach((res) =>
      res.tick(tick / timeDilation, source),
    );
    dt -= tick;
  }

  Object.values(rm.resources).forEach((res) => {
    const rateDt =
      ((settings.lastUpdate ?? 0) - (res._rate.lastCheck ?? 0)) / 1000.0;
    if (rateDt >= rateUpdateSecs) {
      if (res._rate.lastCount !== undefined) {
        res.rate = (res.count - res._rate.lastCount) / rateDt;
      } else {
        res.rate = 0;
      }
    }

    if (
      res._rate.lastCheck === undefined ||
      res._rate.lastCount === undefined ||
      rateDt >= rateUpdateSecs
    ) {
      res._rate.lastCheck = settings.lastUpdate;
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

        if (style === "dry") {
          return [gain];
        } else {
          cost.forEach(({ resource, count, kind }) =>
            applyToResource(resolve(rm, resource), [
              { resource, count: -count, kind },
            ]),
          );
          return applyToResource(rc.resource, [gain]);
        }
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

function getCountOf(
  rcs: ResourceCount[],
  resName: string,
  resKind?: string,
): number {
  return (
    rcs
      .filter(
        ({ resource, kind }) =>
          (resKind ?? "") === (kind ?? "") &&
          resName === (typeof resource === "string" ? resource : resource.name),
      )
      .map(({ count }) => count)
      .pop() ?? 0
  );
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
  if (!resource || count <= 0 || !(resource.unlocked ?? true)) {
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
    if (style !== "full") {
      partialCost = combineResources(
        partialCost,
        resolveAll(rm, resource.cost(i + 1)),
      );
      if (!canAfford(rm, partialCost)) {
        break;
      }
    }

    partialCount++;
    cost = combineResources(cost, resolveAll(rm, resource.cost(i + 1)));
  }

  if (
    !canAfford(rm, cost) ||
    (style === "full" && start + partialCount !== target)
  ) {
    return [{ resource, count: 0, kind }, []];
  }

  return [{ resource, count: partialCount, kind }, cost];
}
