import { MouseEvent } from "react";

import useGameContext from "../components/GameContext";
import round from "../utils/round";

export default function Tutorial() {
  const { settings } = useGameContext();
  let greyedOut = false;
  let left = "50% - 100px";
  let top = "20px";
  let width = "200px";
  let height = "200px";

  if (settings.tutorialStep > 0) {
    return null;
  }

  switch (settings.tutorialStep) {
    case 0:
      greyedOut = true;
      left = "50% - 300px";
      top = "3rem";
      width = "600px";
      height = "600px";
      break;
  }

  function skipStep(event: MouseEvent<Element>) {
    event.preventDefault();
    settings.tutorialStep = round(settings.tutorialStep + 100, -2, "floor");
  }

  const style = {
    left: _calc(left),
    top: _calc(top),
    width: _calc(width),
    height: _calc(height),
  };

  const ret = (
    <div className="tutorial" style={style}>
      <div className="panel">
        <div className="title-bar">Tutorial step: {settings.tutorialStep}</div>
        <div className="full">
          Hello and welcome to Progressive Mine Sweep &mdash; also known as PMS.
        </div>
        <div className="skip">
          <a href="" onClick={skipStep}>
            skip &gt;&gt;&gt;
          </a>
        </div>
      </div>
    </div>
  );

  if (greyedOut) {
    return <div className="greyout">{ret}</div>;
  } else {
    return ret;
  }
}

function _calc(s?: string) {
  return `max(5%, 1em, min(90%, calc(100% - 2em), calc(${s})))`;
}
