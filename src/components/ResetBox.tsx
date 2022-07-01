import { MouseEvent, useEffect, useState } from "react";

import { boardReset, resetTimeFormula } from "../model/GameFormulas";
import message from "../utils/message";
import useGameContext from "./GameContext";
import ProgressCircle from "./ProgressCircle";

export default function ResetBox() {
  const {
    context,
    board,
    resources: { resetSpeed },
  } = useGameContext();
  const [title, setTitle] = useState<string>(board.state);
  const [isResetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState("");
  const [messageTime, setMessageTime] = useState(0);

  useEffect(() => {
    setTitle(message(board.state));
  }, [board, board.state]);

  if (board.rows === 0 || board.cols === 0 || board.state === "inactive") {
    boardReset(context, true);
    return null;
  } else if (board.state === "active") {
    return null;
  }

  const waitTime = resetTimeFormula(context);
  const remainingTime = resetSpeed.extra.remainingTime;

  if (!isResetting && remainingTime > 0) {
    setResetting(true);
    setMessageTime(0);
  } else if (isResetting && remainingTime < 0.001) {
    setResetting(false);
  }

  if (
    isResetting &&
    (!resetMessage || waitTime - remainingTime >= messageTime)
  ) {
    setResetMessage(message("resetting"));
    setMessageTime(messageTime + 2);
  }

  function startReset(event?: MouseEvent) {
    event?.preventDefault();

    if (!isResetting) {
      if (waitTime < 0.001) {
        boardReset(context, false);
      } else if (resetSpeed.extra.remainingTime < 0.001) {
        resetSpeed.extra.remainingTime = waitTime;
        resetSpeed.onChange = (timer, kind, src) =>
          timer < 0.001 &&
          kind === "remainingTime" &&
          src === "tick" &&
          boardReset(context, false);
      }
    }
  }

  return (
    <div className="reset-box">
      <div className={`panel shadow board-state-${board.state}`}>
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
              id="button-reset"
            />
          )}
          {isResetting && <span>{resetMessage}...</span>}
        </ProgressCircle>
      </div>
    </div>
  );
}
