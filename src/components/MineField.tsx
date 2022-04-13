import React, { useCallback, useState } from "react";

import { CellAction } from "../model/Cell";
import { Board, genBoardState } from "../model/Board";
import MineCell from "./MineCell";
import { CellIcon } from "../utils/Icon";
import clamp from "../utils/clamp";
import useGameContext from "../utils/GameContext";

const MineField: React.FC<{
  board: Board;
  setBoard: (board: Board) => void;
  showToggleTap?: boolean;
}> = ({ board, setBoard, showToggleTap }) => {
  const { settings, resource } = useGameContext();
  const [tapMode, setTapMode] = useState<CellAction>("reveal");

  const onAction = useCallback(() => {
    if (board.state !== "active") {
      return;
    }

    board = genBoardState({ ...board });
    setBoard(board);
    if (board.cellCounts["blown"] >= settings.maxErrors) {
      board.state = "lost";
      setBoard(genBoardState(board));
      resource("losses").count++;
      resource("losses").extra.manual++;
    } else if (board.state === "won") {
      resource("wins").count++;
      resource("wins").extra.manual++;
    }
  }, [board]);

  const estSize = Math.floor(95 / Math.max(board.rows, board.cols));
  const cellSize = clamp(estSize, 2, 30);

  function toggleTapMode() {
    setTapMode(tapMode === "reveal" ? "flag" : "reveal");
  }

  return (
    <div className="minefield">
      <table>
        {(showToggleTap ?? true) && (
          <thead>
            <tr>
              <th colSpan={board.cols} className="cell">
                <button type="button" value={tapMode} onClick={toggleTapMode}>
                  Tap mode:
                  <CellIcon
                    state={tapMode === "reveal" ? "revealed" : "flagged"}
                    neighbors={9}
                    size="1em"
                  />
                  {tapMode === "reveal" ? "Revealing" : "Flagging"}
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
                  enabled={board.state === "active"}
                  tapMode={tapMode}
                  onAction={onAction}
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
