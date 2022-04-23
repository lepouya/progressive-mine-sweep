import React, { ChangeEvent, useEffect, useState } from "react";
import { genHints, genBoard, Board } from "../model/Board";
import clamp from "../utils/clamp";
import useGameContext from "./GameContext";

const BoardControls: React.FC<{
  board: Board;
  setBoard: (board: Board) => void;
}> = ({ board, setBoard }) => {
  const { resource } = useGameContext();
  const [rows, setRows] = useState(0);
  const [cols, setCols] = useState(0);
  const [difficulty, setDifficulty] = useState(0);

  useEffect(() => {
    if (board.rows > 0 && board.cols > 0) {
      setRows(resource("rows").value());
      setCols(resource("cols").value());
      setDifficulty(Math.floor(100 * resource("difficulty").value()));
    } else {
      resetBoard();
    }
  }, [board]);

  function changeInput(event: ChangeEvent<HTMLInputElement>) {
    const target = event.target;

    if (target.validity.valid) {
      let num = parseInt(target.value);
      if (isNaN(num)) {
        num = 0;
      }

      if (target.name === "rows") {
        setRows(num);
        resource(target.name).count = clamp(num, 3, 40);
      } else if (target.name === "cols") {
        setCols(num);
        resource(target.name).count = clamp(num, 3, 40);
      } else if (target.name === "difficulty") {
        setDifficulty(num);
        resource(target.name).count = clamp(num / 100);
      }
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

  function getHint() {
    if (genHints(board, 1, 0, 8, resource("hintQuality").value()) > 0) {
      resource("hints").count++;
      resource("hints").extra.manual++;
      setBoard({ ...board });
    }
  }

  return (
    <div className="board-controls panel">
      <div className="title-bar">Game parameters</div>
      <div className="half">
        <div className="half">Number of rows:</div>
        <div className="half">
          <input
            type="number"
            name="rows"
            min={0}
            max={40}
            value={rows}
            onInput={changeInput}
          />
        </div>
      </div>
      <div className="right half">
        <div className="half">
          <input type="button" value="Reset Board" onClick={resetBoard} />
        </div>
      </div>
      <div className="half">
        <div className="half">Number of columns:</div>
        <div className="half">
          <input
            type="number"
            name="cols"
            min={0}
            max={40}
            value={cols}
            onInput={changeInput}
          />
        </div>
      </div>
      <div className="right half">
        <div className="half">
          <input type="button" value="Get A Hint" onClick={getHint} />
        </div>
      </div>
      <div className="half">
        <div className="half">Game difficulty:</div>
        <div className="half">
          <input
            type="range"
            name="difficulty"
            min={1}
            max={99}
            value={difficulty}
            onInput={changeInput}
          />
        </div>
      </div>
    </div>
  );
};

export default BoardControls;
