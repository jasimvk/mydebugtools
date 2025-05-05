'use client';

import { Suspense, ReactNode } from 'react';

interface SuspenseBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * SuspenseBoundary component to wrap any page that uses useSearchParams
 * to fix the Next.js build warning about missing suspense boundaries
 */
export default function SuspenseBoundary({ children, fallback }: SuspenseBoundaryProps) {
  const defaultFallback = (
    <div className="flex items-center justify-center h-[600px] bg-gray-50 rounded-lg">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="text-gray-600 font-medium">Loading...</p>
      </div>
    </div>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );
} 