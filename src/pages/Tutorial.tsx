import { MouseEvent, useState, useEffect } from "react";

import useGameContext from "../components/GameContext";
import round from "../utils/round";
import { Context } from "../model/Context";
import { Generative } from "../utils/generate";
import generate from "../utils/generate";
import map from "../utils/map";

export default function Tutorial() {
  const { context, settings } = useGameContext();
  const [tutorialStep, setTutorialStep] = useState<TutorialStep | undefined>();

  useEffect(() => {
    const stepGen = tutorialSteps[settings.tutorialStep];
    if (!stepGen) {
      setTutorialStep(undefined);
      return;
    }

    const sortedSteps = Object.keys(tutorialSteps)
      .map((n) => parseInt(n))
      .sort((a, b) => a - b);
    const stepIdx = sortedSteps.indexOf(settings.tutorialStep);

    const gen = generate(
      stepGen,
      {
        step: settings.tutorialStep,
        title: `Tutorial step #${settings.tutorialStep}`,
        body: "...",
        enabled: true,

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

    gen.bounds = map(
      gen.bounds,
      (size) => `max(5%, 1em, min(90%, calc(100% - 2em), calc(${size})))`,
    );

    setTutorialStep(gen);
  }, [settings.tutorialStep]);

  function validStep(step?: number) {
    return (
      step != null &&
      step != undefined &&
      step >= 0 &&
      step !== settings.tutorialStep &&
      step !== tutorialStep?.step
    );
  }

  function gotoStep(event: MouseEvent<Element>, step?: number) {
    event.preventDefault();
    if (validStep(step)) {
      settings.tutorialStep = step!;
    }
  }

  if (
    !tutorialStep ||
    tutorialStep.step !== settings.tutorialStep ||
    tutorialStep.step < 0
  ) {
    // Either done with tutorials or ended up in an error state
    return null;
  } else if (!tutorialStep.enabled) {
    // Need to re-evaluate the tutorial activation
    const enableFunc = tutorialSteps[settings.tutorialStep].enabled;
    if (typeof enableFunc === "function") {
      tutorialStep.enabled = enableFunc(tutorialStep, context) ?? true;
    }
    if (!tutorialStep.enabled) {
      return null;
    }
    setTutorialStep(tutorialStep);
  }

  const tutorial = (
    <div className="tutorial" style={tutorialStep?.bounds}>
      <div className="panel">
        {tutorialStep?.title != null && tutorialStep?.title !== "" && (
          <div className="title-bar">{tutorialStep?.title}</div>
        )}
        {tutorialStep?.body}
        {validStep(tutorialStep?.prevStep) && (
          <div className="prev">
            <a href="" onClick={(e) => gotoStep(e, tutorialStep?.prevStep)}>
              {tutorialStep?.prevStepTitle}
            </a>
          </div>
        )}
        {validStep(tutorialStep?.nextStep) && (
          <div className="next">
            <a href="" onClick={(e) => gotoStep(e, tutorialStep?.nextStep)}>
              {tutorialStep?.nextStepTitle}
            </a>
          </div>
        )}
        {validStep(tutorialStep?.skipToStep) && (
          <div className="skip">
            <a href="" onClick={(e) => gotoStep(e, tutorialStep?.skipToStep)}>
              {tutorialStep?.skipToStepTitle}
            </a>
          </div>
        )}
      </div>
    </div>
  );

  if (tutorialStep?.greyOut) {
    return <div className="greyout">{tutorial}</div>;
  } else {
    return tutorial;
  }
}

type TutorialStep = {
  step: number;
  title: string | JSX.Element;
  body: string | JSX.Element;

  enabled: boolean;

  prevStep: number;
  prevStepTitle: string | JSX.Element;
  nextStep: number;
  nextStepTitle: string | JSX.Element;
  skipToStep: number;
  skipToStepTitle: string | JSX.Element;

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
      <div className="full">
        Hello and welcome to Progressive Mine Sweep &mdash; also known as PMS.
      </div>
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
