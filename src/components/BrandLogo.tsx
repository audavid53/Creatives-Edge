import React from 'react';

interface BrandLogoProps {
  className?: string;
}

/**
 * The Creative Academy brand mark — a rounded badge in the brand blue with a
 * yellow "spark of a new market" rising out of an open book / upward path.
 *
 * This is a placeholder mark in the blue + yellow brand palette. To use the
 * real logo, drop your file into `public/brand/` (see public/brand/README.md)
 * — the favicon and marketing hero read from there, and this component can be
 * swapped for an <img src="/brand/logo-icon.svg" /> if you prefer the raster art.
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({ className = 'h-8 w-8' }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="The Creative Academy"
    role="img"
  >
    <defs>
      <linearGradient id="ca-brand-grad" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
        <stop stopColor="#2563EB" />
        <stop offset="1" stopColor="#1D4ED8" />
      </linearGradient>
    </defs>
    {/* Rounded badge */}
    <rect x="2" y="2" width="44" height="44" rx="13" fill="url(#ca-brand-grad)" />
    {/* Upward path — the new market you create */}
    <path
      d="M12 33 L21 24 L27 29 L36 17"
      stroke="#FFFFFF"
      strokeWidth="3.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Yellow spark / new-market star */}
    <path
      d="M35.5 12.5 L37 16 L40.5 17.5 L37 19 L35.5 22.5 L34 19 L30.5 17.5 L34 16 Z"
      fill="#FACC15"
    />
    {/* Grounding dots — the crowded market left behind */}
    <circle cx="12" cy="33" r="2.4" fill="#FACC15" />
  </svg>
);
