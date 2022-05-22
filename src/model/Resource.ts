export type ResourceCount = {
  resource: Resource | string;
  count: number;
  kind?: string;
};

export type Resource = {
  readonly name: string;
  unlocked?: boolean;

  icon?: string;
  display?: "number" | "time" | "percentage";
  description?: string;
  singularName?: string;
  pluralName?: string;

  count: number;
  maxCount?: number;
  extra: Record<string, number>;

  value: (kind?: string) => number;
  cost: (n: number, kind?: string) => ResourceCount[];
  tick?: (dt: number, source?: string) => void;

  rate: number;
  _rate: {
    lastCheck?: number;
    lastCount?: number;
  };
};

export function genEmptyResource(name: string): Resource {
  const res: Resource = {
    name,
    count: 0,
    extra: {},
    value: (kind) => (!kind ? res.count : res.extra[kind] ?? 0),
    cost: () => [],
    rate: 0,
    _rate: {},
  };

  return res;
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

export function getResourceCounts(resource: Resource): ResourceCount[] {
  return [
    { resource, count: resource.count },
    ...Object.entries(resource.extra).map(([kind, count]) => ({
      resource,
      count,
      kind,
    })),
  ].filter(({ count }) => count !== 0);
}

export function checkHasResources(
  res: Resource,
  rcs: ResourceCount[],
): boolean {
  return (
    (res.unlocked ?? true) &&
    subtractResources(
      getResourceCounts(res),
      rcs.filter(
        ({ resource }) =>
          res.name ===
          (typeof resource === "string" ? resource : resource.name),
      ),
    ).filter(({ count }) => count < 0).length === 0
  );
}

export function applyToResource(
  res: Resource,
  rcs: ResourceCount[],
): ResourceCount[] {
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
        let next = Math.max(0, prev + count);
        if (!kind && res.maxCount && next > res.maxCount) {
          next = res.maxCount;
        }

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
