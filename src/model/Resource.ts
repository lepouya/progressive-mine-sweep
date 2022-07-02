import apply from "../utils/apply";
import assign from "../utils/assign";
import clamp from "../utils/clamp";
import { compileInlineFunction } from "../utils/compiler";
import dedupe from "../utils/dedupe";
import { setSaveProperties } from "../utils/store";
import tickTimer from "../utils/tickTimer";
import { Nullable } from "../utils/types";

export type Resource<Context = any, Result = any> = {
  readonly manager: ResourceManager<Context, Result>;

  readonly name: string;
  unlocked?: boolean;
  disabled?: boolean;

  icon?: string;
  display?: "number" | "time" | "percentage";
  description?: string;
  singularName?: string;
  pluralName?: string;

  count: number;
  maxCount?: number;
  minCount?: number;
  extra: Record<string, number>;

  value: (kind?: string) => number;
  cost: (n: number, kind?: string) => ResourceCount<Context, Result>[];

  shouldTick?: (dt: number, source?: string) => boolean;
  tick?: (dt: number, source?: string) => Nullable<Result>;

  buy: (
    count?: number,
    style?: PurchaseStyle,
    kind?: string,
    gainMultiplier?: number,
    costMultiplier?: number,
  ) => PurchaseCost<Context, Result>;
  sell: (
    count?: number,
    kind?: string,
    sellMultiplier?: number,
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

  gainMultiplier?: (m: number) => number;
  costMultiplier?: (m: number) => number;

  autoAward?: boolean;

  onPurchase?: (purchase: PurchaseCost<Context, Result>) => void;
  onChange?: (value: number, kind?: string, source?: string) => Result;

  execution: {
    lastTick?: number;
    lastResult?: Nullable<Result>;
    lastAttempt?: number;
  };

  rate: {
    count: number;
    ticks: number;

    lastCountUpdate?: number;
    lastCount?: number;

    lastTickUpdate?: number;
    deltaTicks?: number;

    pastCounts: number[];
    pastTicks: number[];
  };
};

export type ResourceManager<Context = any, Result = any> = {
  context: Context;
  settings: Partial<ResourceManagerSettings>;
  resources: Record<string, Resource<Context, Result>>;

  upsert: (
    props: Partial<Resource<Context, Result>> | string,
  ) => Resource<Context, Result>;
  get: (
    resource: Resource<Context, Result> | string,
  ) => Resource<Context, Result>;
  purchase: (
    toBuy: ResourceCount<Context, Result>[],
    style?: PurchaseStyle,
    gainMultiplier?: number,
    costMultiplier?: number,
  ) => PurchaseCost<Context, Result>;
  canAfford: (cost: ResourceCount<Context, Result>[]) => boolean;

  update: (now?: number, source?: string) => Result[];

  gainMultiplier?: (m: number) => number;
  costMultiplier?: (m: number) => number;
};

export type ResourceCount<Context = any, Result = any> = {
  resource: Resource<Context, Result> | string;
  count: number;
  kind?: string;
};

export type PurchaseStyle =
  | "full"
  | "partial"
  | "free"
  | "dry-full"
  | "dry-partial";

export type PurchaseCost<Context = any, Result = any> = {
  count: number;
  gain: ResourceCount<Context, Result>[];
  cost: ResourceCount<Context, Result>[];
};

export type ResourceManagerSettings = {
  lastUpdate: number;

  rateUpdateSecs: number;
  rateHistoryWindow: number;

  minResourceUpdateSecs: number;
  maxResourceUpdateSecs: number;
  maxResourceTickSecs: number;

  sellRatio: number;
  timeDilation: number;
};

export function genResource<Context, Result>(
  rm: ResourceManager<Context, Result>,
  name: string,
): Resource<Context, Result> {
  const res: Resource<Context, Result> = {
    manager: rm,
    name,
    count: 0,
    extra: {},

    value: (kind) =>
      !kind
        ? clamp(res.count, res.minCount ?? 0, res.maxCount ?? Infinity)
        : res.extra[kind] ?? 0,
    cost: () => [],

    buy: (
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
      ),
    sell: (count, kind, sellMultiplier) =>
      res.buy(-(count ?? 1), undefined, kind, undefined, sellMultiplier),
    add: (count, kind, gainMultiplier) =>
      res.buy(count, "free", kind, gainMultiplier),

    canBuy: (count, kind, costMultiplier) =>
      res.buy(count, "dry-partial", kind, undefined, costMultiplier),

    execution: {},
    rate: { count: 0, ticks: 0, pastCounts: [], pastTicks: [] },
  };

  return setSaveProperties(res, [
    "name",
    "unlocked",
    "disabled",
    "count",
    "extra",
  ]);
}

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

  return setSaveProperties(rm, ["resources"]);
}

