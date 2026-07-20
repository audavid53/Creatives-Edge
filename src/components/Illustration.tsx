import React from 'react';

interface IllustrationProps {
  type: 'baker' | 'tailor' | 'seed' | 'compass' | 'hourglass' | 'bridge' | 'mirror' | 'scale';
  className?: string;
  size?: number;
}

export const Illustration: React.FC<IllustrationProps> = ({ type, className = '', size = 160 }) => {
  const baseSvgProps = {
    width: size,
    height: size,
    viewBox: "0 0 200 200",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className: `transition-all duration-500 ${className}`,
    id: `illustration-${type}`
  };

  switch (type) {
    case 'baker':
      return (
        <svg {...baseSvgProps}>
          {/* Background warm soft circle */}
          <circle cx="100" cy="100" r="80" fill="#FAF3E6" stroke="#F1E3CD" strokeWidth="2" />
          {/* Table surface */}
          <line x1="30" y1="140" x2="170" y2="140" stroke="#1C1917" strokeWidth="4" strokeLinecap="round" />
          {/* Bread loaf/sourdough basket */}
          <path d="M60 140 C60 100, 140 100, 140 140 Z" fill="#FAF6F0" stroke="#C85A32" strokeWidth="4" strokeLinejoin="round" />
          {/* Flour dusting and score marks */}
          <path d="M85 115 Q100 105 115 115" stroke="#D4A373" strokeWidth="3" strokeLinecap="round" />
          <path d="M75 125 Q100 115 125 125" stroke="#D4A373" strokeWidth="3" strokeLinecap="round" />
          {/* Rolling pin */}
          <rect x="50" y="70" width="100" height="12" rx="6" fill="#D4A373" stroke="#1C1917" strokeWidth="3" />
          <rect x="40" y="73" width="10" height="6" rx="2" fill="#C85A32" stroke="#1C1917" strokeWidth="2" />
          <rect x="150" y="73" width="10" height="6" rx="2" fill="#C85A32" stroke="#1C1917" strokeWidth="2" />
          {/* Hands symbol (baking wheat stalk) */}
          <path d="M100 35 V60" stroke="#1C1917" strokeWidth="3" strokeLinecap="round" />
          <path d="M100 40 Q110 35 115 42" stroke="#C85A32" strokeWidth="3" strokeLinecap="round" />
          <path d="M100 48 Q110 43 115 50" stroke="#C85A32" strokeWidth="3" strokeLinecap="round" />
          <path d="M100 40 Q90 35 85 42" stroke="#C85A32" strokeWidth="3" strokeLinecap="round" />
          <path d="M100 48 Q90 43 85 50" stroke="#C85A32" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );

    case 'tailor':
      return (
        <svg {...baseSvgProps}>
          <circle cx="100" cy="100" r="80" fill="#F4EFEA" stroke="#E9DFD5" strokeWidth="2" />
          {/* Measuring tape loop */}
          <path d="M40 140 C40 80, 160 80, 160 140" stroke="#D4A373" strokeWidth="4" strokeLinecap="round" strokeDasharray="2 6" />
          {/* Scissors */}
          <g transform="translate(100, 100) rotate(-45) translate(-100, -100)">
            {/* Shear Blade 1 */}
            <path d="M100 100 L160 110 L100 120 Z" fill="#FAF6F0" stroke="#1C1917" strokeWidth="3" strokeLinejoin="round" />
            {/* Shear Blade 2 */}
            <path d="M100 100 L160 90 L100 80 Z" fill="#FAF6F0" stroke="#1C1917" strokeWidth="3" strokeLinejoin="round" />
            {/* Handles */}
            <circle cx="70" cy="85" r="16" fill="none" stroke="#C85A32" strokeWidth="4" />
            <circle cx="70" cy="115" r="16" fill="none" stroke="#C85A32" strokeWidth="4" />
            <line x1="86" y1="90" x2="100" y2="100" stroke="#1C1917" strokeWidth="3" />
            <line x1="86" y1="110" x2="100" y2="100" stroke="#1C1917" strokeWidth="3" />
            {/* Pivot screw */}
            <circle cx="100" cy="100" r="4" fill="#1C1917" />
          </g>
          {/* Needle */}
          <line x1="35" y1="65" x2="85" y2="115" stroke="#1C1917" strokeWidth="3" strokeLinecap="round" />
          {/* Eye of the needle */}
          <ellipse cx="40" cy="70" rx="3" ry="1" transform="rotate(45, 40, 70)" fill="#FAF6F0" stroke="#1C1917" strokeWidth="1" />
          {/* Thread through eye */}
          <path d="M25 55 Q35 70 50 65 T90 50" fill="none" stroke="#C85A32" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );

    case 'seed':
      return (
        <svg {...baseSvgProps}>
          <circle cx="100" cy="100" r="80" fill="#EBF4EB" stroke="#D7EAD7" strokeWidth="2" />
          {/* Earth ground mound */}
          <path d="M40 150 Q100 130 160 150" stroke="#1C1917" strokeWidth="4" strokeLinecap="round" fill="none" />
          {/* Seed pod under ground */}
          <ellipse cx="100" cy="155" rx="14" ry="8" fill="#D4A373" stroke="#1C1917" strokeWidth="3" />
          {/* Sprout Stem */}
          <path d="M100 150 Q100 95 125 65" fill="none" stroke="#1C1917" strokeWidth="4" strokeLinecap="round" />
          {/* Leaf 1 */}
          <path d="M110 105 C125 95, 140 105, 125 120 C115 120, 110 115, 110 105 Z" fill="#C85A32" stroke="#1C1917" strokeWidth="3" strokeLinejoin="round" />
          {/* Leaf 2 (top leaf) */}
          <path d="M125 65 C135 50, 125 35, 110 45 C110 55, 115 65, 125 65 Z" fill="#5F8D5F" stroke="#1C1917" strokeWidth="3" strokeLinejoin="round" />
          {/* Sunrise/Growth Rays in background */}
          <path d="M70 50 L60 40" stroke="#D4A373" strokeWidth="3" strokeLinecap="round" />
          <path d="M100 35 L100 20" stroke="#D4A373" strokeWidth="3" strokeLinecap="round" />
          <path d="M130 50 L140 40" stroke="#D4A373" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );

    case 'compass':
      return (
        <svg {...baseSvgProps}>
          <circle cx="100" cy="100" r="80" fill="#FAF4EB" stroke="#F1E3CE" strokeWidth="2" />
          {/* Outer Ring dial */}
          <circle cx="100" cy="100" r="64" fill="none" stroke="#1C1917" strokeWidth="4" />
          <circle cx="100" cy="100" r="56" fill="none" stroke="#D4A373" strokeWidth="2" strokeDasharray="3 6" />
          {/* Compass Rose direction ticks */}
          <line x1="100" y1="36" x2="100" y2="44" stroke="#1C1917" strokeWidth="3" />
          <line x1="100" y1="156" x2="100" y2="164" stroke="#1C1917" strokeWidth="3" />
          <line x1="36" y1="100" x2="44" y2="100" stroke="#1C1917" strokeWidth="3" />
          <line x1="156" y1="100" x2="164" y2="100" stroke="#1C1917" strokeWidth="3" />
          {/* North Label */}
          <text x="100" y="32" fontFamily="sans-serif" fontSize="12" fontWeight="bold" fill="#C85A32" textAnchor="middle">N</text>
          {/* Needle pivot */}
          <circle cx="100" cy="100" r="8" fill="#FAF6F0" stroke="#1C1917" strokeWidth="3" z="10" />
          {/* Needle Red (North) */}
          <path d="M100 100 L110 95 L100 55 L90 95 Z" fill="#C85A32" stroke="#1C1917" strokeWidth="3" strokeLinejoin="round" />
          {/* Needle Dark (South) */}
          <path d="M100 100 L110 105 L100 145 L90 105 Z" fill="#FAF6F0" stroke="#1C1917" strokeWidth="3" strokeLinejoin="round" />
        </svg>
      );

    case 'hourglass':
      return (
        <svg {...baseSvgProps}>
          <circle cx="100" cy="100" r="80" fill="#FAF8F5" stroke="#ECE5DC" strokeWidth="2" />
          {/* Glass shape */}
          <path d="M65 50 H135 L115 95 Q100 100 115 105 L135 150 H65 L85 105 Q100 100 85 95 Z" fill="#FAF6F0" stroke="#1C1917" strokeWidth="4" strokeLinejoin="round" />
          {/* Sand top pile */}
          <path d="M72 60 Q100 100 128 60 Z" fill="#D4A373" stroke="#D4A373" strokeWidth="2" />
          {/* Sand bottom pile */}
          <path d="M72 140 Q100 105 128 140 Z" fill="#D4A373" stroke="#1C1917" strokeWidth="3" strokeLinejoin="round" />
          {/* Sand pouring stream */}
          <line x1="100" y1="90" x2="100" y2="135" stroke="#C85A32" strokeWidth="3" strokeDasharray="3 4" strokeLinecap="round" />
          {/* Top/Bottom Wooden Supports */}
          <rect x="55" y="40" width="90" height="10" rx="3" fill="#C85A32" stroke="#1C1917" strokeWidth="3" />
          <rect x="55" y="150" width="90" height="10" rx="3" fill="#C85A32" stroke="#1C1917" strokeWidth="3" />
        </svg>
      );

    case 'bridge':
      return (
        <svg {...baseSvgProps}>
          <circle cx="100" cy="100" r="80" fill="#EDF3F7" stroke="#DBE5EC" strokeWidth="2" />
          {/* River / Water below */}
          <path d="M30 145 C60 135 80 155 110 145 C140 135 160 155 170 145" stroke="#D4A373" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M30 158 C60 148 80 168 110 158 C140 148 160 168 170 158" stroke="#D4A373" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* Bridge Arch */}
          <path d="M40 130 Q100 85 160 130" fill="none" stroke="#1C1917" strokeWidth="5" strokeLinecap="round" />
          {/* Bridge Pathway */}
          <path d="M35 122 Q100 78 165 122" fill="none" stroke="#C85A32" strokeWidth="4" strokeLinecap="round" />
          {/* Vertical Pillars/Suspension lines */}
          <line x1="70" y1="113" x2="70" y2="128" stroke="#1C1917" strokeWidth="3" />
          <line x1="100" y1="100" x2="100" y2="118" stroke="#1C1917" strokeWidth="3" />
          <line x1="130" y1="113" x2="130" y2="128" stroke="#1C1917" strokeWidth="3" />
          {/* Sun in distance */}
          <circle cx="100" cy="65" r="14" fill="#FAF6F0" stroke="#C85A32" strokeWidth="3" />
        </svg>
      );

    case 'mirror':
      return (
        <svg {...baseSvgProps}>
          <circle cx="100" cy="100" r="80" fill="#FBF3FA" stroke="#F4E2F2" strokeWidth="2" />
          {/* Handle */}
          <rect x="94" y="130" width="12" height="40" rx="6" fill="#C85A32" stroke="#1C1917" strokeWidth="3" />
          <circle cx="100" cy="160" r="4" fill="#FAF6F0" stroke="#1C1917" strokeWidth="2" />
          {/* Mirror Frame */}
          <circle cx="100" cy="85" r="45" fill="#FAF6F0" stroke="#1C1917" strokeWidth="4" />
          {/* Mirror Glass Reflection Accent */}
          <path d="M70 70 A 35 35 0 0 1 125 65 Z" fill="#F4E2F2" opacity="0.6" />
          {/* Sparkle/Insights Symbol inside mirror */}
          <path d="M100 65 L103 77 L115 80 L103 83 L100 95 L97 83 L85 80 L97 77 Z" fill="#D4A373" stroke="#1C1917" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      );

    case 'scale':
      return (
        <svg {...baseSvgProps}>
          <circle cx="100" cy="100" r="80" fill="#FAF9EB" stroke="#F1F0CC" strokeWidth="2" />
          {/* Center Pillar */}
          <line x1="100" y1="50" x2="100" y2="150" stroke="#1C1917" strokeWidth="4" strokeLinecap="round" />
          <rect x="80" y="145" width="40" height="10" rx="3" fill="#C85A32" stroke="#1C1917" strokeWidth="3" />
          <circle cx="100" cy="50" r="8" fill="#C85A32" stroke="#1C1917" strokeWidth="3" />
          {/* Balance beam */}
          <line x1="50" y1="70" x2="150" y2="70" stroke="#1C1917" strokeWidth="4" strokeLinecap="round" />
          {/* Left string & pan */}
          <line x1="50" y1="70" x2="50" y2="110" stroke="#D4A373" strokeWidth="2" />
          <path d="M35 110 H65 L50 120 Z" fill="#FAF6F0" stroke="#1C1917" strokeWidth="3" strokeLinejoin="round" />
          {/* Right string & pan (tilted slightly representing balance of leverage) */}
          <line x1="150" y1="70" x2="150" y2="110" stroke="#D4A373" strokeWidth="2" />
          <path d="M135 110 H165 L150 120 Z" fill="#FAF6F0" stroke="#1C1917" strokeWidth="3" strokeLinejoin="round" />
          {/* Weight on right pan (asset leverage) */}
          <rect x="145" y="100" width="10" height="10" rx="2" fill="#C85A32" stroke="#1C1917" strokeWidth="2" />
        </svg>
      );

    default:
      return null;
  }
};
