import useGameContext from "../components/GameContext";
import ResourceRender from "../components/ResourceRender";
import achievement_resources from "../data/achievements.json";

export default function Achievements() {
  const { resource } = useGameContext();
  const achievements = achievement_resources.map((r) => resource(r.name));

  let earned = 0,
    total = 0;
  achievements.forEach((res) => {
    earned += res.count;
    total += res.maxCount ?? 0;
  });

  return (
    <div id="achievements">
      <div className="panel">
        <div className="half right">Total achievements score:</div>
        <div className="half left">
          &nbsp; {earned} / {total}
        </div>
      </div>
      <div className="panel">
        <div className="title-bar">Achievements</div>
        {achievements.map((achievement) => (
          <div
            key={achievement.name}
            className={`achievement ${achievement.count ? "" : "un"}earned`}
          >
            <ResourceRender
              resource={achievement}
              showChrome={true}
              showValue={achievement.count > 0}
              infix={achievement.count > 0 ? ":" : ""}
              placeholder="???"
            />
            {achievement.maxCount && achievement.maxCount > 1 && (
              <div className="subtext">
                Gained {achievement.count} / {achievement.maxCount} milestones
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
