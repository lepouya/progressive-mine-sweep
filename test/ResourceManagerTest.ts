import "mocha";

import { expect } from "chai";

import { genResourceManager } from "../src/model/ResourceManager";

describe("Creating resources", () => {
  it("Empty resource manager set up correctly", () => {
    const rm = genResourceManager(null, {});
    expect(rm.resources).to.deep.equal({});
  });

  it("Creating new resource works", () => {
    const rm = genResourceManager(null, {});
    const R1 = rm.upsert({ name: "test1" });

    expect(rm.resources["test1"]).to.equal(R1);
    expect(rm.resources["test1"].name).to.equal("test1");
  });

  it("Adding multiple fields", () => {
    const rm = genResourceManager(null, {});
    const R1 = rm.upsert({ name: "test1", count: 5, maxCount: 1 });
    const R2 = rm.upsert({ name: "test2", extra: { bonus: 1 } });

    expect(rm.resources["test1"]).to.equal(R1);
    expect(rm.resources["test1"].name).to.equal("test1");
    expect(rm.resources["test1"].count).to.equal(5);
    expect(rm.resources["test1"].extra["bonus"]).to.be.undefined;
    expect(rm.resources["test1"].maxCount).to.equal(1);

    expect(rm.resources["test2"]).to.equal(R2);
    expect(rm.resources["test2"].name).to.equal("test2");
    expect(rm.resources["test2"].count).to.equal(0);
    expect(rm.resources["test2"].extra["bonus"]).to.equal(1);
    expect(rm.resources["test2"].extra["auto"]).to.be.undefined;
    expect(rm.resources["test2"].maxCount).to.be.undefined;
  });

  it("Overwriting fields", () => {
    const rm = genResourceManager(null, {});
    const R1 = rm.upsert({ name: "test1", count: 5 });
    const R2 = rm.upsert({ name: "test1", extra: { auto: 7 }, maxCount: 1 });

    expect(rm.resources["test1"]).to.equal(R1);
    expect(rm.resources["test1"]).to.equal(R2);
    expect(rm.resources["test1"].name).to.equal("test1");
    expect(rm.resources["test1"].count).to.equal(5);
    expect(rm.resources["test1"].extra["auto"]).to.equal(7);
    expect(rm.resources["test1"].maxCount).to.equal(1);
  });
});

