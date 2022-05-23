import assign from "../utils/assign";
import clamp from "../utils/clamp";
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

  upsert: (props: Partial<Resource> | string) => Resource & ResourceHelper;
  get: (resource: Resource | string) => Resource & ResourceHelper;
  purchase: (toBuy: ResourceCount[], style?: PurchaseStyle) => PurchaseCost;
  canAfford: (cost: ResourceCount[]) => boolean;

  update: (now?: number, settings?: Partial<Settings>, source?: string) => void;
};

export type PurchaseStyle =
  | "full"
  | "partial"
  | "free"
  | "dry-full"
  | "dry-partial";

export type PurchaseCost = {
  count: number;
  gain: ResourceCount[];
  cost: ResourceCount[];
};

export type ResourceHelper = {
  buy: (count?: number, style?: PurchaseStyle, kind?: string) => PurchaseCost;
  add: (count?: number, kind?: string) => PurchaseCost;
  canBuy: (count?: number, kind?: string) => PurchaseCost;
};

export function genResourceManager(): ResourceManager {
  const rm: ResourceManager = {
    resources: {},
    upsert: (props) => upsert(rm, props),
    get: (resource) => resolve(rm, resource),
    purchase: (toBuy, style) => purchase(rm, toBuy, style),
    canAfford: (cost) => canAfford(rm, cost),
    update: (now, settings, source) =>
      update(rm, now, settings ?? {}, source ?? "unknown"),
  };

  return rm;
}

export function mergeResourceManagers(
  rm: ResourceManager,
  toLoad: Partial<ResourceManager>,
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
  props: Partial<Resource> | string,
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
    purchase(rm, [{ resource: res, count, kind }], style);
  res.add = (count, kind) => res.buy(count, "free", kind);
  res.canBuy = (count, kind) => res.buy(count, "dry-partial", kind);

  if (res.name) {
    rm.resources[res.name] = res;
  }

  return res;
}

function update(
  rm: ResourceManager,
  now: number | undefined,
  settings: Partial<Settings>,
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
    Object.values(rm.resources).forEach(
      (res) => res.tick && res.tick(tick / timeDilation, source),
    );
    dt -= tick;
  }

  Object.values(rm.resources).forEach((res) => {
    const rateDt =
      ((settings.lastUpdate ?? 0) - (res.rate.lastCheck ?? 0)) / 1000.0;
    if (rateDt >= rateUpdateSecs) {
      if (res.rate.lastCount !== undefined) {
        res.rate.value = (res.count - res.rate.lastCount) / rateDt;
      } else {
        res.rate.value = 0;
      }
    }

    if (
      res.rate.lastCheck === undefined ||
      res.rate.lastCount === undefined ||
      rateDt >= rateUpdateSecs
    ) {
      res.rate.lastCheck = settings.lastUpdate;
      res.rate.lastCount = res.count;
    }
  });
}

function purchase(
  rm: ResourceManager,
  toBuy: ResourceCount[],
  style?: PurchaseStyle,
): PurchaseCost {
  const costs = resolveAll(rm, toBuy).map((rc) => {
    const rcCost = getPurchaseCost(
      rm,
      rc.resource,
      rc.count,
      rc.kind,
      style ?? "partial",
    );

    if (style === "dry-partial" || style === "dry-full") {
      return rcCost;
    } else {
      const gain = applyToResource(rc.resource, rcCost.gain),
        count = getCountOf(gain, rc.resource.name, rc.kind),
        cost = rcCost.cost
          .map(({ resource, count, kind }) =>
            applyToResource(resolve(rm, resource), [
              { resource, count: -count, kind },
            ]),
          )
          .flat();
      return {
        count,
        gain,
        cost,
      };
    }
  });

  return {
    count: costs.reduce((count, rcCost) => count + rcCost.count, 0),
    gain: combineResources(costs.map((rcCost) => rcCost.gain).flat()),
    cost: combineResources(costs.map((rcCost) => rcCost.cost).flat()),
  };
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
    .filter(({ resource, count }) => resource && count);
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
): PurchaseCost {
  if (!resource || count === 0 || !(resource.unlocked ?? true)) {
    return { count: 0, gain: [], cost: [] };
  }

  const start = kind ? resource.extra[kind] ?? 0 : resource.count;
  let target = Math.max(0, start + count);
  if (!kind && resource.maxCount && target > resource.maxCount) {
    target = resource.maxCount;
  }

  if (style === "free") {
    return {
      count: target - start,
      gain: [{ resource, count: target - start, kind }],
      cost: [],
    };
  }

  let cost: ResourceCount[] = [];
  let partialCost = cost;
  let partialCount = 0;
  for (let i = start; i < target; i++) {
    if (style === "partial" || style === "dry-partial") {
      partialCost = combineResources(
        partialCost,
        resolveAll(rm, resource.cost(i + 1, kind)),
      );
      if (!canAfford(rm, partialCost)) {
        break;
      }
    }

    partialCount++;
    cost = combineResources(cost, resolveAll(rm, resource.cost(i + 1, kind)));
  }

  const gain = [{ resource, count: partialCount, kind }];

  if (
    (style !== "dry-full" && !canAfford(rm, cost)) ||
    (style === "full" && start + partialCount !== target)
  ) {
    return { count: 0, gain: [], cost: [] };
  }

  return {
    count: partialCount,
    gain,
    cost,
  };
}
