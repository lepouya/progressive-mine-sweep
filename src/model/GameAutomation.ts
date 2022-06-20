import { shuffle } from "../utils/shuffle";
import { Context } from "./Context";
import { resetTimeFormula, revealNeighbors } from "./GameFormulas";
import { Resource } from "./Resource";

export function shouldTick(res: Resource<any, any>) {
  return function (dt: number, src?: string) {
    return (
      src === "tick" &&
      res.count > 0 &&
      (res.unlocked ?? true) &&
      dt >= 60.0 / res.count
    );
  };
}

export function revealNeighborsTask(context: Context) {
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

export function resetGameTask(context: Context) {
  const res = context.resourceManager.resources.autoResetGame;
  if (
    res.count <= 0 ||
    !(res.unlocked ?? true) ||
    context.board.state === "active" ||
    context.board.state === "inactive"
  ) {
    return null;
  }

  context.resourceManager.resources.resetSpeed.extra.remainingTime =
    resetTimeFormula(context);
  return false;
}
