import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'New Tools (Test Version) | DebugTools',
  description: 'Internal preview surface for DebugTools features still under test. This is not a published tool listing; the live registry lives on the all-tools page.',
  path: '/new/tools/',
  noindex: true,
});

export default function NewToolsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">New Tools (Test Version)</h1>
      {/* Your new tools content will be rendered here */}
    </div>
  );
} 