import "mocha";
import { expect } from "chai";

import {
  combineResources,
  genEmptyResource,
  subtractResources,
} from "../Resource";

describe("genEmptyResource", () => {
  it("Empty resource set up correctly", () => {
    const r = genEmptyResource("test");
    expect(r.name).to.equal("test");
    expect(r.count).to.equal(0);
  });
});

describe("combineResources", () => {
  const R1 = genEmptyResource("test1");
  const R2 = genEmptyResource("test2");
  const R3 = genEmptyResource("test3");

  it("Single ResourceCount", () => {
    const rc = combineResources([{ resource: R1, count: 7 }]);

    expect(rc).to.have.length(1);
    expect(rc[0].resource).to.equal(R1);
    expect(rc[0].count).to.equal(7);
  });

  it("Repeated ResourceCount", () => {
    const rc = combineResources([
      { resource: R1, count: 1 },
      { resource: R2, count: 2 },
      { resource: "test1", count: 3 },
      { resource: R1, count: 4 },
    ]);

    expect(rc).to.have.length(2);
    expect(rc[0].resource).to.equal(R1);
    expect(rc[0].count).to.equal(8);
    expect(rc[1].resource).to.equal(R2);
    expect(rc[1].count).to.equal(2);
  });

  it("Multiple ResourceCounts", () => {
    const rc = combineResources(
      [
        { resource: R1, count: 1 },
        { resource: R2, count: 2 },
        { resource: "test1", count: 3 },
        { resource: R1, count: 4 },
      ],
      [{ resource: R3, count: 5 }],
      [
        { resource: "test2", count: 6 },
        { resource: "test1", count: 7 },
      ],
      [
        { resource: "test3", count: 0 },
        { resource: R2, count: 8 },
        { resource: R1, count: 9 },
      ],
    );

    expect(rc).to.have.length(3);
    expect(rc[0].resource).to.equal(R1);
    expect(rc[0].count).to.equal(24);
    expect(rc[1].resource).to.equal(R2);
    expect(rc[1].count).to.equal(16);
    expect(rc[2].resource).to.equal(R3);
    expect(rc[2].count).to.equal(5);
  });
});

describe("subtractResources", () => {
  const R1 = genEmptyResource("test1");
  const R2 = genEmptyResource("test2");
  const R3 = genEmptyResource("test3");

  it("Single ResourceCount", () => {
    const rc = subtractResources([{ resource: R1, count: 7 }], []);

    expect(rc).to.have.length(1);
    expect(rc[0].resource).to.equal(R1);
    expect(rc[0].count).to.equal(7);
  });

  it("Negatives", () => {
    const rc = subtractResources(
      [{ resource: R2, count: 2 }],
      [{ resource: "test2", count: 5 }],
    );

    expect(rc).to.have.length(1);
    expect(rc[0].resource).to.equal(R2);
    expect(rc[0].count).to.equal(-3);
  });

  it("Single Minus ResourceCount", () => {
    const rc = subtractResources([], [{ resource: R3, count: 1 }]);

    expect(rc).to.have.length(1);
    expect(rc[0].resource).to.equal(R3);
    expect(rc[0].count).to.equal(-1);
  });

  it("Cancellations", () => {
    const rc = subtractResources(
      [
        { resource: "test1", count: 3 },
        { resource: R1, count: 2 },
      ],
      [{ resource: "test1", count: 5 }],
    );

    expect(rc).to.have.length(0);
  });

  it("Multiple ResourceCounts", () => {
    const rc = subtractResources(
      [
        { resource: R1, count: 10 },
        { resource: R2, count: 2 },
      ],
      [
        { resource: R1, count: 1 },
        { resource: R3, count: 3 },
      ],
    );

    expect(rc).to.have.length(3);
    expect(rc[0].resource).to.equal(R1);
    expect(rc[0].count).to.equal(9);
    expect(rc[1].resource).to.equal(R2);
    expect(rc[1].count).to.equal(2);
    expect(rc[2].resource).to.equal(R3);
    expect(rc[2].count).to.equal(-3);
  });
});
