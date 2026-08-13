'use client';

import Navigation from '../components/Navigation';

const mvpCommands = [
  { command: 'debugtools json', purpose: 'Format, minify, repair, validate, query, and convert JSON.' },
  { command: 'debugtools jwt decode', purpose: 'Decode JWT header and payload locally.' },
  { command: 'debugtools base64', purpose: 'Encode and decode text or files from stdin or disk.' },
  { command: 'debugtools diff', purpose: 'Compare files and emit text, Markdown, or JSON reports.' },
  { command: 'debugtools http-status', purpose: 'Look up HTTP codes and search status references offline.' },
];

const nextCommands = [
  { command: 'debugtools api run', purpose: 'Run saved API requests and collections in local terminals or CI.' },
  { command: 'debugtools api import-collection', purpose: 'Normalize Postman and debugtools collection exports.' },
  { command: 'debugtools db query', purpose: 'Run SQLite queries and export results as CSV.' },
  { command: 'debugtools css/html/md', purpose: 'Format, validate, and report on frontend files.' },
  { command: 'debugtools releases', purpose: 'List release notes, latest changes, and changelog summaries.' },
];

const laterCommands = [
  'webhook inspector and replay',
  'OpenAPI validation and collection generation',
  'bundle and startup profile comparison',
  'Dockerfile and Kubernetes YAML checks',
  'hash, HMAC, checksum, JWT/JWKS, and TLS certificate utilities',
];

export default function CliPage() {
  return (
    <main className="min-h-screen bg-[#fafafa] text-[#09090b]">
      <Navigation />
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="rounded-md border border-[#e4e4e7] bg-white">
          <div className="border-b border-[#e4e4e7] px-5 py-4">
            <p className="font-mono text-xs text-[#71717a]">CLI_ROADMAP.md</p>
            <h1 className="mt-2 text-3xl font-semibold text-[#09090b]">CLI roadmap</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#71717a]">
              The CLI should make the web tools scriptable: same developer utilities, but pipe-friendly for terminals, CI jobs, release checks, and local workflows.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href="https://github.com/jasimvkarim/mydebugtools/blob/main/CLI_ROADMAP.md"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md bg-[#09090b] px-3 py-2 text-sm font-semibold text-white hover:bg-[#32383f] hover:text-white"
              >
                Read roadmap
              </a>
              <a
                href="https://github.com/jasimvkarim/mydebugtools/issues/new?title=Add%20debugtools%20CLI"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md border border-[#e4e4e7] bg-white px-3 py-2 text-sm font-semibold text-[#09090b] hover:bg-[#fafafa] hover:text-[#09090b]"
              >
                Propose CLI issue
              </a>
            </div>
          </div>

          <div className="grid gap-0 lg:grid-cols-[1fr_320px]">
            <div className="p-5">
              <h2 className="text-xl font-semibold text-[#09090b]">MVP commands</h2>
              <div className="mt-4 grid gap-3">
                {mvpCommands.map((item) => (
                  <div key={item.command} className="rounded-md border border-[#e4e4e7] bg-[#fafafa] p-4">
                    <code className="bg-white font-mono text-sm text-[#2563eb]">{item.command}</code>
                    <p className="mt-2 text-sm leading-6 text-[#71717a]">{item.purpose}</p>
                  </div>
                ))}
              </div>

              <h2 className="mt-8 text-xl font-semibold text-[#09090b]">V1 commands</h2>
              <div className="mt-4 grid gap-3">
                {nextCommands.map((item) => (
                  <div key={item.command} className="rounded-md border border-[#e4e4e7] bg-white p-4">
                    <code className="bg-[#fafafa] font-mono text-sm text-[#2563eb]">{item.command}</code>
                    <p className="mt-2 text-sm leading-6 text-[#71717a]">{item.purpose}</p>
                  </div>
                ))}
              </div>
            </div>

            <aside className="border-t border-[#e4e4e7] bg-[#fafafa] p-5 lg:border-l lg:border-t-0">
              <h2 className="text-sm font-semibold text-[#09090b]">Recommended shape</h2>
              <ul className="mt-3 space-y-3 text-sm leading-6 text-[#71717a]">
                <li>One binary: <code className="bg-white">debugtools</code>, with <code className="bg-white">dt</code> as an alias later.</li>
                <li>Extract shared logic into <code className="bg-white">src/lib/tools/*</code> before adding CLI entrypoints.</li>
                <li>Keep MVP commands dependency-light and CI-friendly.</li>
                <li>Use release automation after the first CLI module lands.</li>
              </ul>

              <h2 className="mt-8 text-sm font-semibold text-[#09090b]">Later possibilities</h2>
              <ul className="mt-3 space-y-3">
                {laterCommands.map((item) => (
                  <li key={item} className="flex gap-2 text-sm leading-6 text-[#71717a]">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#1f883d]" />
                    {item}
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
