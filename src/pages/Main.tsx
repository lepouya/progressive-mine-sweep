import React, { useMemo } from "react";

import BoardControls from "../components/BoardControls";
import MineField from "../components/MineField";
import Scoreboard from "../components/Scoreboard";
import useGameContext from "../utils/GameContext";

const Main: React.FC = () => {
  const { board, setBoard } = useGameContext();
  return useMemo(
    () => (
      <div>
        <Scoreboard board={board} />
        <MineField board={board} setBoard={setBoard} />
        <BoardControls board={board} setBoard={setBoard} />
      </div>
    ),
    [board],
  );
};

export default Main;