describe("Updating resources", () => {
  it("Time is updated correctly", () => {
    const settings = { lastUpdate: 1000 };
    const rm = genResourceManager(null, settings);

    rm.update(2000);
    expect(settings.lastUpdate).to.be.equal(2000);

    rm.update(3000);
    expect(settings.lastUpdate).to.be.equal(3000);
  });

  it("Time below min delta doesn't change anything", () => {
    const settings = { lastUpdate: 1000 };
    const rm = genResourceManager(null, settings);

    rm.update(1000.1);
    expect(settings.lastUpdate).to.be.equal(1000);
  });

  it("Resource ticks called corectly", () => {
    const settings = { lastUpdate: 0 };
    const rm = genResourceManager(null, settings);

    rm.upsert({
      name: "test1",
      tick: (dt) => (rm.get("test1").count += dt),
    });
    rm.upsert({
      name: "test2",
      tick: () => rm.get("test2").count++,
    });

    rm.update(500);
    expect(settings.lastUpdate).to.be.equal(500);
    expect(rm.resources["test1"].count).to.be.equal(0.5);
    expect(rm.resources["test2"].count).to.be.equal(1);

    rm.update(1500);
    expect(settings.lastUpdate).to.be.equal(1500);
    expect(rm.resources["test1"].count).to.be.equal(1.5);
    expect(rm.resources["test2"].count).to.be.equal(2);
  });

  it("Tick granularity works as expected", () => {
    const settings = { lastUpdate: 0 };
    const rm = genResourceManager(null, settings);

    const R1 = rm.upsert({ name: "test1" });
    R1.tick = (dt) => {
      R1.count += dt;
    };
    const R2 = rm.upsert({ name: "test2" });
    R2.tick = () => {
      R2.count++;
    };

    rm.update(0.5);
    expect(settings.lastUpdate).to.be.equal(0);
    expect(rm.resources["test1"].count).to.be.equal(0);
    expect(rm.resources["test2"].count).to.be.equal(0);

    rm.update(500);
    expect(settings.lastUpdate).to.be.equal(500);
    expect(rm.resources["test1"].count).to.be.equal(0.5);
    expect(rm.resources["test2"].count).to.be.equal(1);

    rm.update(1000);
    expect(settings.lastUpdate).to.be.equal(1000);
    expect(rm.resources["test1"].count).to.be.equal(1);
    expect(rm.resources["test2"].count).to.be.equal(2);

    rm.update(10000);
    expect(settings.lastUpdate).to.be.equal(10000);
    expect(rm.resources["test1"].count).to.be.equal(10);
    expect(rm.resources["test2"].count).to.be.equal(11);
  });

  it("Max tick update works", () => {
    const settings = { lastUpdate: 0 };
    const rm = genResourceManager(null, settings);

    rm.upsert("test1").tick = (dt) => (rm.get("test1").count += dt);
    rm.upsert("test2").tick = () => rm.get("test2").count++;

    rm.update(500);
    expect(settings.lastUpdate).to.be.equal(500);
    expect(rm.resources["test1"].count).to.be.equal(0.5);
    expect(rm.resources["test2"].count).to.be.equal(1);

    rm.update(100000000);
    expect(settings.lastUpdate).to.be.equal(100000000);
    expect(rm.resources["test1"].count).to.be.equal(86400.5);
    expect(rm.resources["test2"].count).to.be.equal(86401);
  });

  it("Rate update works", () => {
    const settings = { lastUpdate: 0 };
    const rm = genResourceManager(null, settings);

    rm.upsert({
      name: "test1",
      tick: (dt) => (rm.get("test1").count += dt),
    });
    rm.upsert({
      name: "test2",
      tick: () => (rm.get("test2").count += rm.get("test1").value()),
    });

    rm.update(1000);
    expect(rm.resources["test1"].count).to.be.equal(1);
    expect(rm.resources["test2"].count).to.be.equal(1);

    rm.update(2000);
    expect(rm.resources["test1"].count).to.be.equal(2);
    expect(rm.resources["test1"].rate.count).to.be.equal(1);
    expect(rm.resources["test2"].count).to.be.equal(3);
    expect(rm.resources["test2"].rate.count).to.be.equal(2);

    rm.update(5000);
    expect(rm.resources["test1"].count).to.be.equal(5);
    expect(rm.resources["test1"].rate.count).to.be.equal(1);
    expect(rm.resources["test2"].count).to.be.equal(15);
    expect(rm.resources["test2"].rate.count).to.be.equal(4);
  });
});

