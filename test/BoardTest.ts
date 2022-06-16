import "mocha";

import { expect } from "chai";

import { Board, genBoard } from "../src/model/Board";

function setupBoard(
  rows: number,
  cols: number,
  mines: number = 0,
  maxMines?: number,
): Board {
  let board = genBoard(rows, cols, mines, maxMines);

  expect(board.rows).to.equal(rows);
  expect(board.cols).to.equal(cols);

  if (maxMines === undefined) {
    expect(board.numMines).to.equal(mines);
  }

  return board;
}

function expectCleanCells(board: Board): void {
  for (let r = 0; r < board.rows; r++) {
    for (let c = 0; c < board.cols; c++) {
      const cell = board.cells[r][c];
      expect(cell.row).to.equal(r);
      expect(cell.col).to.equal(c);
      expect(cell.neighbors).to.equal(0);
      expect(cell.contents).to.equal("clear");
      expect(cell.state).to.equal("hidden");
    }
  }
}

describe("Clean boards", () => {
  it("Smallest board set up correctly", () => {
    const board = setupBoard(1, 1);
    expectCleanCells(board);
  });

  it("Larger board set up correctly", () => {
    const board = setupBoard(10, 10);
    expectCleanCells(board);
  });
});

function expectCorrectMineCounts(board: Board): void {
  let countedMines = 0,
    countedClear = 0;
  for (let r = 0; r < board.rows; r++) {
    for (let c = 0; c < board.cols; c++) {
      const cell = board.cells[r][c];
      if (cell.contents === "mine") {
        countedMines++;
      } else {
        countedClear++;
      }
    }
  }

  expect(countedMines).to.equal(board.numMines);
  expect(countedClear).to.equal(board.rows * board.cols - board.numMines);
}

describe("Mine placements", () => {
  it("Small board set up correctly", () => {
    const board = setupBoard(2, 2, 1);
    expectCorrectMineCounts(board);
  });

  it("Large board set up correctly", () => {
    const board = setupBoard(20, 20, 20);
    expectCorrectMineCounts(board);
  });

  it("There aren't too many mines on board", () => {
    const board = setupBoard(3, 3, 10, 20);
    expect(board.numMines).to.equal(3 * 3 - 1);
    expectCorrectMineCounts(board);
  });
});

function expectCorrectNeighboringMineCounts(board: Board): void {
  for (let r = 0; r < board.rows; r++) {
    for (let c = 0; c < board.cols; c++) {
      const cell = board.cells[r][c];

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
            r1 >= 0 && c1 >= 0 && r1 < board.rows && c1 < board.cols,
        )
        .filter(([r2, c2]) => board.cells[r2][c2].contents === "mine").length;

      expect(mines).to.equal(cell.neighbors);
    }
  }
}

describe("Neighboring mine counts", () => {
  it("Small board set up correctly", () => {
    const board = setupBoard(2, 2, 1);
    expectCorrectMineCounts(board);
    expectCorrectNeighboringMineCounts(board);
  });

  it("Large board set up correctly", () => {
    const board = setupBoard(20, 20, 10, 20);
    expectCorrectMineCounts(board);
    expectCorrectNeighboringMineCounts(board);
  });

  it("Saturated board set up correctly", () => {
    const board = setupBoard(3, 3, 10, 20);
    expectCorrectMineCounts(board);
    expectCorrectNeighboringMineCounts(board);
  });
});
