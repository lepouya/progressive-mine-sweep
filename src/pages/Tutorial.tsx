import { MouseEvent, useEffect } from "react";

import useGameContext from "../components/GameContext";
import { resolveTutorialStep } from "../model/TutorialStep";
import tutorialSteps from "../tutorial/TutorialSteps";
import apply from "../utils/apply";
import { Nullable } from "../utils/types";

export default function Tutorial() {
  const { context, settings } = useGameContext();

  const tutorialStep = resolveTutorialStep(
    settings.tutorialStep,
    tutorialSteps,
    context,
  );

  useEffect(() => {
    const onMount = tutorialStep?.onMount;
    const onUnmount = tutorialStep?.onUnmount;
    let elems: Nullable<NodeListOf<Element>>;
    try {
      elems = document.querySelectorAll(tutorialStep?.highlightSelector ?? "");
    } catch (_) {}

    if (tutorialStep?.enabled) {
      elems?.forEach((elem) => elem.classList.add("highlight"));
      if (onMount) {
        onMount();
      }
    }

    return () => {
      elems?.forEach((elem) => elem.classList.remove("highlight"));
      if (onUnmount) {
        onUnmount();
      }
    };
  }, [tutorialStep?.step, tutorialStep?.enabled]);

  if (
    !tutorialStep ||
    !tutorialStep.enabled ||
    tutorialStep.step !== settings.tutorialStep ||
    tutorialStep.step < 0
  ) {
    return null;
  }

  function validStep(step?: number) {
    return (
      step != null &&
      step != undefined &&
      step >= 0 &&
      step !== settings.tutorialStep &&
      step !== tutorialStep?.step
    );
  }

  function gotoStep(step: number | undefined, event: MouseEvent) {
    event.preventDefault();
    if (validStep(step)) {
      settings.tutorialStep = step!;
    }
  }

  function calcStyle(size?: string) {
    return `max(5%, 1em, min(90%, calc(100% - 2em), calc(${size})))`;
  }

  const bounds = {
    left: calcStyle(tutorialStep.bounds.left),
    bottom: calcStyle(
      "100vh - " + tutorialStep.bounds.top + " - " + tutorialStep.bounds.height,
    ),
    width: calcStyle(tutorialStep.bounds.width),
    minHeight: calcStyle(tutorialStep.bounds.height),
    maxHeight: calcStyle("100%"),
  };

  const tutorial = (
    <div
      className="tutorial"
      style={bounds}
      id={`tutorial-step-${tutorialStep.step}`}
    >
      <div
        className="panel shadow"
        style={{ minHeight: tutorialStep.bounds.height }}
      >
        {tutorialStep.title != null && tutorialStep.title !== "" && (
          <div className="title-bar">{tutorialStep.title}</div>
        )}
        {tutorialStep.body}
        {validStep(tutorialStep.prevStep) && (
          <div className="prev">
            <a href="" onClick={apply(gotoStep, tutorialStep.prevStep)}>
              {tutorialStep.prevStepTitle}
            </a>
          </div>
        )}
        {validStep(tutorialStep.nextStep) && (
          <div className="next">
            <a href="" onClick={apply(gotoStep, tutorialStep.nextStep)}>
              {tutorialStep.nextStepTitle}
            </a>
          </div>
        )}
        {validStep(tutorialStep.skipToStep) && (
          <div className="skip">
            <a href="" onClick={apply(gotoStep, tutorialStep.skipToStep)}>
              {tutorialStep.skipToStepTitle}
            </a>
          </div>
        )}
      </div>
    </div>
  );

  if (tutorialStep.greyOut) {
    return <div className="greyout">{tutorial}</div>;
  } else {
    return tutorial;
  }
}
