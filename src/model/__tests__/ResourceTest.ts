import { genResourceManager } from "../Resource";

describe("Creating resources", () => {
  test("Empty resource manager set up correctly", () => {
    const rm = genResourceManager(null, {});
    expect(rm.resources).toEqual({});
  });

  test("Creating new resource works", () => {
    const rm = genResourceManager(null, {});
    const R1 = rm.upsert({ name: "test1" });

    expect(rm.resources["test1"]).toEqual(R1);
    expect(rm.resources["test1"].name).toEqual("test1");
  });

  test("Adding multiple fields", () => {
    const rm = genResourceManager(null, {});
    const R1 = rm.upsert({ name: "test1", count: 5, maxCount: 1 });
    const R2 = rm.upsert({ name: "test2", extra: { bonus: 1 } });

    expect(rm.resources["test1"]).toEqual(R1);
    expect(rm.resources["test1"].name).toEqual("test1");
    expect(rm.resources["test1"].count).toEqual(5);
    expect(rm.resources["test1"].extra["bonus"]).toBeUndefined();
    expect(rm.resources["test1"].maxCount).toEqual(1);

    expect(rm.resources["test2"]).toEqual(R2);
    expect(rm.resources["test2"].name).toEqual("test2");
    expect(rm.resources["test2"].count).toEqual(0);
    expect(rm.resources["test2"].extra["bonus"]).toEqual(1);
    expect(rm.resources["test2"].extra["auto"]).toBeUndefined;
    expect(rm.resources["test2"].maxCount).toBeUndefined;
  });

  test("Overwriting fields", () => {
    const rm = genResourceManager(null, {});
    const R1 = rm.upsert({ name: "test1", count: 5 });
    const R2 = rm.upsert({ name: "test1", extra: { auto: 7 }, maxCount: 1 });

    expect(rm.resources["test1"]).toEqual(R1);
    expect(rm.resources["test1"]).toEqual(R2);
    expect(rm.resources["test1"].name).toEqual("test1");
    expect(rm.resources["test1"].count).toEqual(5);
    expect(rm.resources["test1"].extra["auto"]).toEqual(7);
    expect(rm.resources["test1"].maxCount).toEqual(1);
  });
});

describe("Updating resources", () => {
  test("Time is updated correctly", () => {
    const settings = { lastUpdate: 1000 };
    const rm = genResourceManager(null, settings);

    rm.update(2000);
    expect(settings.lastUpdate).toEqual(2000);

    rm.update(3000);
    expect(settings.lastUpdate).toEqual(3000);
  });

  test("Time below min delta doesn't change anything", () => {
    const settings = { lastUpdate: 1000 };
    const rm = genResourceManager(null, settings);

    rm.update(1000.1);
    expect(settings.lastUpdate).toEqual(1000);
  });

  test("Resource ticks called corectly", () => {
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
    expect(settings.lastUpdate).toEqual(500);
    expect(rm.resources["test1"].count).toEqual(0.5);
    expect(rm.resources["test2"].count).toEqual(1);

    rm.update(1500);
    expect(settings.lastUpdate).toEqual(1500);
    expect(rm.resources["test1"].count).toEqual(1.5);
    expect(rm.resources["test2"].count).toEqual(2);
  });

  test("Tick granularity works as expected", () => {
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
    expect(settings.lastUpdate).toEqual(0);
    expect(rm.resources["test1"].count).toEqual(0);
    expect(rm.resources["test2"].count).toEqual(0);

    rm.update(500);
    expect(settings.lastUpdate).toEqual(500);
    expect(rm.resources["test1"].count).toEqual(0.5);
    expect(rm.resources["test2"].count).toEqual(1);

    rm.update(1000);
    expect(settings.lastUpdate).toEqual(1000);
    expect(rm.resources["test1"].count).toEqual(1);
    expect(rm.resources["test2"].count).toEqual(2);

    rm.update(10000);
    expect(settings.lastUpdate).toEqual(10000);
    expect(rm.resources["test1"].count).toEqual(10);
    expect(rm.resources["test2"].count).toEqual(11);
  });

  test("Max tick update works", () => {
    const settings = { lastUpdate: 0 };
    const rm = genResourceManager(null, settings);

    rm.upsert("test1").tick = function (dt) {
      rm.get("test1").count += dt;
    };
    rm.upsert("test2").tick = function () {
      rm.get("test2").count++;
    };

    rm.update(500);
    expect(settings.lastUpdate).toEqual(500);
    expect(rm.resources["test1"].count).toEqual(0.5);
    expect(rm.resources["test2"].count).toEqual(1);

    rm.update(100000000);
    expect(settings.lastUpdate).toEqual(100000000);
    expect(rm.resources["test1"].count).toEqual(86400.5);
    expect(rm.resources["test2"].count).toEqual(86401);
  });

  test("Rate update works", () => {
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
    expect(rm.resources["test1"].count).toEqual(1);
    expect(rm.resources["test2"].count).toEqual(1);

    rm.update(2000);
    expect(rm.resources["test1"].count).toEqual(2);
    expect(rm.resources["test1"].rate.count).toEqual(1);
    expect(rm.resources["test2"].count).toEqual(3);
    expect(rm.resources["test2"].rate.count).toEqual(2);

    rm.update(5000);
    expect(rm.resources["test1"].count).toEqual(5);
    expect(rm.resources["test1"].rate.count).toEqual(1);
    expect(rm.resources["test2"].count).toEqual(15);
    expect(rm.resources["test2"].rate.count).toEqual(4);
  });
});

