import type { Metadata } from 'next';
import Link from 'next/link';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Changelog | DebugTools',
  description: 'A compact implementation log of shipped DebugTools changes across tools, API Workbench imports, documentation, typography, and roadmap cleanup.',
  path: '/changelog/',
  keywords: ['debugtools changelog', 'developer tools changelog', 'shipped changes', 'open source project log'],
});

const entries = [
  ['Tool quality sweep', 'Included API Workbench in the home and all-tools grids, enabled the tools rail, hardened API Workbench storage/codegen/cache paths, added JSON repair, improved Base64 text handling, and self-hosted the SQLite WASM asset.'],
  ['Workspace direction', 'Added a Workspaces page and roadmap entry for local, self-hosted, and hosted team layers with a clear role and database model.'],
  ['OSS bookkeeping polish', 'Refreshed README, CONTRIBUTING, SECURITY, changelog, releases, and roadmap copy for a practical open-source project surface.'],
  ['API Workbench import fixes', 'Native debugtools exports and nested Postman collections import without empty undefined collections.'],
  ['Typography and header polish', 'Recent site work moved the public shell toward a compact Menlo-friendly OSS interface.'],
  ['Local-first positioning', 'Docs now state which tools run in the browser and how API Workbench network requests differ from local-only modules.'],
  ['Roadmap cleanup', 'The roadmap now tracks the current modules first, then CLI extraction and deeper API workflows.'],
];

export default function ChangelogPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 text-[#09090b] sm:px-6">
      <p className="font-mono text-xs text-[#71717a]">debugtools / changelog</p>
      <h1 className="mt-2 text-3xl font-semibold">Changelog</h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-[#71717a]">
        A compact implementation log for shipped improvements. The full file lives at GitHub; release summaries live on the releases page.
      </p>
      <div className="mt-8 divide-y divide-[#e4e4e7] rounded-md border border-[#e4e4e7] bg-white">
        {entries.map(([title, text]) => (
          <article key={title} className="p-5">
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-[#71717a]">{text}</p>
          </article>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-4 text-sm font-semibold">
        <Link href="/releases" className="text-[#2563eb]">View releases</Link>
        <a href="https://github.com/jasimvkarim/mydebugtools/blob/main/CHANGELOG.md" className="text-[#2563eb]">Read CHANGELOG.md</a>
      </div>
    </main>
  );
}
