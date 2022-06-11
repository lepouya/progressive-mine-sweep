import BuyButton from "../components/BuyButton";
import MineField from "../components/MineField";
import ResourceBar from "../components/ResourceBar";
import ResetBox from "../components/ResetBox";
import ModeControls from "../components/ModeControls";
import ResourceRender from "../components/ResourceRender";
import useGameContext from "../components/GameContext";
import { genBoardState, genHints } from "../model/Board";
import {
  hintFormula,
  remainingHintsFormula,
  stateChanged,
} from "../model/GameFormulas";

export default function Main() {
  const {
    context,
    board,
    setBoard,
    resources: { rows, cols, hints, resets },
  } = useGameContext();

  const boardSizeChanged =
    board.rows !== rows.value() || board.cols !== cols.value();

  function reset() {
    let newBoard = genBoardState(board, 0);
    setBoard({ ...newBoard });
    stateChanged(context, "board", newBoard.state, false);
  }

  function getHint(_res: unknown, _kind: unknown, numHints = 0) {
    if (genHints(board, numHints, 0, 8, hintFormula(context)) > 0) {
      hints.extra.manual++;
      setBoard({ ...board });
    }
  }

  return (
    <div className="main" id="main">
      <ResourceBar />
      <ResetBox />
      <MineField />
      <ModeControls />
      <div className="game-controls panel">
        <div className="half">
          <button className="buy-button" onClick={reset} id="button-reset">
            <ResourceRender
              resource={resets}
              value={1}
              showValue={false}
              showChrome={true}
              infix=""
              suffix="the Game"
            />
          </button>
        </div>
        <div className="half">
          <BuyButton
            resource={hints}
            count={0}
            maxCount={remainingHintsFormula(context)}
            onPurchase={getHint}
          />
        </div>
        {boardSizeChanged && (
          <div className="left full" id="reset-info">
            On reset, game board will change to size to
            {` ${rows.value()}x${cols.value()}`}
          </div>
        )}
      </div>
    </div>
  );
}
