import React from "react";
import { Resource, ResourceCount } from "../model/Resource";

import useGameContext from "./GameContext";
import ResourceRender from "./ResourceRender";

const BuyButton: React.FC<{
  resource: string | Resource;
  kind?: string;
  enabled?: boolean;

  maxNum?: number;
  minNum?: number;
  increment?: number;

  gainMultiplier?: number;

  prefix?: string;
  suffix?: string;
  infix?: string;
  and?: string;

  className?: string;
  style?: React.CSSProperties;

  onPurchase?: (resource: Resource, kind?: string, bought?: number) => void;
}> = ({
  resource: resProp,
  kind,
  enabled = true,

  maxNum = 1,
  minNum = 1,
  increment = 1,

  gainMultiplier = 1,

  prefix = "Buy",
  suffix = "",
  infix = "for",
  and = "&",

  className,
  style,
  onPurchase,
}) => {
  const { resource } = useGameContext();
  const res = resource(resProp);

  function renderResourceCounts(rcs: ResourceCount[], multiplier = 1) {
    return rcs.map((rc, i) => (
      <ResourceRender
        resource={
          typeof rc.resource === "string" ? { name: rc.resource } : rc.resource
        }
        value={rc.count * multiplier}
        kind={rc.kind}
        display={
          typeof rc.resource !== "string" ? rc.resource.display : "number"
        }
        infix={""}
        prefix={i > 0 ? and : ""}
        showLocked={true}
        showColors={true}
        showPlusSign={true}
        showChrome={true}
        className={"value-first"}
        key={typeof rc.resource === "string" ? rc.resource : rc.resource.name}
      />
    ));
  }

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

    let gainCount = res.buy(count, "partial", kind).count;
    gainCount += res.add((gainMultiplier - 1) * gainCount, kind).count;

    if (onPurchase) {
      onPurchase(res, kind, purchase.count + gainCount);
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

  if (!enabled) {
    purchase.cost = [];
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
      {prefix && <div className="prefix">{prefix}</div>}
      {renderResourceCounts(purchase.gain, gainMultiplier)}
      {enabled && infix && <div className="infix">{infix}</div>}
      {enabled && renderResourceCounts(purchase.cost, -1)}
      {suffix && <div className="suffix">{suffix}</div>}
    </button>
  );
};

export default BuyButton;