describe("Purchasing", () => {
  it("Simple purchases", () => {
    const rm = genResourceManager(null, {});
    const r1 = rm.upsert({ name: "r1", count: 10 });
    const r2 = rm.upsert({ name: "r2", count: 0 });
    r2.cost = () => [{ resource: "r1", count: 1 }];

    rm.purchase([{ resource: "r2", count: 1 }]);
    expect(r1.count).to.equal(9);
    expect(r2.count).to.equal(1);

    rm.purchase([{ resource: "r2", count: 4 }]);
    expect(r1.count).to.equal(5);
    expect(r2.count).to.equal(5);
  });

  it("Full purchases", () => {
    const rm = genResourceManager(null, {});
    const r1 = rm.upsert({ name: "r1", count: 10 });
    const r2 = rm.upsert({ name: "r2", count: 0 });
    r2.cost = () => [{ resource: "r1", count: 1 }];

    rm.purchase([{ resource: "r2", count: 3 }], "full");
    expect(r1.count).to.equal(7);
    expect(r2.count).to.equal(3);

    rm.purchase([{ resource: "r2", count: 4 }], "full");
    expect(r1.count).to.equal(3);
    expect(r2.count).to.equal(7);

    rm.purchase([{ resource: "r2", count: 5 }], "full");
    expect(r1.count).to.equal(3);
    expect(r2.count).to.equal(7);
  });

  it("Partial purchases", () => {
    const rm = genResourceManager(null, {});
    const r1 = rm.upsert({ name: "r1", count: 10 });
    const r2 = rm.upsert({ name: "r2", count: 0 });
    r2.cost = () => [{ resource: "r1", count: 1 }];

    rm.purchase([{ resource: "r2", count: 3 }], "partial");
    expect(r1.count).to.equal(7);
    expect(r2.count).to.equal(3);

    rm.purchase([{ resource: "r2", count: 4 }], "partial");
    expect(r1.count).to.equal(3);
    expect(r2.count).to.equal(7);

    rm.purchase([{ resource: "r2", count: 5 }], "partial");
    expect(r1.count).to.equal(0);
    expect(r2.count).to.equal(10);
  });

  it("Free purchases", () => {
    const rm = genResourceManager(null, {});
    const r1 = rm.upsert({ name: "r1", count: 10 });
    const r2 = rm.upsert({ name: "r2", count: 0 });
    r2.cost = () => [{ resource: "r1", count: 1 }];

    rm.purchase([{ resource: "r2", count: 3 }], "free");
    expect(r1.count).to.equal(10);
    expect(r2.count).to.equal(3);
  });

  it("Locked purchases", () => {
    const rm = genResourceManager(null, {});
    const r1 = rm.upsert({ name: "r1", count: 10 });
    const r2 = rm.upsert({ name: "r2", count: 0 });
    r2.cost = () => [{ resource: "r1", count: 1 }];
    r2.unlocked = false;

    rm.purchase([{ resource: "r2", count: 3 }]);
    expect(r1.count).to.equal(10);
    expect(r2.count).to.equal(0);

    r1.unlocked = false;
    r2.unlocked = true;

    rm.purchase([{ resource: "r2", count: 3 }]);
    expect(r1.count).to.equal(10);
    expect(r2.count).to.equal(0);

    r1.unlocked = true;

    rm.purchase([{ resource: "r2", count: 3 }]);
    expect(r1.count).to.equal(7);
    expect(r2.count).to.equal(3);
  });

  it("Complex purchases", () => {
    const rm = genResourceManager(null, {});
    const r1 = rm.upsert({ name: "r1", count: 100 });
    const r2 = rm.upsert({ name: "r2", count: 20 });
    const r3 = rm.upsert({ name: "r3", count: 0 });
    r3.cost = (n) => [
      { resource: "r1", count: n ** 2 },
      { resource: "r2", count: n },
    ];

    rm.purchase([{ resource: "r3", count: 1 }]);
    expect(r1.count).to.equal(99);
    expect(r2.count).to.equal(19);
    expect(r3.count).to.equal(1);

    rm.purchase([{ resource: "r3", count: 1 }]);
    expect(r1.count).to.equal(95);
    expect(r2.count).to.equal(17);
    expect(r3.count).to.equal(2);

    rm.purchase([{ resource: "r3", count: 2 }]);
    expect(r1.count).to.equal(70);
    expect(r2.count).to.equal(10);
    expect(r3.count).to.equal(4);

    rm.purchase([{ resource: "r3", count: 2 }], "full");
    expect(r1.count).to.equal(70);
    expect(r2.count).to.equal(10);
    expect(r3.count).to.equal(4);

    rm.purchase([{ resource: "r3", count: 2 }], "partial");
    expect(r1.count).to.equal(45);
    expect(r2.count).to.equal(5);
    expect(r3.count).to.equal(5);

    rm.purchase([{ resource: "r3", count: 2 }], "free");
    expect(r1.count).to.equal(45);
    expect(r2.count).to.equal(5);
    expect(r3.count).to.equal(7);
  });

  it("Multiple purchases", () => {
    const rm = genResourceManager(null, {});
    const r1 = rm.upsert({ name: "r1", count: 100, extra: { auto: 10 } });
    const r2 = rm.upsert({ name: "r2", count: 20 });
    const r3 = rm.upsert({ name: "r3", count: 0 });
    r2.cost = (n) => [
      { resource: "r1", count: n, kind: "" },
      { resource: "r1", count: 1, kind: "auto" },
    ];
    r3.cost = (n) => [
      { resource: "r1", count: n ** 2 },
      { resource: "r2", count: n },
    ];

    rm.purchase([{ resource: "r3", count: 1 }]);
    expect(r1.count).to.equal(99);
    expect(r1.extra["auto"]).to.equal(10);
    expect(r2.count).to.equal(19);
    expect(r3.count).to.equal(1);

    rm.purchase([{ resource: "r2", count: 1 }]);
    expect(r1.count).to.equal(79);
    expect(r1.extra["auto"]).to.equal(9);
    expect(r2.count).to.equal(20);
    expect(r3.count).to.equal(1);

    rm.purchase([
      { resource: "r3", count: 2 },
      { resource: "r2", count: 2 },
    ]);
    expect(r1.count).to.equal(33);
    expect(r1.extra["auto"]).to.equal(7);
    expect(r2.count).to.equal(17);
    expect(r3.count).to.equal(3);
  });

  it("Dry purchases", () => {
    const rm = genResourceManager(null, {});
    const r1 = rm.upsert({ name: "r1", count: 100, extra: { auto: 10 } });
    const r2 = rm.upsert({ name: "r2", count: 20 });
    const r3 = rm.upsert({ name: "r3", count: 0 });
    r2.cost = (n) => [
      { resource: "r1", count: n, kind: "" },
      { resource: "r1", count: 1, kind: "auto" },
    ];
    r3.cost = (n) => [
      { resource: "r1", count: n ** 2 },
      { resource: "r2", count: n },
    ];

    let canBuy = rm.purchase([{ resource: "r3", count: 1 }], "dry-full");
    expect(r1.count).to.equal(100);
    expect(r1.extra["auto"]).to.equal(10);
    expect(r2.count).to.equal(20);
    expect(r3.count).to.equal(0);
    expect(canBuy.gain).to.deep.equal([{ resource: r3, count: 1, kind: "" }]);

    canBuy = rm.purchase([{ resource: "r2", count: 1 }], "dry-full");
    expect(r1.count).to.equal(100);
    expect(r1.extra["auto"]).to.equal(10);
    expect(r2.count).to.equal(20);
    expect(r3.count).to.equal(0);
    expect(canBuy.gain).to.deep.equal([{ resource: r2, count: 1, kind: "" }]);

    canBuy = rm.purchase(
      [
        { resource: r3, count: 10 },
        { resource: "r2", count: 10 },
      ],
      "dry-partial",
    );
    expect(canBuy.gain).to.deep.equal([
      { resource: r3, count: 5, kind: "" },
      { resource: r2, count: 4, kind: "" },
    ]);
  });
});

