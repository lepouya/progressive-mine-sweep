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
    rcs2.map(({ resource, count }) => ({ resource, count: -count })),
  );
}
