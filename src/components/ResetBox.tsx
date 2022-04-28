import React, { useEffect, useState } from "react";

import useGameContext from "./GameContext";
import message from "../utils/message";
import ProgressCircle from "./ProgressCircle";
import { genBoard } from "../model/Board";

const ResetBox: React.FC = () => {
  const { board, setBoard, resource } = useGameContext();
  const [title, setTitle] = useState<string>(board.state);
  const [resetting, setResetting] = useState({
    active: false,
    message: "",
    switchTime: 0,
  });

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
    (1 - resetSpeed.value()) *
    Math.sqrt(
      resource("rows").value() *
        resource("cols").value() *
        resource("difficulty").value() *
        10,
    );
  const remainingTime = resetSpeed.extra.remainingTime;

  if (
    resetting.active &&
    (!resetting.message || waitTime - remainingTime >= resetting.switchTime)
  ) {
    setResetting({
      active: resetting.active,
      message: message("resetting"),
      switchTime: resetting.switchTime + 2,
    });
  }

  if (resetting.active && remainingTime === 0) {
    setResetting({
      active: false,
      message: "",
      switchTime: 0,
    });
    resetBoard();
  }

  function startReset() {
    if (!resetting.active) {
      setResetting({
        active: true,
        message: "",
        switchTime: 0,
      });
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
    const m = r * c * resource("difficulty").value();
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
          value={resetting.active ? (waitTime - remainingTime) / waitTime : 0}
          showPercent={resetting.active}
          width="100%"
          height="50%"
        >
          {!resetting.active && (
            <input
              type="button"
              value="Reset!"
              disabled={resetting.active}
              onClick={startReset}
            />
          )}
          {resetting.active && <span>{resetting.message}</span>}
        </ProgressCircle>
      </div>
    </div>
  );
};

export default ResetBox;
