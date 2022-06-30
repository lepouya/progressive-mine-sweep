import ResourceRender from "../components/ResourceRender";
import { TutorialSteps } from "../model/TutorialStep";

export const tsScoring: TutorialSteps = {
  100: {
    title: "Scoring",
    body: (_, context) => (
      <>
        <div className="full">
          Scores are awarded to the player based on how many cells have been
          successfully marked and how many playing fields have been cleared.
          These rewards can be used to purchase upgrades to the game to make it
          more engaging or challenging.
        </div>
        <div className="half center">
          <ResourceRender
            resource={context.resourceManager.get("wins")}
            showChrome={true}
          />
        </div>
        <div className="half left">
          Shows how many fields you have successfully cleared
        </div>
        <div className="half center">
          <ResourceRender
            resource={context.resourceManager.get("cells")}
            showChrome={true}
          />
        </div>
        <div className="half left">
          Shows how many cells you have cleared without exploding
        </div>
      </>
    ),
    enabled: (_, context) =>
      context.resourceManager.resources.resets.extra.total > 1,
    highlightSelector: "div.panel#resource-bar",
    bounds: {
      top: "12rem",
      height: "400px",
    },
  },
  105: {
    title: "Other scores",
    body: (
      <>
        <div className="full">
          There are many other scores and resources tracked in the game that you
          can access via the STATISTICS tab above.
        </div>
      </>
    ),
    highlightSelector: "div#tab-stats",
    bounds: {
      left: "100% - 300px - 2rem",
      width: "300px",
      height: "200px",
    },
  },
  110: {
    title: "Upgrades",
    body: (
      <>
        <div className="full">
          The UPGRADES tab allows you to upgrade various aspects of the game to
          make it more interesting.
        </div>
        <div className="full">
          Side note: this is what makes the game progressive &mdash; sometimes
          also called incremenetal.
        </div>
        <div className="full">
          Head over to this tab to check out the different upgrade options
          available.
        </div>
      </>
    ),
    highlightSelector: "div#tab-upgrades",
    enabled: (_, context) =>
      context.resourceManager.resources.resets.extra.total > 1,
    nextStep: (step) =>
      document.location.href.includes("upgrades") ? null : step?.step,
  },
  115: {
    title: "Upgrades",
    body: (_, context) => (
      <>
        <div className="full">
          You can increase the playing field size and difficulty of the game in
          Upgrades section. The cost of these upgrades increases over time, but
          you will eventually gain enough scores to upgrade them all!
        </div>
        <div className="half left">Game Width:</div>
        <div className="half left">
          <ResourceRender
            resource={context.resourceManager.get("cols")}
            showChrome={true}
            infix=""
            className="value-first"
          />
        </div>
        <div className="half left">Game Height:</div>
        <div className="half left">
          <ResourceRender
            resource={context.resourceManager.get("rows")}
            showChrome={true}
            infix=""
            className="value-first"
          />
        </div>
        <div className="half left">Game Difficulty:</div>
        <div className="half left">
          <ResourceRender
            resource={context.resourceManager.get("difficulty")}
            showChrome={true}
            showName={false}
            infix=""
            className="value-first"
          />
        </div>
      </>
    ),
    highlightSelector: "div#game-upgrades",
    bounds: {
      top: "26rem",
      height: "200px",
    },
  },
  120: {
    title: "Quality Upgrades",
    body: (
      <>
        <div className="full">
          There are many other upgrades in this tab that improve the quality and
          various aspects of the game. Such as getting hints or revealing
          neighboring cells on double-tap!
        </div>
        <div className="full">
          Try them all and make the game more enjoyable.
        </div>
        <div className="full">
          PRO TIP: There is a lot more to the game than these upgrades. Use them
          for a while and a whole lot of new features may open up as you go!
        </div>
      </>
    ),
  },
  200: {
    title: "Automation",
    body: (
      <>
        <div className="full">
          The AUTOMATION tab provides new game mechanics to automatically
          perform some repetitive actions in the game, such as reseting the
          board or revealing neighboring squares!
        </div>
        <div className="full">
          Head over to this tab to check out the different automation options
          available.
        </div>
      </>
    ),
    highlightSelector: "div#tab-auto",
    enabled: (_, context) =>
      context.resourceManager.resources.automation.extra.total >= 5,
    nextStep: (step) =>
      document.location.href.includes("auto") ? null : step?.step,
  },
};
