import React, { useEffect, useState } from "react";
import BoardControls from "../components/BoardControls";
import MineField from "../components/MineField";
import { genPlayboard } from "../model/Playboard";
import Settings from "../model/Settings";

const Main: React.FC = () => {
  const [board, setBoard] = useState(Settings.mainPlayboard);

  useEffect(() => {
    if (board.rows === 0 || board.cols === 0) {
      setBoard(genPlayboard(10, 10, 10));
    }
  }, []);

  useEffect(() => {
    Settings.mainPlayboard = board;
    Settings.Save();
  }, [board]);

  return (
    <div>
      <MineField board={board} />
      <BoardControls board={board} setBoard={setBoard} />
    </div>
  );
};

export default Main;
