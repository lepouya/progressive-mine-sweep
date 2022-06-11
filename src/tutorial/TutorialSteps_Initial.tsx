import { TutorialSteps } from "../model/TutorialStep";

export const tsInit: TutorialSteps = {
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
};
