import { shuffle } from "../utils/shuffle";
import { Context } from "./Context";
import { revealNeighbors } from "./GameFormulas";
import { Resource } from "./Resource";

export function automatorShouldTick(res: Resource<any, any>) {
  return function (dt: number, src?: string) {
    return (
      src === "tick" &&
      res.count > 0 &&
      (res.unlocked ?? true) &&
      dt >= 60.0 / res.count
    );
  };
}

export function autoRevealNeighborsTask(context: Context) {
  const res = context.resourceManager.resources.autoRevealNeighbors;
  if (
    res.count <= 0 ||
    !(res.unlocked ?? true) ||
    context.board.state !== "active"
  ) {
    return null;
  }

  const candidates = context.board.cells
    .flat()
    .filter(
      (cell) =>
        cell.state === "revealed" &&
        cell.contents === "clear" &&
        cell.neighborContents.mine === cell.neighborStates.flagged &&
        cell.neighborStates.hidden > 0,
    );
  if (candidates.length === 0) {
    return false;
  }

  const revelaed = revealNeighbors(
    context,
    context.board,
    shuffle(candidates)[0],
    context.resourceManager.resources.revealNeighbors.count,
    true,
    true,
  );

  return revelaed > 0;
}
