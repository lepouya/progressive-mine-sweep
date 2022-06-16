import "mocha";

import { expect } from "chai";

import {
  applyToResource,
  checkHasResources,
  combineResources,
  genEmptyResource,
  subtractResources,
} from "../src/model/Resource";

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

  it("Multiple Kinds", () => {
    const rc = combineResources(
      [
        { resource: R1, count: 1 },
        { resource: R2, count: 2 },
        { resource: "test1", count: 3 },
        { resource: R1, count: 4, kind: "auto" },
      ],
      [{ resource: R3, count: 5 }],
      [
        { resource: "test2", count: 6, kind: "" },
        { resource: "test1", count: 7 },
      ],
      [
        { resource: "test3", count: 0 },
        { resource: R2, count: 8 },
        { resource: R1, count: 9, kind: "auto" },
      ],
    );

    expect(rc).to.have.length(4);
    expect(rc[0].resource).to.equal(R1);
    expect(rc[0].count).to.equal(11);
    expect(rc[0].kind ?? "").to.equal("");
    expect(rc[1].resource).to.equal(R2);
    expect(rc[1].count).to.equal(16);
    expect(rc[1].kind ?? "").to.equal("");
    expect(rc[2].resource).to.equal(R1);
    expect(rc[2].count).to.equal(13);
    expect(rc[2].kind ?? "").to.equal("auto");
    expect(rc[3].resource).to.equal(R3);
    expect(rc[3].count).to.equal(5);
    expect(rc[3].kind ?? "").to.equal("");
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

  it("Kinds", () => {
    const rc = subtractResources(
      [
        { resource: "test1", count: 3 },
        { resource: R1, count: 2, kind: "auto" },
      ],
      [
        { resource: "test1", count: 5, kind: "auto" },
        { resource: R1, count: 5, kind: "what" },
      ],
    );

    expect(rc).to.have.length(3);
    expect(rc[0].resource).to.equal("test1");
    expect(rc[0].count).to.equal(3);
    expect(rc[0].kind ?? "").to.equal("");
    expect(rc[1].resource).to.equal(R1);
    expect(rc[1].count).to.equal(-3);
    expect(rc[1].kind ?? "").to.equal("auto");
    expect(rc[2].resource).to.equal(R1);
    expect(rc[2].count).to.equal(-5);
    expect(rc[2].kind ?? "").to.equal("what");
  });
});

describe("applyToResource", () => {
  it("Single Resource", () => {
    const R1 = genEmptyResource("test1");
    const rc = applyToResource(R1, [{ resource: R1, count: 1 }]);

    expect(R1.count).to.equal(1);
    expect(rc).to.have.length(1);
    expect(rc[0].resource).to.equal(R1);
    expect(rc[0].count).to.equal(1);
  });

  it("Multiple Resources", () => {
    const R1 = genEmptyResource("test1");
    const R2 = genEmptyResource("test2");
    const rc = applyToResource(R1, [
      { resource: R1, count: 1 },
      { resource: "test1", count: 2 },
      { resource: R2, count: 3 },
      { resource: "test2", count: 4 },
      { resource: "something invalid", count: 5 },
    ]);

    expect(R1.count).to.equal(3);
    expect(R2.count).to.equal(0);

    expect(rc).to.have.length(1);
    expect(rc[0].resource).to.equal(R1);
    expect(rc[0].count).to.equal(3);
  });

  it("Multiple changes", () => {
    const R1 = genEmptyResource("test1");
    R1.count = 5;
    R1.extra["bonus"] = 1;
    const rc = applyToResource(R1, [
      { resource: R1, count: 1 },
      { resource: "test1", count: 3 },
      { resource: R1, count: 1, kind: "" },
      { resource: "test1", count: 5, kind: "auto" },
      { resource: R1, count: 3, kind: "bonus" },
      { resource: R1, count: 6, kind: "bonus" },
    ]);

    expect(R1.count).to.equal(10);
    expect(R1.extra["bonus"]).to.equal(10);
    expect(R1.extra["auto"]).to.equal(5);

    expect(rc).to.have.length(3);
    expect(rc[0].resource).to.equal(R1);
    expect(rc[0].count).to.equal(5);
    expect(rc[0].kind ?? "").to.equal("");
    expect(rc[1].resource).to.equal(R1);
    expect(rc[1].count).to.equal(5);
    expect(rc[1].kind ?? "").to.equal("auto");
    expect(rc[2].resource).to.equal(R1);
    expect(rc[2].count).to.equal(9);
    expect(rc[2].kind ?? "").to.equal("bonus");
  });

  it("Locked resources", () => {
    const R1 = genEmptyResource("test1");
    R1.count = 5;
    R1.unlocked = false;

    const rc = applyToResource(R1, [
      { resource: R1, count: 1 },
      { resource: R1, count: 2, kind: "bonus" },
    ]);

    expect(rc).to.have.length(0);
    expect(R1.count).to.equal(5);
    expect(R1.extra["bonus"]).to.be.undefined;
  });
});