describe("ResourceHelper", () => {
  it("Helper methods", () => {
    const rm = genResourceManager(null, {});
    const r1 = rm.upsert({ name: "r1", count: 100, extra: { auto: 10 } });
    const r2 = rm.upsert({ name: "r2", count: 20 });
    const r3 = rm.upsert({ name: "r3", count: 0 });
    r1.value = (kind) =>
      kind
        ? r1.extra[kind]
        : r1.count + Object.values(r1.extra).reduce((s, c) => s + c, 0);
    r2.cost = (n) => [
      { resource: "r1", count: n, kind: "" },
      { resource: "r1", count: 1, kind: "auto" },
    ];
    r3.cost = (n) => [
      { resource: "r1", count: n ** 2 },
      { resource: "r2", count: n },
    ];

    expect(rm.get(r1).value()).to.equal(110);
    expect(rm.get("r1").value("auto")).to.equal(10);
    expect(rm.get("r2").value()).to.equal(20);
    expect(rm.get(r3).value()).to.equal(0);

    expect(rm.get("r3").canBuy().count).to.equal(1);
    expect(rm.get("r2").canBuy(1).count).to.equal(1);
    expect(rm.get(r3).canBuy(10).count).to.equal(5);
    expect(rm.get(r2).canBuy(10).count).to.equal(4);

    expect(rm.get(r1).add(3).count).to.equal(3);
    expect(rm.get(r1).value()).to.equal(113);
    expect(rm.get(r1).count).to.equal(103);
    expect(rm.get(r1).value("auto")).to.equal(10);

    expect(rm.get(r3).add(10).count).to.equal(10);
    expect(rm.get(r1).value()).to.equal(113);
    expect(rm.get(r2).value()).to.equal(20);
    expect(rm.get(r3).value()).to.equal(10);

    r1.count = 100;
    r3.count = 0;

    expect(rm.get(r3).buy().count).to.equal(1);
    expect(r1.count).to.equal(99);
    expect(r1.extra["auto"]).to.equal(10);
    expect(r2.count).to.equal(19);
    expect(r3.count).to.equal(1);

    expect(rm.get(r2).buy(1).count).to.equal(1);
    expect(r1.count).to.equal(79);
    expect(r1.extra["auto"]).to.equal(9);
    expect(r2.count).to.equal(20);
    expect(r3.count).to.equal(1);

    expect(rm.get(r3).buy(2).count).to.equal(2);
    expect(rm.get(r2).buy(2).count).to.equal(2);
    expect(r1.count).to.equal(33);
    expect(r1.extra["auto"]).to.equal(7);
    expect(r2.count).to.equal(17);
    expect(r3.count).to.equal(3);
  });
});

