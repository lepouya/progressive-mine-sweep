import React from "react";
import { ResourceCount } from "../model/Resource";

import useGameContext from "./GameContext";
import ResourceRender from "./ResourceRender";

const BuyButton: React.FC<{
  resource: string;
  kind?: string;
  maxNum?: number;
  minNum?: number;
  increment?: number;
  enabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}> = ({
  resource: resName,
  kind,
  maxNum = 1,
  minNum = 1,
  increment = 1,
  enabled = true,
  className,
  style,
}) => {
  const { resource } = useGameContext();
  const res = resource(resName);

  function adjustCount(count = 0) {
    return Math.max(
      0,
      Math.floor((res.count + count) / increment) * increment - res.count,
    );
  }

  function purchase(count = 0) {
    if (!enabled || count < 1) {
      return;
    }
    res.buy(count, "partial", kind);
  }

  let active = true;
  let cost = res.buy(adjustCount(maxNum), "dry-partial", kind);
  if (cost.count % increment !== 0) {
    cost = res.buy(adjustCount(cost.count), "dry-partial", kind);
  }
  if (cost.count < minNum) {
    cost = res.buy(adjustCount(maxNum), "dry-full", kind);
    active = false;
  }

  const classNames = [
    "buy-button",
    `buy-button-${active ? "" : "un"}affordable`,
    className,
  ].filter((s) => !!s);

  return (
    <button
      onClick={() => purchase(active && enabled ? cost.count : 0)}
      disabled={!active || !enabled}
      className={classNames.join(" ")}
      style={style}
    >
      Buy
      {renderResourceCounts(cost.gain)}
      for
      {renderResourceCounts(cost.cost, -1)}
    </button>
  );
};

function renderResourceCounts(rcs: ResourceCount[], multiplier = 1) {
  return rcs.map((rc, i) => (
    <ResourceRender
      resource={
        typeof rc.resource === "string" ? { name: rc.resource } : rc.resource
      }
      value={rc.count * multiplier}
      kind={rc.kind}
      display={"number"}
      infix={""}
      prefix={i > 0 ? "& " : ""}
      showLocked={true}
      showColors={true}
      showPlusSign={true}
      showChrome={true}
      key={typeof rc.resource === "string" ? rc.resource : rc.resource.name}
    />
  ));
}

export default BuyButton;