describe("Purchasing", () => {
  test("Simple purchases", () => {
    const rm = genResourceManager(null, {});
    const r1 = rm.upsert({ name: "r1", count: 10 });
    const r2 = rm.upsert({ name: "r2", count: 0 });
    r2.cost = () => [{ resource: "r1", count: 1 }];

    rm.purchase([{ resource: "r2", count: 1 }]);
    expect(r1.count).toEqual(9);
    expect(r2.count).toEqual(1);

    rm.purchase([{ resource: "r2", count: 4 }]);
    expect(r1.count).toEqual(5);
    expect(r2.count).toEqual(5);
  });

  test("Full purchases", () => {
    const rm = genResourceManager(null, {});
    const r1 = rm.upsert({ name: "r1", count: 10 });
    const r2 = rm.upsert({ name: "r2", count: 0 });
    r2.cost = () => [{ resource: "r1", count: 1 }];

    rm.purchase([{ resource: "r2", count: 3 }], "full");
    expect(r1.count).toEqual(7);
    expect(r2.count).toEqual(3);

    rm.purchase([{ resource: "r2", count: 4 }], "full");
    expect(r1.count).toEqual(3);
    expect(r2.count).toEqual(7);

    rm.purchase([{ resource: "r2", count: 5 }], "full");
    expect(r1.count).toEqual(3);
    expect(r2.count).toEqual(7);
  });

  test("Partial purchases", () => {
    const rm = genResourceManager(null, {});
    const r1 = rm.upsert({ name: "r1", count: 10 });
    const r2 = rm.upsert({ name: "r2", count: 0 });
    r2.cost = () => [{ resource: "r1", count: 1 }];

    rm.purchase([{ resource: "r2", count: 3 }], "partial");
    expect(r1.count).toEqual(7);
    expect(r2.count).toEqual(3);

    rm.purchase([{ resource: "r2", count: 4 }], "partial");
    expect(r1.count).toEqual(3);
    expect(r2.count).toEqual(7);

    rm.purchase([{ resource: "r2", count: 5 }], "partial");
    expect(r1.count).toEqual(0);
    expect(r2.count).toEqual(10);
  });

  test("Free purchases", () => {
    const rm = genResourceManager(null, {});
    const r1 = rm.upsert({ name: "r1", count: 10 });
    const r2 = rm.upsert({ name: "r2", count: 0 });
    r2.cost = () => [{ resource: "r1", count: 1 }];

    rm.purchase([{ resource: "r2", count: 3 }], "free");
    expect(r1.count).toEqual(10);
    expect(r2.count).toEqual(3);
  });

  test("Locked purchases", () => {
    const rm = genResourceManager(null, {});
    const r1 = rm.upsert({ name: "r1", count: 10 });
    const r2 = rm.upsert({ name: "r2", count: 0 });
    r2.cost = () => [{ resource: "r1", count: 1 }];
    r2.unlocked = false;

    rm.purchase([{ resource: "r2", count: 3 }]);
    expect(r1.count).toEqual(10);
    expect(r2.count).toEqual(0);

    r1.unlocked = false;
    r2.unlocked = true;

    rm.purchase([{ resource: "r2", count: 3 }]);
    expect(r1.count).toEqual(10);
    expect(r2.count).toEqual(0);

    r1.unlocked = true;

    rm.purchase([{ resource: "r2", count: 3 }]);
    expect(r1.count).toEqual(7);
    expect(r2.count).toEqual(3);
  });

  test("Complex purchases", () => {
    const rm = genResourceManager(null, {});
    const r1 = rm.upsert({ name: "r1", count: 100 });
    const r2 = rm.upsert({ name: "r2", count: 20 });
    const r3 = rm.upsert({ name: "r3", count: 0 });
    r3.cost = (n) => [
      { resource: "r1", count: n ** 2 },
      { resource: "r2", count: n },
    ];

    rm.purchase([{ resource: "r3", count: 1 }]);
    expect(r1.count).toEqual(99);
    expect(r2.count).toEqual(19);
    expect(r3.count).toEqual(1);

    rm.purchase([{ resource: "r3", count: 1 }]);
    expect(r1.count).toEqual(95);
    expect(r2.count).toEqual(17);
    expect(r3.count).toEqual(2);

    rm.purchase([{ resource: "r3", count: 2 }]);
    expect(r1.count).toEqual(70);
    expect(r2.count).toEqual(10);
    expect(r3.count).toEqual(4);

    rm.purchase([{ resource: "r3", count: 2 }], "full");
    expect(r1.count).toEqual(70);
    expect(r2.count).toEqual(10);
    expect(r3.count).toEqual(4);

    rm.purchase([{ resource: "r3", count: 2 }], "partial");
    expect(r1.count).toEqual(45);
    expect(r2.count).toEqual(5);
    expect(r3.count).toEqual(5);

    rm.purchase([{ resource: "r3", count: 2 }], "free");
    expect(r1.count).toEqual(45);
    expect(r2.count).toEqual(5);
    expect(r3.count).toEqual(7);
  });

  test("Multiple purchases", () => {
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
    expect(r1.count).toEqual(99);
    expect(r1.extra["auto"]).toEqual(10);
    expect(r2.count).toEqual(19);
    expect(r3.count).toEqual(1);

    rm.purchase([{ resource: "r2", count: 1 }]);
    expect(r1.count).toEqual(79);
    expect(r1.extra["auto"]).toEqual(9);
    expect(r2.count).toEqual(20);
    expect(r3.count).toEqual(1);

    rm.purchase([
      { resource: "r3", count: 2 },
      { resource: "r2", count: 2 },
    ]);
    expect(r1.count).toEqual(33);
    expect(r1.extra["auto"]).toEqual(7);
    expect(r2.count).toEqual(17);
    expect(r3.count).toEqual(3);
  });

  test("Dry purchases", () => {
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
    expect(r1.count).toEqual(100);
    expect(r1.extra["auto"]).toEqual(10);
    expect(r2.count).toEqual(20);
    expect(r3.count).toEqual(0);
    expect(canBuy.gain).toEqual([{ resource: r3, count: 1, kind: "" }]);

    canBuy = rm.purchase([{ resource: "r2", count: 1 }], "dry-full");
    expect(r1.count).toEqual(100);
    expect(r1.extra["auto"]).toEqual(10);
    expect(r2.count).toEqual(20);
    expect(r3.count).toEqual(0);
    expect(canBuy.gain).toEqual([{ resource: r2, count: 1, kind: "" }]);

    canBuy = rm.purchase(
      [
        { resource: r3, count: 10 },
        { resource: "r2", count: 10 },
      ],
      "dry-partial",
    );
    expect(canBuy.gain).toEqual([
      { resource: r3, count: 5, kind: "" },
      { resource: r2, count: 4, kind: "" },
    ]);
  });
});

