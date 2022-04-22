import React from "react";

import TimeDuration from "../utils/TimeDuration";
import useGameContext from "../utils/GameContext";

const Stats: React.FC = () => {
  const { settings } = useGameContext();

  return (
    <div>
      <div className="panel">
        <div className="title-bar">Time Stats</div>
        <div className="full">
          <TimeDuration
            start={settings.lastReset}
            end={settings.lastUpdate}
            prefix={"You started this game "}
            suffix={" ago"}
          />
          .
        </div>
      </div>
    </div>
  );
};

export default Stats;
