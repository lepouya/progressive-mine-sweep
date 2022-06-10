import { MouseEvent } from "react";

import useGameContext from "../components/GameContext";
import round from "../utils/round";
import { Context } from "../model/Context";
import { Generative } from "../utils/generate";
import generate from "../utils/generate";
import map from "../utils/map";
import { MineFieldWrapper } from "../components/MineField";
import ResourceRender from "../components/ResourceRender";
import Icon from "../components/Icon";
import ModeControls from "../components/ModeControls";

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
        height: "450px",
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
        <div className="full center">Sample 3x3 board:</div>
        <div className="full center">
          <MineFieldWrapper rows={3} cols={3} randomMines={1} size={200} />
        </div>
      </>
    ),
    greyOut: true,
  },
  15: {
    title: "Revealing a square",
    body: (
      <>
        <div className="full">
          Clicking or tapping on an empty square will reveal its contents. The
          contents of a square is either clear or a mine. When revealing a clear
          square, you are given a clue to the number of mines surrounding it
          &mdash; in all directions, including diagonals. Revealing a mine,
          however, would trigger it and explode!
        </div>
        <div className="full center">
          Try clicking (or tapping) the hinted square below:
        </div>
        <div className="full center">
          <MineFieldWrapper
            rows={3}
            cols={3}
            size={200}
            mines={[[2, 2]]}
            hints={[[0, 0]]}
            unlocks={[[0, 0]]}
          />
        </div>
      </>
    ),
    greyOut: true,
  },
  20: {
    title: "Revealing squares",
    body: (
      <>
        <div className="full">
          <span>
            The revealed contents of &nbsp;
            <Icon state="revealed" neighbors={0} size="1em" />
            &nbsp; tells us there are no mines in the squares surrounding it, so
            it's safe to go ahead and reveal the 3 surrounding squars as well!
          </span>
        </div>
        <div className="full center">
          Try clicking (or tapping) the hinted squares below:
        </div>
        <div className="full center">
          <MineFieldWrapper
            rows={3}
            cols={3}
            size={200}
            mines={[[2, 2]]}
            reveals={[[0, 0]]}
            hints={[
              [0, 1],
              [1, 0],
              [1, 1],
            ]}
            unlocks={[
              [0, 1],
              [1, 0],
              [1, 1],
            ]}
          />
        </div>
      </>
    ),
    greyOut: true,
  },
  25: {
    title: "Reasoning about squares",
    body: (
      <>
        <div className="full">
          <span>
            Uh oh! The &nbsp;
            <Icon state="revealed" neighbors={1} size="1em" />
            &nbsp; in the middle means there's one mine hidden under one of the
            remaining squares around the centerpiece! Better be careful with
            this one...
          </span>
        </div>
        <div className="full">
          However, we know from the other 2 squares we just revealed that there
          are no mines in the 2 squares immediately surrounding those places.
        </div>
        <div className="full center">
          <MineFieldWrapper
            rows={3}
            cols={3}
            size={200}
            mines={[[2, 2]]}
            reveals={[
              [0, 0],
              [0, 1],
              [1, 0],
              [1, 1],
            ]}
            hints={[
              [0, 2],
              [1, 2],
              [2, 0],
              [2, 1],
            ]}
            unlocks={[
              [0, 2],
              [1, 2],
              [2, 0],
              [2, 1],
            ]}
          />
        </div>
      </>
    ),
    greyOut: true,
  },
  30: {
    title: "Flagging squares",
    body: (
      <>
        <div className="full">
          This brings us to the final square in the corner which is obviously a
          mine! You won't want to set this off!
        </div>
        <div className="full">
          Be careful with this one. Right (or meta) click on the square to flag
          it, or simply toggle the tapping mode to flag squares instead of
          revealing:
        </div>
        <div className="full center">
          <ModeControls showBuyAmount={false} />
        </div>
        <div className="full center">
          <MineFieldWrapper
            rows={3}
            cols={3}
            size={200}
            mines={[[2, 2]]}
            reveals={[
              [0, 0],
              [0, 1],
              [1, 0],
              [1, 1],
              [0, 2],
              [1, 2],
              [2, 0],
              [2, 1],
            ]}
          />
        </div>
      </>
    ),
    greyOut: true,
  },
  35: {
    title: "Winning a game",
    body: (
      <>
        <div className="full">
          No sweating if you accidentally set off the mine in the previous step.
        </div>
        <div className="full">
          Once you reveal all the squares and flag all the mines correctly, you
          win the playing field, and the game announced it to you.
        </div>
        <div className="full">
          Similarly, if you set off a mine, you lose the playing field and need
          to reset the board.
        </div>
        <div className="full">
          In either case, you will be represented with an option to reset the
          board and receive a brand new game to play. We can upgrade this box
          and its functions later on.
        </div>
      </>
    ),
    greyOut: true,
  },
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

const sortedTutorialSteps = Object.keys(tutorialSteps)
  .map((n) => parseInt(n))
  .sort((a, b) => a - b);
