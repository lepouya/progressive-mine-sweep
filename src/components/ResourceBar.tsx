import React from "react";
import useGameContext from "./GameContext";
import ResourceRender from "./ResourceRender";

const ResourceBar: React.FC = () => {
  const { board, resource } = useGameContext();
  return (
    <div className={`panel board-state-${board.state}`}>
      <ResourceRender
        resource={resource("wins")}
        showRate={true}
        showZeroRates={true}
        showRatePercentages={false}
        showChrome={true}
      />
      <ResourceRender
        resource={resource("cells")}
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
        value={
          (board.cellCounts.revealed + board.cellCounts.flagged) /
          (board.rows * board.cols)
        }
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