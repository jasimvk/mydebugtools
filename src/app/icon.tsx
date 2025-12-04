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
        <rect width="32" height="32" rx="6" fill="url(#grad)" />
        <g transform="translate(4, 5)">
          <line x1="0" y1="1" x2="3" y2="1" stroke="white" strokeWidth="0.8" />
          <text
            x="0"
            y="6"
            fontSize="3"
            fontFamily="monospace"
            fill="white"
            letterSpacing="0.3"
          >
            $
          </text>
          <text x="3" y="6" fontSize="3" fontFamily="monospace" fill="white">
            debug
          </text>
          <text
            x="0"
            y="12"
            fontSize="3"
            fontFamily="monospace"
            fill="white"
            letterSpacing="0.3"
          >
            {'>'}
          </text>
          <text x="3" y="12" fontSize="2.5" fontFamily="monospace" fill="rgba(255,255,255,0.7)">
            ...
          </text>
        </g>
      </svg>
    ),
    size
  );
}
