import assign from "../utils/assign";
import clamp from "../utils/clamp";
import dedupe from "../utils/dedupe";
import { Context } from "./Context";
import { genEmptyTask, Task, TaskRunResults } from "./Task";

export type TaskOrchestrator = {
  tasks: Record<string, Task>;
  _lastExec?: number;

  register: (props: Partial<Task> | string) => Task;
  resolve: (task: Task | string) => Task;

  execute: (
    now: number | undefined,
    context: Context,
    source?: string,
  ) => TaskRunResults;
};

export function genTaskOrchestrator(): TaskOrchestrator {
  const tx: TaskOrchestrator = {
    tasks: {},
    register: (props) => register(tx, props),
    resolve: (task) => resolve(tx, task),
    execute: (now, context, source) =>
      execute(tx, now ?? Date.now(), context, source ?? "unknown"),
  };

  return tx;
}

export function mergeTaskOrchestrators(
  tx: TaskOrchestrator,
  toLoad: Partial<TaskOrchestrator>,
): TaskOrchestrator {
  let k: keyof TaskOrchestrator;
  for (k in toLoad) {
    if (k === "tasks") {
      Object.values(toLoad[k] ?? {}).forEach((task) => tx.register(task));
    } else {
      assign(tx, k, toLoad[k]);
    }
  }

  return tx;
}

function resolve(tx: TaskOrchestrator, task: Task | string): Task {
  return tx.tasks[typeof task === "string" ? task : task.name];
}

function register(tx: TaskOrchestrator, props: Partial<Task> | string): Task {
  const name = typeof props === "string" ? props : props.name ?? "";
  const task = tx.tasks[name] ?? genEmptyTask(name);

  if (typeof props !== "string") {
    let k: keyof Task;
    for (k in props) {
      assign(task, k, props[k]);
    }
  }

  if (task.name) {
    tx.tasks[task.name] = task;
  }

  return task;
}

function execute(
  tx: TaskOrchestrator,
  now: number,
  context: Context,
  source: string,
): TaskRunResults {
  const {
    rateUpdateSecs = 1.0,
    minResourceUpdateSecs = 0.001,
    maxResourceUpdateSecs = 86400.0,
    timeDilation = 1.0,
  } = context.settings;

  let dt = clamp(
    (now - (tx._lastExec ?? 0)) / 1000.0,
    0,
    maxResourceUpdateSecs,
  );
  if (dt < minResourceUpdateSecs) {
    return undefined;
  }
  tx._lastExec = now;

  const results = Object.values(tx.tasks)
    .map(function (task) {
      if (!task.enabled) {
        return undefined;
      }

      task.lastRun ??= now;
      task.execution.lastAttempt = now;

      const dt = (now - task.lastRun) / 1000.0 / timeDilation;
      if (dt <= 0 || (task.shouldRun && !task.shouldRun(dt, source))) {
        return undefined;
      }

      task.execution.lastResult = task.run(dt, source);
      task.lastRun = now;
      task.execution.deltaRuns = (task.execution.deltaRuns ?? 0) + 1;
      task.execution.lastRateUpdate ??= now;

      const rateDt = (now - (task.execution.lastRateUpdate ?? 0)) / 1000.0;
      if (rateDt >= rateUpdateSecs) {
        task.execution.runRate = task.execution.deltaRuns / rateDt;
        task.execution.deltaRuns = 0;
        task.execution.lastRateUpdate = now;
      }

      return task.execution.lastResult;
    })
    .filter((result) => result != undefined);

  if (results.length > 0) {
    // At least one task executed
    return dedupe(results.flatMap((result) => result ?? []));
  }

  return undefined;
}
