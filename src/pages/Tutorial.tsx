import { MouseEvent } from "react";

import useGameContext from "../components/GameContext";
import round from "../utils/round";
import { Context } from "../model/Context";
import { Generative } from "../utils/generate";
import generate from "../utils/generate";
import map from "../utils/map";

export default function Tutorial() {
  const { context, settings } = useGameContext();
  const stepGen = tutorialSteps[settings.tutorialStep];
  if (!stepGen) {
    return null;
  }

  const stepIdx = sortedSteps.indexOf(settings.tutorialStep);
  const tutorialStep: TutorialStep = generate(
    stepGen,
    {
      step: settings.tutorialStep,
      enabled: true,

      title: `Tutorial step #${settings.tutorialStep}`,
      body: "...",

      prevStep: sortedSteps[stepIdx - 1],
      prevStepTitle: "< back",
      nextStep: sortedSteps[stepIdx + 1],
      nextStepTitle: "next >",
      skipToStep: round(settings.tutorialStep + 100, -2, "floor"),
      skipToStepTitle: "skip >>>",

      greyOut: false,
      bounds: {
        left: "50% - 100px",
        top: "20px",
        width: "200px",
        height: "200px",
      },
    },
    context,
  );

  if (
    !tutorialStep ||
    !tutorialStep.enabled ||
    tutorialStep.step !== settings.tutorialStep ||
    tutorialStep.step < 0 ||
    stepIdx < 0
  ) {
    return null;
  }

  tutorialStep.bounds = map(
    tutorialStep.bounds,
    (size) => `max(5%, 1em, min(90%, calc(100% - 2em), calc(${size})))`,
  );

  function validStep(step?: number) {
    return (
      step != null &&
      step != undefined &&
      step >= 0 &&
      step !== settings.tutorialStep &&
      step !== tutorialStep.step
    );
  }

  function gotoStep(event: MouseEvent<Element>, step?: number) {
    event.preventDefault();
    if (validStep(step)) {
      settings.tutorialStep = step!;
    }
  }

  const tutorial = (
    <div className="tutorial" style={tutorialStep.bounds}>
      <div className="panel">
        {tutorialStep.title != null && tutorialStep.title !== "" && (
          <div className="title-bar">{tutorialStep.title}</div>
        )}
        {tutorialStep.body}
        {validStep(tutorialStep.prevStep) && (
          <div className="prev">
            <a href="" onClick={(e) => gotoStep(e, tutorialStep.prevStep)}>
              {tutorialStep.prevStepTitle}
            </a>
          </div>
        )}
        {validStep(tutorialStep.nextStep) && (
          <div className="next">
            <a href="" onClick={(e) => gotoStep(e, tutorialStep.nextStep)}>
              {tutorialStep.nextStepTitle}
            </a>
          </div>
        )}
        {validStep(tutorialStep.skipToStep) && (
          <div className="skip">
            <a href="" onClick={(e) => gotoStep(e, tutorialStep.skipToStep)}>
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

type TutorialStep = {
  step: number;
  enabled: boolean;

  title: string | JSX.Element;
  body: string | JSX.Element;

  prevStep: number;
  prevStepTitle: string | JSX.Element;
  nextStep: number;
  nextStepTitle: string | JSX.Element;
  skipToStep: number;
  skipToStepTitle: string | JSX.Element;

  highlightSelector: string;
  greyOut: boolean;
  bounds: {
    left: string;
    top: string;
    width: string;
    height: string;
  };
};

const tutorialSteps: Record<number, Generative<TutorialStep, [Context]>> = {
  0: {
    body: (
      <div className="full">Hi! this is the testing part of the tutorial.</div>
    ),
    greyOut: true,
    bounds: {
      left: "50% - 300px",
      top: "3rem",
      width: "600px",
      height: "600px",
    },
  },
};

const sortedSteps = Object.keys(tutorialSteps)
  .map((n) => parseInt(n))
  .sort((a, b) => a - b);
