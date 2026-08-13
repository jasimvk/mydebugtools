import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Contributing Guide | DebugTools',
  description: 'How to contribute to DebugTools: pick one surface, file a reproducible issue, run the local dev and test commands, state privacy impact, and open a scoped PR.',
  path: '/contributing/',
  keywords: ['contribute to debugtools', 'open source contributing guide', 'developer tools contributions', 'good first issue'],
});

const steps = [
  ['Pick one surface', 'Start with a single tool, parser, import format, route, test, or documentation gap.'],
  ['File a reproducible issue', 'Include affected route, steps, sample input, expected behavior, actual behavior, browser/OS, and screenshots for UI bugs.'],
  ['Use local commands', 'Run npm install, npm run dev, focused Jest tests, npx tsc --noEmit --pretty false, and npm run build for TSX or route changes.'],
  ['Keep privacy explicit', 'State whether the change is local-only, sends a user-requested network request, or uses optional API Workbench sync.'],
  ['Open a scoped PR', 'Keep patches reviewable, update docs/changelog when behavior changes, and list verification commands in the PR body.'],
];

export default function ContributingPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 text-[#09090b] sm:px-6">
      <p className="font-mono text-xs text-[#71717a]">debugtools / contributing</p>
      <h1 className="mt-2 text-3xl font-semibold">Contributing</h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-[#71717a]">
        debugtools contributions should be small, reproducible, and tied to a real debugging workflow.
      </p>
      <div className="mt-8 grid gap-3">
        {steps.map(([title, text]) => (
          <section key={title} className="rounded-md border border-[#e4e4e7] bg-white p-5">
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-[#71717a]">{text}</p>
          </section>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <a href="https://github.com/jasimvkarim/mydebugtools/issues/new" className="rounded-md bg-[#09090b] px-4 py-2 text-sm font-semibold text-white">Open issue</a>
        <a href="https://github.com/jasimvkarim/mydebugtools/blob/main/CONTRIBUTING.md" className="rounded-md border border-[#e4e4e7] px-4 py-2 text-sm font-semibold text-[#09090b]">Read guide</a>
        <a href="https://github.com/jasimvkarim/mydebugtools" className="rounded-md border border-[#e4e4e7] px-4 py-2 text-sm font-semibold text-[#09090b]">View repository</a>
      </div>
    </main>
  );
}
