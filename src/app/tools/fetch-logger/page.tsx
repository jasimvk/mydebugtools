'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { ArrowTopRightOnSquareIcon, ClipboardDocumentIcon, SignalIcon } from '@heroicons/react/24/outline';
import { getLogs, getConsoleLogs, clearLogs, clearConsoleLogs } from '@jasimvk/fetchlogger';

// Local report builder mirroring the package's buildDebugReport (works with the
// installed version; switches to the package export once 0.2.0 is deployed).
function buildReport(): string {
  const logs = getLogs().filter((l) => !l.pending);
  const last = logs.at(-1);
  const errors = getConsoleLogs().filter((l) => l.level === 'error');
  const fmt = (b: unknown) =>
    b === undefined || b === null ? '(none)' : typeof b === 'string' ? b : JSON.stringify(b, null, 2);
  if (!last) return 'FetchLogger Debug Report\n\n(no requests captured yet)';
  return [
    'FetchLogger Debug Report',
    '',
    `Method: ${last.method}`,
    `URL: ${last.url}`,
    `Status: ${last.error ? `ERROR (${last.error})` : last.status ?? '—'}`,
    `Duration: ${last.elapsed != null ? `${last.elapsed}ms` : '—'}`,
    '',
    'Request Body:',
    fmt(last.reqBody),
    '',
    'Response Body:',
    fmt(last.resBody),
    '',
    'Console Errors:',
    errors.length ? errors.map((e) => e.text).join('\n') : '(none)',
  ].join('\n');
}

// Client-only: the panel patches window.fetch and renders a floating overlay.
const FetchLogger = dynamic(() => import('@jasimvk/fetchlogger/react'), { ssr: false });

const DEMO_API = 'https://jsonplaceholder.typicode.com';
const NPM_URL = 'https://www.npmjs.com/package/@jasimvk/fetchlogger';
const GITHUB_URL = 'https://github.com/jasimvkarim/fetchlogger';
const INSTALL_CMD = 'npm i -D @jasimvk/fetchlogger';

const reactSnippet = `import FetchLogger from "@jasimvk/fetchlogger/react";

export default function App() {
  return (
    <>
      <FetchLogger />
      {/* ...your app... */}
    </>
  );
}`;

const vanillaSnippet = `import { mountFetchLoggerPanel } from "@jasimvk/fetchlogger";

const unmount = mountFetchLoggerPanel({ position: "bottom-center" });
// later: unmount();`;

const features = [
  'Records every fetch request & response in real time — a DevTools alternative for fetch',
  'Network + Console tabs: status, timing, payloads, and console output in one panel',
  'Works in React, Vue, Svelte, or plain JavaScript',
  'Local-first — nothing leaves the browser; secrets are auto-redacted',
];

function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950 p-4 font-mono text-[13px] leading-6 text-zinc-100">
      <code className="bg-transparent p-0">{code}</code>
    </pre>
  );
}

/** A small "copied" flip helper for buttons. */
function useCopied() {
  const [copied, setCopied] = useState(false);
  const copy = (text: string) => {
    navigator.clipboard?.writeText(text).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1400);
      },
      () => {},
    );
  };
  return { copied, copy };
}

/** Static preview of the panel (visual proof above the live demo). */
function PanelPreview() {
  const rows = [
    { method: 'GET', label: '/todos/1', status: '200', time: '142ms', color: 'text-emerald-400' },
    { method: 'POST', label: '/posts', status: '201', time: '88ms', color: 'text-emerald-400' },
    { method: 'GET', label: '/nope-404', status: '404', time: '61ms', color: 'text-orange-400' },
  ];
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 font-mono text-[12px] text-zinc-200 shadow-sm">
      <div className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/80 px-3 py-2">
        <span className="text-indigo-300">⠿</span>
        <span className="rounded bg-indigo-400 px-2 py-0.5 text-[11px] font-bold text-zinc-900">Network 3</span>
        <span className="px-2 py-0.5 text-[11px] font-bold text-zinc-400">Console 1</span>
        <span className="ml-auto text-zinc-500">✕ clear ▼ ✕</span>
      </div>
      {rows.map((r) => (
        <div key={r.label} className="flex items-center gap-3 border-b border-zinc-800/60 px-3 py-2">
          <span className={`font-bold ${r.color} w-8`}>{r.status}</span>
          <span className="w-10 font-bold text-amber-400">{r.method}</span>
          <span className="flex-1 truncate text-zinc-200">{r.label}</span>
          <span className="text-violet-300">{r.time}</span>
        </div>
      ))}
      <div className="px-3 py-2 text-[11px] text-zinc-500">
        ↑ REQUEST · ↓ RESPONSE · copy · drag the header to move
      </div>
    </div>
  );
}

