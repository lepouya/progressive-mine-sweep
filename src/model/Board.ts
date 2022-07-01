import clamp from "../utils/clamp";
import { setSaveProperties } from "../utils/store";
import { Expansion } from "../utils/types";
import { actOnCell, Cell, CellState, emptyCell } from "./Cell";

export type BoardState = "inactive" | "active" | "won" | "lost";

export type Board = {
  rows: number;
  cols: number;

  cells: Cell[][];
  numMines: number;

  state: BoardState;
  cellCounts: Expansion<CellState, number>;

  hadUserAction: boolean;
};

export const emptyBoard: Board = {
  rows: 0,
  cols: 0,
  cells: [],
  numMines: 0,
  state: "inactive",
  cellCounts: {
    hidden: 0,
    hinted: 0,
    flagged: 0,
    revealed: 0,
    blown: 0,
  },
  hadUserAction: false,
};

export function makeClearBoard(rows: number, cols: number): Board {
  const cells: Cell[][] = [];
  for (let row = 0; row < rows; row++) {
    cells[row] = [];
    for (let col = 0; col < cols; col++) {
      cells[row][col] = { ...emptyCell, row, col };
    }
  }

  return {
    rows,
    cols,
    cells,
    numMines: 0,
    state: "active",
    cellCounts: { ...emptyBoard.cellCounts, hidden: rows * cols },
    hadUserAction: false,
  };
}

export function populateRandomMines(
  board: Board,
  minMines?: number,
  maxMines?: number,
): Board {
  minMines = minMines ?? maxMines ?? 0;
  maxMines = maxMines ?? minMines ?? 0;
  let numMines = clamp(
    Math.floor(minMines + Math.random() * (1 + maxMines - minMines)),
    0,
    board.rows * board.cols - board.numMines - 1,
  );

  while (numMines > 0) {
    const r = Math.floor(Math.random() * board.rows);
    const c = Math.floor(Math.random() * board.cols);

    if (board.cells[r][c].contents === "clear") {
      board.cells[r][c].contents = "mine";
      board.numMines++;
      numMines--;
    }
  }

  return board;
}

export function genBoardState(board: Board, maxErrors = 1): Board {
  board.cellCounts = { ...emptyBoard.cellCounts };
  board.numMines = 0;
  board.cells.forEach((cells) =>
    cells.forEach((cell) => {
      cell.neighborContents = { ...emptyCell.neighborContents };
      cell.neighborStates = { ...emptyCell.neighborStates };
    }),
  );

  for (let r = 0; r < board.rows; r++) {
    for (let c = 0; c < board.cols; c++) {
      const cell = board.cells[r][c];
      board.numMines += cell.contents === "mine" ? 1 : 0;
      board.cellCounts[cell.state]++;
      cell.row = r;
      cell.col = c;
      cell.locked = !!cell.locked || undefined;
      setSaveProperties(cell, ["contents", "state", "locked"]);

      for (let dr = r - 1; dr <= r + 1; dr++) {
        for (let dc = c - 1; dc <= c + 1; dc++) {
          const neighbor = (board.cells[dr] ?? [])[dc];
          if (neighbor && !(dr === r && dc === c)) {
            cell.neighborContents[neighbor.contents]++;
            cell.neighborStates[neighbor.state]++;
          }
        }
      }
    }
  }

  if (board.state === "lost" || board.cellCounts["blown"] >= maxErrors) {
    board.state = "lost";
    board.cells.forEach((cells) =>
      cells.forEach((cell) => {
        board.cellCounts[cell.state]--;
        actOnCell(cell, "reveal");
        board.cellCounts[cell.state]++;
      }),
    );
  } else if (board.cols * board.rows === 0) {
    board.state = "inactive";
  } else if (
    board.cellCounts["blown"] + board.cellCounts["flagged"] ===
      board.numMines &&
    board.cellCounts["hidden"] === 0 &&
    board.cellCounts["revealed"] === board.cols * board.rows - board.numMines
  ) {
    board.state = "won";
  } else {
    board.state = "active";
  }

  return setSaveProperties(board, ["rows", "cols", "cells", "hadUserAction"]);
}

export function genBoard(
  rows: number,
  cols: number,
  minMines?: number,
  maxMines?: number,
): Board {
  let board = makeClearBoard(rows, cols);
  board = populateRandomMines(board, minMines, maxMines);
  board = genBoardState(board);

  return board;
}

export function genHints(
  board: Board,
  numHints: number,
  minHintLevel: number = 0,
  maxHintLevel: number = 8,
  hintQuality: number = 0,
): number {
  // Input cleanup
  numHints = Math.floor(clamp(numHints, 0, 100));
  minHintLevel = Math.floor(clamp(minHintLevel, 0, 8));
  maxHintLevel = Math.floor(clamp(maxHintLevel, 0, 8));
  hintQuality = clamp(hintQuality, 0, 1);
  if (numHints === 0) {
    return 0;
  }

  // Rank all hidden cells
  const rankedHints = board.cells
    .flat()
    .filter(
      (cell) =>
        cell.state === "hidden" &&
        cell.contents === "clear" &&
        cell.neighborContents.mine >= minHintLevel &&
        cell.neighborContents.mine <= maxHintLevel,
    )
    .sort(
      (cell1, cell2) =>
        cell1.neighborContents.mine - cell2.neighborContents.mine,
    );
  if (rankedHints.length <= numHints) {
    rankedHints.forEach((cell) => {
      actOnCell(cell, "hint");
      board.cellCounts.hinted++;
      board.cellCounts.hidden--;
    });
    return rankedHints.length;
  }

  // Pick out hints to mark
  for (let i = 0; i < numHints; i++) {
    // With probability p = hintQuality and 0 <= p <= 1, we can draw a line
    // from p at x=0 to (1-p) at x=1 (later to scale x * |hints|)
    // f(x) = p + (1-2p) x
    // The area under this line is always 0.5 independent from p
    // So if we have a random number r: 0 <= r <= 1, then r/2 can be where our
    // random sample would lie in the area curve of this function. So
    // r/2 = ∫f(x).dx = px + (1-2p)/2 x² ==>
    // x = (-p ± √(p² + r - 2pr)) / (1-2p)
    // This only works when p ≠ 0.5, otherwise we have linear equation:
    // r/2 = px  ==> x = r / 2p = r
    // which is a very easy formula

    let x = 0;
    const p = hintQuality;
    const r = Math.random();

    if (p === 0.5) {
      x = r;
    } else {
      const q = Math.sqrt(p * p + r - 2 * p * r);
      x = (q - p) / (1 - 2 * p);
    }

    x = Math.floor(x * rankedHints.length);
    rankedHints.splice(x, 1).map((cell) => {
      actOnCell(cell, "hint");
      board.cellCounts.hinted++;
      board.cellCounts.hidden--;
    });
  }

  return numHints;
}
