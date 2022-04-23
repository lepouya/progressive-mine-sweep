import React from "react";

import useGameContext from "../utils/GameContext";
import ResourceRender from "../utils/ResourceRender";

const Stats: React.FC = () => {
  const { settings } = useGameContext();

  return (
    <div>
      <div className="panel stats">
        <div className="title-bar">Time Stats</div>
        <div className="full">
          <ResourceRender
            epoch={settings.lastReset / 1000}
            value={settings.lastUpdate / 1000}
            display={"time"}
            precision={0}
            prefix={"Started "}
            suffix={"."}
          />
        </div>
      </div>
    </div>
  );
};

export default Stats;
