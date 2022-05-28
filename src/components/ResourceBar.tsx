import { boardProgressFormula } from "../model/GameFormulas";
import useGameContext from "./GameContext";
import ResourceRender from "./ResourceRender";

export default function ResourceBar() {
  const {
    context,
    board,
    resources: { wins, cells },
  } = useGameContext();

  return (
    <div className={`panel board-state-${board.state}`}>
      <ResourceRender
        resource={wins}
        precision={0}
        showRate={true}
        showZeroRates={true}
        showRatePercentages={false}
        showChrome={true}
      />
      <ResourceRender
        resource={cells}
        precision={0}
        showRate={true}
        showZeroRates={true}
        showRatePercentages={false}
        showChrome={true}
      />
      <hr className="separator" />
      <ResourceRender
        name={"Board"}
        suffix={`${board.rows}x${board.cols}`}
        showChrome={true}
      />
      <ResourceRender
        name={"progress"}
        value={boardProgressFormula(context)}
        display={"percentage"}
        showChrome={true}
      />
      <ResourceRender
        resource={{
          name: "Mines",
          count: board.cellCounts.flagged,
          maxCount: board.numMines,
        }}
        showMaxValue={true}
        showChrome={true}
      />
    </div>
  );
}
