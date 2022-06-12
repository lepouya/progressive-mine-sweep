import { Context } from "./Context";
import generate, { Generative } from "../utils/generate";
import recordMap from "../utils/recordMap";
import round from "../utils/round";

export type TutorialSteps = Record<number, Generative<TutorialStep, [Context]>>;

export type TutorialStep = {
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

export function resolveTutorialStep(
  tutorialStep: number,
  tutorialSteps: TutorialSteps,
  context: Context,
): TutorialStep | undefined {
  const stepGen = tutorialSteps[tutorialStep];
  if (!stepGen) {
    return undefined;
  }

  const sortedTutorialSteps = Object.keys(tutorialSteps)
    .map((n) => parseInt(n))
    .sort((a, b) => a - b);
  const stepIdx = sortedTutorialSteps.indexOf(tutorialStep);
  const prevIdx = sortedTutorialSteps[stepIdx - 1];
  const nextIdx = sortedTutorialSteps[stepIdx + 1];
  const skipIdx = round(tutorialStep + 100, -2, "floor");

  const res = generate(
    stepGen,
    {
      step: tutorialStep,
      enabled: true,

      title: `Tutorial step #${tutorialStep}`,
      body: "...",

      prevStep: prevIdx,
      prevStepTitle: "< back",
      nextStep: nextIdx >= 0 ? nextIdx : skipIdx,
      nextStepTitle: nextIdx >= 0 ? "next >" : "done",
      skipToStep: skipIdx,
      skipToStepTitle: "skip >>>",

      highlightSelector: "",
      greyOut: false,
      bounds: {
        left: "50% - 200px",
        top: "6rem",
        width: "400px",
        height: "450px",
      },
    },
    context,
  );

  res.bounds = recordMap(
    res.bounds,
    (size) => `max(5%, 1em, min(90%, calc(100% - 2em), calc(${size})))`,
  );

  return res;
}