describe("Task execution", () => {
  it("Task executor enables and disabled task runs", () => {
    const settings = { lastUpdate: 0 };
    const rm = genResourceManager(null, settings);

    const t1 = rm.upsert({
      name: "test1",
      tick: (dt) => dt.toString(),
      unlocked: false,
    });

    expect(rm.update(1)).to.deep.equal([]);
    expect(t1.execution.lastTick).to.be.undefined;
    expect(t1.execution.lastAttempt).to.be.undefined;

    expect(rm.update(2)).to.deep.equal([]);
    expect(t1.execution.lastTick).to.be.undefined;
    expect(t1.execution.lastAttempt).to.be.undefined;

    expect(rm.update(1000)).to.deep.equal([]);
    expect(t1.execution.lastTick).to.be.undefined;
    expect(t1.execution.lastAttempt).to.be.undefined;

    t1.unlocked = true;

    expect(rm.update(2000)).to.deep.equal(["1"]);
    expect(t1.execution.lastTick).to.be.equal(2000);
    expect(t1.execution.lastAttempt).to.be.equal(2000);

    expect(rm.update(2001)).to.deep.equal(["0.001"]);
    expect(t1.execution.lastTick).to.be.equal(2001);
    expect(t1.execution.lastAttempt).to.be.equal(2001);

    expect(rm.update(3000)).to.deep.equal(["0.999"]);
    expect(t1.execution.lastTick).to.be.equal(3000);
    expect(t1.execution.lastAttempt).to.be.equal(3000);

    t1.unlocked = false;

    expect(rm.update(4000)).to.deep.equal([]);
    expect(t1.execution.lastTick).to.be.equal(3000);
    expect(t1.execution.lastAttempt).to.be.equal(3000);
  });

  it("Task executor schedules tasks correctly", () => {
    const settings = { maxResourceTickSecs: 5 };
    const rm = genResourceManager(null, settings);

    const t1 = rm.upsert({
      name: "1/sec",
      shouldTick: (dt) => dt >= 1,
      tick: (dt) => t1.name + "-" + dt.toString(),
    });
    const t2 = rm.upsert({
      name: "2/sec",
      shouldTick: (dt) => dt >= 0.5,
      tick: (dt) => t2.name + "-" + dt.toString(),
    });

    expect(rm.update(1000)).to.deep.equal([]);
    expect(rm.update(1100)).to.deep.equal([]);
    expect(rm.update(1200)).to.deep.equal([]);
    expect(rm.update(1500)).to.deep.equal(["2/sec-0.5"]);
    expect(rm.update(1750)).to.deep.equal([]);
    expect(rm.update(2000)).to.deep.equal(["1/sec-1", "2/sec-0.5"]);
    expect(rm.update(3000)).to.deep.equal(["1/sec-1", "2/sec-1"]);
    expect(rm.update(5000)).to.deep.equal(["1/sec-2", "2/sec-2"]);
    expect(rm.update(5555)).to.deep.equal(["2/sec-0.555"]);
    expect(rm.update(15555)).to.deep.equal(["1/sec-5", "2/sec-5"]);
  });

  it("Task executor updates rates", () => {
    const settings = { maxResourceTickSecs: 5 };
    const rm = genResourceManager(null, settings);

    const t1 = rm.upsert({
      name: "1/sec",
      shouldTick: (dt) => dt >= 1,
      tick: (dt) => t1.name + "-" + dt.toString(),
    });
    const t2 = rm.upsert({
      name: "2/sec",
      shouldTick: (dt) => dt >= 0.5,
      tick: (dt) => t2.name + "-" + dt.toString(),
    });

    expect(t1.rate.ticks).to.equal(0);
    expect(t2.rate.ticks).to.equal(0);
    rm.update(1000);
    expect(t1.rate.ticks).to.equal(0);
    expect(t2.rate.ticks).to.equal(0);
    rm.update(1100);
    rm.update(1200);
    rm.update(1500);
    expect(t1.rate.ticks).to.equal(0);
    expect(t2.rate.ticks).to.equal(0);
    rm.update(1750);
    expect(t1.rate.ticks).to.equal(0);
    expect(t2.rate.ticks).to.equal(0);
    rm.update(2000);
    expect(t1.rate.ticks).to.equal(1);
    expect(t2.rate.ticks).to.equal(2);
    rm.update(3000);
    expect(t1.rate.ticks).to.equal(1);
    expect(t2.rate.ticks).to.equal(1);
    rm.update(5000);
    expect(t1.rate.ticks).to.equal(0.5);
    expect(t2.rate.ticks).to.equal(0.5);
    rm.update(5555);
    expect(t1.rate.ticks).to.equal(0.5);
    expect(t2.rate.ticks).to.equal(0.5);
    rm.update(6500);
    expect(t1.rate.ticks).to.equal(1 / 1.5);
    expect(t2.rate.ticks).to.equal(2 / 1.5);
    rm.update(16500);
    expect(t1.rate.ticks).to.equal(0.2);
    expect(t2.rate.ticks).to.equal(0.2);
  });
});
