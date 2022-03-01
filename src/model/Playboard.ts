import { Cell } from "./Cell";

export type Playboard = {
  rows: number;
  cols: number;

  cells: Cell[][];
  numBombs: number;
};

export const emptyBoard: Playboard = {
  rows: 0,
  cols: 0,
  cells: [],
  numBombs: 0,
};

export function makeClearPlayboard(rows: number, cols: number): Playboard {
  const cells: Cell[][] = [];
  for (let row = 0; row < rows; row++) {
    cells[row] = [];
    for (let col = 0; col < cols; col++) {
      cells[row][col] = {
        row,
        col,
        contents: "clear",
        state: "hidden",
        neighbors: 0,
      };
    }
  }

  return { rows, cols, cells, numBombs: 0 };
}

export function populateRandomBombs(
  playboard: Playboard,
  minBombs?: number,
  maxBombs?: number,
): Playboard {
  minBombs = minBombs ?? maxBombs ?? 0;
  maxBombs = maxBombs ?? minBombs ?? 0;
  let numBombs = Math.min(
    Math.floor(minBombs + Math.random() * (1 + maxBombs - minBombs)),
    playboard.rows * playboard.cols - playboard.numBombs - 1,
  );

  while (numBombs > 0) {
    const r = Math.floor(Math.random() * playboard.rows);
    const c = Math.floor(Math.random() * playboard.cols);

    if (playboard.cells[r][c].contents === "clear") {
      playboard.cells[r][c].contents = "bomb";
      playboard.numBombs++;
      numBombs--;
    }
  }

  return playboard;
}

export function populateNeighboringCells(playboard: Playboard): Playboard {
  for (let r = 0; r < playboard.rows; r++) {
    for (let c = 0; c < playboard.cols; c++) {
      if (playboard.cells[r][c].contents === "bomb") {
        for (let dr = r - 1; dr <= r + 1; dr++) {
          for (let dc = c - 1; dc <= c + 1; dc++) {
            if (
              dr >= 0 &&
              dc >= 0 &&
              dr < playboard.rows &&
              dc < playboard.cols &&
              !(dr === r && dc === c)
            ) {
              playboard.cells[dr][dc].neighbors++;
            }
          }
        }
      }
    }
  }

  return playboard;
}

export function genPlayboard(
  rows: number,
  cols: number,
  minBombs?: number,
  maxBombs?: number,
): Playboard {
  let playboard = makeClearPlayboard(rows, cols);
  playboard = populateRandomBombs(playboard, minBombs, maxBombs);
  playboard = populateNeighboringCells(playboard);

  return playboard;
}
