import React, { useState } from 'react';
import { ImageIcon } from 'lucide-react';

interface SmartImageProps {
  src?: string;
  alt: string;
  /** Short label shown inside the placeholder when the image is missing. */
  placeholderLabel?: string;
  className?: string;
  imgClassName?: string;
}

/**
 * Renders an image, falling back to a branded placeholder tile if the file is
 * missing or fails to load. Lets the marketing page ship before the real
 * convener / mentor / student photos are dropped into `public/brand/`.
 */
export const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt,
  placeholderLabel,
  className = '',
  imgClassName = 'w-full h-full object-cover',
}) => {
  const [failed, setFailed] = useState(!src);

  if (failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#EFF5FE] to-[#DCE9FB] text-[#2563EB] ${className}`}
        aria-label={alt}
        role="img"
      >
        <ImageIcon size={26} className="opacity-60" />
        {placeholderLabel && (
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#2563EB]/70 px-3 text-center leading-tight">
            {placeholderLabel}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`overflow-hidden ${className}`}>
      <img
        src={src}
        alt={alt}
        className={imgClassName}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
      />
    </div>
  );
};