export default function FetchLoggerPage() {
  const [live, setLive] = useState(false);
  const [fired, setFired] = useState(0);
  const install = useCopied();
  const report = useCopied();

  const fire = (run: () => Promise<unknown>) => {
    run().catch(() => {});
    setFired((n) => n + 1);
  };

  const triggerConsoleError = () => {
     
    console.error('Demo console error from Fetch Logger', { code: 'DEMO_ERROR', at: Date.now() });
    setFired((n) => n + 1);
  };

  const clearAll = () => {
    clearLogs();
    clearConsoleLogs();
    setFired(0);
  };

  const copyDebugReport = () => report.copy(buildReport());

  return (
    <div className="mx-auto max-w-3xl space-y-8 py-2">
      {/* Header */}
      <header>
        <p className="font-mono text-xs font-medium uppercase tracking-[0.16em] text-muted">tools / fetch-logger</p>
        <div className="mt-3 flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface text-accent">
            <SignalIcon className="h-5 w-5" />
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Fetch Logger</h1>
        </div>
        <p className="mt-3 text-sm font-medium text-muted">Mini DevTools for fetch debugging inside the browser.</p>
        <p className="mt-3 max-w-2xl text-[15px] leading-7 text-muted">
          A live, in-page <strong className="font-medium text-foreground">browser fetch debugger</strong> and{' '}
          in-page network inspector that records every <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-[13px] text-foreground">fetch</code>{' '}
          request and response — no DevTools required. A drop-in React fetch logger that also works with Vue, Svelte,
          plain JavaScript, and inside mobile webviews. Powered by the open-source{' '}
          <a className="font-medium text-accent hover:text-accent-hover hover:underline" href={NPM_URL} target="_blank" rel="noopener noreferrer">
            @jasimvk/fetchlogger
          </a>{' '}
          package.
        </p>

        {/* Demo video */}
        <div className="mt-5 overflow-hidden rounded-xl border border-border bg-zinc-950 shadow-sm">
          <video
            className="block w-full"
            src="/fetchlogger-demo.mp4"
            poster="/fetchlogger-preview.png"
            controls
            loop
            muted
            playsInline
            preload="metadata"
          />
        </div>

        {/* Primary CTAs */}
        <div className="mt-5 flex flex-wrap gap-2.5">
          <button
            onClick={() => setLive((v) => !v)}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors ${
              live ? 'bg-[#dc2626] hover:bg-[#b91c1c]' : 'bg-primary hover:bg-primary-hover'
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${live ? 'bg-white' : 'bg-emerald-400'}`} />
            {live ? 'Stop live panel' : 'Start live panel'}
          </button>
          <button
            onClick={() => install.copy(INSTALL_CMD)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card-bg px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-zinc-300 hover:bg-surface"
          >
            <ClipboardDocumentIcon className="h-4 w-4" />
            {install.copied ? 'Copied!' : 'Install npm package'}
          </button>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card-bg px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-zinc-300 hover:bg-surface"
          >
            View GitHub <ArrowTopRightOnSquareIcon className="h-4 w-4" />
          </a>
        </div>

        <ul className="mt-6 grid gap-2 sm:grid-cols-2">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm leading-6 text-muted">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              {f}
            </li>
          ))}
        </ul>
      </header>

      {/* Live demo */}
      <section className="rounded-xl border border-border bg-card-bg">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold text-foreground">Try it live</h2>
          <p className="mt-1 text-sm leading-6 text-muted">
            Start the panel, fire a few requests, then open the floating panel (bottom-right) to inspect them.
          </p>
        </div>

        <div className="space-y-5 p-5">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
              Sample requests {!live && '· start the panel first'}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                disabled={!live}
                onClick={() =>
                  fire(() =>
                    fetch(`${DEMO_API}/posts`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ user: 'demo', password: 'secret123' }),
                    }),
                  )
                }
                className="rounded-lg border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-[13px] font-medium text-emerald-700 transition-colors enabled:hover:bg-emerald-100 disabled:opacity-40"
              >
                Trigger Successful Request
              </button>
              <button
                disabled={!live}
                onClick={() => fire(() => fetch(`${DEMO_API}/nope-404`))}
                className="rounded-lg border border-orange-300 bg-orange-50 px-3.5 py-2 text-[13px] font-medium text-orange-700 transition-colors enabled:hover:bg-orange-100 disabled:opacity-40"
              >
                Trigger Failed Request
              </button>
              <button
                disabled={!live}
                onClick={triggerConsoleError}
                className="rounded-lg border border-red-300 bg-red-50 px-3.5 py-2 text-[13px] font-medium text-red-700 transition-colors enabled:hover:bg-red-100 disabled:opacity-40"
              >
                Trigger Console Error
              </button>
              <button
                disabled={!live}
                onClick={clearAll}
                className="rounded-lg border border-border bg-card-bg px-3.5 py-2 text-[13px] font-medium text-muted transition-colors enabled:hover:border-zinc-300 enabled:hover:text-foreground disabled:opacity-40"
              >
                Clear Logs
              </button>
            </div>
          </div>

          {live && fired > 0 && (
            <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
              <button
                onClick={copyDebugReport}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover hover:text-white"
              >
                <ClipboardDocumentIcon className="h-4 w-4" />
                {report.copied ? 'Report copied!' : 'Copy debug report'}
              </button>
              <span className="text-sm text-muted">
                {fired} request{fired === 1 ? '' : 's'} fired — great for pasting into a QA ticket or bug report.
              </span>
            </div>
          )}

          {live && <FetchLogger position="bottom-right" defaultOpen />}
        </div>
      </section>

      {/* Mobile & QA */}
      <section className="rounded-xl border border-border bg-surface p-5">
        <h2 className="text-base font-semibold text-foreground">Built for mobile &amp; QA debugging</h2>
        <p className="mt-1 text-sm leading-6 text-muted">
          Fetch Logger is most useful when DevTools are hard to access:
        </p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {['Mobile browsers', 'WebViews & embedded browsers', 'Staging links', 'QA builds', 'Client demos', 'Tester bug reports'].map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm text-muted">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm leading-6 text-muted">
          Testers hit <span className="font-medium text-foreground">Copy Debug Report</span> and paste a complete,
          redacted summary into a ticket — so developers get reproducible context without &ldquo;what did the network tab say?&rdquo;.
        </p>
      </section>

      {/* Install + usage */}
      <section className="rounded-xl border border-border bg-card-bg">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold text-foreground">Use it in your own project</h2>
          <p className="mt-1 text-sm leading-6 text-muted">Drop the frontend API debugging tool into any app in one line.</p>
        </div>

        <div className="space-y-6 p-5">
          <div>
            <p className="mb-2 text-sm font-semibold text-foreground">1 · Install</p>
            <CodeBlock code={INSTALL_CMD} />
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-foreground">2 · React (Next, Vite, CRA)</p>
            <CodeBlock code={reactSnippet} />
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-foreground">Or — any framework / plain JS</p>
            <CodeBlock code={vanillaSnippet} />
          </div>

          <div className="flex flex-wrap gap-3 border-t border-border pt-5">
            <a
              href={NPM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover hover:text-white"
            >
              View on npm <ArrowTopRightOnSquareIcon className="h-4 w-4" />
            </a>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card-bg px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-zinc-300 hover:bg-surface"
            >
              GitHub <ArrowTopRightOnSquareIcon className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
