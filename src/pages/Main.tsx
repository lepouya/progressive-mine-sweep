import React, { useMemo } from "react";

import BoardControls from "../components/BoardControls";
import MineField from "../components/MineField";
import ResourceBar from "../components/ResourceBar";
import useGameContext from "../components/GameContext";
import ResetBox from "../components/ResetBox";

const Main: React.FC = () => {
  const { board, setBoard } = useGameContext();
  const mineField = useMemo(
    () => <MineField board={board} setBoard={setBoard} />,
    [board],
  );

  return (
    <div className="main">
      <ResourceBar />
      <ResetBox />
      {mineField}
      <BoardControls board={board} setBoard={setBoard} />
    </div>
  );
};

export default Main;
