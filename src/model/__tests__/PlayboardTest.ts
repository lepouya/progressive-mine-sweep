import "mocha";
import { expect } from "chai";

import { Playboard, genPlayboard } from "../Playboard";

function setupBoard(
  rows: number,
  cols: number,
  mines: number = 0,
  maxMines?: number,
): Playboard {
  let playboard = genPlayboard(rows, cols, mines, maxMines);

  expect(playboard.rows).to.equal(rows);
  expect(playboard.cols).to.equal(cols);

  if (maxMines === undefined) {
    expect(playboard.numMines).to.equal(mines);
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

function expectCorrectMineCounts(playboard: Playboard): void {
  let countedMines = 0,
    countedClear = 0;
  for (let r = 0; r < playboard.rows; r++) {
    for (let c = 0; c < playboard.cols; c++) {
      const cell = playboard.cells[r][c];
      if (cell.contents === "mine") {
        countedMines++;
      } else {
        countedClear++;
      }
    }
  }

  expect(countedMines).to.equal(playboard.numMines);
  expect(countedClear).to.equal(
    playboard.rows * playboard.cols - playboard.numMines,
  );
}

describe("Mine placements", () => {
  it("Small playboard set up correctly", () => {
    const playboard = setupBoard(2, 2, 1);
    expectCorrectMineCounts(playboard);
  });

  it("Large playboard set up correctly", () => {
    const playboard = setupBoard(20, 20, 20);
    expectCorrectMineCounts(playboard);
  });

  it("There aren't too many mines on board", () => {
    const playboard = setupBoard(3, 3, 10, 20);
    expect(playboard.numMines).to.equal(3 * 3 - 1);
    expectCorrectMineCounts(playboard);
  });
});

function expectCorrectNeighboringMineCounts(playboard: Playboard): void {
  for (let r = 0; r < playboard.rows; r++) {
    for (let c = 0; c < playboard.cols; c++) {
      const cell = playboard.cells[r][c];

      const mines = [
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
          ([r2, c2]) => playboard.cells[r2][c2].contents === "mine",
        ).length;

      expect(mines).to.equal(cell.neighbors);
    }
  }
}

describe("Neighboring mine counts", () => {
  it("Small playboard set up correctly", () => {
    const playboard = setupBoard(2, 2, 1);
    expectCorrectMineCounts(playboard);
    expectCorrectNeighboringMineCounts(playboard);
  });

  it("Large playboard set up correctly", () => {
    const playboard = setupBoard(20, 20, 10, 20);
    expectCorrectMineCounts(playboard);
    expectCorrectNeighboringMineCounts(playboard);
  });

  it("Saturated playboard set up correctly", () => {
    const playboard = setupBoard(3, 3, 10, 20);
    expectCorrectMineCounts(playboard);
    expectCorrectNeighboringMineCounts(playboard);
  });
});
