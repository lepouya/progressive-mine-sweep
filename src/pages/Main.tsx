import React, { useMemo, useState } from "react";

import BoardControls from "../components/BoardControls";
import MineField from "../components/MineField";
import ResourceBar from "../components/ResourceBar";
import useGameContext from "../components/GameContext";
import ResetBox from "../components/ResetBox";
import { CellAction } from "../model/Cell";
import ModeControls from "../components/ModeControls";

const Main: React.FC = () => {
  const { board, setBoard } = useGameContext();
  const [tapMode, setTapMode] = useState<CellAction>("reveal");
  const [buyAmount, setBuyAmount] = useState("x1");

  const mineField = useMemo(
    () => <MineField board={board} setBoard={setBoard} tapMode={tapMode} />,
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
      <BoardControls board={board} setBoard={setBoard} buyAmount={buyAmount} />
    </div>
  );
};

export default Main;
