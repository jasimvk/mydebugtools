import { ImageResponse } from 'next/og';

export const size = {
  width: 32,
  height: 32,
};

export const contentType = 'image/svg+xml';

export default function Icon() {
  return new ImageResponse(
    (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6C37" />
            <stop offset="100%" stopColor="#ff5722" />
          </linearGradient>
        </defs>
        {/* Background */}
        <rect width="32" height="32" rx="6" fill="url(#grad)" />
        
        {/* Terminal window style */}
        <g transform="translate(5, 6)">
          {/* Top bar */}
          <line x1="0" y1="0" x2="22" y2="0" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
          
          {/* Cursor prompt $ */}
          <path d="M 2 4 L 2 6 M 3 5 L 4 5" stroke="white" strokeWidth="0.8" fill="none" strokeLinecap="round" />
          
          {/* Dash lines representing code */}
          <line x1="6" y1="4.5" x2="12" y2="4.5" stroke="rgba(255,255,255,0.8)" strokeWidth="0.6" />
          <line x1="6" y1="9" x2="15" y2="9" stroke="rgba(255,255,255,0.6)" strokeWidth="0.5" />
          <line x1="6" y1="11" x2="10" y2="11" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
        </g>
      </svg>
    ),
    size
  );
}
