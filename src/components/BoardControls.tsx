import { genHints, genBoardState } from "../model/Board";
import useGameContext from "./GameContext";
import BuyButton from "./BuyButton";
import ResourceRender from "./ResourceRender";
import {
  hintFormula,
  remainingHintsFormula,
  scoreMultiplier,
} from "../model/GameFormulas";

export default function BoardControls() {
  const {
    context,
    board,
    setBoard,
    resources: {
      rows,
      cols,
      difficulty,
      hintQuality,
      resetSpeed,
      hints,
      losses,
    },
  } = useGameContext();

  const multiplier = scoreMultiplier(context);

  const boardSizeChanged =
    board.rows !== rows.value() || board.cols !== cols.value();

  function getHint(_res: unknown, _kind: unknown, numHints = 0) {
    if (genHints(board, numHints, 0, 8, hintFormula(context)) > 0) {
      hints.extra.manual++;
      setBoard({ ...board });
    }
  }

  function reset() {
    board.state = "lost";
    setBoard(genBoardState(board));
    losses.count++;
    losses.extra.manual++;
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
            infix={""}
            className={"value-first"}
          />
        </div>
        <div className="right half">
          <BuyButton resource={cols} prefix={"Expand"} maxCount={50} />
        </div>
        <div className="quarter">Game Height:</div>
        <div className="quarter">
          <ResourceRender
            resource={rows}
            showChrome={true}
            infix={""}
            className={"value-first"}
          />
        </div>
        <div className="right half">
          <BuyButton resource={rows} prefix={"Expand"} maxCount={50} />
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

        <div className="quarter">Game Difficulty:</div>
        <div className="quarter">
          <ResourceRender
            resource={difficulty}
            showChrome={true}
            showName={false}
            infix={""}
            className={"value-first"}
          />
        </div>
        <div className="right half">
          <BuyButton resource={difficulty} prefix={"Increase"} maxCount={100} />
        </div>
        <div className="quarter">
          <span className="computed">Score Multiplier:</span>
        </div>
        <div className="quarter">
          <ResourceRender
            value={multiplier * 100}
            display="percentage"
            showChrome={true}
            className="computed"
          />
        </div>
        <div className="right half">
          <BuyButton
            resource={difficulty}
            prefix={"Decrease"}
            gainMultiplier={-1}
            enabled={difficulty.count > 0}
            minNum={1}
            maxNum={1}
            increment={1}
          />
        </div>

        <div className="quarter">Reset Speed:</div>
        <div className="quarter">
          <ResourceRender
            resource={resetSpeed}
            showChrome={true}
            showName={false}
            infix={""}
            className={"value-first"}
          />
        </div>
        <div className="right half">
          <BuyButton resource={resetSpeed} prefix={"Speed up"} maxCount={100} />
        </div>

        <div className="quarter">Hint Quality:</div>
        <div className="quarter">
          <ResourceRender
            resource={hintQuality}
            showChrome={true}
            showName={false}
            infix={""}
            className={"value-first"}
          />
        </div>
        <div className="right half">
          <BuyButton resource={hintQuality} prefix={"Improve"} maxCount={100} />
        </div>
        <div className="half"></div>
        <div className="right half">
          <BuyButton
            resource={hints}
            count={0}
            maxCount={remainingHintsFormula(context)}
            onPurchase={getHint}
          />
        </div>
      </div>
    </div>
  );
}
