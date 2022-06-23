import assign from "../utils/assign";
import clamp from "../utils/clamp";
import dedupe from "../utils/dedupe";
import { setSaveProperties } from "../utils/store";
import * as R from "./Resource";

import type { Resource, ResourceCount } from "./Resource";

export type ResourceManager<Context, Result> = {
  context: Context;
  settings: Partial<ResourceManagerSettings>;
  resources: Record<string, ManagedResource<Context, Result>>;

  upsert: (
    props: Partial<Resource<Context, Result>> | string,
  ) => ManagedResource<Context, Result>;
  get: (
    resource: Resource<Context, Result> | string,
  ) => ManagedResource<Context, Result>;
  purchase: (
    toBuy: ResourceCount<Context, Result>[],
    style?: PurchaseStyle,
    gainMultiplier?: number,
    costMultiplier?: number,
  ) => PurchaseCost<Context, Result>;
  canAfford: (cost: ResourceCount<Context, Result>[]) => boolean;

  update: (now?: number, source?: string) => Result[];
};

export type PurchaseStyle =
  | "full"
  | "partial"
  | "free"
  | "dry-full"
  | "dry-partial";

export type PurchaseCost<Context, Result> = {
  count: number;
  gain: ResourceCount<Context, Result>[];
  cost: ResourceCount<Context, Result>[];
};

export type ManagedResource<Context, Result> = Resource<Context, Result> & {
  buy: (
    count?: number,
    style?: PurchaseStyle,
    kind?: string,
    gainMultiplier?: number,
    costMultiplier?: number,
  ) => PurchaseCost<Context, Result>;
  add: (
    count?: number,
    kind?: string,
    gainMultiplier?: number,
  ) => PurchaseCost<Context, Result>;
  canBuy: (
    count?: number,
    kind?: string,
    costMultiplier?: number,
  ) => PurchaseCost<Context, Result>;
};

export type ResourceManagerSettings = {
  lastUpdate: number;
  rateUpdateSecs: number;
  minResourceUpdateSecs: number;
  maxResourceUpdateSecs: number;
  maxResourceTickSecs: number;
  timeDilation: number;
};

export function genResourceManager<Context, Result>(
  context: Context,
  settings: Partial<ResourceManagerSettings>,
): ResourceManager<Context, Result> {
  const rm: ResourceManager<Context, Result> = {
    context,
    settings,
    resources: {},
    upsert: (props) => upsert(rm, props),
    get: (resource) => resolve(rm, resource),
    purchase: (
      toBuy,
      style = "partial",
      gainMultiplier = 1,
      costMultiplier = 1,
    ) => purchase(rm, toBuy, style, gainMultiplier, costMultiplier),
    canAfford: (cost) => canAfford(rm, cost),
    update: (now, source) => update(rm, now ?? Date.now(), source ?? "unknown"),
  };

  setSaveProperties(rm, ["resources"]);
  return rm;
}

export function mergeResourceManagers<Context, Result>(
  rm: ResourceManager<Context, Result>,
  toLoad: Partial<ResourceManager<Context, Result>>,
): ResourceManager<Context, Result> {
  Object.values(toLoad["resources"] ?? {}).forEach((res) => rm.upsert(res));
  return rm;
}

function resolve<Context, Result>(
  rm: ResourceManager<Context, Result>,
  resource: Resource<Context, Result> | string,
): ManagedResource<Context, Result> {
  return rm.resources[typeof resource === "string" ? resource : resource.name];
}

function upsert<Context, Result>(
  rm: ResourceManager<Context, Result>,
  props: Partial<Resource<Context, Result>> | string,
): ManagedResource<Context, Result> {
  const name = typeof props === "string" ? props : props.name ?? "";
  const res = rm.resources[name] ?? R.genEmptyResource(name);

  if (typeof props !== "string") {
    let k: keyof Resource<Context, Result>;
    for (k in props) {
      assign(res, k, props[k]);
    }
  }

  res.buy = (
    count = 1,
    style = "partial",
    kind = "",
    gainMultiplier = 1,
    costMultiplier = 1,
  ) =>
    purchase(
      rm,
      [{ resource: res, count, kind }],
      style,
      gainMultiplier,
      costMultiplier,
    );
  res.add = (count, kind, gainMultiplier) =>
    res.buy(count, "free", kind, gainMultiplier);
  res.canBuy = (count, kind, costMultiplier) =>
    res.buy(count, "dry-partial", kind, undefined, costMultiplier);

  if (res.name) {
    rm.resources[res.name] = res;
  }

  return res;
}

