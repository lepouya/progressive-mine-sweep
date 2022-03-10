import React, { useEffect, useMemo, useState } from "react";
import BoardControls from "../components/BoardControls";
import MineField from "../components/MineField";
import Scoreboard from "../components/Scoreboard";
import { actOnCell } from "../model/Cell";
import { BoardState, countCells, genBoard } from "../model/Board";
import Settings from "../model/Settings";

const Main: React.FC = () => {
  const [board, setBoard] = useState(Settings.mainBoard);
  const [gameState, setGameState] = useState("inactive" as BoardState);
  const [cellCounts, setCellCounts] = useState(() => countCells(board));

  useEffect(() => {
    if (board.rows === 0 || board.cols === 0) {
      setBoard(genBoard(10, 10, 10));
    }
  }, []);

  useEffect(() => {
    Settings.mainBoard = board;

    const counts = countCells(board);
    setCellCounts(counts);

    if (board.cols * board.rows === 0) {
      setGameState("inactive");
    } else if (counts["blown"] >= Settings.maxErrors) {
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
        <MineField board={board} setBoard={setBoard} gameState={gameState} />
        <BoardControls board={board} setBoard={setBoard} />
      </div>
    ),
    [board, gameState, cellCounts],
  );

  return game;
};

export default Main;
