import useGameContext from "../components/GameContext";
import ResourceRender from "../components/ResourceRender";
import achievements_normal from "../data/achievements_normal.json";
import achievements_secret from "../data/achievements_secret.json";
import { achievementScoreMultiplier } from "../model/GameAchievements";
import { Resource } from "../model/Resource";

export default function Achievements() {
  const { context, resource } = useGameContext();

  let [earned, total] = [0, 0];

  const resources_normal = achievements_normal.flat().map(({ name }) => {
    const res = resource(name);
    earned += res.count;
    total += res.maxCount ?? 0;
    return res;
  });
  const resources_secret = achievements_secret.flat().map(({ name }) => {
    const res = resource(name);
    earned += res.count;
    total += res.maxCount ?? 0;
    return res;
  });

  function renderAchievement(achievement: Resource) {
    return (
      <div
        key={achievement.name}
        className={`achievement ${achievement.count ? "" : "un"}earned`}
      >
        <ResourceRender
          resource={achievement}
          showChrome={true}
          showIcon={false}
          showValue={achievement.count > 0}
          infix=""
          placeholder="???"
          className="value-first"
        />
        {(achievement.unlocked ?? true) &&
          achievement.maxCount &&
          achievement.maxCount > 1 && (
            <div className="subtext">
              Gained {achievement.count} / {achievement.maxCount} milestones
            </div>
          )}
      </div>
    );
  }

  return (
    <div id="achievements">
      <div className="panel">
        <div className="title-bar">Achievements</div>
        <div className="half right">Total achievements score:</div>
        <div className="half left">
          {earned} / {total}
        </div>
        <div className="half right">Score multiplier from achievements:</div>
        <div className="half left">
          {Math.floor(achievementScoreMultiplier(context) * 100)}%
        </div>
      </div>

      <div className="panel">
        <div className="title-bar">Normal Achievements</div>
        {resources_normal.map(renderAchievement)}
      </div>

      <div className="panel">
        <div className="title-bar">Secret Achievements</div>
        {resources_secret.map(renderAchievement)}
      </div>
    </div>
  );
}
