import React, { useMemo } from "react";

import BoardControls from "../components/BoardControls";
import MineField from "../components/MineField";
import ResourceBar from "../components/ResourceBar";
import useGameContext from "../utils/GameContext";

const Main: React.FC = () => {
  const { board, setBoard } = useGameContext();
  const mineField = useMemo(
    () => <MineField board={board} setBoard={setBoard} />,
    [board],
  );
  return (
    <div>
      <ResourceBar board={board} />
      {mineField}
      <BoardControls board={board} setBoard={setBoard} />
    </div>
  );
};

export default Main;
