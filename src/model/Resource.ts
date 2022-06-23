import clamp from "../utils/clamp";
import { setSaveProperties } from "../utils/store";

export type ResourceCount<Context, Result> = {
  resource: Resource<Context, Result> | string;
  count: number;
  kind?: string;
};

export type Resource<Context, Result> = {
  readonly name: string;
  context: Context;
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
  tick?: (dt: number, source?: string) => Result | null;

  execution: {
    lastTick?: number;
    lastResult?: Result;
    lastAttempt?: number;
  };

  rate: {
    count: number;
    ticks: number;

    lastCountUpdate?: number;
    lastCount?: number;

    lastTickUpdate?: number;
    deltaTicks?: number;
  };
};

export function genEmptyResource<Context, Result>(
  name: string,
  context: Context,
): Resource<Context, Result> {
  const res: Resource<Context, Result> = {
    name,
    context,
    count: 0,
    extra: {},
    value: (kind) => (!kind ? res.count : res.extra[kind] ?? 0),
    cost: () => [],
    execution: {},
    rate: { count: 0, ticks: 0 },
  };

  setSaveProperties(res, [
    "name",
    "unlocked",
    "disabled",
    "count",
    "maxCount",
    "extra",
  ]);
  return res;
}

export function combineResources<Context, Result>(
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

export function scaleResources<Context, Result>(
  rcs: ResourceCount<Context, Result>[],
  scalar: number,
): ResourceCount<Context, Result>[] {
  return rcs.map(({ resource, count, kind }) => ({
    resource,
    count: scalar * count,
    kind,
  }));
}

export function subtractResources<Context, Result>(
  rcs1: ResourceCount<Context, Result>[],
  rcs2: ResourceCount<Context, Result>[],
): ResourceCount<Context, Result>[] {
  return combineResources(rcs1, scaleResources(rcs2, -1));
}

export function getResourceCounts<Context, Result>(
  resource: Resource<Context, Result>,
): ResourceCount<Context, Result>[] {
  return [
    { resource, count: resource.count },
    ...Object.entries(resource.extra).map(([kind, count]) => ({
      resource,
      count,
      kind,
    })),
  ].filter(({ count }) => count !== 0);
}

export function checkHasResources<Context, Result>(
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

export function applyToResource<Context, Result>(
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
