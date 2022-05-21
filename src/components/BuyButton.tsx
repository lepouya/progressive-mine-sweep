import React from "react";
import { Resource, ResourceCount } from "../model/Resource";

import useGameContext from "./GameContext";
import ResourceRender from "./ResourceRender";

const BuyButton: React.FC<{
  resource: string | Resource;
  kind?: string;

  maxNum?: number;
  minNum?: number;
  increment?: number;
  enabled?: boolean;

  className?: string;
  style?: React.CSSProperties;

  onPurchase?: (resource: Resource, kind?: string, bought?: number) => void;
}> = ({
  resource: resProp,
  kind,

  maxNum = 1,
  minNum = 1,
  increment = 1,
  enabled = true,

  className,
  style,
  onPurchase,
}) => {
  const { resource } = useGameContext();
  const res = resource(resProp);

  function adjustCount(count = 0) {
    return Math.max(
      0,
      Math.floor((res.count + count) / increment) * increment - res.count,
    );
  }

  function doPurchase(count = 0) {
    if (!enabled || count < 1) {
      return;
    }
    res.buy(count, "partial", kind);
    if (onPurchase) {
      onPurchase(res, kind, count);
    }
  }

  let active = true;
  let purchase = res.buy(adjustCount(maxNum), "dry-partial", kind);
  if (purchase.count % increment !== 0) {
    purchase = res.buy(adjustCount(purchase.count), "dry-partial", kind);
  }
  if (purchase.count < minNum) {
    purchase = res.buy(adjustCount(maxNum), "dry-full", kind);
    active = false;
  }

  const classNames = [
    "buy-button",
    `buy-button-${active ? "" : "un"}affordable`,
    className,
  ].filter((s) => !!s);

  return (
    <button
      onClick={() => doPurchase(active && enabled ? purchase.count : 0)}
      disabled={!active || !enabled}
      className={classNames.join(" ")}
      style={style}
    >
      Buy
      {renderResourceCounts(purchase.gain)}
      for
      {renderResourceCounts(purchase.cost, -1)}
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
      className={"value-first"}
      key={typeof rc.resource === "string" ? rc.resource : rc.resource.name}
    />
  ));
}

export default BuyButton;
