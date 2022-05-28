import { Context } from "./Context";

export function boardProgressFormula({ board }: Context): number {
  return (
    (100 * (board.cellCounts.revealed + board.cellCounts.flagged)) /
    (board.rows * board.cols)
  );
}

export function numMinesFormula({
  resourceManager: {
    resources: { rows, cols, difficulty },
  },
}: Context): number {
  return rows.value() * cols.value() * (difficulty.value() / 100);
}

export function hintFormula({
  resourceManager: {
    resources: { hintQuality },
  },
}: Context): number {
  return hintQuality.value() / 100;
}

export function remainingHintsFormula({ board }: Context): number {
  return board.rows * board.cols - board.numMines - board.cellCounts.revealed;
}

export function resetTimeFormula({
  resourceManager: {
    resources: { rows, cols, difficulty, resetSpeed },
  },
}: Context): number {
  return (
    (1 - resetSpeed.value() / 100) *
    Math.sqrt(rows.value() * cols.value() * (difficulty.value() / 100) * 10)
  );
}

export function scoreMultiplier({
  resourceManager: {
    resources: { difficulty },
  },
}: Context): number {
  return (difficulty.value() + 10) / 25;
}

export function stateChanged(
  context: Context,
  target: "board" | "cell",
  state: string,
  automatic: boolean,
) {
  const factor = 1;
  const multiplier = scoreMultiplier(context);
  const resName = _targetStates[target + ":" + state];
  let res = context.resourceManager.resources[resName ?? ""];

  if (resName && res) {
    res.count += factor * multiplier;
    if (automatic) {
      res.extra.auto += factor;
    } else {
      res.extra.manual += factor;
    }
  } else {
    switch (target + ":" + state) {
      case "cell:unflagged":
        res = context.resourceManager.resources.flags;
        res.count -= factor * multiplier;
        res.extra.unflags += factor;
        break;
      case "cell:unrevealed":
        res = context.resourceManager.resources.cells;
        res.count -= factor * multiplier;
        res.extra.hidden += factor;
        break;
    }
  }
}

const _targetStates: Record<string, string> = {
  "board:active": "resets",
  "board:lost": "losses",
  "board:won": "wins",
  "cell:blown": "explosions",
  "cell:hinted": "hints",
  "cell:flagged": "flags",
  "cell:revealed": "cells",
};
