'use client';

import { ReactNode } from 'react';
import { Suspense } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-[200px]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      {children}
    </Suspense>
  );
} 