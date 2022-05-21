import React, { ChangeEvent, useEffect, useState } from "react";
import { genHints, Board, genBoardState } from "../model/Board";
import clamp from "../utils/clamp";
import useGameContext from "./GameContext";
import BuyButton from "./BuyButton";
import ResourceRender from "./ResourceRender";
import { useLocation } from "react-router";

const BoardControls: React.FC<{
  board: Board;
  setBoard: (board: Board) => void;
}> = ({ board, setBoard }) => {
  const { resource } = useGameContext();
  const [numRows, setNumRows] = useState(0);
  const [numCols, setNumCols] = useState(0);
  const [difficulty, setDifficulty] = useState(0);

  const location = useLocation();
  const showDebug =
    `${location.pathname} ${location.search} ${location.hash} ${location.key}`
      .toLowerCase()
      .indexOf("debug") >= 0;

  const rows = resource("rows");
  const cols = resource("cols");
  const boardSizeChanged =
    board.rows !== rows.value() || board.cols !== cols.value();

  useEffect(() => {
    if (board.rows > 0 && board.cols > 0) {
      setNumRows(rows.value());
      setNumCols(cols.value());
      setDifficulty(Math.floor(100 * resource("difficulty").value()));
    } else {
      board.state = "inactive";
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
        setNumRows(num);
        resource(target.name).count = clamp(num, 3, 40);
      } else if (target.name === "cols") {
        setNumCols(num);
        resource(target.name).count = clamp(num, 3, 40);
      } else if (target.name === "difficulty") {
        setDifficulty(num);
        resource(target.name).count = clamp(num / 100);
      }
    }
  }

  function getHint() {
    if (genHints(board, 1, 0, 8, resource("hintQuality").value()) > 0) {
      resource("hints").extra.manual++;
      setBoard({ ...board });
    }
  }

  function reset() {
    board.state = "lost";
    setBoard(genBoardState(board));
    resource("losses").count++;
    resource("losses").extra.manual++;
  }

  return (
    <div>
      <div className="board-controls panel">
        <div className="title-bar">Upgrades</div>

        <div className="quarter">Game Width:</div>
        <div className="quarter">
          <ResourceRender
            resource={cols}
            showChrome={true}
            infix=""
            className="value-first"
          />
        </div>
        <div className="right half">
          <BuyButton resource={cols} />
        </div>
        <div className="quarter">Game Height:</div>
        <div className="quarter">
          <ResourceRender
            resource={rows}
            showChrome={true}
            infix=""
            className="value-first"
          />
        </div>
        <div className="right half">
          <BuyButton resource={rows} />
        </div>
        <div className="half"></div>
        <div className="right half">
          <BuyButton resource={"hints"} onPurchase={getHint} />
        </div>
        {boardSizeChanged && (
          <div className="left">
            On reset, game board will change to size to
            {` ${rows.value()}x${cols.value()}`}
          </div>
        )}
        {boardSizeChanged && (
          <div className="right quarter">
            <input type="button" value="Reset Now!" onClick={reset} />
          </div>
        )}
      </div>

      {showDebug && (
        <div className="board-controls panel">
          <div className="title-bar">Debug Game parameters</div>
          <div className="quarter">Number of rows:</div>
          <div className="quarter">
            <input
              type="number"
              name="rows"
              min={0}
              max={40}
              value={numRows}
              onInput={changeInput}
            />
          </div>
          <div className="quarter">Game difficulty:</div>
          <div className="quarter">
            <input
              type="range"
              name="difficulty"
              min={1}
              max={99}
              value={difficulty}
              onInput={changeInput}
            />
          </div>
          <div className="quarter">Number of columns:</div>
          <div className="quarter">
            <input
              type="number"
              name="cols"
              min={0}
              max={40}
              value={numCols}
              onInput={changeInput}
            />
          </div>
          <div className="quarter"></div>
          <div className="right quarter">
            <input type="button" value="Get A Hint" onClick={getHint} />
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardControls;
