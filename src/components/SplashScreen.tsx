import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Show splash screen for 1.8s then smoothly fade out
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(onFinish, 400);
    }, 1800);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      onClick={() => {
        setFadeOut(true);
        setTimeout(onFinish, 300);
      }}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between py-16 px-6 cursor-pointer select-none transition-opacity duration-400 ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 40%, #090d16 100%)'
      }}
    >
      {/* Rainy window bokeh background simulation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute top-1/3 -right-20 w-72 h-72 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 w-80 h-80 rounded-full bg-cyan-500/15 blur-3xl" />
        {/* Soft bokeh lights */}
        <div className="absolute top-1/4 left-1/4 w-12 h-12 rounded-full bg-amber-100/10 blur-xl" />
        <div className="absolute top-1/2 right-1/4 w-16 h-16 rounded-full bg-blue-200/10 blur-xl" />
      </div>

      {/* Top spacing */}
      <div className="pt-12 relative z-10 text-center">
        <h1 className="text-5xl sm:text-6xl font-normal text-white tracking-wide font-sans drop-shadow-md">
          Mausam
        </h1>
      </div>

      {/* Center Official IMD Emblem matching Image 1 */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto">
        <div className="relative w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center">
          {/* Subtle outer glow */}
          <div className="absolute inset-0 rounded-full bg-blue-400/20 blur-xl animate-pulse" />

          {/* Official IMD Emblem Vector Graphic */}
          <svg
            className="w-full h-full drop-shadow-xl"
            viewBox="0 0 200 240"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Ashoka Lion Capital at Top */}
            <g transform="translate(75, 4)">
              <rect x="18" y="24" width="14" height="4" fill="#fbbf24" rx="1" />
              <path
                d="M10 16 C10 8, 40 8, 40 16 C38 22, 12 22, 10 16 Z"
                fill="#fbbf24"
              />
              <circle cx="25" cy="8" r="6" fill="#f59e0b" />
              <circle cx="16" cy="11" r="4.5" fill="#d97706" />
              <circle cx="34" cy="11" r="4.5" fill="#d97706" />
            </g>

            {/* Circular Seal Outer Ring */}
            <circle cx="100" cy="120" r="76" fill="#1e293b" stroke="#ffffff" strokeWidth="2.5" />
            <circle cx="100" cy="120" r="70" fill="#0f172a" stroke="#fbbf24" strokeWidth="2" />

            {/* Weather & Radar Globe */}
            <circle cx="100" cy="120" r="56" fill="#38bdf8" />
            <circle cx="100" cy="120" r="56" fill="url(#globeGrad)" />

            {/* India Subcontinent Outline Stylized */}
            <path
              d="M92 84 L104 88 L108 98 L100 112 L112 124 L102 148 L96 138 L90 120 L86 102 Z"
              fill="#22c55e"
              opacity="0.85"
            />

            {/* Isobars / Meteorological Wind Curves */}
            <path
              d="M54 110 Q100 95 146 110"
              stroke="#ffffff"
              strokeWidth="1.5"
              strokeDasharray="3 2"
              fill="none"
              opacity="0.8"
            />
            <path
              d="M58 130 Q100 115 142 130"
              stroke="#ffffff"
              strokeWidth="1.5"
              strokeDasharray="3 2"
              fill="none"
              opacity="0.8"
            />

            {/* Outer Ring Text (Hindi & English) */}
            <path
              id="curveTop"
              d="M 40 120 A 60 60 0 0 1 160 120"
              fill="none"
            />
            <text fill="#ffffff" fontSize="9" fontWeight="bold" letterSpacing="0.8">
              <textPath href="#curveTop" startOffset="50%" textAnchor="middle">
                भारत मौसम विज्ञान विभाग
              </textPath>
            </text>

            <path
              id="curveBottom"
              d="M 160 120 A 60 60 0 0 1 40 120"
              fill="none"
            />
            <text fill="#ffffff" fontSize="7" fontWeight="bold" letterSpacing="0.5">
              <textPath href="#curveBottom" startOffset="50%" textAnchor="middle">
                INDIA METEOROLOGICAL DEPARTMENT
              </textPath>
            </text>

            {/* Ribbon at bottom */}
            <g transform="translate(45, 186)">
              <rect x="15" y="0" width="80" height="15" rx="3" fill="#ea580c" />
              <polygon points="5,8 15,0 15,15" fill="#c2410c" />
              <polygon points="105,8 95,0 95,15" fill="#c2410c" />
              <text x="55" y="11" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">
                आदित्यात् जायते वृष्टिः
              </text>
            </g>

            {/* Gradient definition */}
            <defs>
              <linearGradient id="globeGrad" x1="60" y1="80" x2="140" y2="160" gradientUnits="userSpaceOnUse">
                <stop stopColor="#60a5fa" stopOpacity="0.4" />
                <stop offset="1" stopColor="#0284c7" stopOpacity="0.9" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Subtitle matching Image 1 */}
        <h2 className="text-xl sm:text-2xl font-bold text-white mt-6 tracking-wide drop-shadow-sm">
          Unified Mobile App
        </h2>
        <p className="text-sm text-slate-300 font-medium mt-1">
          India Meteorological Department
        </p>
      </div>

      {/* Bottom Loading hint */}
      <div className="relative z-10 flex flex-col items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
        <span className="text-[11px] text-slate-400 font-medium tracking-wider">
          TAP ANYWHERE TO CONTINUE
        </span>
      </div>
    </div>
  );
};
