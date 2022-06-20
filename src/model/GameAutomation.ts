import { shuffle } from "../utils/shuffle";
import { actOnCell } from "./Cell";
import { Context } from "./Context";
import {
  resetTimeFormula,
  revealNeighbors,
  stateChanged,
} from "./GameFormulas";
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
  const resetSpeed = context.resourceManager.resources.resetSpeed;
  if (
    res.count <= 0 ||
    !(res.unlocked ?? true) ||
    context.board.state === "active" ||
    context.board.state === "inactive" ||
    resetSpeed.extra.remainingTime > 0
  ) {
    return null;
  }

  resetSpeed.extra.remainingTime = resetTimeFormula(context);
  return false;
}

export function flagMinesTask(context: Context) {
  const res = context.resourceManager.resources.autoFlagMines;
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
        cell.neighborContents.mine ===
          cell.neighborStates.flagged + cell.neighborStates.hidden &&
        cell.neighborContents.clear === cell.neighborStates.revealed &&
        cell.neighborStates.hidden > 0,
    );
  if (candidates.length === 0) {
    return false;
  }

  const cell = shuffle(candidates)[0];
  const choices = [];
  for (let dr = cell.row - 1; dr <= cell.row + 1; dr++) {
    for (let dc = cell.col - 1; dc <= cell.col + 1; dc++) {
      if ((context.board.cells[dr] ?? [])[dc]?.state === "hidden") {
        choices.push(context.board.cells[dr][dc]);
      }
    }
  }
  if (choices.length === 0) {
    return false;
  }

  const neighbor = shuffle(choices)[0];
  actOnCell(neighbor, "flag");
  stateChanged(context, "cell", neighbor.state, true);

  return true;
}
