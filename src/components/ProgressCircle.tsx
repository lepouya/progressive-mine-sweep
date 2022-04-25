import React from "react";

const ProgressCircle: React.FC<
  React.PropsWithChildren<{
    value: number;
    minValue?: number;
    maxValue?: number;
    width?: string | number;
    height?: string | number;
    showPercent?: boolean;
    className?: string;
  }>
> = ({
  value,
  minValue = 0.0,
  maxValue = 1.0,
  width = "100px",
  height = width,
  showPercent = false,
  className,
  children,
}) => {
  const pct = (value - minValue) / (maxValue - minValue);
  return (
    <div
      className={`progress-circle ${className ?? ""}`}
      style={{ minWidth: width, minHeight: height }}
    >
      <div className="children">
        {showPercent && <span>{Math.floor(100 * pct)}%</span>}
        {children}
      </div>
      <svg viewBox="-55 -55 110 110" width={width} height={height}>
        <circle className="secondary" r={50} />
        <circle
          className="primary"
          r={50}
          transform="rotate(-90)"
          strokeDasharray={Math.PI * 100}
          strokeDashoffset={Math.PI * 100 * (1 - pct)}
        />
      </svg>
    </div>
  );
};

export default ProgressCircle;
