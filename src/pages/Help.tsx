import map from "../utils/map";
import useGameContext from "../components/GameContext";
import tutorialSteps from "../tutorial/TutorialSteps";
import { resolveTutorialStep } from "../model/TutorialStep";

export default function Help() {
  const context = useGameContext();

  const resolvedSteps = map(tutorialSteps, (_, idx) =>
    resolveTutorialStep(idx ?? 0, tutorialSteps, context),
  );
  const keys = Object.keys(tutorialSteps)
    .map((n) => parseInt(n))
    .sort((a, b) => a - b);

  function renderHelpPanel(step: number) {
    const tutorialStep = resolvedSteps[step];
    if (!tutorialStep) {
      return null;
    }

    return (
      <div className="help" key={`help-panel-${step}`}>
        <div className="panel">
          {tutorialStep.title != null && tutorialStep.title !== "" && (
            <div className="title-bar">{tutorialStep.title}</div>
          )}
          {tutorialStep.body}
        </div>
      </div>
    );
  }

  return <>{keys.map((n) => renderHelpPanel(n))}</>;
}