describe("ResourceHelper", () => {
  test("Helper methods", () => {
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

    expect(rm.get(r1).value()).toEqual(110);
    expect(rm.get("r1").value("auto")).toEqual(10);
    expect(rm.get("r2").value()).toEqual(20);
    expect(rm.get(r3).value()).toEqual(0);

    expect(rm.get("r3").canBuy().count).toEqual(1);
    expect(rm.get("r2").canBuy(1).count).toEqual(1);
    expect(rm.get(r3).canBuy(10).count).toEqual(5);
    expect(rm.get(r2).canBuy(10).count).toEqual(4);

    expect(rm.get(r1).add(3).count).toEqual(3);
    expect(rm.get(r1).value()).toEqual(113);
    expect(rm.get(r1).count).toEqual(103);
    expect(rm.get(r1).value("auto")).toEqual(10);

    expect(rm.get(r3).add(10).count).toEqual(10);
    expect(rm.get(r1).value()).toEqual(113);
    expect(rm.get(r2).value()).toEqual(20);
    expect(rm.get(r3).value()).toEqual(10);

    r1.count = 100;
    r3.count = 0;

    expect(rm.get(r3).buy().count).toEqual(1);
    expect(r1.count).toEqual(99);
    expect(r1.extra["auto"]).toEqual(10);
    expect(r2.count).toEqual(19);
    expect(r3.count).toEqual(1);

    expect(rm.get(r2).buy(1).count).toEqual(1);
    expect(r1.count).toEqual(79);
    expect(r1.extra["auto"]).toEqual(9);
    expect(r2.count).toEqual(20);
    expect(r3.count).toEqual(1);

    expect(rm.get(r3).buy(2).count).toEqual(2);
    expect(rm.get(r2).buy(2).count).toEqual(2);
    expect(r1.count).toEqual(33);
    expect(r1.extra["auto"]).toEqual(7);
    expect(r2.count).toEqual(17);
    expect(r3.count).toEqual(3);
  });
});

