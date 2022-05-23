import React from "react";
import { boardProgressFormula } from "../utils/formulas";
import useGameContext, { useResources } from "./GameContext";
import ResourceRender from "./ResourceRender";

const ResourceBar: React.FC = () => {
  const { board } = useGameContext();
  const { wins, cells } = useResources();
  return (
    <div className={`panel board-state-${board.state}`}>
      <ResourceRender
        resource={wins}
        showRate={true}
        showZeroRates={true}
        showRatePercentages={false}
        showChrome={true}
      />
      <ResourceRender
        resource={cells}
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
        value={boardProgressFormula(board)}
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
};

export default ResourceBar;
