'use client';

import { redirect } from 'next/navigation';

export default function ToolsContent() {
  redirect('/tools/json');
  return null; // This line will never be reached due to redirect
} 