describe("checkHasResources", () => {
  it("Simple Resource", () => {
    const R1 = genEmptyResource("test1");
    R1.count = 5;

    expect(checkHasResources(R1, [])).to.be.true;
    expect(checkHasResources(R1, [{ resource: "test1", count: 1 }])).to.be.true;
    expect(checkHasResources(R1, [{ resource: R1, count: 8 }])).to.be.false;
    expect(
      checkHasResources(R1, [
        { resource: "test1", count: 1 },
        { resource: R1, count: 4 },
      ]),
    ).to.be.true;
    expect(
      checkHasResources(R1, [
        { resource: "test1", count: 4 },
        { resource: R1, count: 4 },
      ]),
    ).to.be.false;
    expect(checkHasResources(R1, [{ resource: R1, count: 1, kind: "auto" }])).to
      .be.false;
  });

  it("Locked Resource", () => {
    const R1 = genEmptyResource("test1");
    R1.count = 5;
    R1.unlocked = false;

    expect(checkHasResources(R1, [])).to.be.false;
    expect(checkHasResources(R1, [{ resource: R1, count: 1 }])).to.be.false;
  });

  it("Multiple kinds", () => {
    const R1 = genEmptyResource("test1");
    R1.count = 10;
    R1.extra["bonus"] = 2;
    R1.extra["e1"] = 5;

    expect(checkHasResources(R1, [{ resource: R1, count: 1, kind: "auto" }])).to
      .be.false;
    expect(
      checkHasResources(R1, [{ resource: "test1", count: 1, kind: "bonus" }]),
    ).to.be.true;
    expect(
      checkHasResources(R1, [
        { resource: R1, count: 4, kind: "" },
        { resource: R1, count: 1, kind: "bonus" },
      ]),
    ).to.be.true;
    expect(
      checkHasResources(R1, [
        { resource: R1, count: 2, kind: "bonus" },
        { resource: R1, count: 1, kind: "e1" },
      ]),
    ).to.be.true;
    expect(
      checkHasResources(R1, [
        { resource: R1, count: 2 },
        { resource: R1, count: 5, kind: "bonus" },
        { resource: R1, count: 5, kind: "e1" },
      ]),
    ).to.be.false;
    expect(
      checkHasResources(R1, [
        { resource: R1, count: 2 },
        { resource: R1, count: 5, kind: "e1" },
      ]),
    ).to.be.true;
  });

  it("Multiple Resource", () => {
    const R1 = genEmptyResource("test1");
    const R2 = genEmptyResource("test2");
    R1.count = 5;
    R2.count = 10;
    R2.extra["bonus"] = 2;
    R2.extra["e1"] = 5;

    expect(checkHasResources(R1, [{ resource: "test2", count: 100 }])).to.be
      .true;
    expect(checkHasResources(R2, [{ resource: "test2", count: 100 }])).to.be
      .false;
    expect(checkHasResources(R1, [{ resource: "test1", count: 8 }])).to.be
      .false;
    expect(checkHasResources(R2, [{ resource: "test2", count: 8 }])).to.be.true;
    expect(checkHasResources(R1, [{ resource: R1, count: 3, kind: "e1" }])).to
      .be.false;
    expect(checkHasResources(R2, [{ resource: R2, count: 3, kind: "e1" }])).to
      .be.true;
    expect(
      checkHasResources(R1, [
        { resource: R1, count: 3 },
        { resource: R2, count: 5, kind: "bonus" },
      ]),
    ).to.be.true;
    expect(
      checkHasResources(R2, [
        { resource: R1, count: 3 },
        { resource: R2, count: 5, kind: "bonus" },
      ]),
    ).to.be.false;
  });
});
