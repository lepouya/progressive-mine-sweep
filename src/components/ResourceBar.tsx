import React from "react";
import useGameContext from "../utils/GameContext";
import ResourceRender from "../utils/ResourceRender";

const ResourceBar: React.FC = () => {
  const { resource } = useGameContext();
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
    <div className={"panel resourcebar"}>
      {render("wins")}
      {render("cells")}
    </div>
  );
};

export default ResourceBar;
