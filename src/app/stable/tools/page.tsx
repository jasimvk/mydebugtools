import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Stable Tools | DebugTools',
  description: 'Legacy staging surface for stable DebugTools utilities. This is not a published catalog; the maintained tool registry lives on the all-tools page.',
  path: '/stable/tools/',
  noindex: true,
});

export default function StableToolsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Stable Tools</h1>
      {/* Your stable tools content will be rendered here */}
    </div>
  );
} 