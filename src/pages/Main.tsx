import { useMemo, useState } from "react";

import BoardControls from "../components/BoardControls";
import MineField from "../components/MineField";
import ResourceBar from "../components/ResourceBar";
import useGameContext from "../components/GameContext";
import ResetBox from "../components/ResetBox";
import { CellAction } from "../model/Cell";
import ModeControls from "../components/ModeControls";

export default function Main() {
  const { board } = useGameContext();
  const [tapMode, setTapMode] = useState<CellAction>("reveal");
  const [buyAmount, setBuyAmount] = useState("x1");

  const mineField = useMemo(
    () => <MineField tapMode={tapMode} />,
    [board, tapMode],
  );

  return (
    <div className="main">
      <ResourceBar />
      <ResetBox />
      {mineField}
      <ModeControls
        tapMode={tapMode}
        setTapMode={setTapMode}
        buyAmount={buyAmount}
        setBuyAmount={setBuyAmount}
      />
      <BoardControls buyAmount={buyAmount} />
    </div>
  );
}
