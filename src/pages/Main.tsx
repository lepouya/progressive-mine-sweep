import BoardControls from "../components/BoardControls";
import MineField from "../components/MineField";
import ResourceBar from "../components/ResourceBar";
import ResetBox from "../components/ResetBox";
import ModeControls from "../components/ModeControls";

export default function Main() {
  return (
    <div className="main">
      <ResourceBar />
      <ResetBox />
      <MineField />
      <ModeControls />
      <BoardControls />
    </div>
  );
}
