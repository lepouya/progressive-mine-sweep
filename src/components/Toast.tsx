// Inspired by github:Cogoport/cogo-toast

import { MouseEventHandler, useEffect, useState } from "react";
import { createRoot, Root } from "react-dom/client";

import { getHTMLElement } from "../utils/document";
import { Expansion, Optional } from "../utils/types";
import Icon, { IconProps } from "./Icon";

export type ToastOptions = Optional<{
  id: number;

  heading: string;
  icon: string | IconProps;
  message: string | JSX.Element;

  position: ToastPosition;
  duration: number;
  type: "info" | "success" | "fail";

  onClick: MouseEventHandler;
  onHide: (toast: ToastOptions) => void;

  className: string;
}>;

export type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export type ToastPromise = Promise<void> & { hide: () => void };

export default function toast(options?: ToastOptions): ToastPromise {
  options = options ?? {};
  options.id = options.id ?? toasts_idx++;

  const position = options.position ?? "top-right";
  all_toasts = all_toasts ?? {};
  all_toasts[position] = all_toasts[position] ?? [];
  if (position.includes("bottom")) {
    all_toasts[position].unshift(options);
  } else {
    all_toasts[position].push(options);
  }

  const onToastHide = options.onHide;
  options.onHide = (toast) => {
    const position = toast?.position ?? "top-right";
    all_toasts[position] = all_toasts[position].filter(
      (item: ToastOptions) => item?.id !== toast?.id,
    );
    if (onToastHide) {
      onToastHide(toast);
    }
  };

  const completePromise = new Promise((resolve) =>
    setTimeout(resolve, (options?.duration ?? 3) * 1000),
  );
  (completePromise as ToastPromise).hide = () =>
    options?.onHide ? options.onHide(options) : {};

  toasts_root.render(
    toast_rows.map((row) => (
      <div key={row} className={`row ${row}`}>
        {toast_groups.map((group) => {
          const type = `${row}-${group}` as ToastPosition;
          return (
            <div key={type} className={`group ${group}`}>
              {(all_toasts[type] ?? []).map((toast) => (
                <Toast key={`toast_${type}_${toast?.id}`} {...toast} />
              ))}
            </div>
          );
        })}
      </div>
    )),
  );

  return completePromise as ToastPromise;
}

let toasts_root: Root;
let all_toasts: Expansion<ToastPosition, ToastOptions[]>;
let toasts_idx = 0;
const toast_rows = ["top", "bottom"];
const toast_groups = ["left", "center", "right"];

window.addEventListener(
  "load",
  () => (toasts_root = createRoot(getHTMLElement("toasts-root"))),
  false,
);

function Toast(props: ToastOptions) {
  const [shown, setShown] = useState("hidden");

  function hide() {
    setShown("hidden");
    setTimeout(() => {
      if (props?.onHide) {
        props.onHide(props);
      }
    }, 300);
  }

  useEffect(() => {
    const animTimeout = setTimeout(() => setShown("shown"), 50);
    const hideTimeout = setTimeout(() => {
      if (props?.duration !== 0) {
        hide();
      }
    }, (props?.duration ?? 3) * 1000);

    return () => {
      clearTimeout(animTimeout);
      clearTimeout(hideTimeout);
    };
  }, []);

  const classNames = ["toast", shown, props?.type, props?.className]
    .filter((s) => !!s)
    .join(" ");

  return (
    <div className={classNames} onClick={props?.onClick ?? hide}>
      {props?.icon && typeof props.icon === "string" && (
        <Icon icon={props.icon} />
      )}
      {props?.icon && typeof props.icon === "object" && (
        <Icon {...(props.icon as IconProps)} />
      )}
      <div>
        {props?.heading && <h4>{props.heading}</h4>}
        {props?.message && <div className="message">{props.message}</div>}
      </div>
    </div>
  );
}
