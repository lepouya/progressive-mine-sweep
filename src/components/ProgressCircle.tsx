import React from "react";

const ProgressCircle: React.FC<
  React.PropsWithChildren<{
    value: number;
    minValue?: number;
    maxValue?: number;
    width?: number;
    strokeWidth?: number;
    strokeLinecap?: "round" | "square" | "butt";
    primaryColor?: string;
    secondaryColor?: string;
    fillColor?: string;
    showPercent?: boolean;
    className?: string;
  }>
> = ({
  value,
  minValue = 0.0,
  maxValue = 1.0,
  width = 200,
  strokeWidth = 5,
  strokeLinecap = "round",
  primaryColor = "black",
  secondaryColor = "transparent",
  fillColor = "transparent",
  showPercent = false,
  className,
  children,
}) => {
  const R = width / 2 - strokeWidth * 2;
  const P = 2 * Math.PI * R;
  const pct = (value - minValue) / (maxValue - minValue);
  const offset = P - pct * P;

  return (
    <div
      className={`progress-circle ${className ?? ""}`}
      style={{ height: `${width}px`, width: `${width}px` }}
    >
      <div className="children">
        {showPercent && <span>{Math.floor(100 * pct)}%</span>}
        {children}
      </div>
      <svg
        width="100%"
        height="100%"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="secondary"
          fill="transparent"
          cx={width / 2}
          cy={width / 2}
          r={R}
          stroke={secondaryColor}
          strokeWidth={strokeWidth}
          strokeDasharray={`${P} ${P}`}
        />
        <circle
          className="primary"
          fill={fillColor}
          cx={width / 2}
          cy={width / 2}
          r={R}
          stroke={primaryColor}
          strokeWidth={strokeWidth}
          strokeLinecap={strokeLinecap}
          strokeDasharray={`${P} ${P}`}
          strokeDashoffset={offset}
        />
      </svg>
    </div>
  );
};

export default ProgressCircle;
