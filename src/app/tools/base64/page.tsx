import { Suspense } from 'react';
import Base64Content from './Base64Content';

export default function Base64() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-[600px] bg-gray-50 rounded-lg"><div className="flex flex-col items-center gap-3"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div><p className="text-gray-600 font-medium">Loading Base64 Tool...</p></div></div>}>
      <Base64Content />
    </Suspense>
  );
} 