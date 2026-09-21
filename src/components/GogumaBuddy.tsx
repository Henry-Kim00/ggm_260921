export default function GogumaBuddy() {
  return (
    <div
      aria-hidden="true"
      className="goguma-buddy pointer-events-none fixed left-[5vw] top-32 hidden select-none lg:block"
    >
      <div className="goguma-bob">
        <svg width="132" height="132" viewBox="0 0 120 120" fill="none">
          <defs>
            <linearGradient
              id="goguma-skin"
              gradientUnits="userSpaceOnUse"
              x1="12"
              y1="96"
              x2="114"
              y2="26"
            >
              <stop offset="0%" stopColor="#8e4593" />
              <stop offset="55%" stopColor="#bd5a95" />
              <stop offset="100%" stopColor="#e8836f" />
            </linearGradient>
          </defs>

          {/* 새싹 */}
          <path d="M80 28 C78 16 84 6 95 3 C96 15 91 25 80 28 Z" fill="#7cc47f" />
          <path d="M77 29 C68 22 65 11 69 2 C78 8 83 20 77 29 Z" fill="#5fae66" />

          {/* 고구마 몸통 */}
          <path
            d="M10 94 C14 66 34 40 62 30 C84 22 108 24 113 38 C118 54 98 76 70 86 C46 95 20 100 10 94 Z"
            fill="url(#goguma-skin)"
          />

          {/* 껍질 무늬 */}
          <ellipse cx="34" cy="72" rx="4" ry="1.8" fill="#ffffff" opacity="0.3" transform="rotate(-22 34 72)" />
          <ellipse cx="96" cy="44" rx="4.4" ry="1.8" fill="#ffffff" opacity="0.28" transform="rotate(-22 96 44)" />

          {/* 볼터치 */}
          <ellipse cx="42" cy="72" rx="8" ry="5" fill="#ff9bb5" opacity="0.6" transform="rotate(-18 42 72)" />
          <ellipse cx="92" cy="58" rx="8" ry="5" fill="#ff9bb5" opacity="0.6" transform="rotate(-18 92 58)" />

          {/* 눈 (깜빡임) */}
          <g className="goguma-eye">
            <ellipse cx="55" cy="61" rx="5" ry="6.5" fill="#3a2317" />
            <circle cx="57" cy="58" r="1.9" fill="#ffffff" />
          </g>
          <g className="goguma-eye">
            <ellipse cx="81" cy="53" rx="5" ry="6.5" fill="#3a2317" />
            <circle cx="83" cy="50" r="1.9" fill="#ffffff" />
          </g>

          {/* 입 */}
          <path
            d="M64 70 C67 74 72 73 74 68"
            stroke="#3a2317"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}
