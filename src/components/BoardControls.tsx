import { genHints, genBoardState } from "../model/Board";
import useGameContext from "./GameContext";
import BuyButton from "./BuyButton";
import ResourceRender from "./ResourceRender";
import { hintFormula, remainingHintsFormula } from "../model/GameFormulas";

type Props = {
  buyAmount: string;
};

export default function BoardControls({ buyAmount }: Props) {
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

  let buyAmounts = { min: 1, max: 1, inc: 1 };
  switch (buyAmount) {
    case "max":
      buyAmounts = { min: 1, max: 100, inc: 1 };
      break;
    case "x5":
      buyAmounts = { min: 1, max: 5, inc: 5 };
      break;
    case "x10":
      buyAmounts = { min: 1, max: 10, inc: 10 };
      break;
    case "+5":
      buyAmounts = { min: 5, max: 5, inc: 1 };
      break;
    case "+10":
      buyAmounts = { min: 10, max: 10, inc: 1 };
      break;
    case "x1":
    default:
      buyAmounts = { min: 1, max: 1, inc: 1 };
  }

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
          <BuyButton
            resource={cols}
            prefix={"Expand"}
            maxCount={50}
            minNum={buyAmounts.min}
            maxNum={buyAmounts.max}
            increment={buyAmounts.inc}
          />
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
          <BuyButton
            resource={rows}
            prefix={"Expand"}
            maxCount={50}
            minNum={buyAmounts.min}
            maxNum={buyAmounts.max}
            increment={buyAmounts.inc}
          />
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
          <BuyButton
            resource={difficulty}
            prefix={"Increase"}
            maxCount={100}
            minNum={buyAmounts.min}
            maxNum={buyAmounts.max}
            increment={buyAmounts.inc}
          />
        </div>
        <div className="half"></div>
        <div className="right half">
          <BuyButton
            resource={difficulty}
            prefix={"Decrease"}
            gainMultiplier={-1}
            enabled={difficulty.count > 0}
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
          <BuyButton
            resource={resetSpeed}
            prefix={"Speed up"}
            maxCount={100}
            minNum={buyAmounts.min}
            maxNum={buyAmounts.max}
            increment={buyAmounts.inc}
          />
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
          <BuyButton
            resource={hintQuality}
            prefix={"Improve"}
            maxCount={100}
            minNum={buyAmounts.min}
            maxNum={buyAmounts.max}
            increment={buyAmounts.inc}
          />
        </div>
        <div className="half"></div>
        <div className="right half">
          <BuyButton
            resource={hints}
            count={0}
            prefix={"Get"}
            maxCount={remainingHintsFormula(context)}
            onPurchase={getHint}
            minNum={buyAmounts.min}
            maxNum={buyAmounts.max}
            increment={buyAmounts.inc}
          />
        </div>
      </div>
    </div>
  );
}
