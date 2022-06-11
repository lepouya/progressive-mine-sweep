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
            value={69}
            showChrome={true}
          />
        </div>
        <div className="half left">
          Shows how many fields you have successfully cleared
        </div>
        <div className="half center">
          <ResourceRender
            resource={context.resourceManager.get("cells")}
            value={420}
            showChrome={true}
          />
        </div>
        <div className="half left">
          Shows how many cells you have cleared without exploding
        </div>
        <div className="full">
          There are many other scores and resources tracked in the game that you
          can access via the STATISTICS tab above
        </div>
      </>
    ),
    greyOut: true,
  },
};
