'use client';

import { useMemo, useState } from 'react';
import { analyzeSecurityHeaders } from '@/app/tools/lib/debug-analyzers';

const sampleHeaders = `HTTP/2 200
content-security-policy: default-src 'self'
x-frame-options: DENY
x-content-type-options: nosniff
set-cookie: session=abc; Path=/`;

export default function SecurityHeadersPage() {
  const [input, setInput] = useState(sampleHeaders);
  const result = useMemo(() => analyzeSecurityHeaders(input), [input]);

  return (
    <div className="mx-auto max-w-7xl">
      <section className="rounded-md border border-[#e4e4e7] bg-white">
        <div className="border-b border-[#e4e4e7] px-5 py-4">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-[#71717a]">tools / security-headers</p>
          <h1 className="mt-2 text-2xl font-semibold text-[#09090b]">Security Headers Inspector</h1>
          <p className="mt-2 text-sm leading-6 text-[#71717a]">Paste response headers to score browser security protections, missing headers, and cookie flags.</p>
        </div>
        <div className="grid gap-5 p-5 lg:grid-cols-[1fr_1fr]">
          <textarea value={input} onChange={(event) => setInput(event.target.value)} spellCheck={false} className="min-h-[520px] rounded-md border border-[#e4e4e7] bg-[#fafafa] p-4 font-mono text-sm outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/15" />
          <div className="space-y-4">
            <div className="rounded-md border border-[#e4e4e7] bg-[#fafafa] p-5">
              <div className="font-mono text-4xl font-semibold text-[#09090b]">
                {result.score}
                <span className="text-2xl text-[#71717a]">/100</span>
              </div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#71717a]">header score</div>
            </div>
            <Panel title="Present headers">
              {result.present.map((header) => <Pill key={header} value={header} tone="good" />)}
            </Panel>
            <Panel title="Missing headers">
              {result.missing.map((header) => <Pill key={header} value={header} tone="warn" />)}
            </Panel>
            <Panel title="Cookie warnings">
              {result.cookieWarnings.length ? result.cookieWarnings.map((warning) => <Pill key={warning} value={warning} tone="warn" />) : <p className="text-sm text-[#71717a]">No cookie warnings detected.</p>}
            </Panel>
          </div>
        </div>
      </section>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-md border border-[#e4e4e7] bg-white p-4"><h2 className="text-sm font-semibold text-[#09090b]">{title}</h2><div className="mt-3 flex flex-wrap gap-2">{children}</div></section>;
}

function Pill({ value, tone }: { value: string; tone: 'good' | 'warn' }) {
  const className = tone === 'good'
    ? 'border-[#1a7f37] bg-[#dafbe1] text-[#1a7f37]'
    : 'border-[#bf8700] bg-[#fff8c5] text-[#7d4e00]';
  return <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${className}`}>{value}</span>;
}
