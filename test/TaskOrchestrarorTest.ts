import "mocha";

import { expect } from "chai";

import { emptyContext } from "../src/model/Context";
import { genTaskOrchestrator } from "../src/model/TaskOrchestrator";

describe("Creating tasks", () => {
  it("Empty task orchestrator set up correctly", () => {
    const tx = genTaskOrchestrator();
    expect(tx.tasks).to.deep.equal({});
  });

  it("Creating new task works", () => {
    const tx = genTaskOrchestrator();
    const t1 = tx.register({ name: "test1" });

    expect(tx.tasks["test1"]).to.equal(t1);
    expect(tx.tasks["test1"].name).to.equal("test1");
  });

  it("Adding multiple fields", () => {
    const tx = genTaskOrchestrator();
    const t1 = tx.register({ name: "test1", lastRun: 42, icon: "hello!" });
    const t2 = tx.register({
      name: "test2",
      execution: { runRate: 1, lastAttempt: 1 },
    });

    expect(tx.tasks["test1"]).to.equal(t1);
    expect(tx.tasks["test1"].name).to.equal("test1");
    expect(tx.tasks["test1"].lastRun).to.equal(42);
    expect(tx.tasks["test1"].execution["deltaRuns"]).to.be.undefined;
    expect(tx.tasks["test1"].icon).to.equal("hello!");

    expect(tx.tasks["test2"]).to.equal(t2);
    expect(tx.tasks["test2"].name).to.equal("test2");
    expect(tx.tasks["test2"].lastRun).to.be.undefined;
    expect(tx.tasks["test2"].execution["runRate"]).to.equal(1);
    expect(tx.tasks["test2"].execution["deltaRuns"]).to.be.undefined;
    expect(tx.tasks["test2"].icon).to.be.undefined;
  });

  it("Overwriting fields", () => {
    const tx = genTaskOrchestrator();
    const t1 = tx.register({ name: "test1", lastRun: 42 });
    const t2 = tx.register({
      name: "test1",
      execution: { runRate: 1, lastAttempt: 7 },
      icon: "hello!",
    });

    expect(tx.tasks["test1"]).to.equal(t1);
    expect(tx.tasks["test1"]).to.equal(t2);
    expect(tx.tasks["test1"].name).to.equal("test1");
    expect(tx.tasks["test1"].lastRun).to.equal(42);
    expect(tx.tasks["test1"].execution["lastAttempt"]).to.equal(7);
    expect(tx.tasks["test1"].icon).to.equal("hello!");
  });
});

describe("Task execution", () => {
  it("Running empty task executor", () => {
    const tx = genTaskOrchestrator();
    const context = emptyContext();

    expect(tx._lastExec).to.be.undefined;

    expect(tx.execute(1, context)).to.be.undefined;
    expect(tx._lastExec).to.be.equal(1);

    expect(tx.execute(2, context)).to.be.undefined;
    expect(tx._lastExec).to.be.equal(2);

    expect(tx.execute(1001, context)).to.be.undefined;
    expect(tx._lastExec).to.be.equal(1001);

    expect(tx.execute(1001.9, context)).to.be.undefined;
    expect(tx._lastExec).to.be.equal(1001);
  });

  it("Task executor enables and disabled task runs", () => {
    const tx = genTaskOrchestrator();
    const context = emptyContext();
    const t1 = tx.register("test1");
    t1.run = (dt) => [dt.toString()];

    expect(tx.execute(1, context)).to.be.undefined;
    expect(t1.lastRun).to.be.undefined;
    expect(t1.execution.lastAttempt).to.be.undefined;

    expect(tx.execute(2, context)).to.be.undefined;
    expect(t1.lastRun).to.be.undefined;
    expect(t1.execution.lastAttempt).to.be.undefined;

    expect(tx.execute(1000, context)).to.be.undefined;
    expect(t1.lastRun).to.be.undefined;
    expect(t1.execution.lastAttempt).to.be.undefined;

    t1.enabled = true;

    expect(tx.execute(2000, context)).to.be.undefined;
    expect(t1.lastRun).to.be.equal(2000);
    expect(t1.execution.lastAttempt).to.be.equal(2000);

    expect(tx.execute(2001, context)).to.deep.equal(["0.001"]);
    expect(t1.lastRun).to.be.equal(2001);
    expect(t1.execution.lastAttempt).to.be.equal(2001);

    expect(tx.execute(3000, context)).to.deep.equal(["0.999"]);
    expect(t1.lastRun).to.be.equal(3000);
    expect(t1.execution.lastAttempt).to.be.equal(3000);

    t1.enabled = false;

    expect(tx.execute(4000, context)).to.be.undefined;
    expect(t1.lastRun).to.be.equal(3000);
    expect(t1.execution.lastAttempt).to.be.equal(3000);
  });

  it("Task executor schedules tasks correctly", () => {
    const tx = genTaskOrchestrator();
    const context = emptyContext();

    const t1 = tx.register({
      name: "1/sec",
      enabled: true,
      shouldRun: (dt) => dt >= 1,
      run: (dt) => [t1.name + "-" + dt.toString()],
    });
    const t2 = tx.register({
      name: "2/sec",
      enabled: true,
      shouldRun: (dt) => dt >= 0.5,
      run: (dt) => [t2.name + "-" + dt.toString()],
    });

    expect(tx.execute(1000, context)).to.be.undefined;
    expect(tx.execute(1100, context)).to.be.undefined;
    expect(tx.execute(1200, context)).to.be.undefined;
    expect(tx.execute(1500, context)).to.deep.equal(["2/sec-0.5"]);
    expect(tx.execute(1750, context)).to.be.undefined;
    expect(tx.execute(2000, context)).to.deep.equal(["1/sec-1", "2/sec-0.5"]);
    expect(tx.execute(3000, context)).to.deep.equal(["1/sec-1", "2/sec-1"]);
    expect(tx.execute(5000, context)).to.deep.equal(["1/sec-2", "2/sec-2"]);
    expect(tx.execute(5555, context)).to.deep.equal(["2/sec-0.555"]);
  });
});
