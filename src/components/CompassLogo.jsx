import React from 'react';

export default function CompassLogo({ size = 22, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" className={className}>
      <circle cx="22" cy="22" r="20" fill="none" stroke="var(--foreground)" strokeWidth="2" />
      <circle cx="22" cy="22" r="1.5" fill="var(--accent)" />
      <polygon points="22,10 26,22 22,34 18,22" fill="var(--accent)" />
      <polygon points="10,22 22,18 34,22 22,26" fill="var(--foreground)" />
    </svg>
  );
}
