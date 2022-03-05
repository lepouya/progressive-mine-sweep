export type CellContents = "clear" | "mine";
export type CellState = "hidden" | "hinted" | "flagged" | "revealed" | "blown";

export type Cell = {
  row: number;
  col: number;
  contents: CellContents;

  state: CellState;
  neighbors: number;
};

export type CellAction = "reveal" | "flag" | "hint" | "hide";

export function actOnCell(cell: Cell, action: CellAction): Cell {
  switch (action) {
    case "flag":
      if (cell.state === "hidden" || cell.state === "hinted") {
        cell.state = "flagged";
      } else if (cell.state === "flagged") {
        cell.state = "hidden";
      }
      break;

    case "reveal":
      if (cell.state === "hidden" || cell.state === "hinted") {
        if (cell.contents === "clear") {
          cell.state = "revealed";
        } else if (cell.contents === "mine") {
          cell.state = "blown";
        }
      }
      break;

    case "hint":
      if (cell.state === "hidden") {
        cell.state = "hinted";
      }
      break;

    case "hide":
      if (cell.state === "flagged" || cell.state === "revealed") {
        cell.state = "hidden";
      }
      break;
  }

  return cell;
}
