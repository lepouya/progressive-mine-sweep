import useGameContext from "../components/GameContext";

export default function Tutorial() {
  const { settings } = useGameContext();
  let greyedOut = false;
  let left = "50% - 100px";
  let top = "20px";
  let width = "200px";
  let height = "200px";

  if (settings.tutorialStep === 0) {
    return null;
  }

  const style = {
    left: _calc(left),
    top: _calc(top),
    width: _calc(width),
    height: _calc(height),
  };

  const ret = (
    <div className="tutorial" style={style}>
      <div className="panel">Tutorial step: {settings.tutorialStep}</div>
    </div>
  );

  if (greyedOut) {
    return <div className="greyout">${ret}</div>;
  } else {
    return ret;
  }
}

function _calc(s?: string) {
  return /\W/.test(s ?? "") ? `calc(${s})` : s;
}
