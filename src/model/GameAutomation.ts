import { shuffle } from "../utils/shuffle";
import { genHints } from "./Board";
import { actOnCell, Cell } from "./Cell";
import { Context } from "./Context";
import * as F from "./GameFormulas";
import { Resource } from "./Resource";

export function getTickProgress(res: Resource, dt?: number): number {
  if (!res || res.count <= 0 || !(res.unlocked ?? true) || res.disabled) {
    return NaN;
  }

  const context = res.manager.context;
  dt ??=
    (Date.now() - (res.execution.lastTick ?? Date.now())) /
    1000.0 /
    context.settings.timeDilation;
  return (dt * res.count) / context.settings.automationBaseSecs;
}

export function shouldAutoTick(this: Resource, dt: number, src?: string) {
  return src === "tick" && getTickProgress(this, dt) >= 1.0;
}

function canRevealNeighbors(cell: Cell) {
  return (
    cell.state === "revealed" &&
    cell.contents === "clear" &&
    cell.neighborContents.mine === cell.neighborStates.flagged &&
    cell.neighborStates.hidden > 0
  );
}
export function revealNeighborsTask(context: Context) {
  const res = context.resourceManager.resources.autoRevealNeighbors;
  if (
    res.count <= 0 ||
    !(res.unlocked ?? true) ||
    res.disabled ||
    context.board.state !== "active"
  ) {
    return null;
  }

  const candidates = context.board.cells.flat().filter(canRevealNeighbors);
  if (candidates.length === 0) {
    return false;
  }

  const revelaed = F.revealNeighbors(
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
  const resources = context.resourceManager.resources;
  if (
    resources.autoResetGame.count <= 0 ||
    !(resources.autoResetGame.unlocked ?? true) ||
    resources.autoResetGame.disabled ||
    context.board.state === "active" ||
    context.board.state === "inactive" ||
    resources.resetSpeed.extra.remainingTime > 0
  ) {
    return null;
  }

  const waitTime = F.resetTimeFormula(context);
  if (waitTime < 0.001) {
    F.boardReset(context, true);
    return true;
  } else {
    resources.resetSpeed.extra.remainingTime = waitTime;
    resources.resetSpeed.onChange = (timer, kind, src) =>
      timer < 0.001 &&
      kind === "remainingTime" &&
      src === "tick" &&
      F.boardReset(context, true);
  }

  return false;
}

function canFlagMines(cell: Cell) {
  return (
    cell.state === "revealed" &&
    cell.contents === "clear" &&
    cell.neighborContents.mine ===
      cell.neighborStates.flagged + cell.neighborStates.hidden &&
    cell.neighborContents.clear === cell.neighborStates.revealed &&
    cell.neighborStates.hidden > 0
  );
}
export function flagMinesTask(context: Context) {
  const res = context.resourceManager.resources.autoFlagMines;
  if (
    res.count <= 0 ||
    !(res.unlocked ?? true) ||
    res.disabled ||
    context.board.state !== "active"
  ) {
    return null;
  }

  const candidates = context.board.cells.flat().filter(canFlagMines);
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
  F.stateChanged(context, "cell", neighbor.state, true);

  return true;
}

function canRevealHints(cell: Cell) {
  return cell.state === "hinted" && cell.contents === "clear";
}
export function revealHintsTask(context: Context) {
  const res = context.resourceManager.resources.autoRevealHints;
  if (
    res.count <= 0 ||
    !(res.unlocked ?? true) ||
    res.disabled ||
    context.board.state !== "active"
  ) {
    return null;
  }

  const candidates = context.board.cells.flat().filter(canRevealHints);
  if (candidates.length === 0) {
    return false;
  }

  const cell = shuffle(candidates)[0];
  actOnCell(cell, "reveal");
  F.stateChanged(context, "cell", cell.state, true);

  return true;
}

export function purchaseHintsTask(context: Context) {
  const res = context.resourceManager.resources.autoPurchaseHints;
  if (
    res.count <= 0 ||
    !(res.unlocked ?? true) ||
    res.disabled ||
    context.board.state !== "active" ||
    F.remainingHintsFormula(context) === 0
  ) {
    return null;
  }

  const hints = context.resourceManager.resources.hints;
  const candidates = context.board.cells
    .flat()
    .filter(
      (cell) =>
        canRevealHints(cell) || canRevealNeighbors(cell) || canFlagMines(cell),
    );
  if (candidates.length > 0) {
    return false;
  }

  const purchase = hints.buy();
  if (purchase.count === 0) {
    return false;
  }

  const numHints = genHints(
    context.board,
    purchase.count,
    0,
    8,
    F.hintFormula(context),
  );
  if (numHints > 0) {
    F.countActions(hints, true, numHints);
    return true;
  }

  return false;
}

export function expandBoardDims(context: Context) {
  const ress = context.resourceManager.resources;
  if (
    ress.autoBoardUpgrade.count <= 0 ||
    !(ress.autoBoardUpgrade.unlocked ?? true) ||
    ress.autoBoardUpgrade.disabled
  ) {
    return null;
  }

  const res = ress.rows.count < ress.cols.count ? ress.rows : ress.cols;
  const purchase = res.buy();
  if (purchase.count === 0) {
    return false;
  }

  F.countActions(res, true);
  return true;
}