describe("Task execution", () => {
  test("Task executor enables and disabled task runs", () => {
    const settings = { lastUpdate: 0 };
    const rm = genResourceManager(null, settings);

    const t1 = rm.upsert({
      name: "test1",
      tick: (dt) => dt.toString(),
      unlocked: false,
    });

    expect(rm.update(1)).toEqual([]);
    expect(t1.execution.lastTick).toBeUndefined;
    expect(t1.execution.lastAttempt).toBeUndefined;

    expect(rm.update(2)).toEqual([]);
    expect(t1.execution.lastTick).toBeUndefined;
    expect(t1.execution.lastAttempt).toBeUndefined;

    expect(rm.update(1000)).toEqual([]);
    expect(t1.execution.lastTick).toBeUndefined;
    expect(t1.execution.lastAttempt).toBeUndefined;

    t1.unlocked = true;

    expect(rm.update(2000)).toEqual(["1"]);
    expect(t1.execution.lastTick).toEqual(2000);
    expect(t1.execution.lastAttempt).toEqual(2000);

    expect(rm.update(2001)).toEqual(["0.001"]);
    expect(t1.execution.lastTick).toEqual(2001);
    expect(t1.execution.lastAttempt).toEqual(2001);

    expect(rm.update(3000)).toEqual(["0.999"]);
    expect(t1.execution.lastTick).toEqual(3000);
    expect(t1.execution.lastAttempt).toEqual(3000);

    t1.unlocked = false;

    expect(rm.update(4000)).toEqual([]);
    expect(t1.execution.lastTick).toEqual(3000);
    expect(t1.execution.lastAttempt).toEqual(3000);
  });

  test("Task executor schedules tasks correctly", () => {
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

    expect(rm.update(1000)).toEqual([]);
    expect(rm.update(1100)).toEqual([]);
    expect(rm.update(1200)).toEqual([]);
    expect(rm.update(1500)).toEqual(["2/sec-0.5"]);
    expect(rm.update(1750)).toEqual([]);
    expect(rm.update(2000)).toEqual(["1/sec-1", "2/sec-0.5"]);
    expect(rm.update(3000)).toEqual(["1/sec-1", "2/sec-1"]);
    expect(rm.update(5000)).toEqual(["1/sec-2", "2/sec-2"]);
    expect(rm.update(5555)).toEqual(["2/sec-0.555"]);
    expect(rm.update(15555)).toEqual(["1/sec-5.555", "1/sec-5", "2/sec-5"]);
  });

  test("Task executor updates rates", () => {
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

    expect(t1.rate.ticks).toEqual(0);
    expect(t2.rate.ticks).toEqual(0);
    rm.update(1000);
    expect(t1.rate.ticks).toEqual(0);
    expect(t2.rate.ticks).toEqual(0);
    rm.update(1100);
    rm.update(1200);
    rm.update(1500);
    expect(t1.rate.ticks).toEqual(0);
    expect(t2.rate.ticks).toEqual(0);
    rm.update(1750);
    expect(t1.rate.ticks).toEqual(0);
    expect(t2.rate.ticks).toEqual(0);
    rm.update(2000);
    expect(t1.rate.ticks).toEqual(1);
    expect(t2.rate.ticks).toEqual(2);
    rm.update(3000);
    expect(t1.rate.ticks).toEqual(1);
    expect(t2.rate.ticks).toEqual(1);
    rm.update(5000);
    expect(t1.rate.ticks).toEqual(0.5);
    expect(t2.rate.ticks).toEqual(0.5);
    rm.update(5555);
    expect(t1.rate.ticks).toEqual(0.5);
    expect(t2.rate.ticks).toEqual(0.5);
    rm.update(6500);
    expect(t1.rate.ticks).toEqual(1 / 1.5);
    expect(t2.rate.ticks).toEqual(2 / 1.5);
    rm.update(16500);
    expect(t1.rate.ticks).toEqual(0.2);
    expect(t2.rate.ticks).toEqual(0.2);
  });
});

