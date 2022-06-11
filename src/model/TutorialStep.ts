import { Context } from "./Context";
import generate, { Generative } from "../utils/generate";
import map from "../utils/map";
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

  const res = generate(
    stepGen,
    {
      step: tutorialStep,
      enabled: true,

      title: `Tutorial step #${tutorialStep}`,
      body: "...",

      prevStep: sortedTutorialSteps[stepIdx - 1],
      prevStepTitle: "< back",
      nextStep: sortedTutorialSteps[stepIdx + 1],
      nextStepTitle: "next >",
      skipToStep: round(tutorialStep + 100, -2, "floor"),
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

  res.bounds = map(
    res.bounds,
    (size) => `max(5%, 1em, min(90%, calc(100% - 2em), calc(${size})))`,
  );

  return res;
}
