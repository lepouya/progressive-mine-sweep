import React from "react";

import useGameContext from "../components/GameContext";
import ResourceRender from "../components/ResourceRender";

const Stats: React.FC = () => {
  const { resource } = useGameContext();
  const render = (name: string, display?: "number" | "time" | "percentage") => (
    <ResourceRender
      resource={resource(name)}
      display={display}
      length={"compact"}
      showMaxValue={true}
      showRate={true}
      showExtras={true}
      showZeroRates={true}
      showRateColors={true}
    />
  );

  return (
    <div>
      <div className="panel stats">
        <div className="title-bar">Time Info</div>
        {render("totalTime")}
        {render("activeTime")}
        {render("offlineTime")}
      </div>
      <div className="panel stats">
        <div className="title-bar">Board Info</div>
        {render("rows")}
        {render("cols")}
        {render("difficulty", "percentage")}
        {render("hintQuality", "percentage")}
      </div>
      <div className="panel stats">
        <div className="title-bar">Game Info</div>
        {render("wins")}
        {render("losses")}
        {render("resets")}
      </div>
      <div className="panel stats">
        <div className="title-bar">Cell Info</div>
        {render("cells")}
        {render("flags")}
        {render("hints")}
        {render("explosions")}
        {render("clicks")}
      </div>
    </div>
  );
};

export default Stats;
