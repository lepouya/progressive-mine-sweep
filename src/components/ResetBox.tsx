import { useEffect, useState } from "react";

import useGameContext from "./GameContext";
import message from "../utils/message";
import ProgressCircle from "./ProgressCircle";
import { genBoard } from "../model/Board";
import {
  numMinesFormula,
  resetTimeFormula,
  stateChanged,
} from "../model/GameFormulas";

export default function ResetBox() {
  const {
    context,
    board,
    setBoard,
    settings,
    resources: { rows, cols, resetSpeed },
  } = useGameContext();
  const [title, setTitle] = useState<string>(board.state);
  const [isResetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState("");
  const [messageTime, setMessageTime] = useState(0);

  useEffect(() => {
    setTitle(message(board.state));
  }, [board, board.state]);

  if (board.rows === 0 || board.cols === 0 || board.state === "inactive") {
    resetBoard(true);
    return null;
  } else if (board.state === "active") {
    return null;
  }

  const waitTime = resetTimeFormula(context);
  const remainingTime = resetSpeed.extra.remainingTime;

  if (
    isResetting &&
    (!resetMessage || waitTime - remainingTime >= messageTime)
  ) {
    setResetMessage(message("resetting"));
    setMessageTime(messageTime + 2);
  }

  if (isResetting && remainingTime === 0) {
    setResetting(false);
    resetBoard();
  }

  function startReset() {
    if (!isResetting) {
      setResetting(true);
      setMessageTime(0);
      resetSpeed.extra.remainingTime = waitTime;
    }
  }

  function resetBoard(auto = false) {
    stateChanged(context, "board", "active", auto);

    const m = numMinesFormula(context);
    setBoard(genBoard(rows.value(), cols.value(), Math.floor(m), Math.ceil(m)));
    settings.tapMode = "reveal";
  }

  return (
    <div className="reset-box">
      <div className={`panel board-state-${board.state}`}>
        <div className="title-bar">{title}</div>
        <div className="full center">Game over!</div>
        <div className="full center">
          You may reset the board to receive a brand new game to play:
        </div>
        <ProgressCircle
          value={isResetting ? (waitTime - remainingTime) / waitTime : 0}
          showPercent={isResetting}
          width="100%"
          height="50%"
        >
          {!isResetting && (
            <input
              type="button"
              value="Reset!"
              disabled={isResetting}
              onClick={startReset}
            />
          )}
          {isResetting && <span>{resetMessage}...</span>}
        </ProgressCircle>
      </div>
    </div>
  );
}
