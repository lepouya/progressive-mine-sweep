import React from "react";
import useGameContext from "../utils/GameContext";
import ResourceRender from "../utils/ResourceRender";

const ResourceBar: React.FC = () => {
  const { board, resource } = useGameContext();
  function render(name: string) {
    const res = resource(name);
    return (
      res.count > 0 && (
        <div>
          <ResourceRender
            resource={res}
            showIcon={true}
            showName={true}
            showValue={true}
            showRate={true}
            showZeroRates={true}
            showRatePercentages={false}
          />
        </div>
      )
    );
  }

  return (
    <div className={`panel scoreboard-${board.state}`}>
      {render("wins")}
      {render("cells")}
      <hr className="separator" />
      <div className="left">
        <div>
          Board: {board.rows}x{board.cols}
        </div>
      </div>
      <div className="center">
        <div>
          {board.state === "won"
            ? "Minefield won!"
            : board.state === "lost"
            ? "Minefield lost!!"
            : board.state === "active"
            ? "Progress: " +
              Math.floor(
                (100 * board.cellCounts.revealed) /
                  (board.rows * board.cols - board.numMines),
              ) +
              "%"
            : ""}
        </div>
      </div>
      <div className="right">
        <div>
          Mines: {board.cellCounts.flagged}/{board.numMines}
        </div>
      </div>
    </div>
  );
};

export default ResourceBar;
