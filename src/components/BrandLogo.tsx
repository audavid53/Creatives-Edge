import React from 'react';

interface BrandLogoProps {
  className?: string;
}

/**
 * The Creative Edge brand mark — a forward-leaning double chevron in the
 * Solaa blue family, suggesting momentum and an "edge".
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({ className = 'h-8 w-8' }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="The Creative Edge"
    role="img"
  >
    <defs>
      <linearGradient id="ce-brand-grad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
        <stop stopColor="#2563EB" />
        <stop offset="1" stopColor="#1D4ED8" />
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="44" height="44" rx="13" fill="url(#ce-brand-grad)" />
    <path
      d="M15 14 L27 24 L15 34"
      stroke="#FFFFFF"
      strokeWidth="4.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M25 14 L37 24 L25 34"
      stroke="#BFD4FB"
      strokeWidth="4.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
