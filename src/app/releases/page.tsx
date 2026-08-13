'use client';

import Navigation from '../components/Navigation';

const releases = [
  {
    version: '2026-05-20',
    title: 'Tool Quality Sweep',
    status: 'latest',
    summary: 'Product pass across discovery, API Workbench correctness, Base64, JSON, UUID, and SQLite reliability.',
    changes: [
      'Included API Workbench in the landing-page and all-tools catalogs.',
      'Enabled the tool rail across tool pages for faster cross-tool navigation.',
      'Hardened API Workbench private-mode storage, request code generation, CORS fallback cURL output, and response caching rules.',
      'Added JSON repair and Unicode-safe Base64 text encode/decode.',
      'Self-hosted the SQLite WASM asset for the database query tool.',
    ],
  },
  {
    version: '2026-05-18',
    title: 'Workspace Direction',
    status: 'stable',
    summary: 'Added the team and workspace product path without adding enterprise clutter to the tools.',
    changes: [
      'Added a Workspaces page for local, self-hosted, and hosted team layers.',
      'Documented Owner, Admin, Developer, and Viewer roles.',
      'Added database direction for organizations, workspaces, members, projects, collections, and debug reports.',
      'Linked Workspaces from the Project menu and roadmap.',
    ],
  },
  {
    version: '2026-05-16',
    title: 'OSS Bookkeeping Polish',
    status: 'stable',
    summary: 'Concise project metadata for contributors: README, security, contributing, changelog, releases, and roadmap surfaces.',
    changes: [
      'Documented debugtools as a local-first open-source workbench.',
      'Added practical contribution and security guidance.',
      'Updated roadmap copy around API Workbench, shipped modules, CLI, and deeper API workflows.',
      'Kept canonical project links for debugtools.org and jasimvkarim/mydebugtools.',
    ],
  },
  {
    version: '2026-05-11',
    title: 'OSS Project Refresh',
    status: 'stable',
    summary: 'Repository-style site polish, API Workbench import fixes, typography/header cleanup, and a visible module backlog.',
    changes: [
      'Fixed native debugtools and nested Postman collection imports.',
      'Polished typography and shared header direction for a monospace OSS shell.',
      'Positioned debugtools around local-first browser tools.',
      'Added release, changelog, CLI, and roadmap pages.',
    ],
  },
  {
    version: '1.5.0',
    title: 'Database Query Tool',
    status: 'stable',
    summary: 'SQLite query workspace with quick queries, CSV export, and local inspection flows.',
    changes: ['Added SQLite upload workflow.', 'Added query execution and result views.', 'Added CSV download support.'],
  },
  {
    version: '1.4.0',
    title: 'Tool Expansion',
    status: 'stable',
    summary: 'Regex, HTML, CSS, Markdown, Color, and Code Diff tools joined the toolkit.',
    changes: ['Expanded the public tool catalog.', 'Improved JSON layout and navigation.', 'Added more debugging workflows.'],
  },
  {
    version: '1.3.0',
    title: 'Base64 Converter',
    status: 'stable',
    summary: 'Image and PDF conversion support for Base64 workflows.',
    changes: ['Added image conversion.', 'Added PDF conversion.', 'Improved file handling states.'],
  },
  {
    version: '1.2.0',
    title: 'API Workbench',
    status: 'stable',
    summary: 'Authentication, response handling, and collection workflows for API debugging.',
    changes: ['Improved REST request handling.', 'Added auth and response tooling.', 'Expanded collection UX.'],
  },
];

function badgeClass(status: string) {
  if (status === 'latest') return 'border-[#1a7f37] bg-[#dafbe1] text-[#1a7f37]';
  return 'border-[#e4e4e7] bg-[#fafafa] text-[#71717a]';
}

export default function ReleasesPage() {
  return (
    <main className="min-h-screen bg-[#fafafa] text-[#09090b]">
      <Navigation />
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="rounded-md border border-[#e4e4e7] bg-white">
          <div className="border-b border-[#e4e4e7] px-5 py-4">
            <p className="font-mono text-xs text-[#71717a]">RELEASES.md</p>
            <h1 className="mt-2 text-3xl font-semibold text-[#09090b]">Releases</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#71717a]">
              Human-readable release notes for users and contributors. Detailed implementation history stays in the changelog.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href="https://github.com/jasimvkarim/mydebugtools/releases"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md bg-[#09090b] px-3 py-2 text-sm font-semibold text-white hover:bg-[#32383f] hover:text-white"
              >
                GitHub releases
              </a>
              <a
                href="https://github.com/jasimvkarim/mydebugtools/blob/main/CHANGELOG.md"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md border border-[#e4e4e7] bg-white px-3 py-2 text-sm font-semibold text-[#09090b] hover:bg-[#fafafa] hover:text-[#09090b]"
              >
                Changelog
              </a>
            </div>
          </div>

          <div className="divide-y divide-[#e4e4e7]">
            {releases.map((release) => (
              <article key={release.version} className="p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-mono text-xs text-[#71717a]">{release.version}</p>
                    <h2 className="mt-1 text-xl font-semibold text-[#2563eb]">{release.title}</h2>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-[#71717a]">{release.summary}</p>
                  </div>
                  <span className={`w-fit rounded-full border px-2.5 py-1 text-xs font-semibold ${badgeClass(release.status)}`}>
                    {release.status}
                  </span>
                </div>
                <ul className="mt-4 grid gap-2 md:grid-cols-2">
                  {release.changes.map((change) => (
                    <li key={change} className="flex gap-2 text-sm leading-6 text-[#71717a]">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#1f883d]" />
                      {change}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
