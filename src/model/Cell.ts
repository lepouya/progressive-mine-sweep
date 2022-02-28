export type CellContents = "clear" | "bomb";
export type CellState = "hidden" | "hinted" | "flagged" | "revealed";

export type Cell = {
  row: number;
  col: number;
  contents: CellContents;

  state: CellState;
  neighbors: number;
};