describe("Gain and cost multipliers", () => {
  test("Simple multipliers", () => {
    const rm = genResourceManager(null, {});
    const r1 = rm.upsert({ name: "r1", count: 10 });
    const r2 = rm.upsert({ name: "r2", count: 0 });
    r2.cost = () => [{ resource: "r1", count: 1 }];

    rm.purchase([{ resource: "r2", count: 1 }]);
    expect(r1.count).toEqual(9);
    expect(r2.count).toEqual(1);

    rm.purchase([{ resource: "r2", count: 2 }], undefined, 2, 1);
    expect(r1.count).toEqual(7);
    expect(r2.count).toEqual(5);

    rm.purchase([{ resource: "r2", count: 2 }], undefined, 1, 2);
    expect(r1.count).toEqual(3);
    expect(r2.count).toEqual(7);
  });

  test("More complicated multipliers", () => {
    const rm = genResourceManager(null, {});
    const r1 = rm.upsert({ name: "r1", count: 100 });
    const r2 = rm.upsert({ name: "r2", count: 20 });
    const r3 = rm.upsert({ name: "r3", count: 0 });
    r3.cost = (n) => [
      { resource: "r1", count: n ** 2 },
      { resource: "r2", count: n },
    ];

    rm.purchase([{ resource: "r3", count: 1 }], "full", 10, 2);
    expect(r1.count).toEqual(98);
    expect(r2.count).toEqual(18);
    expect(r3.count).toEqual(10);

    rm.purchase([{ resource: "r3", count: 1 }], "partial", 2, 0.1);
    expect(r1.count).toEqual(85.9);
    expect(r2.count).toEqual(16.9);
    expect(r3.count).toEqual(12);

    rm.purchase([{ resource: "r3", count: 3 }], "partial", 0.5, 0.5);
    expect(r1.count).toBeCloseTo(1.4, 3);
    expect(r2.count).toBeCloseTo(10.4, 3);
    expect(r3.count).toBeCloseTo(12.5, 3);
  });
});

describe("Resource selling", () => {
  test("Simple buy and sell", () => {
    const rm = genResourceManager(null, {});
    const r1 = rm.upsert({ name: "r1", count: 10 });
    const r2 = rm.upsert({ name: "r2", count: 0 });
    r2.cost = () => [{ resource: "r1", count: 1 }];

    rm.purchase([{ resource: "r2", count: 1 }]);
    expect(r1.count).toEqual(9);
    expect(r2.count).toEqual(1);

    rm.purchase([{ resource: "r2", count: 2 }]);
    expect(r1.count).toEqual(7);
    expect(r2.count).toEqual(3);

    rm.purchase([{ resource: "r2", count: -1 }]);
    expect(r1.count).toEqual(8);
    expect(r2.count).toEqual(2);

    rm.purchase([{ resource: "r2", count: -2 }]);
    expect(r1.count).toEqual(10);
    expect(r2.count).toEqual(0);

    rm.purchase([{ resource: "r2", count: 1 }]);
    expect(r1.count).toEqual(9);
    expect(r2.count).toEqual(1);

    rm.purchase([{ resource: "r2", count: -2 }]);
    expect(r1.count).toEqual(10);
    expect(r2.count).toEqual(0);
  });

  test("Complex selling", () => {
    const rm = genResourceManager(null, {});
    const r1 = rm.upsert({ name: "r1", count: 100, minCount: 80 });
    const r2 = rm.upsert({ name: "r2", count: 20 });
    const r3 = rm.upsert({ name: "r3", count: 0, maxCount: 5 });
    r3.cost = (n) => [
      { resource: "r1", count: n ** 2 },
      { resource: "r2", count: n },
    ];

    rm.purchase([{ resource: "r3", count: 1 }]);
    expect(r1.count).toEqual(99);
    expect(r2.count).toEqual(19);
    expect(r3.count).toEqual(1);

    rm.purchase([{ resource: "r3", count: 2 }]);
    expect(r1.count).toEqual(86);
    expect(r2.count).toEqual(14);
    expect(r3.count).toEqual(3);

    rm.purchase([{ resource: "r3", count: 2 }]);
    expect(r1.count).toEqual(86);
    expect(r2.count).toEqual(14);
    expect(r3.count).toEqual(3);

    rm.purchase([{ resource: "r3", count: -1 }]);
    expect(r1.count).toEqual(95);
    expect(r2.count).toEqual(17);
    expect(r3.count).toEqual(2);

    rm.purchase([{ resource: "r3", count: -5 }]);
    expect(r1.count).toEqual(100);
    expect(r2.count).toEqual(20);
    expect(r3.count).toEqual(0);
  });
});
