import "mocha";
import { expect } from "chai";

import { genResourceManager } from "../ResourceManager";

describe("Creating resources", () => {
  it("Empty resource manager set up correctly", () => {
    const rm = genResourceManager();
    expect(rm.resources).to.deep.equal({});
    expect(rm.lastUpdate).to.be.greaterThan(0);
  });

  it("Creating new resource works", () => {
    const rm = genResourceManager();
    const R1 = rm.create({ name: "test1" });

    expect(rm.resources["test1"]).to.equal(R1);
    expect(rm.resources["test1"].name).to.equal("test1");
  });

  it("Adding multiple fields", () => {
    const rm = genResourceManager();
    const R1 = rm.create({ name: "test1", count: 5, maxCount: 1 });
    const R2 = rm.create({ name: "test2", extra: { bonus: 1 } });

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
    const R1 = rm.create({ name: "test1", count: 5 });
    const R2 = rm.create({ name: "test1", extra: { auto: 7 }, maxCount: 1 });

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
    rm.lastUpdate = 1000;

    rm.update(2000);
    expect(rm.lastUpdate).to.be.equal(2000);

    rm.update(3000);
    expect(rm.lastUpdate).to.be.equal(3000);
  });

  it("Time below min delta doesn't change anything", () => {
    const rm = genResourceManager();
    rm.lastUpdate = 1000;

    rm.update(1000.1);
    expect(rm.lastUpdate).to.be.equal(1000);
  });

  it("Resource ticks called corectly", () => {
    const rm = genResourceManager();
    rm.lastUpdate = 0;

    const R1 = rm.create({ name: "test1" });
    R1.tick = (dt) => {
      R1.count += dt;
    };
    const R2 = rm.create({ name: "test2" });
    R2.tick = () => {
      R2.count++;
    };

    rm.update(500);
    expect(rm.lastUpdate).to.be.equal(500);
    expect(rm.resources["test1"].count).to.be.equal(0.5);
    expect(rm.resources["test2"].count).to.be.equal(1);

    rm.update(1500);
    expect(rm.lastUpdate).to.be.equal(1500);
    expect(rm.resources["test1"].count).to.be.equal(1.5);
    expect(rm.resources["test2"].count).to.be.equal(2);
  });

  it("Tick granularity works as expected", () => {
    const rm = genResourceManager();
    rm.lastUpdate = 0;

    const R1 = rm.create({ name: "test1" });
    R1.tick = (dt) => {
      R1.count += dt;
    };
    const R2 = rm.create({ name: "test2" });
    R2.tick = () => {
      R2.count++;
    };

    rm.update(0.5);
    expect(rm.lastUpdate).to.be.equal(0);
    expect(rm.resources["test1"].count).to.be.equal(0);
    expect(rm.resources["test2"].count).to.be.equal(0);

    rm.update(500);
    expect(rm.lastUpdate).to.be.equal(500);
    expect(rm.resources["test1"].count).to.be.equal(0.5);
    expect(rm.resources["test2"].count).to.be.equal(1);

    rm.update(1000);
    expect(rm.lastUpdate).to.be.equal(1000);
    expect(rm.resources["test1"].count).to.be.equal(1);
    expect(rm.resources["test2"].count).to.be.equal(2);

    rm.update(10000);
    expect(rm.lastUpdate).to.be.equal(10000);
    expect(rm.resources["test1"].count).to.be.equal(10);
    expect(rm.resources["test2"].count).to.be.equal(11);
  });

  it("Max tick update works", () => {
    const rm = genResourceManager();
    rm.lastUpdate = 0;

    const R1 = rm.create({ name: "test1" });
    R1.tick = (dt) => {
      R1.count += dt;
    };
    const R2 = rm.create({ name: "test2" });
    R2.tick = () => {
      R2.count++;
    };

    rm.update(500);
    expect(rm.lastUpdate).to.be.equal(500);
    expect(rm.resources["test1"].count).to.be.equal(0.5);
    expect(rm.resources["test2"].count).to.be.equal(1);

    rm.update(100000000);
    expect(rm.lastUpdate).to.be.equal(100000000);
    expect(rm.resources["test1"].count).to.be.equal(86400.5);
    expect(rm.resources["test2"].count).to.be.equal(86401);
  });

  it("Rate update works", () => {
    const rm = genResourceManager();
    rm.lastUpdate = 0;

    const R1 = rm.create({ name: "test1" });
    R1.tick = (dt) => {
      R1.count += dt;
    };
    const R2 = rm.create({ name: "test2" });
    R2.tick = () => {
      R2.count += R1.count;
    };

    rm.update(1000);
    expect(rm.resources["test1"].count).to.be.equal(1);
    expect(rm.resources["test2"].count).to.be.equal(1);

    rm.update(2000);
    expect(rm.resources["test1"].count).to.be.equal(2);
    expect(rm.resources["test1"].rate).to.be.equal(1);
    expect(rm.resources["test2"].count).to.be.equal(3);
    expect(rm.resources["test2"].rate).to.be.equal(2);

    rm.update(5000);
    expect(rm.resources["test1"].count).to.be.equal(5);
    expect(rm.resources["test1"].rate).to.be.equal(1);
    expect(rm.resources["test2"].count).to.be.equal(15);
    expect(rm.resources["test2"].rate).to.be.equal(4);
  });
});

describe("Purchasing", () => {
  it("Simple purchases", () => {
    const rm = genResourceManager();
    const r1 = rm.create({ name: "r1", count: 10 });
    const r2 = rm.create({ name: "r2", count: 0 });
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
    const r1 = rm.create({ name: "r1", count: 10 });
    const r2 = rm.create({ name: "r2", count: 0 });
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
    const r1 = rm.create({ name: "r1", count: 10 });
    const r2 = rm.create({ name: "r2", count: 0 });
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
    const r1 = rm.create({ name: "r1", count: 10 });
    const r2 = rm.create({ name: "r2", count: 0 });
    r2.cost = () => [{ resource: "r1", count: 1 }];

    rm.purchase([{ resource: "r2", count: 3 }], "free");
    expect(r1.count).to.equal(10);
    expect(r2.count).to.equal(3);
  });

  it("Complex purchases", () => {
    const rm = genResourceManager();
    const r1 = rm.create({ name: "r1", count: 100 });
    const r2 = rm.create({ name: "r2", count: 20 });
    const r3 = rm.create({ name: "r3", count: 0 });
    r3.cost = (n) => [
      { resource: "r1", count: (r3.count + n) ** 2 },
      { resource: "r2", count: r3.count + n },
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
    const r1 = rm.create({ name: "r1", count: 100, extra: { auto: 10 } });
    const r2 = rm.create({ name: "r2", count: 20 });
    const r3 = rm.create({ name: "r3", count: 0 });
    r2.cost = (n) => [
      { resource: "r1", count: r2.count + n, kind: "" },
      { resource: "r1", count: 1, kind: "auto" },
    ];
    r3.cost = (n) => [
      { resource: "r1", count: (r3.count + n) ** 2 },
      { resource: "r2", count: r3.count + n },
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
});