export function compileResourceCost<Context, Result>(
  rm: ResourceManager<Context, Result>,
  cost: string,
): (n: number) => ResourceCount<Context, Result>[] {
  return eval(
    "(n) => [" +
      (cost as string)
        .replace(/\s/gim, "")
        .split(/[;,]/gim)
        .map((cost) => {
          const parts = cost
            .split(/:/gim, 2)
            .map((s) =>
              s.replace(/\b\w+\b/gim, (m) =>
                rm.resources[m] ? `rm.resources.${m}` : m,
              ),
            );
          const rc = [
            `resource: ${parts[0]}`,
            `count: ${parts[parts.length - 1]}`,
          ];
          if (parts.length > 2) {
            rc.push(`kind: ${parts[1]}`);
          }
          return `{${rc.join(", ")}}`;
        })
        .join(", ") +
      "];",
  );
}

function update<Context, Result>(
  rm: ResourceManager<Context, Result>,
  now: number,
  source: string,
): Result[] {
  const {
    rateUpdateSecs = 1.0,
    minResourceUpdateSecs = 0.001,
    maxResourceUpdateSecs = 86400.0,
    maxResourceTickSecs = 1.0,
    timeDilation = 1.0,
  } = rm.settings;

  let dt = clamp(
    (now - (rm.settings.lastUpdate ?? now)) / 1000.0,
    0,
    maxResourceUpdateSecs,
  );
  if (dt < minResourceUpdateSecs && rm.settings.lastUpdate != undefined) {
    return [];
  }

  rm.settings.lastUpdate = now;
  const epoch = now - dt * 1000.0;
  const resources = Object.values(rm.resources).filter(
    (res) => res.unlocked ?? true,
  );
  const tickResources = resources.filter((res) => res.tick && !res.disabled);

  resources.forEach((res) => {
    res.rate.lastCountUpdate ??= epoch;
    res.rate.lastCount ??= res.count;
    res.execution.lastTick = clamp(
      res.execution.lastTick ?? epoch,
      now - maxResourceUpdateSecs * 1000.0,
      now,
    );
    res.execution.lastAttempt = now;
  });

  let results: Record<string, Result> = {};
  const tickScale = 1 / 1000.0 / timeDilation;
  while (dt > 0) {
    dt -= clamp(dt, minResourceUpdateSecs, maxResourceTickSecs);
    const slice = now - dt * 1000.0;

    tickResources.forEach((res) => {
      const tick = (slice - res.execution.lastTick!) * tickScale;

      if (tick > 0 && (!res.shouldTick || res.shouldTick(tick, source))) {
        res.execution.lastResult = res.tick!(tick, source) ?? undefined;
        res.execution.lastTick = slice;
        res.rate.deltaTicks = (res.rate.deltaTicks ?? 0) + 1;
        res.rate.lastTickUpdate ??= slice;
        if (res.execution.lastResult) {
          results[res.name] = res.execution.lastResult;
        }
      }
    });
  }

  resources.forEach((res) => {
    const rateDt = (now - (res.rate.lastCountUpdate ?? 0)) / 1000.0;
    if (
      res.rate.lastCountUpdate == undefined ||
      res.rate.lastCount == undefined ||
      rateDt >= rateUpdateSecs
    ) {
      res.rate.count = (res.count - (res.rate.lastCount ?? 0)) / rateDt;
      res.rate.lastCountUpdate = now;
      res.rate.lastCount = res.count;
    }

    const tickRateDt = (now - (res.rate.lastTickUpdate ?? 0)) / 1000.0;
    if (
      res.rate.lastTickUpdate == undefined ||
      res.rate.deltaTicks == undefined ||
      tickRateDt >= rateUpdateSecs
    ) {
      res.rate.ticks = (res.rate.deltaTicks ?? 0) / tickRateDt;
      res.rate.deltaTicks = 0;
      res.rate.lastTickUpdate = now;
    }
  });

  return dedupe(Object.values(results));
}

