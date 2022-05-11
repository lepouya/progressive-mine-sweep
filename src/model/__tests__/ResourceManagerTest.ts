import "mocha";
import { expect } from "chai";

import { genResourceManager } from "../ResourceManager";

describe("Creating resources", () => {
  it("Empty resource manager set up correctly", () => {
    const rm = genResourceManager();
    expect(rm.resources).to.deep.equal({});
  });

  it("Creating new resource works", () => {
    const rm = genResourceManager();
    const R1 = rm.upsert({ name: "test1" });

    expect(rm.resources["test1"]).to.equal(R1);
    expect(rm.resources["test1"].name).to.equal("test1");
  });

  it("Adding multiple fields", () => {
    const rm = genResourceManager();
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
    const rm = genResourceManager();
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
    const rm = genResourceManager();
    const settings = { lastUpdate: 1000 };

    rm.update(2000, settings);
    expect(settings.lastUpdate).to.be.equal(2000);

    rm.update(3000, settings);
    expect(settings.lastUpdate).to.be.equal(3000);
  });

  it("Time below min delta doesn't change anything", () => {
    const rm = genResourceManager();
    const settings = { lastUpdate: 1000 };

    rm.update(1000.1, settings);
    expect(settings.lastUpdate).to.be.equal(1000);
  });

  it("Resource ticks called corectly", () => {
    const rm = genResourceManager();
    const settings = { lastUpdate: 0 };

    rm.upsert({
      name: "test1",
      tick: (dt) => (rm.get("test1").count += dt),
    });
    rm.upsert({
      name: "test2",
      tick: () => rm.get("test2").count++,
    });

    rm.update(500, settings);
    expect(settings.lastUpdate).to.be.equal(500);
    expect(rm.resources["test1"].count).to.be.equal(0.5);
    expect(rm.resources["test2"].count).to.be.equal(1);

    rm.update(1500, settings);
    expect(settings.lastUpdate).to.be.equal(1500);
    expect(rm.resources["test1"].count).to.be.equal(1.5);
    expect(rm.resources["test2"].count).to.be.equal(2);
  });

  it("Tick granularity works as expected", () => {
    const rm = genResourceManager();
    const settings = { lastUpdate: 0 };

    const R1 = rm.upsert({ name: "test1" });
    R1.tick = (dt) => {
      R1.count += dt;
    };
    const R2 = rm.upsert({ name: "test2" });
    R2.tick = () => {
      R2.count++;
    };

    rm.update(0.5, settings);
    expect(settings.lastUpdate).to.be.equal(0);
    expect(rm.resources["test1"].count).to.be.equal(0);
    expect(rm.resources["test2"].count).to.be.equal(0);

    rm.update(500, settings);
    expect(settings.lastUpdate).to.be.equal(500);
    expect(rm.resources["test1"].count).to.be.equal(0.5);
    expect(rm.resources["test2"].count).to.be.equal(1);

    rm.update(1000, settings);
    expect(settings.lastUpdate).to.be.equal(1000);
    expect(rm.resources["test1"].count).to.be.equal(1);
    expect(rm.resources["test2"].count).to.be.equal(2);

    rm.update(10000, settings);
    expect(settings.lastUpdate).to.be.equal(10000);
    expect(rm.resources["test1"].count).to.be.equal(10);
    expect(rm.resources["test2"].count).to.be.equal(11);
  });

  it("Max tick update works", () => {
    const rm = genResourceManager();
    const settings = { lastUpdate: 0 };

    rm.upsert({
      name: "test1",
      tick: (dt) => (rm.get("test1").count += dt),
    });
    rm.upsert({
      name: "test2",
      tick: () => rm.get("test2").count++,
    });

    rm.update(500, settings);
    expect(settings.lastUpdate).to.be.equal(500);
    expect(rm.resources["test1"].count).to.be.equal(0.5);
    expect(rm.resources["test2"].count).to.be.equal(1);

    rm.update(100000000, settings);
    expect(settings.lastUpdate).to.be.equal(100000000);
    expect(rm.resources["test1"].count).to.be.equal(86400.5);
    expect(rm.resources["test2"].count).to.be.equal(86401);
  });

  it("Rate update works", () => {
    const rm = genResourceManager();
    const settings = { lastUpdate: 0 };

    rm.upsert({
      name: "test1",
      tick: (dt) => (rm.get("test1").count += dt),
    });
    rm.upsert({
      name: "test2",
      tick: () => (rm.get("test2").count += rm.get("test1").value()),
    });

    rm.update(1000, settings);
    expect(rm.resources["test1"].count).to.be.equal(1);
    expect(rm.resources["test2"].count).to.be.equal(1);

    rm.update(2000, settings);
    expect(rm.resources["test1"].count).to.be.equal(2);
    expect(rm.resources["test1"].rate).to.be.equal(1);
    expect(rm.resources["test2"].count).to.be.equal(3);
    expect(rm.resources["test2"].rate).to.be.equal(2);

    rm.update(5000, settings);
    expect(rm.resources["test1"].count).to.be.equal(5);
    expect(rm.resources["test1"].rate).to.be.equal(1);
    expect(rm.resources["test2"].count).to.be.equal(15);
    expect(rm.resources["test2"].rate).to.be.equal(4);
  });
});

describe("Purchasing", () => {
  it("Simple purchases", () => {
    const rm = genResourceManager();
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
    const rm = genResourceManager();
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
    const rm = genResourceManager();
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
    const rm = genResourceManager();
    const r1 = rm.upsert({ name: "r1", count: 10 });
    const r2 = rm.upsert({ name: "r2", count: 0 });
    r2.cost = () => [{ resource: "r1", count: 1 }];

    rm.purchase([{ resource: "r2", count: 3 }], "free");
    expect(r1.count).to.equal(10);
    expect(r2.count).to.equal(3);
  });

  it("Locked purchases", () => {
    const rm = genResourceManager();
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
    const rm = genResourceManager();
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
    const rm = genResourceManager();
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
    const rm = genResourceManager();
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
    const rm = genResourceManager();
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
