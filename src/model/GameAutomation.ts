import { shuffle } from "../utils/shuffle";
import tickTimer from "../utils/tickTimer";
import { genBoard, genHints } from "./Board";
import { actOnCell, Cell } from "./Cell";
import { Context } from "./Context";
import * as F from "./GameFormulas";
import { Resource } from "./Resource";

export function shouldTick(res: Resource<any, any>) {
  return function (dt: number, src?: string) {
    return (
      src === "tick" &&
      res.count > 0 &&
      (res.unlocked ?? true) &&
      !res.disabled &&
      dt >= 60.0 / res.count
    );
  };
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

  tickTimer(
    resources.resetSpeed,
    {
      kind: "remainingTime",
      value: F.resetTimeFormula(context),
    },
    function (_, timer) {
      if (timer === 0) {
        const m = F.numMinesFormula(context);
        context.settings.tapMode = "reveal";
        context.board = genBoard(
          resources.rows.value(),
          resources.cols.value(),
          Math.floor(m),
          Math.ceil(m),
        );
        F.stateChanged(context, "board", "active", true);
      }
    },
  );

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

  const candidates = context.board.cells
    .flat()
    .filter(
      (cell) =>
        canRevealHints(cell) || canRevealNeighbors(cell) || canFlagMines(cell),
    );
  if (candidates.length > 0) {
    return false;
  }

  const purchase = context.resourceManager.resources.hints.buy();
  if (purchase.count === 0) {
    return false;
  }

  const numHints = genHints(
    context.board,
    context.resourceManager.resources.hintsCount.value(),
    0,
    8,
    F.hintFormula(context) * purchase.count,
  );
  F.stateChanged(context, "cell", "hinted", true, numHints);
  context.resourceManager.resources.hints.count -= purchase.count;

  return true;
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

  F.countActions(context, res.name, true);
  return true;
}