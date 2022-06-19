import useGameContext from "../components/GameContext";
import ResourceRender from "../components/ResourceRender";

export default function Stats() {
  const { resource } = useGameContext();

  function render(name: string) {
    const res = resource(name);
    return (
      <ResourceRender
        resource={res}
        length={res.display === "percentage" ? "tiny" : "compact"}
        precision={res.display === "percentage" ? 1 : undefined}
        showMaxValue={true}
        showRate={true}
        showExtras={true}
        showZeroRates={true}
        showRateColors={true}
        placeholder=""
      />
    );
  }

  return (
    <div id="stats">
      <div className="panel stats" id="stats-time">
        <div className="title-bar">Time Info</div>
        {render("totalTime")}
        {render("activeTime")}
        {render("offlineTime")}
      </div>
      <div className="panel stats" id="stats-board">
        <div className="title-bar">Board Info</div>
        {render("rows")}
        {render("cols")}
        {render("difficulty")}
        {render("resetSpeed")}
        {render("hintQuality")}
      </div>
      <div className="panel stats" id="stats-game">
        <div className="title-bar">Game Info</div>
        {render("wins")}
        {render("losses")}
        {render("resets")}
        {render("automation")}
      </div>
      <div className="panel stats" id="stats-cell">
        <div className="title-bar">Cell Info</div>
        {render("cells")}
        {render("flags")}
        {render("hints")}
        {render("explosions")}
        {render("clicks")}
        {render("revealNeighbors")}
      </div>
    </div>
  );
}
