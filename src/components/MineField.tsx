import React, { useState } from "react";

import { CellAction } from "../model/Cell";
import { BoardState, Board } from "../model/Board";
import MineCell from "./MineCell";
import cellIcons from "../utils/cellIcons";
import clamp from "../utils/clamp";

const MineField: React.FC<{
  board: Board;
  setBoard: (board: Board) => void;
  gameState: BoardState;
  onInitialClick: (r: number, c: number) => void;
  showToggleTap?: boolean;
}> = ({ board, setBoard, gameState, onInitialClick, showToggleTap }) => {
  const [tapMode, setTapMode] = useState<CellAction>("reveal");

  const estSize = Math.floor(95 / Math.max(board.rows, board.cols));
  const cellSize = clamp(estSize, 2, 30);

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
      <table>
        {(showToggleTap ?? true) && (
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
        )}
        <tbody>
          {board.cells.flatMap((row, r) => (
            <tr key={"row:" + r + ":*"}>
              {row.map((cell, c) => (
                <MineCell
                  key={"cell:" + r + ":" + c}
                  cell={cell}
                  size={cellSize}
                  initialized={board.initialized}
                  enabled={gameState === "active"}
                  tapMode={tapMode}
                  onAction={() => setBoard({ ...board })}
                  onInitialize={cell => onInitialClick(cell.row, cell.col)}
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
