import React from 'react';

const Spinner: React.SFC = () => {
  const style = {
    background: "none",
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" className="lds-spinner" width="128px" height="128px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" style={style}>
      <g transform="rotate(0 50 50)">
        <rect x="47" y="24" rx="9.4" ry="4.8" width="6" height="12" fill="#32a0da">
          <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1.1s" begin="-1.0083333333333335s" repeatCount="indefinite" />
        </rect>
      </g>
      <g transform="rotate(30 50 50)">
        <rect x="47" y="24" rx="9.4" ry="4.8" width="6" height="12" fill="#32a0da">
          <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1.1s" begin="-0.9166666666666666s" repeatCount="indefinite" />
        </rect>
      </g>
      <g transform="rotate(60 50 50)">
        <rect x="47" y="24" rx="9.4" ry="4.8" width="6" height="12" fill="#32a0da">
          <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1.1s" begin="-0.8250000000000001s" repeatCount="indefinite" />
        </rect>
      </g>
      <g transform="rotate(90 50 50)">
        <rect x="47" y="24" rx="9.4" ry="4.8" width="6" height="12" fill="#32a0da">
          <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1.1s" begin="-0.7333333333333334s" repeatCount="indefinite" />
        </rect>
      </g>
      <g transform="rotate(120 50 50)">
        <rect x="47" y="24" rx="9.4" ry="4.8" width="6" height="12" fill="#32a0da">
          <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1.1s" begin="-0.6416666666666667s" repeatCount="indefinite" />
        </rect>
      </g>
      <g transform="rotate(150 50 50)">
        <rect x="47" y="24" rx="9.4" ry="4.8" width="6" height="12" fill="#32a0da">
          <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1.1s" begin="-0.55s" repeatCount="indefinite" />
        </rect>
      </g>
      <g transform="rotate(180 50 50)">
        <rect x="47" y="24" rx="9.4" ry="4.8" width="6" height="12" fill="#32a0da">
          <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1.1s" begin="-0.4583333333333333s" repeatCount="indefinite" />
        </rect>
      </g>
      <g transform="rotate(210 50 50)">
        <rect x="47" y="24" rx="9.4" ry="4.8" width="6" height="12" fill="#32a0da">
          <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1.1s" begin="-0.3666666666666667s" repeatCount="indefinite" />
        </rect>
      </g>
      <g transform="rotate(240 50 50)">
        <rect x="47" y="24" rx="9.4" ry="4.8" width="6" height="12" fill="#32a0da">
          <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1.1s" begin="-0.275s" repeatCount="indefinite" />
        </rect>
      </g>
      <g transform="rotate(270 50 50)">
        <rect x="47" y="24" rx="9.4" ry="4.8" width="6" height="12" fill="#32a0da">
          <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1.1s" begin="-0.18333333333333335s" repeatCount="indefinite" />
        </rect>
      </g>
      <g transform="rotate(300 50 50)">
        <rect x="47" y="24" rx="9.4" ry="4.8" width="6" height="12" fill="#32a0da">
          <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1.1s" begin="-0.09166666666666667s" repeatCount="indefinite" />
        </rect>
      </g>
      <g transform="rotate(330 50 50)">
        <rect x="47" y="24" rx="9.4" ry="4.8" width="6" height="12" fill="#32a0da">
          <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1.1s" begin="0s" repeatCount="indefinite" />
        </rect>
      </g>
    </svg>
  );
}

export default Spinner;