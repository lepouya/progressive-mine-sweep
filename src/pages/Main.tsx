import React, { useEffect, useMemo, useState } from "react";

import BoardControls from "../components/BoardControls";
import MineField from "../components/MineField";
import Scoreboard from "../components/Scoreboard";
import { actOnCell } from "../model/Cell";
import { BoardState, countCells, fillBoard, genBoard } from "../model/Board";
import useGameContext from "../utils/GameContext";

type MainProps = {
  rows?: number;
  cols?: number;
  mines?: number;
}

const Main: React.FC<MainProps> = ({rows = 10, cols = 10, mines = 20}) => {
  const { settings, board, setBoard } = useGameContext();
  const [gameState, setGameState] = useState<BoardState>("inactive");
  const [cellCounts, setCellCounts] = useState(() => countCells(board));


  const onInitialClick = (r: number, c: number) => {
    if(board.initialized) {
      throw new Error('lel');
    }

    setBoard(fillBoard(board, r, c));
  }

  useEffect(() => {
    if (board.rows === 0 || board.cols === 0) {
      setBoard(genBoard(rows, cols, mines));
    }
  }, []);

  useEffect(() => {
    const counts = countCells(board);
    setCellCounts(counts);

    if (board.cols * board.rows === 0) {
      setGameState("inactive");
    } else if (counts["blown"] >= settings.maxErrors) {
      setGameState("lost");
      board.cells.forEach((cells) =>
        cells.forEach((cell) => actOnCell(cell, "reveal")),
      );
    } else if (
      counts["blown"] + counts["flagged"] === board.numMines &&
      counts["hidden"] === 0 &&
      counts["revealed"] === board.cols * board.rows - board.numMines
    ) {
      setGameState("won");
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
        <MineField board={board} setBoard={setBoard} gameState={gameState} onInitialClick={onInitialClick} />
        <BoardControls board={board} setBoard={setBoard} />
      </div>
    ),
    [board, gameState, cellCounts],
  );

  return game;
};

export default Main;
