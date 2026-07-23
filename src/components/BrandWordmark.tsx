import React from 'react';
import { BrandLogo } from './BrandLogo';

interface BrandWordmarkProps {
  /** 'light' = for light backgrounds (navy text). 'dark' = for dark backgrounds (white text). */
  variant?: 'light' | 'dark';
  /** Show the tagline under the name. */
  showTagline?: boolean;
  className?: string;
  logoClassName?: string;
}

/**
 * The Creative Academy lockup: brand mark + wordmark, with light/dark variants
 * so it sits correctly on both light and dark surfaces.
 */
export const BrandWordmark: React.FC<BrandWordmarkProps> = ({
  variant = 'light',
  showTagline = false,
  className = '',
  logoClassName = 'h-9 w-9',
}) => {
  const nameColor = variant === 'dark' ? 'text-white' : 'text-[#0B1F3A]';
  const taglineColor = variant === 'dark' ? 'text-[#FACC15]' : 'text-[#2563EB]';

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <BrandLogo className={logoClassName} />
      <span className="text-left leading-none">
        <span className={`block font-serif font-extrabold tracking-tight ${nameColor}`}>
          The Creative Academy
        </span>
        {showTagline && (
          <span className={`block text-[9px] font-mono font-bold uppercase tracking-[0.16em] mt-1 ${taglineColor}`}>
            We don&apos;t compete — we create new markets
          </span>
        )}
      </span>
    </span>
  );
};
