import { useState } from "react";

import BoardControls from "../components/BoardControls";
import MineField from "../components/MineField";
import ResourceBar from "../components/ResourceBar";
import ResetBox from "../components/ResetBox";
import { CellAction } from "../model/Cell";
import ModeControls from "../components/ModeControls";

export default function Main() {
  const [tapMode, setTapMode] = useState<CellAction>("reveal");
  const [buyAmount, setBuyAmount] = useState("x1");

  return (
    <div className="main">
      <ResourceBar />
      <ResetBox />
      <MineField tapMode={tapMode} />
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
