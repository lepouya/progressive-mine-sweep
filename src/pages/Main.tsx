import React, { useEffect, useMemo, useState } from "react";

import BoardControls from "../components/BoardControls";
import MineField from "../components/MineField";
import Scoreboard from "../components/Scoreboard";
import { actOnCell } from "../model/Cell";
import { BoardState, countCells } from "../model/Board";
import useGameContext from "../utils/GameContext";

const Main: React.FC = () => {
  const { settings, resource, board, setBoard } = useGameContext();
  const [gameState, setGameState] = useState<BoardState>("inactive");
  const [cellCounts, setCellCounts] = useState(() => countCells(board));

  useEffect(() => {
    const counts = countCells(board);
    setCellCounts(counts);

    if (board.cols * board.rows === 0) {
      setGameState("inactive");
    } else if (counts["blown"] >= settings.maxErrors) {
      setGameState("lost");
      resource("losses").count++;
      resource("losses").extra.manual++;

      board.cells.forEach((cells) =>
        cells.forEach((cell) => actOnCell(cell, "reveal")),
      );
    } else if (
      counts["blown"] + counts["flagged"] === board.numMines &&
      counts["hidden"] === 0 &&
      counts["revealed"] === board.cols * board.rows - board.numMines
    ) {
      setGameState("won");
      resource("wins").count++;
      resource("wins").extra.manual++;
    } else {
      setGameState("active");
    }
  }, [board]);

  const game = useMemo(
    () => (
      <div>
        <Scoreboard
          board={board}
          cellCounts={cellCounts}
          gameState={gameState}
        />
        <MineField board={board} setBoard={setBoard} gameState={gameState} />
        <BoardControls board={board} setBoard={setBoard} />
      </div>
    ),
    [board, gameState, cellCounts],
  );

  return game;
};

export default Main;
