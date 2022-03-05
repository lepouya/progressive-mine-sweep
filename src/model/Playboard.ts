import { Cell } from "./Cell";

export type Playboard = {
  rows: number;
  cols: number;

  cells: Cell[][];
  numMines: number;
};

export const emptyBoard: Playboard = {
  rows: 0,
  cols: 0,
  cells: [],
  numMines: 0,
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

  return { rows, cols, cells, numMines: 0 };
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
    playboard.rows * playboard.cols - playboard.numMines - 1,
  );

  while (numBombs > 0) {
    const r = Math.floor(Math.random() * playboard.rows);
    const c = Math.floor(Math.random() * playboard.cols);

    if (playboard.cells[r][c].contents === "clear") {
      playboard.cells[r][c].contents = "mine";
      playboard.numMines++;
      numBombs--;
    }
  }

  return playboard;
}

export function populateNeighboringCells(playboard: Playboard): Playboard {
  for (let r = 0; r < playboard.rows; r++) {
    for (let c = 0; c < playboard.cols; c++) {
      if (playboard.cells[r][c].contents === "mine") {
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

export function genHints(
  playboard: Playboard,
  numHints: number,
  minHintLevel: number = 0,
  maxHintLevel: number = 8,
  hintQuality: number = 0,
): number {
  // Input cleanup
  numHints = Math.floor(Math.max(0, numHints));
  minHintLevel = Math.floor(Math.max(0, Math.min(8, minHintLevel)));
  maxHintLevel = Math.floor(Math.max(0, Math.min(8, maxHintLevel)));
  hintQuality = Math.max(0, Math.min(1, hintQuality));
  if (numHints === 0) {
    return 0;
  }

  // Rank all hidden cells
  const rankedHints = playboard.cells
    .flat()
    .filter(
      (cell) =>
        cell.state === "hidden" &&
        cell.contents === "clear" &&
        cell.neighbors >= minHintLevel &&
        cell.neighbors <= maxHintLevel,
    )
    .sort((cell1, cell2) => cell1.neighbors - cell2.neighbors);
  if (rankedHints.length <= numHints) {
    rankedHints.forEach((cell) => (cell.state = "hinted"));
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
    rankedHints.splice(x, 1).map((cell) => (cell.state = "hinted"));
  }

  return numHints;
}

export type PlayboardCellCounts = {
  hidden: number;
  hinted: number;
  flagged: number;
  revealed: number;
  blown: number;
};

export function countCells(playboard: Playboard): PlayboardCellCounts {
  const counts = {
    hidden: 0,
    hinted: 0,
    flagged: 0,
    revealed: 0,
    blown: 0,
  };

  playboard.cells.forEach((cells) =>
    cells.forEach((cell) => counts[cell.state]++),
  );

  return counts;
}
