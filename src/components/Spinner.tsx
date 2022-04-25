import React from "react";

const Spinner: React.FC<{ numFrames?: number; durationSecs?: number }> = ({
  numFrames = 12,
  durationSecs = 1,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    className="lds-spinner"
    width="128px"
    height="128px"
    viewBox="0 0 100 100"
    preserveAspectRatio="xMidYMid"
    style={{
      background: "none",
    }}
  >
    {Array.from(Array(numFrames).keys()).map((num) => (
      <g
        transform={`rotate(${(num * 360) / numFrames} 50 50)`}
        key={`frame-${num}`}
      >
        <rect
          x="47"
          y="24"
          rx="9.4"
          ry="4.8"
          width="6"
          height="12"
          fill="#32a0da"
        >
          <animate
            attributeName="opacity"
            values="1;0"
            keyTimes="0;1"
            dur={`${durationSecs}s`}
            begin={`${(num - numFrames) * (durationSecs / numFrames)}s`}
            repeatCount="indefinite"
          />
        </rect>
      </g>
    ))}
  </svg>
);

export default Spinner;
