import React, { useId } from 'react';

interface LogoProps {
  className?: string;
  variant?: 'stacked' | 'horizontal' | 'icon';
  color?: 'black' | 'gold' | string;
}

/**
 * Programmatic vector matching the original RACHID's SHOP brand identity:
 * - Fluid, elegant script 'R' positioned naturally at the start of "ACHID"
 * - "ACHID SHOP" aligned precisely on the same horizontal baseline as "R"
 * - Calligraphic apostrophe & flourished lowercase 's' at the end
 * - Color option: 'black' (default, deep luxury black) or 'gold'
 */
export function Logo({ 
  className = "", 
  variant = 'horizontal',
  color = 'black'
}: LogoProps) {
  const idPrefix = useId().replace(/:/g, '');
  const goldColorId = `rachidGold_${idPrefix}`;
  const darkSerifId = `rachidSerifColor_${idPrefix}`;

  const isBlack = color === 'black' || color === '#000000' || color === '#0f0f11';
  const strokeColor = isBlack ? '#0f0f11' : `url(#${goldColorId})`;
  const textColor = isBlack ? '#0f0f11' : `url(#${darkSerifId})`;

  // ICON ONLY (The ornamental calligraphic 'R')
  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center select-none ${className}`}>
        <svg
          viewBox="0 0 90 90"
          className="w-full h-full overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={goldColorId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#966c22" />
              <stop offset="50%" stopColor="#b68936" />
              <stop offset="100%" stopColor="#875c18" />
            </linearGradient>
          </defs>

          {/* Calligraphic R */}
          <path
            d="M 14 42 C 14 26, 26 21, 38 21 C 56 21, 74 25, 80 38 C 84 48, 77 58, 64 61 C 55 63, 44 59, 41 53 C 39 49, 42 45, 47 45 C 51 45, 53 48, 51 51 C 50 53, 47 54, 45 53"
            stroke={strokeColor}
            strokeWidth="3.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 28 23 C 44 20, 65 21, 76 28 C 84 33, 86 42, 80 50 C 73 57, 63 60, 54 60"
            stroke={strokeColor}
            strokeWidth="4.2"
            strokeLinecap="round"
          />
          <path
            d="M 72 30 C 62 45, 48 64, 38 78 C 31 87, 22 90, 15 88 C 8 85, 6 77, 10 71 C 14 66, 22 65, 27 69 C 30 72, 29 78, 24 80 C 22 81, 19 80, 18 78"
            stroke={strokeColor}
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 54 60 C 60 65, 68 73, 75 80 C 81 85, 87 86, 90 83 C 94 79, 93 73, 88 70 C 83 67, 76 70, 75 75"
            stroke={strokeColor}
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }

  // FULL LOGO: (Calligraphic R + ACHID SHOP + 's) in Luxury Black
  return (
    <div 
      className={`inline-flex items-center justify-center select-none ${className}`}
      dir="ltr"
    >
      <svg
        viewBox="0 0 290 80"
        className="w-auto h-full max-h-full overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={goldColorId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#966c22" />
            <stop offset="35%" stopColor="#b88b38" />
            <stop offset="70%" stopColor="#c59844" />
            <stop offset="100%" stopColor="#825816" />
          </linearGradient>

          <linearGradient id={darkSerifId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#5a391a" />
            <stop offset="100%" stopColor="#6e461f" />
          </linearGradient>
        </defs>

        {/* 1. CALLIGRAPHIC "R" */}
        <g id="Calligraphic-R" transform="translate(6, 4) scale(0.78)">
          <path
            d="M 18 38 C 17 25, 29 20, 42 20 C 58 20, 76 25, 82 37 C 86 46, 80 56, 68 59 C 58 61, 48 57, 44 51 C 42 47, 45 43, 50 43 C 54 43, 56 46, 54 49 C 53 51, 50 52, 48 51"
            stroke={strokeColor}
            strokeWidth="3.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path
            d="M 30 22 C 46 19, 68 20, 80 27 C 88 32, 90 41, 84 49 C 77 56, 67 59, 58 59"
            stroke={strokeColor}
            strokeWidth="4.2"
            strokeLinecap="round"
          />

          <path
            d="M 75 28 C 65 44, 50 63, 40 77 C 33 86, 24 89, 17 87 C 10 84, 8 76, 12 70 C 16 65, 24 64, 29 68 C 32 71, 31 77, 26 79 C 24 80, 21 79, 20 77"
            stroke={strokeColor}
            strokeWidth="5.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path
            d="M 58 59 C 64 64, 72 72, 79 79 C 85 84, 91 85, 94 82 C 98 78, 97 72, 92 69 C 87 66, 80 69, 79 74"
            stroke={strokeColor}
            strokeWidth="4.2"
            strokeLinecap="round"
          />
        </g>

        {/* 2. "ACHID SHOP" in pure deep black */}
        <text
          x="78"
          y="49"
          fill={textColor}
          style={{
            fontFamily: '"Cormorant Garamond", "Cinzel", "Times New Roman", Georgia, serif',
            fontWeight: 600,
            fontSize: '22px',
            letterSpacing: '0.04em',
          }}
        >
          ACHID SHOP
        </text>

        {/* 3. APOSTROPHE & 's' ('s) in pure deep black */}
        <g id="Apostrophe-S" transform="translate(230, 9) scale(0.85)">
          <path
            d="M 12 28 C 10 25, 12 22, 16 21 C 20 20, 23 23, 22 27 C 21 32, 15 37, 13 40 C 12 41, 11 41, 11 39 C 11 38, 12 34, 12 28 Z"
            fill={textColor}
          />

          <path
            d="M 18 56 C 19 50, 22 45, 26 41 C 29 38, 32 37, 33 39 C 34 41, 31 44, 29 47 C 26 51, 28 54, 32 56 C 36 58, 39 62, 36 66 C 33 70, 26 71, 20 68 C 13 64, 10 57, 12 53 C 14 49, 18 48, 20 51 C 21 53, 20 56, 17 57"
            stroke={strokeColor}
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 20 67 C 24 70, 30 71, 34 68 C 38 64, 38 59, 33 55 C 27 51, 26 46, 30 41 C 32 39, 35 39, 37 41"
            stroke={strokeColor}
            strokeWidth="3.2"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
}

export function BrandEmblem({ className = "" }: { className?: string }) {
  return <Logo variant="icon" className={className} />;
}
