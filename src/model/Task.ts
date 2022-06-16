import { setSaveProperties } from "../utils/store";
import { genEmptyResource, Resource, ResourceCount } from "./Resource";

export type TaskRunResults<Tracker = never> = {
  status?: string;
  updates?: Tracker;
  resourceCounts?: ResourceCount[];
};

export type Task<Tracker = never> = Resource & {
  enabled?: boolean;
  lastRun?: number;

  runDelay: () => number;
  shouldRun: (dt: number, source?: string) => boolean;
  run: (dt: number, source?: string) => TaskRunResults<Tracker>;

  execution: {
    runRate: number;
    lastUpdate?: number;
    deltaRuns?: number;

    lastAttempt?: number;
    lastResult?: TaskRunResults;
  };
};

export function genEmptyTask<Tracker>(name: string): Task<Tracker> {
  const res: Task = {
    ...genEmptyResource(name),
    runDelay: () => 0,
    shouldRun: () => true,
    run: () => ({}),
    execution: { runRate: 0 },
  };

  setSaveProperties(res, ["enabled", "lastRun"]);
  return res;
}
