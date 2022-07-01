import { shuffle } from "../utils/shuffle";
import { Board, genBoard, genBoardState, genHints } from "./Board";
import { actOnCell, Cell } from "./Cell";
import { Context } from "./Context";
import { Resource } from "./Resource";

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

export function getBuyAmount(buyAmount?: string) {
  return _buyAmounts[buyAmount ?? ""] ?? _buyAmounts[""];
}

export function scoreMultiplier({
  resourceManager: {
    resources: { difficulty },
  },
}: Context): number {
  return (difficulty.value() + 10) / 25;
}

export function revealNeighbors(
  context: Context,
  board: Board,
  cell: Cell,
  count: number,
  shouldCountStats: boolean,
  automatic: boolean,
): number {
  const res = context.resourceManager.resources.revealNeighbors;

  const choices = [];
  for (let dr = cell.row - 1; dr <= cell.row + 1; dr++) {
    for (let dc = cell.col - 1; dc <= cell.col + 1; dc++) {
      if ((board.cells[dr] ?? [])[dc]?.state === "hidden") {
        choices.push(board.cells[dr][dc]);
      }
    }
  }

  shuffle(choices).splice(count);
  for (const cell of choices) {
    actOnCell(cell, "reveal");
    if (shouldCountStats) {
      stateChanged(context, "cell", cell.state, true);

      if (cell.state === "revealed" && cell.contents === "clear") {
        res.extra.reveals++;
      } else if (cell.state === "blown" || cell.contents === "mine") {
        res.extra.explosions++;
      } else {
        res.extra.useless++;
      }
    }
  }

  if (shouldCountStats) {
    countActions(res, automatic);
    if (choices.length === 0) {
      res.extra.useless++;
    }
  }

  return choices.length;
}

export function countActions(
  resource: Resource,
  automatic: boolean,
  count = 1,
) {
  if (automatic) {
    const auto = resource.manager.resources.automation;
    auto.add(count, "", scoreMultiplier(resource.manager.context));
    auto.extra.total += count;

    if (resource.extra.auto != null) {
      resource.extra.auto += count;
    }
  } else if (resource.extra.manual != null) {
    resource.extra.manual += count;
  }

  if (resource.extra.total != null) {
    resource.extra.total += count;
  }

  if (resource.extra.streak != null) {
    resource.extra.streak += count;

    if (
      resource.extra.longestStreak != null &&
      resource.extra.streak > resource.extra.longestStreak
    ) {
      resource.extra.longestStreak = resource.extra.streak;
    }
  }
}

export function stateChanged(
  context: Context,
  target: "board" | "cell",
  state: string,
  automatic: boolean,
  count = 1,
) {
  const resources = context.resourceManager.resources;
  const multiplier = scoreMultiplier(context);

  const res = resources[_targetStates[target + ":" + state] ?? ""];
  if (res) {
    res.add(count, "", multiplier);
    countActions(res, automatic, count);
  }

  switch (target + ":" + state) {
    case "cell:unflagged":
      resources.flags.add(-count, "", multiplier);
      resources.flags.extra.unflags += count;
      break;
    case "cell:unrevealed":
      resources.cells.add(-count, "", multiplier);
      resources.cells.extra.hidden += count;
      break;
    case "board:won":
      resources.losses.extra.streak = 0;
      break;
    case "board:lost":
      resources.wins.extra.streak = 0;
      break;
  }
}

export function boardReset(context: Context, automatic = false) {
  const resources = context.resourceManager.resources;
  const firstGame =
    automatic &&
    context.board.state === "inactive" &&
    resources.resets.count === 0 &&
    resources.resets.extra.total === 0;

  // First game always has 1 mine
  const m = firstGame ? 1 : numMinesFormula(context);

  context.settings.tapMode = "reveal";
  context.board = genBoard(
    resources.rows.value(),
    resources.cols.value(),
    Math.floor(m),
    Math.ceil(m),
  );

  if (firstGame) {
    // Free hint on first game!
    if (genHints(context.board, 1, 0, 0, 1) === 0) {
      genHints(context.board, 1, 0, 1, 1);
    }
    stateChanged(context, "board", "active", true);
    stateChanged(context, "cell", "hinted", true);
  }

  // Auto click on start
  if (
    resources.autoClickBoard.count > 0 &&
    (resources.autoClickBoard.unlocked ?? true) &&
    !resources.autoClickBoard.disabled
  ) {
    for (let i = resources.autoClickBoard.value(); i > 0; i--) {
      const r = Math.floor(Math.random() * resources.rows.value());
      const c = Math.floor(Math.random() * resources.cols.value());
      const cell = context.board.cells[r][c];
      if (cell.state === "hidden" && context.board.state === "active") {
        actOnCell(cell, "reveal");
        stateChanged(context, "cell", cell.state, true);
        context.board = genBoardState(
          context.board,
          context.settings.maxErrors,
        );
      }
    }
  }

  return true;
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

const _buyAmounts: Record<string, { min: number; max: number; inc: number }> = {
  "": { min: 1, max: 1, inc: 1 },
  x1: { min: 1, max: 1, inc: 1 },
  x5: { min: 1, max: 5, inc: 5 },
  x10: { min: 1, max: 10, inc: 10 },
  "+5": { min: 5, max: 5, inc: 1 },
  "+10": { min: 10, max: 10, inc: 1 },
  max: { min: 1, max: 100, inc: 1 },
};
