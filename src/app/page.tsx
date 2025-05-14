'use client';

import { useState, Suspense } from 'react';
import { redirect } from 'next/navigation';

function HomeContent() {
  redirect('/tools/json');
  return null; // This line will never be reached due to redirect
}

export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <Suspense fallback={
        <div className="flex items-center justify-center h-[600px] bg-gray-50 rounded-lg">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="text-gray-600 font-medium">Loading Home Page...</p>
          </div>
        </div>
      }>
        <HomeContent />
      </Suspense>
    </div>
  );
}
