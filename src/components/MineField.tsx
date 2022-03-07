import React, { useEffect, useState } from "react";

import { actOnCell, CellAction } from "../model/Cell";
import { BoardState, countCells, Playboard } from "../model/Playboard";
import Settings from "../model/Settings";
import MineCell from "./MineCell";
import Scoreboard from "./Scoreboard";
import cellIcons from "../utils/cellIcons";
import clamp from "../utils/clamp";

const MineField: React.FC<{ board: Playboard }> = ({ board }) => {
  const [cellSize, setCellSize] = useState(1);
  const [gameState, setGameState] = useState("inactive" as BoardState);
  const [cellCounts, setCellCounts] = useState(countCells(board));
  const [tapMode, setTapMode] = useState("reveal" as CellAction);

  useEffect(() => {
    calcBoardState();
  }, [board]);

  function calcBoardState() {
    const counts = countCells(board);
    setCellCounts(counts);

    const estSize = Math.floor(95 / Math.max(board.rows, board.cols));
    setCellSize(clamp(estSize, 2, 30));

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
  }

  function toggleTapMode() {
    setTapMode(tapMode === "reveal" ? "flag" : "reveal");
  }

  const tapText = tapMode === "reveal" ? "Revealing" : "Flagging";
  const tapCell = cellIcons[tapMode === "reveal" ? "revealed" : "flagged"];
  const tapColor = tapCell.color;
  let tapIcon = tapCell.icon;
  if (tapIcon instanceof Array) {
    tapIcon = tapIcon[9];
  }

  return (
    <div className="minefield">
      <Scoreboard board={board} cellCounts={cellCounts} gameState={gameState} />
      <table>
        <thead>
          <tr>
            <th colSpan={board.cols} className="cell">
              <button type="button" value={tapMode} onClick={toggleTapMode}>
                {"Tap mode: "}
                {tapIcon ? tapIcon({ color: tapColor, size: "1em" }) : null}
                {" " + tapText}
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {board.cells.flatMap((row, r) => (
            <tr key={"row:" + r + ":*"}>
              {row.map((cell, c) => (
                <MineCell
                  key={"cell:" + r + ":" + c}
                  cell={cell}
                  size={cellSize}
                  enabled={gameState === "active"}
                  tapMode={tapMode}
                  onAction={calcBoardState}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MineField;
