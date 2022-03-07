import React, { ChangeEvent, useEffect, useState } from "react";
import { genHints, genPlayboard, Playboard } from "../model/Playboard";
import clamp from "../utils/clamp";

const BoardControls: React.FC<{
  board: Playboard;
  setBoard: (board: Playboard) => void;
}> = ({ board, setBoard }) => {
  const [rows, setRows] = useState(0);
  const [cols, setCols] = useState(0);
  const [mines, setMines] = useState(0);

  useEffect(() => {
    if (board.rows > 0 && board.cols > 0) {
      setRows(board.rows);
      setCols(board.cols);
      setMines(Math.floor((100 * board.numMines) / (board.rows * board.cols)));
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
      } else if (target.name === "cols") {
        setCols(num);
      } else if (target.name === "mines") {
        setMines(num);
      }
    }
  }

  function resetBoard() {
    const r = clamp(rows, 3, 40);
    const c = clamp(cols, 3, 40);
    const m = (r * c * clamp(mines, 0, 100)) / 100;
    setBoard(genPlayboard(r, c, Math.floor(m), Math.ceil(m)));
  }

  function getHint() {
    genHints(board, 1, 0, 8, 1);
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
        <div className="half">Mines density:</div>
        <div className="half">
          <input
            type="range"
            name="mines"
            min={1}
            max={99}
            value={mines}
            onInput={changeInput}
          />
        </div>
      </div>
    </div>
  );
};

export default BoardControls;
