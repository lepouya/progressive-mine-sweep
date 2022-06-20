import { MouseEvent, useEffect, useState } from "react";

import { genBoard, genHints } from "../model/Board";
import {
  numMinesFormula,
  resetTimeFormula,
  stateChanged,
} from "../model/GameFormulas";
import message from "../utils/message";
import tickTimer from "../utils/tickTimer";
import useGameContext from "./GameContext";
import ProgressCircle from "./ProgressCircle";

export default function ResetBox() {
  const {
    context,
    board,
    setBoard,
    settings,
    resources: { rows, cols, resets, resetSpeed },
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
  if (!isResetting && remainingTime > 0) {
    startReset(undefined, true);
  }

  if (
    isResetting &&
    (!resetMessage || waitTime - remainingTime >= messageTime)
  ) {
    setResetMessage(message("resetting"));
    setMessageTime(messageTime + 2);
  }

  function startReset(event?: MouseEvent, auto = false) {
    event?.preventDefault();

    if (!isResetting) {
      setResetting(true);
      setMessageTime(0);
      tickTimer(
        resetSpeed,
        { kind: "remainingTime", value: waitTime },
        (_, timer) => timer === 0 && resetBoard(auto),
      );
    }
  }

  function resetBoard(auto = false) {
    const firstGame =
      auto &&
      context.board.state === "inactive" &&
      resets.count === 0 &&
      resets.extra.manual === 0 &&
      resets.extra.auto === 0;

    const m = firstGame ? 1 : numMinesFormula(context);

    setResetting(false);
    setBoard(genBoard(rows.value(), cols.value(), Math.floor(m), Math.ceil(m)));
    stateChanged(context, "board", "active", auto);
    settings.tapMode = "reveal";

    if (firstGame) {
      // Free hint on first game!
      if (genHints(context.board, 1, 0, 0, 1) === 0) {
        genHints(context.board, 1, 0, 1, 1);
      }
      stateChanged(context, "cell", "hinted", auto);
    }

    return true;
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
