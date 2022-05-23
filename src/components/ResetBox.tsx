import React, { useEffect, useState } from "react";

import useGameContext from "./GameContext";
import message from "../utils/message";
import ProgressCircle from "./ProgressCircle";
import { genBoard } from "../model/Board";

const ResetBox: React.FC = () => {
  const { board, setBoard, resource } = useGameContext();
  const [title, setTitle] = useState<string>(board.state);
  const [isResetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState("");
  const [messageTime, setMessageTime] = useState(0);

  useEffect(() => {
    setTitle(message(board.state));
  }, [board, board.state]);

  if (board.state === "active") {
    return null;
  } else if (board.state === "inactive") {
    resetBoard();
    return null;
  }

  const resetSpeed = resource("resetSpeed");
  const waitTime =
    (1 - resetSpeed.value() / 100) *
    Math.sqrt(
      resource("rows").value() *
        resource("cols").value() *
        (resource("difficulty").value() / 100) *
        10,
    );
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

  function resetBoard() {
    resource("resets").count++;
    if (board.rows === 0 || board.cols === 0) {
      resource("resets").extra.auto++;
    } else {
      resource("resets").extra.manual++;
    }

    const r = resource("rows").value();
    const c = resource("cols").value();
    const m = r * c * (resource("difficulty").value() / 100);
    setBoard(genBoard(r, c, Math.floor(m), Math.ceil(m)));
  }

  return (
    <div className={`reset-box board-state-${board.state}`}>
      <div className="panel">
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
          {isResetting && <span>{resetMessage}</span>}
        </ProgressCircle>
      </div>
    </div>
  );
};

export default ResetBox;
