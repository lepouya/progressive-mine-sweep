import { MouseEvent } from "react";

import useGameContext from "../components/GameContext";
import round from "../utils/round";
import { Context } from "../model/Context";
import { Generative } from "../utils/generate";
import generate from "../utils/generate";
import map from "../utils/map";
import { MineFieldWrapper } from "../components/MineField";
import ResourceRender from "../components/ResourceRender";

export default function Tutorial() {
  const { context, settings } = useGameContext();
  const stepGen = tutorialSteps[settings.tutorialStep];
  if (!stepGen) {
    return null;
  }

  const stepIdx = sortedTutorialSteps.indexOf(settings.tutorialStep);
  const tutorialStep: TutorialStep = generate(
    stepGen,
    {
      step: settings.tutorialStep,
      enabled: true,

      title: `Tutorial step #${settings.tutorialStep}`,
      body: "...",

      prevStep: sortedTutorialSteps[stepIdx - 1],
      prevStepTitle: "< back",
      nextStep: sortedTutorialSteps[stepIdx + 1],
      nextStepTitle: "next >",
      skipToStep: round(settings.tutorialStep + 100, -2, "floor"),
      skipToStepTitle: "skip >>>",

      greyOut: false,
      bounds: {
        left: "50% - 200px",
        top: "6rem",
        width: "400px",
        height: "400px",
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
    title: "Progressive Mine Sweep",
    body: (
      <>
        <div className="full">Hi! Welcome to progressive mine sweeper.</div>
        <div className="full">
          This is my special take on the classic minesweeper game with
          progressive / incremental aspects built into it.
        </div>
        <div className="full">
          The first part of this tutorial will walk you through how to play
          minesweeper. At any point in tutorial you can move to the next or
          previous pages. Feel free to skip to the next chapter if you already
          know how to play!
        </div>
      </>
    ),
    greyOut: true,
  },
  10: {
    title: "What is minesweeper",
    body: (
      <>
        <div className="full">
          The game board consists of a playing field shaped like a grid of
          squares. There are a certain number of mines buried under this field.
          The objective of each game is to successfully clear all the empty
          cells, and flag the cells containing mines without triggering
          (exploding) them.
        </div>
        <div className="full center">Sample 4x4 board:</div>
        <div className="full center">
          <MineFieldWrapper rows={4} cols={4} randomMines={2} size={200} />
        </div>
      </>
    ),
    greyOut: true,
  },
  15: {
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

const sortedTutorialSteps = Object.keys(tutorialSteps)
  .map((n) => parseInt(n))
  .sort((a, b) => a - b);
