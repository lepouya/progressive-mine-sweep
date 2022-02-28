import "mocha";
import { expect } from "chai";

import { Playboard, genPlayboard } from "../Playboard";

function setupBoard(
  rows: number,
  cols: number,
  bombs: number = 0,
  maxBombs?: number,
): Playboard {
  let playboard = genPlayboard(rows, cols, bombs, maxBombs);

  expect(playboard.rows).to.equal(rows);
  expect(playboard.cols).to.equal(cols);

  if (maxBombs === undefined) {
    expect(playboard.numBombs).to.equal(bombs);
  }

  return playboard;
}

function expectCleanCells(playboard: Playboard): void {
  for (let r = 0; r < playboard.rows; r++) {
    for (let c = 0; c < playboard.cols; c++) {
      const cell = playboard.cells[r][c];
      expect(cell.row).to.equal(r);
      expect(cell.col).to.equal(c);
      expect(cell.neighbors).to.equal(0);
      expect(cell.contents).to.equal("clear");
      expect(cell.state).to.equal("hidden");
    }
  }
}

describe("Clean playboards", () => {
  it("Smallest playboard set up correctly", () => {
    const playboard = setupBoard(1, 1);
    expectCleanCells(playboard);
  });

  it("Larger playboard set up correctly", () => {
    const playboard = setupBoard(10, 10);
    expectCleanCells(playboard);
  });
});

function expectCorrectBombCounts(playboard: Playboard): void {
  let countedBombs = 0,
    countedClear = 0;
  for (let r = 0; r < playboard.rows; r++) {
    for (let c = 0; c < playboard.cols; c++) {
      const cell = playboard.cells[r][c];
      if (cell.contents === "bomb") {
        countedBombs++;
      } else {
        countedClear++;
      }
    }
  }

  expect(countedBombs).to.equal(playboard.numBombs);
  expect(countedClear).to.equal(
    playboard.rows * playboard.cols - playboard.numBombs,
  );
}

describe("Bomb placements", () => {
  it("Small playboard set up correctly", () => {
    const playboard = setupBoard(2, 2, 1);
    expectCorrectBombCounts(playboard);
  });

  it("Large playboard set up correctly", () => {
    const playboard = setupBoard(20, 20, 20);
    expectCorrectBombCounts(playboard);
  });

  it("There aren't too many bombs on board", () => {
    const playboard = setupBoard(3, 3, 10, 20);
    expect(playboard.numBombs).to.equal(3 * 3 - 1);
    expectCorrectBombCounts(playboard);
  });
});

function expectCorrectNeighboringBombCounts(playboard: Playboard): void {
  for (let r = 0; r < playboard.rows; r++) {
    for (let c = 0; c < playboard.cols; c++) {
      const cell = playboard.cells[r][c];

      const bombs = [
        [r - 1, c - 1],
        [r - 1, c],
        [r - 1, c + 1],
        [r, c - 1],
        [r, c + 1],
        [r + 1, c - 1],
        [r + 1, c],
        [r + 1, c + 1],
      ]
        .filter(
          ([r1, c1]) =>
            r1 >= 0 && c1 >= 0 && r1 < playboard.rows && c1 < playboard.cols,
        )
        .filter(
          ([r2, c2]) => playboard.cells[r2][c2].contents === "bomb",
        ).length;

      expect(bombs).to.equal(cell.neighbors);
    }
  }
}

describe("Neighboring bomb counts", () => {
  it("Small playboard set up correctly", () => {
    const playboard = setupBoard(2, 2, 1);
    expectCorrectBombCounts(playboard);
    expectCorrectNeighboringBombCounts(playboard);
  });

  it("Large playboard set up correctly", () => {
    const playboard = setupBoard(20, 20, 10, 20);
    expectCorrectBombCounts(playboard);
    expectCorrectNeighboringBombCounts(playboard);
  });

  it("Saturated playboard set up correctly", () => {
    const playboard = setupBoard(3, 3, 10, 20);
    expectCorrectBombCounts(playboard);
    expectCorrectNeighboringBombCounts(playboard);
  });
});
