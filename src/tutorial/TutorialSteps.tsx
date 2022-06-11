import { tsInit } from "./TutorialSteps_Initial";
import { tsPlaying } from "./TutorialSteps_Playing";
import { tsScoring } from "./TutorialSteps_Scoring";

const tutorialSteps = {
  ...tsInit,
  ...tsPlaying,
  ...tsScoring,
};

export default tutorialSteps;
