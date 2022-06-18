import { setSaveProperties } from "../utils/store";

export type TaskRunResults = string[] | undefined;

export type Task = {
  readonly name: string;
  enabled?: boolean;
  lastRun?: number;

  icon?: string;
  description?: string;

  shouldRun?: (dt: number, source?: string) => boolean;
  run: (dt: number, source?: string) => TaskRunResults;

  execution: {
    runRate: number;
    lastRateUpdate?: number;
    deltaRuns?: number;

    lastAttempt?: number;
    lastResult?: TaskRunResults;
  };
};

export function genEmptyTask(name: string): Task {
  const res: Task = {
    name,
    run: () => undefined,
    execution: { runRate: 0 },
  };

  setSaveProperties(res, ["name", "enabled", "lastRun"]);
  return res;
}
