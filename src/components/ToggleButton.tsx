import { JSX, MouseEvent, PropsWithChildren, useEffect, useState } from "react";

export type ToggleButtonProps = {
  enabled?: boolean;

  checked?: boolean;
  onChange?: (checked: boolean) => void;

  checkedContents?: JSX.Element | string;
  unCheckedContents?: JSX.Element | string;

  className?: string;
  style?: React.CSSProperties;
};

export default function ToggleButton({
  enabled = true,

  checked = false,
  onChange,

  checkedContents,
  unCheckedContents,

  className,
  style,

  children,
}: PropsWithChildren<ToggleButtonProps>) {
  const [toggle, setToggle] = useState(false);

  useEffect(() => {
    setToggle(checked);
  }, [checked]);

  function triggerToggle(event: MouseEvent) {
    event.preventDefault();
    if (!enabled) {
      return;
    }

    setToggle(!toggle);
    if (onChange) {
      onChange(!toggle);
    }
  }

  const classNames = [
    "toggle-button",
    `toggle-button-${enabled ? "en" : "dis"}abled`,
    `toggle-button-${checked ? "" : "un"}checked`,
    className,
  ].filter((s) => !!s);

  return (
    <div onClick={triggerToggle} className={classNames.join(" ")} style={style}>
      <div className="check">
        <div>{checkedContents}</div>
      </div>
      <div className="contents">{children}</div>
      <div className="uncheck">
        <div>{unCheckedContents}</div>
      </div>
      <div className="circle"></div>
    </div>
  );
}
