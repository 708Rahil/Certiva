'use client';

import { useEffect, useState } from 'react';

interface ScoreRingProps {
  score: number;
  size?: number;
}

export default function ScoreRing({ score, size = 72 }: ScoreRingProps) {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Start with full offset (empty circle) so it can animate in
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    // Small delay ensures the initial empty state is rendered before animating to the target
    const targetOffset = circumference - (score / 100) * circumference;
    const timeout = setTimeout(() => {
      setOffset(targetOffset);
    }, 50);
    return () => clearTimeout(timeout);
  }, [score, circumference]);

  const color = score >= 70 ? '#34d399' : score >= 45 ? '#fbbf24' : '#4f6ef7';

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={5}
        />
        {/* Score arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 0,
      }}>
        <span style={{
          fontSize: size < 64 ? 13 : 16,
          fontWeight: 700,
          color,
          lineHeight: 1,
          letterSpacing: '-0.5px',
        }}>{score}</span>
        <span style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 500 }}>SCORE</span>
      </div>
    </div>
  );
}