function purchase<Context, Result>(
  rm: ResourceManager<Context, Result>,
  toBuy: ResourceCount<Context, Result>[],
  style: PurchaseStyle,
  gainMultiplier: number,
  costMultiplier: number,
): PurchaseCost<Context, Result> {
  const costs = resolveAll(rm, toBuy).map((rc) => {
    const rcCost = getPurchaseCost(
      rm,
      rc.resource,
      rc.count,
      rc.kind,
      style,
      gainMultiplier,
      costMultiplier,
    );

    if (style === "dry-partial" || style === "dry-full") {
      return rcCost;
    } else {
      const gain = R.applyToResource(rc.resource, rcCost.gain),
        count = getCountOf(gain, rc.resource.name, rc.kind),
        cost = rcCost.cost
          .map(({ resource, count, kind }) =>
            R.applyToResource(resolve(rm, resource), [
              { resource, count: -count, kind },
            ]),
          )
          .flat();
      return { count, gain, cost };
    }
  });

  return {
    count: costs.reduce((count, rcCost) => count + rcCost.count, 0),
    gain: R.combineResources(costs.map((rcCost) => rcCost.gain).flat()),
    cost: R.combineResources(costs.map((rcCost) => rcCost.cost).flat()),
  };
}

function resolveAll<Context, Result>(
  rm: ResourceManager<Context, Result>,
  rcs: ResourceCount<Context, Result>[],
): {
  resource: ManagedResource<Context, Result>;
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

function getCountOf<Context, Result>(
  rcs: ResourceCount<Context, Result>[],
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

function canAfford<Context, Result>(
  rm: ResourceManager<Context, Result>,
  cost: ResourceCount<Context, Result>[],
): boolean {
  return resolveAll(rm, R.combineResources(cost)).every((rc) =>
    R.checkHasResources(rc.resource, [rc], true),
  );
}

function getPurchaseCost<Context, Result>(
  rm: ResourceManager<Context, Result>,
  resource: Resource<Context, Result>,
  count: number,
  kind: string,
  style: PurchaseStyle,
  gainMultiplier: number,
  costMultiplier: number,
): PurchaseCost<Context, Result> {
  if (
    !resource ||
    count === 0 ||
    (!(resource.unlocked ?? true) && !style.includes("dry"))
  ) {
    return { count: 0, gain: [], cost: [] };
  }

  let start = kind ? resource.extra[kind] ?? 0 : resource.count;
  let target = clamp(
    start + count,
    !kind ? resource.minCount ?? 0 : 0,
    !kind ? resource.maxCount ?? Infinity : Infinity,
  );

  if (style === "free") {
    const gainCount = gainMultiplier * (target - start);
    return {
      count: gainCount,
      gain: [{ resource, count: gainCount, kind }],
      cost: [],
    };
  }

  if (start > target) {
    [start, target] = [target, start];
    [gainMultiplier, costMultiplier] = [-gainMultiplier, -costMultiplier];
  }

  let cost: ResourceCount<Context, Result>[] = [];
  let partialCost = cost;
  let partialCount = 0;
  for (let i = start; i < target; i++) {
    const curCost = R.scaleResources(
      resolveAll(rm, resource.cost(i + 1, kind)),
      costMultiplier,
    );
    if (style.includes("partial")) {
      partialCost = R.combineResources(partialCost, curCost);
      if (!canAfford(rm, partialCost)) {
        break;
      }
    }

    partialCount++;
    cost = R.combineResources(cost, curCost);
  }

  if (
    (style !== "dry-full" && !canAfford(rm, cost)) ||
    (style === "full" && start + partialCount !== target)
  ) {
    return { count: 0, gain: [], cost: [] };
  }

  const gainCount = gainMultiplier * partialCount;
  return {
    count: gainCount,
    gain: [{ resource, count: gainCount, kind }],
    cost,
  };
}
