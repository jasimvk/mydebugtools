import type { Metadata } from 'next';
import Link from 'next/link';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Architecture Notes | DebugTools',
  description: 'How DebugTools is structured: local-first browser tool modules, the network-capable API workbench, persistence layers, and the open-source project shell.',
  path: '/architecture/',
  keywords: ['debugtools architecture', 'local first web app', 'browser tool architecture', 'next.js project structure'],
});

const layers = [
  ['Browser tools', 'Local-first utilities for formatting, decoding, editing, diffing, and inspection.'],
  ['API workbench', 'Network-capable API testing with explicit browser CORS constraints, private mode, and optional Cloud Sync.'],
  ['Persistence', 'LocalStorage for local workspaces and authenticated API routes for synced collections.'],
  ['Project shell', 'Navigation, roadmap, releases, answers, and docs surfaces that make the project inspectable.'],
];

export default function ArchitecturePage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 text-[#09090b] sm:px-6">
      <p className="font-mono text-xs text-[#71717a]">debugtools / architecture</p>
      <h1 className="mt-2 text-3xl font-semibold">Architecture notes</h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-[#71717a]">
        debugtools is structured as a set of focused browser modules wrapped in an open-source project shell. The default boundary is local execution; network and cloud behavior is called out when a tool needs it.
      </p>
      <div className="mt-8 grid gap-3">
        {layers.map(([title, text]) => (
          <section key={title} className="rounded-md border border-[#e4e4e7] bg-white p-5">
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-[#71717a]">{text}</p>
          </section>
        ))}
      </div>
      <div className="mt-8 rounded-md border border-[#e4e4e7] bg-[#fafafa] p-5">
        <h2 className="text-lg font-semibold">Next architecture work</h2>
        <p className="mt-2 text-sm leading-6 text-[#71717a]">
          The next milestone is separating shared tool primitives, request persistence, and module metadata so each tool can be tested and documented independently.
        </p>
        <Link href="/roadmap" className="mt-4 inline-flex text-sm font-semibold text-[#2563eb]">View roadmap</Link>
      </div>
    </main>
  );
}
