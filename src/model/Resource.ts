export type ResourceCount = {
  resource: Resource | string;
  count: number;
  kind?: string;
};

export type Resource = {
  name: string;
  description?: string;
  unlocked?: boolean;

  count: number;
  bonus: number;
  auto: number;
  extra: Record<string, number>;

  min?: number;
  max?: number;

  value: () => ResourceCount[];
  cost: (n: number) => ResourceCount[];
  tick: (dt: number) => void;
};

export function genEmptyResource(name: string): Resource {
  return {
    name,
    count: 0,
    bonus: 0,
    auto: 0,
    extra: {},
    value: () => [],
    cost: () => [],
    tick: () => {},
  };
}

export function combineResources(
  rcs: ResourceCount[],
  ...rcss: ResourceCount[][]
): ResourceCount[] {
  return [rcs, ...rcss]
    .flat()
    .reduce((res: ResourceCount[], rc: ResourceCount) => {
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
        return [...res, rc];
      }
    }, [])
    .filter(({ count }) => count !== 0);
}

export function subtractResources(
  rcs1: ResourceCount[],
  rcs2: ResourceCount[],
): ResourceCount[] {
  return combineResources(
    rcs1,
    rcs2.map(({ resource, count, kind }) => ({
      resource,
      count: -count,
      kind,
    })),
  );
}

export function applyToResource(
  res: Resource,
  rcs: ResourceCount[],
): ResourceCount[] {
  return combineResources(
    rcs
      .map(({ resource, count, kind }) => {
        if (
          res.name !== (typeof resource === "string" ? resource : resource.name)
        ) {
          return [];
        }

        let prev = 0;
        switch ((kind ?? "").toLowerCase()) {
          case "":
          case "count":
            prev = res.count;
            res.count = Math.max(0, prev + count);
            if (res.min !== undefined && res.count < res.min) {
              res.count = res.min;
            } else if (res.max !== undefined && res.count > res.max) {
              res.count = res.max;
            }
            return [{ resource: res, count: res.count - prev }];

          case "bonus":
            prev = res.bonus;
            res.bonus = Math.max(0, prev + count);
            return [{ resource: res, count: res.bonus - prev, kind }];

          case "auto":
            prev = res.auto;
            res.auto = Math.max(0, prev + count);
            return [{ resource: res, count: res.auto - prev, kind }];

          default:
            if (!kind) {
              return [];
            }
            prev = res.extra[kind] ?? 0;
            res.extra[kind] = Math.max(0, prev + count);
            return [{ resource: res, count: res.extra[kind] - prev, kind }];
        }
      })
      .flat(),
  );
}