function resolve<Context, Result>(
  rm: ResourceManager<Context, Result>,
  resource: Resource<Context, Result> | string,
): Resource<Context, Result> {
  return (
    rm.resources[typeof resource === "string" ? resource : resource.name] ??
    upsert(rm, resource)
  );
}

function upsert<Context, Result>(
  rm: ResourceManager<Context, Result>,
  props: Partial<Resource<Context, Result>> | string,
): Resource<Context, Result> {
  const name = typeof props === "string" ? props : props.name ?? "";
  const res = rm.resources[name] ?? genResource(rm, name);

  if (typeof props !== "string") {
    let k: keyof Resource<Context, Result>;
    for (k in props) {
      assign(res, k, props[k]);
    }
  }

  if (res.name) {
    rm.resources[res.name] = res;
  }

  return res;
}

function update<Context, Result>(
  rm: ResourceManager<Context, Result>,
  now: number,
  source: string,
): Result[] {
  const {
    rateUpdateSecs = 1.0,
    rateHistoryWindow = 10,
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
  const cache: Record<string, Record<string, number>> = {};
  const resources = Object.values(rm.resources).filter(
    (res) => res.unlocked ?? true,
  );

  resources.forEach((res) => {
    if (res.onChange) {
      cache[res.name] = { ...res.extra, "": res.count };
    }

    res.rate.lastCountUpdate ??= epoch;
    res.rate.lastCount ??= res.count;
    res.execution.lastTick = clamp(
      res.execution.lastTick ?? epoch,
      now - maxResourceUpdateSecs * 1000.0,
      now,
    );
    res.execution.lastAttempt = now;
  });

  const results: Record<string, Result[]> = {};
  const tickResources = resources.filter((res) => res.tick && !res.disabled);
  const tickScale = 1 / 1000.0 / timeDilation;
  while (dt > 0) {
    dt -= clamp(dt, minResourceUpdateSecs, maxResourceTickSecs);
    const slice = now - dt * 1000.0;

    tickResources.forEach((res) => {
      const tick = (slice - res.execution.lastTick!) * tickScale;

      if (tick > 0 && (!res.shouldTick || res.shouldTick(tick, source))) {
        res.execution.lastResult = res.tick!(tick, source);
        res.execution.lastTick = slice;
        res.rate.deltaTicks = (res.rate.deltaTicks ?? 0) + 1;
        res.rate.lastTickUpdate ??= slice;
        if (res.execution.lastResult) {
          if (!results[res.name]) {
            results[res.name] = [];
          }

          if (!results[res.name].includes(res.execution.lastResult)) {
            results[res.name].push(res.execution.lastResult);
          }
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
      res.rate.lastCount = res.count;
      res.rate.lastCountUpdate = now;
      res.rate.pastCounts.unshift(res.rate.count);
      res.rate.pastCounts.splice(rateHistoryWindow);
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
      res.rate.pastTicks.unshift(res.rate.ticks);
      res.rate.pastTicks.splice(rateHistoryWindow);
    }

    if (res.onChange) {
      const changeResults = [];
      if (res.count !== (cache[res.name] ?? {})[""]) {
        changeResults.push(res.onChange(res.count, undefined, source));
      }
      for (const kind in res.extra) {
        if (res.extra[kind] !== (cache[res.name] ?? {})[kind]) {
          changeResults.push(res.onChange(res.extra[kind], kind, source));
        }
      }

      results[res.name] = dedupe([
        ...(results[res.name] ?? []),
        ...changeResults,
      ]);
    }
  });

  Object.values(rm.resources).forEach((res) => {
    if (res.autoAward && !res.disabled && res.count < (res.maxCount ?? 0)) {
      const req = res.cost(res.count + 1);
      if (canAfford(rm, req)) {
        res.count++;

        if (!(res.unlocked ?? true)) {
          res.unlocked = true;
        }

        if (res.onPurchase) {
          res.onPurchase({
            count: 1,
            gain: [{ resource: res, count: 1 }],
            cost: [],
          });
        }

        if (res.onChange) {
          results[res.name] = dedupe([
            ...(results[res.name] ?? []),
            res.onChange(res.count, undefined, source),
          ]);
        }
      }
    }
  });

  return dedupe(Object.values(results).flat());
}

function purchase<Context, Result>(
  rm: ResourceManager<Context, Result>,
  toBuy: ResourceCount<Context, Result>[],
  style: PurchaseStyle,
  gainMultiplier: number,
  costMultiplier: number,
): PurchaseCost<Context, Result> {
  const globalGainMultiplier = rm.gainMultiplier
    ? rm.gainMultiplier(gainMultiplier)
    : gainMultiplier;
  const globalCostMultiplier = rm.costMultiplier
    ? rm.costMultiplier(costMultiplier)
    : costMultiplier;

  const costs = resolveAll(rm, toBuy).map((rc) => {
    const res = rc.resource;
    const localGainMultiplier = res.gainMultiplier
      ? res.gainMultiplier(globalGainMultiplier)
      : globalGainMultiplier;
    const localCostMultiplier = res.costMultiplier
      ? res.costMultiplier(globalCostMultiplier)
      : globalCostMultiplier;
    const rcCost = getPurchaseCost(
      rm,
      res,
      rc.count,
      rc.kind,
      style,
      localGainMultiplier,
      localCostMultiplier,
    );

    if (style === "dry-partial" || style === "dry-full") {
      return rcCost;
    } else {
      const gain = applyToResource(res, rcCost.gain),
        cost = rcCost.cost
          .map(({ resource, count, kind }) =>
            applyToResource(resolve(rm, resource), [
              { resource, count: -count, kind },
            ]),
          )
          .flat();

      const purchaseCost = { count: rcCost.count, gain, cost };
      if (res.onPurchase) {
        res.onPurchase(purchaseCost);
      }
      return purchaseCost;
    }
  });

  return {
    count: costs.reduce((count, rcCost) => count + rcCost.count, 0),
    gain: combineResources(costs.map((rcCost) => rcCost.gain).flat()),
    cost: combineResources(costs.map((rcCost) => rcCost.cost).flat()),
  };
}

function resolveAll<Context, Result>(
  rm: ResourceManager<Context, Result>,
  rcs: ResourceCount<Context, Result>[],
): {
  resource: Resource<Context, Result>;
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

function canAfford<Context, Result>(
  rm: ResourceManager<Context, Result>,
  cost: ResourceCount<Context, Result>[],
): boolean {
  return resolveAll(rm, combineResources(cost)).every((rc) =>
    checkHasResources(rc.resource, [rc], true),
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
    return {
      count: target - start,
      gain: [{ resource, count: gainMultiplier * (target - start), kind }],
      cost: [],
    };
  }

  if (start > target) {
    [start, target] = [target, start];
    [gainMultiplier, costMultiplier] = [
      -gainMultiplier,
      -costMultiplier * (rm.settings.sellRatio ?? 1),
    ];
  }

  let cost: ResourceCount<Context, Result>[] = [];
  let partialCost = cost;
  let partialCount = 0;
  for (let i = start; i < target; i++) {
    const curCost = scaleResources(
      resolveAll(rm, resource.cost(i + 1, kind)),
      costMultiplier,
    );
    if (style.includes("partial")) {
      partialCost = combineResources(partialCost, curCost);
      if (!canAfford(rm, partialCost)) {
        break;
      }
    }

    partialCount++;
    cost = combineResources(cost, curCost);
  }

  if (
    (style !== "dry-full" && !canAfford(rm, cost)) ||
    (style === "full" && start + partialCount !== target)
  ) {
    return { count: 0, gain: [], cost: [] };
  }

  return {
    count: partialCount,
    gain: [{ resource, count: gainMultiplier * partialCount, kind }],
    cost,
  };
}

function combineResources<Context, Result>(
  rcs: ResourceCount<Context, Result>[],
  ...rcss: ResourceCount<Context, Result>[][]
): ResourceCount<Context, Result>[] {
  return [rcs, ...rcss]
    .flat()
    .reduce(
      (
        res: ResourceCount<Context, Result>[],
        rc: ResourceCount<Context, Result>,
      ) => {
        const frc = res.find(
          (orc) =>
            (orc.resource === rc.resource ||
              (typeof orc.resource === "string"
                ? orc.resource
                : orc.resource.name) ===
                (typeof rc.resource === "string"
                  ? rc.resource
                  : rc.resource.name)) &&
            (orc.kind ?? "") === (rc.kind ?? ""),
        );
        if (frc) {
          frc.count += rc.count;
          return res;
        } else {
          return [...res, { ...rc }];
        }
      },
      [],
    )
    .filter(({ count }) => count !== 0);
}

function scaleResources<Context, Result>(
  rcs: ResourceCount<Context, Result>[],
  scalar: number,
): ResourceCount<Context, Result>[] {
  return rcs.map(({ resource, count, kind }) => ({
    resource,
    count: scalar * count,
    kind,
  }));
}

function checkHasResources<Context, Result>(
  res: Resource<Context, Result>,
  rcs: ResourceCount<Context, Result>[],
  toSpend = false,
): boolean {
  return (
    (res.unlocked ?? true) &&
    combineResources(rcs).every(
      ({ resource, count, kind }) =>
        res.name !==
          (typeof resource === "string" ? resource : resource.name) ||
        res.value(kind) - count >=
          (toSpend && !kind && typeof resource !== "string"
            ? resource.minCount ?? 0
            : 0),
    )
  );
}

function applyToResource<Context, Result>(
  res: Resource<Context, Result>,
  rcs: ResourceCount<Context, Result>[],
): ResourceCount<Context, Result>[] {
  return combineResources(
    rcs
      .filter(
        ({ resource }) =>
          (res.unlocked ?? true) &&
          res.name ===
            (typeof resource === "string" ? resource : resource.name),
      )
      .map(({ count, kind }) => {
        const prev = kind ? res.extra[kind] ?? 0 : res.count;
        const next = clamp(
          prev + count,
          !kind ? res.minCount ?? 0 : 0,
          !kind ? res.maxCount ?? Infinity : Infinity,
        );

        if (kind) {
          res.extra[kind] = next;
        } else {
          res.count = next;
        }

        return [{ resource: res, count: next - prev, kind }];
      })
      .flat(),
  );
}

export function compileAllResources<Context, Result>(
  rm: ResourceManager<Context, Result>,
) {
  Object.values(rm.resources).forEach((res) => {
    const resourceContext = {
      ...res.manager.context,
      ...res.manager,
      ...res.manager.resources,
      timer: apply(tickTimer, res),
    };

    if (typeof res.value === "string") {
      res.value = compileInlineFunction(
        res.value,
        res,
        ["kind"],
        resourceContext,
      );
    }

    if (typeof res.cost === "string") {
      const costFunction =
        "[" +
        (res.cost as string)
          .replace(/\s/gim, "")
          .split(/[;]/gim)
          .map((cost) => {
            const parts = cost.split(/:/gim);
            const rc = [
              `resource: ${parts[0]}`,
              `count: ${parts[parts.length - 1]}`,
            ];
            if (parts.length > 2) {
              rc.push(`kind: "${parts[1]}"`);
            }
            return "{" + rc.join(", ") + "}";
          })
          .join(", ") +
        "]";
      res.cost = compileInlineFunction(
        costFunction,
        res,
        ["n"],
        resourceContext,
      );
    }

    if (typeof res.shouldTick === "string") {
      res.shouldTick = compileInlineFunction(
        res.shouldTick,
        res,
        ["dt", "source"],
        resourceContext,
      );
    }
    if (typeof res.tick === "string") {
      res.tick = compileInlineFunction(
        res.tick,
        res,
        ["dt", "source"],
        resourceContext,
      );
    }

    if (typeof res.gainMultiplier === "string") {
      res.gainMultiplier = compileInlineFunction(
        res.gainMultiplier,
        res,
        ["m"],
        resourceContext,
      );
    }
    if (typeof res.costMultiplier === "string") {
      res.costMultiplier = compileInlineFunction(
        res.costMultiplier,
        res,
        ["m"],
        resourceContext,
      );
    }

    if (typeof res.onPurchase === "string") {
      res.onPurchase = compileInlineFunction(
        res.onPurchase,
        res,
        ["purchase"],
        resourceContext,
      );
    }
    if (typeof res.onChange === "string") {
      res.onChange = compileInlineFunction(
        res.onChange,
        res,
        ["value", "kind", "source"],
        resourceContext,
      );
    }
  });
}
