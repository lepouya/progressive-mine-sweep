import { Board } from "../model/Board";
import { Resource } from "../model/Resource";

export function boardProgressFormula(board: Board): number {
  return (
    (100 * (board.cellCounts.revealed + board.cellCounts.flagged)) /
    (board.rows * board.cols)
  );
}

export function numMinesFormula(
  rows: Resource,
  cols: Resource,
  difficulty: Resource,
): number {
  return rows.value() * cols.value() * (difficulty.value() / 100);
}

export function hintFormula(hintQuality: Resource): number {
  return hintQuality.value() / 100;
}

export function resetTimeFormula(
  rows: Resource,
  cols: Resource,
  difficulty: Resource,
  resetSpeed: Resource,
): number {
  return (
    (1 - resetSpeed.value() / 100) *
    Math.sqrt(rows.value() * cols.value() * (difficulty.value() / 100) * 10)
  );
}
