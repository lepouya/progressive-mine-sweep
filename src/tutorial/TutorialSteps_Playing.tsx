import Icon from "../components/Icon";
import { MineFieldWrapper } from "../components/MineField";
import ModeControls from "../components/ModeControls";
import { TutorialSteps } from "../model/TutorialStep";

export const tsPlaying: TutorialSteps = {
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
            it's safe to go ahead and reveal the 3 surrounding squares as well!
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
        <div className="full center">
          <ModeControls showBuyAmount={false} />
        </div>
      </>
    ),
    greyOut: true,
    onMount: (_, context) => () => {
      _tempTapMode = context.settings.tapMode;
    },
    onUnmount: (_, context) => () => {
      context.settings.tapMode = _tempTapMode;
    },
  },
  35: {
    title: "Winning a game",
    body: (
      <>
        <div className="full">
          No sweat if you accidentally set off the mine in the previous step.
        </div>
        <div className="full">
          Once you reveal all the squares and flag all the mines correctly, you
          win the playing field, and the game announces it to you.
        </div>
        <div className="full">
          Similarly, if you set off a mine, you lose the playing field and need
          to reset the board.
        </div>
        <div className="full">
          In either case, you will be presented with an option to reset the
          board and receive a brand new game to play. We can upgrade this box
          and its functions later on.
        </div>
      </>
    ),
    greyOut: true,
  },
};

let _tempTapMode: "reveal" | "flag" = "reveal";
