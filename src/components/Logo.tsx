import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'wordmark' | 'full' | 'stacked' | 'horizontal' | 'icon';
  color?: 'black' | 'gold' | 'white';
}

/**
 * RACHID SHOP - Premium Wordmark Typography Logo
 * Matches the sleek typography with the calligraphic apostrophe & 's'
 * in pure black (#111111) for modern luxury ecommerce branding.
 */
export function Logo({ 
  className = "", 
  variant = 'wordmark',
  color = 'black'
}: LogoProps) {
  const isBlack = color === 'black';
  const isWhite = color === 'white';
  const textColor = isBlack ? '#111111' : isWhite ? '#ffffff' : '#966c22';

  // ICON ONLY (The elegant letter 'R')
  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center select-none ${className}`} dir="ltr">
        <span 
          style={{
            fontFamily: '"Cinzel", "Cormorant Garamond", "Times New Roman", serif',
            fontWeight: 700,
            fontSize: '1.75rem',
            lineHeight: 1,
            color: textColor,
            letterSpacing: '0.05em'
          }}
        >
          R
        </span>
      </div>
    );
  }

  // PURE TEXT TYPOGRAPHY LOGO (WORDMARK)
  // "RACHID SHOP'S" in the exact high-fashion serif styling
  return (
    <div 
      className={`inline-flex items-center select-none ${className}`}
      dir="ltr"
    >
      <div className="flex items-baseline tracking-[0.14em] font-serif leading-none">
        {/* Main Brand Name */}
        <span 
          className="text-lg sm:text-xl md:text-2xl font-bold uppercase transition-colors"
          style={{
            fontFamily: '"Cinzel", "Cormorant Garamond", "Playfair Display", "Times New Roman", Georgia, serif',
            fontWeight: 800,
            letterSpacing: '0.14em',
            color: textColor,
          }}
        >
          RACHID SHOP
        </span>

        {/* Calligraphic 's flourish */}
        <span 
          className="text-sm sm:text-base md:text-lg font-normal italic ms-0.5 -translate-y-1 inline-block"
          style={{
            fontFamily: '"Cormorant Garamond", "Alex Brush", "Italianno", cursive, serif',
            fontWeight: 600,
            color: textColor,
          }}
        >
          ’s
        </span>
      </div>
    </div>
  );
}
