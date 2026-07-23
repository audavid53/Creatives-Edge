import React, { useMemo } from 'react';
import { motion } from 'motion/react';

interface ConfettiProps {
  /** Number of pieces to launch. */
  count?: number;
  /** Fire once (default) or leave running. */
  duration?: number;
}

const COLORS = ['#2563EB', '#FACC15', '#1D4ED8', '#0B1F3A', '#EAB308', '#93B4F5'];

/**
 * Lightweight, dependency-free celebration confetti. Pieces fall from the top
 * with a little horizontal drift and spin, then fade. Purely decorative.
 */
export const Confetti: React.FC<ConfettiProps> = ({ count = 60, duration = 2.8 }) => {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        drift: (Math.random() - 0.5) * 160,
        rotate: Math.random() * 720 - 360,
        size: 6 + Math.random() * 8,
        color: COLORS[i % COLORS.length],
        rounded: Math.random() > 0.5,
        dur: duration + Math.random() * 1.2,
      })),
    [count, duration],
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ y: '-10vh', x: 0, opacity: 1, rotate: 0 }}
          animate={{ y: '110vh', x: p.drift, opacity: [1, 1, 0], rotate: p.rotate }}
          transition={{ duration: p.dur, delay: p.delay, ease: 'easeIn' }}
          style={{
            position: 'absolute',
            top: 0,
            left: `${p.left}%`,
            width: p.size,
            height: p.size * (p.rounded ? 1 : 1.6),
            backgroundColor: p.color,
            borderRadius: p.rounded ? '9999px' : '2px',
          }}
        />
      ))}
    </div>
  );
};
