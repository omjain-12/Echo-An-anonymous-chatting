import React from "react";

function Logo({ className }) {
  return (
    <svg
      className={className}
      width="40"
      height="40"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>

      {/* Outer wave - representing echo */}
      <path
        d="M 50 20 Q 65 30, 70 50 Q 65 70, 50 80 Q 35 70, 30 50 Q 35 30, 50 20 Z"
        fill="url(#logoGradient)"
        opacity="0.3"
      >
        <animate
          attributeName="opacity"
          values="0.3;0.6;0.3"
          dur="2s"
          repeatCount="indefinite"
        />
      </path>

      {/* Middle wave */}
      <path
        d="M 50 30 Q 60 37, 63 50 Q 60 63, 50 70 Q 40 63, 37 50 Q 40 37, 50 30 Z"
        fill="url(#logoGradient)"
        opacity="0.5"
      >
        <animate
          attributeName="opacity"
          values="0.5;0.8;0.5"
          dur="2s"
          begin="0.3s"
          repeatCount="indefinite"
        />
      </path>

      {/* Inner circle - representing the source */}
      <circle cx="50" cy="50" r="12" fill="url(#logoGradient)">
        <animate
          attributeName="r"
          values="12;14;12"
          dur="2s"
          begin="0.6s"
          repeatCount="indefinite"
        />
      </circle>

      {/* Chat bubble detail */}
      <path d="M 50 40 L 48 48 L 52 48 Z" fill="white" opacity="0.9" />
    </svg>
  );
}

export default Logo;
