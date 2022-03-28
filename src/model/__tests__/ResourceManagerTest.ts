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
    const R1 = rm.create({ name: "test1", count: 5, min: 1 });
    const R2 = rm.create({ name: "test2", bonus: 1 });

    expect(rm.resources["test1"]).to.equal(R1);
    expect(rm.resources["test1"].name).to.equal("test1");
    expect(rm.resources["test1"].count).to.equal(5);
    expect(rm.resources["test1"].bonus).to.equal(0);
    expect(rm.resources["test1"].auto).to.equal(0);
    expect(rm.resources["test1"].min).to.equal(1);
    expect(rm.resources["test1"].max).to.be.undefined;

    expect(rm.resources["test2"]).to.equal(R2);
    expect(rm.resources["test2"].name).to.equal("test2");
    expect(rm.resources["test2"].count).to.equal(0);
    expect(rm.resources["test2"].bonus).to.equal(1);
    expect(rm.resources["test2"].auto).to.equal(0);
    expect(rm.resources["test2"].min).to.be.undefined;
    expect(rm.resources["test2"].max).to.be.undefined;
  });

  it("Overwriting fields", () => {
    const rm = genResourceManager();
    const R1 = rm.create({ name: "test1", count: 5 });
    const R2 = rm.create({ name: "test1", auto: 7, min: 1 });

    expect(rm.resources["test1"]).to.not.equal(R1);
    expect(rm.resources["test1"]).to.equal(R2);
    expect(rm.resources["test1"].name).to.equal("test1");
    expect(rm.resources["test1"].count).to.equal(5);
    expect(rm.resources["test1"].auto).to.equal(7);
    expect(rm.resources["test1"].min).to.equal(1);
    expect(rm.resources["test1"].max).to.be.undefined;
  });
});

describe("Updationg resources", () => {
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
});
