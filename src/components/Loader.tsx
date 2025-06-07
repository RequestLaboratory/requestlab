import React from 'react';

const Loader: React.FC = () => (
  <div className="absolute inset-0 z-40 flex items-center justify-center bg-white/70 dark:bg-black/80 backdrop-blur-sm">
    <div className="flex flex-col items-center space-y-6 animate-fade-in">
      {/* SVG Circuit Animation */}
      <div className="relative w-24 h-24">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full text-orange-500 animate-rotate-path"
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
        >
          <circle cx="25" cy="25" r="8" fill="currentColor">
            <animate attributeName="r" values="8;12;8" dur="1.4s" repeatCount="indefinite" />
          </circle>
          <circle cx="75" cy="75" r="8" fill="currentColor">
            <animate attributeName="r" values="8;12;8" dur="1.4s" begin="0.7s" repeatCount="indefinite" />
          </circle>
          <path
            d="M25 25 v25 h50 v25"
            strokeDasharray="8"
            strokeLinecap="round"
          >
            <animate
              attributeName="stroke-dashoffset"
              values="0;30;0"
              dur="1.6s"
              repeatCount="indefinite"
            />
          </path>
        </svg>

        {/* Glowing Points */}
        <div className="absolute w-4 h-4 bg-orange-400 rounded-full left-[21%] top-[21%] blur-md animate-ping" />
        <div className="absolute w-4 h-4 bg-orange-400 rounded-full left-[73%] top-[73%] blur-md animate-ping delay-700" />
      </div>

      {/* Glowing Text */}
      <span className="text-orange-500 font-extrabold text-xl tracking-wide animate-glow text-shadow-orange">
        ⚡ Request Lab is booting up...
      </span>
    </div>
  </div>
);

export default Loader;
