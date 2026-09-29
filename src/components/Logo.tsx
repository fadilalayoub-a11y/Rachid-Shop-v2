import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'wordmark' | 'full' | 'stacked' | 'horizontal' | 'icon';
  color?: 'black' | 'gold' | 'white';
}

/**
 * Calligraphic 'R' Brandmark SVG
 * The iconic ornate luxury monogram
 */
function CalligraphicR({ 
  color = '#111111', 
  className = "h-8 sm:h-9 md:h-10 w-auto" 
}: { 
  color?: string; 
  className?: string; 
}) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={className}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g transform="translate(5, 5) scale(0.95)">
        {/* Top curve and loop */}
        <path
          d="M 14 42 C 14 26, 26 21, 38 21 C 56 21, 74 25, 80 38 C 84 48, 77 58, 64 61 C 55 63, 44 59, 41 53 C 39 49, 42 45, 47 45 C 51 45, 53 48, 51 51 C 50 53, 47 54, 45 53"
          stroke={color}
          strokeWidth="3.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Smooth arched crest */}
        <path
          d="M 28 23 C 44 20, 65 21, 76 28 C 84 33, 86 42, 80 50 C 73 57, 63 60, 54 60"
          stroke={color}
          strokeWidth="4.6"
          strokeLinecap="round"
        />
        {/* Stem sweeping diagonally into bottom-left loop */}
        <path
          d="M 72 30 C 62 45, 48 64, 38 78 C 31 87, 22 90, 15 88 C 8 85, 6 77, 10 71 C 14 66, 22 65, 27 69 C 30 72, 29 78, 24 80 C 22 81, 19 80, 18 78"
          stroke={color}
          strokeWidth="5.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Right foot sweeping smoothly towards baseline */}
        <path
          d="M 54 60 C 60 65, 68 73, 75 80 C 81 85, 87 86, 90 83 C 94 79, 93 73, 88 70 C 83 67, 76 70, 75 75"
          stroke={color}
          strokeWidth="4.4"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

/**
 * RACHID SHOP - Restored Signature Logo
 * Calligraphic embellished 'R' monogram followed by 'ACHID SHOP' in luxury serif styling
 */
export function Logo({ 
  className = "", 
  variant = 'wordmark',
  color = 'black'
}: LogoProps) {
  const isBlack = color === 'black';
  const isWhite = color === 'white';
  const textColor = isBlack ? '#111111' : isWhite ? '#ffffff' : '#966c22';

  // ICON ONLY (The ornate calligraphic letter 'R')
  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center select-none ${className}`} dir="ltr">
        <CalligraphicR color={textColor} className="h-7 w-auto" />
      </div>
    );
  }

  // SIGNATURE BRAND LOGO: [Calligraphic R] + [ACHID SHOP]
  const hasCustomHeight = className.includes('h-');
  const iconClass = hasCustomHeight 
    ? "h-full w-auto flex-shrink-0 -me-1" 
    : "h-6.5 sm:h-7.5 md:h-8 w-auto flex-shrink-0 -me-1";

  return (
    <div 
      className={`inline-flex items-center select-none ${className}`}
      dir="ltr"
      aria-label="RACHID SHOP"
    >
      <CalligraphicR color={textColor} className={iconClass} />
      
      <span 
        className="text-sm sm:text-[15px] md:text-[17px] font-bold uppercase tracking-[0.13em] leading-none transition-colors"
        style={{
          fontFamily: '"Cinzel", "Cormorant Garamond", "Playfair Display", "Times New Roman", serif',
          fontWeight: 700,
          color: textColor,
        }}
      >
        ACHID SHOP
      </span>
    </div>
  );
}

