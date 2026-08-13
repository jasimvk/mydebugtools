'use client';

import { useMemo, useState } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { analyzeHar } from '@/app/tools/lib/debug-analyzers';

const sampleHar = JSON.stringify({
  log: {
    entries: [
      { request: { method: 'GET', url: 'https://api.example.com/users' }, response: { status: 200, bodySize: 4200 }, time: 180, timings: { wait: 120 } },
      { request: { method: 'POST', url: 'https://api.example.com/checkout' }, response: { status: 500, bodySize: 900 }, time: 1320, timings: { wait: 1180 } },
      { request: { method: 'GET', url: 'https://api.example.com/session' }, response: { status: 302, bodySize: 0 }, time: 74, timings: { wait: 40 } },
    ],
  },
}, null, 2);

export default function HttpProfilerPage() {
  const [input, setInput] = useState(sampleHar);
  const analysis = useMemo(() => {
    // An empty editor is an empty state, not a JSON syntax error.
    if (!input.trim()) return { result: null, error: '' };

    try {
      return { result: analyzeHar(input), error: '' };
    } catch (error) {
      return { result: null, error: error instanceof Error ? error.message : 'Invalid HAR JSON' };
    }
  }, [input]);

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <section className="rounded-md border border-[#e4e4e7] bg-white">
        <div className="border-b border-[#e4e4e7] px-5 py-4">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-[#71717a]">tools / http-profiler</p>
          <h1 className="mt-2 text-2xl font-semibold text-[#09090b]">HTTP Traffic Inspector</h1>
          <p className="mt-2 text-sm leading-6 text-[#71717a]">Paste HAR JSON to summarize requests, redirects, failures, payload size, and slowest calls.</p>
        </div>

        <div className="grid gap-5 p-5 lg:grid-cols-[1fr_1fr]">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            className="min-h-[560px] rounded-md border border-[#e4e4e7] bg-[#fafafa] p-4 font-mono text-sm text-[#09090b] outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/15"
            spellCheck={false}
          />

          {!analysis.result && !analysis.error ? (
            <div className="rounded-md border border-dashed border-[#e4e4e7] bg-[#fafafa] p-4 text-sm text-[#71717a]">
              Paste HAR JSON to see the request summary.
            </div>
          ) : analysis.error || !analysis.result ? (
            <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <div className="flex items-center gap-2 font-semibold">
                <ExclamationTriangleIcon className="h-5 w-5" />
                Could not parse HAR
              </div>
              <p className="mt-2">{analysis.error}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-4">
                <Stat label="Requests" value={analysis.result.totalRequests} />
                <Stat label="Failures" value={analysis.result.failures} />
                <Stat label="Redirects" value={analysis.result.redirects} />
                <Stat label="KB" value={Math.round(analysis.result.totalTransferSize / 1024)} />
              </div>

              <section className="rounded-md border border-[#e4e4e7] bg-white">
                <div className="border-b border-[#e4e4e7] px-4 py-3">
                  <h2 className="text-sm font-semibold text-[#09090b]">Status groups</h2>
                </div>
                <div className="grid grid-cols-5 gap-2 p-3">
                  {['2xx', '3xx', '4xx', '5xx', 'other'].map((group) => (
                    <div key={group} className="rounded-md bg-[#fafafa] p-3 text-center">
                      <div className="font-mono text-xl font-semibold text-[#09090b]">{analysis.result.statusGroups[group] || 0}</div>
                      <div className="mt-1 text-xs font-semibold text-[#71717a]">{group}</div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-md border border-[#e4e4e7] bg-white">
                <div className="border-b border-[#e4e4e7] px-4 py-3">
                  <h2 className="text-sm font-semibold text-[#09090b]">Slowest requests</h2>
                </div>
                <div className="divide-y divide-[#e4e4e7]">
                  {analysis.result.slowest.map((request, index) => (
                    <article key={`${request.url}-${index}`} className="p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-[#e4e4e7] px-2 py-0.5 font-mono text-[11px] font-semibold text-[#71717a]">{request.method}</span>
                        <span className="rounded-full border border-[#e4e4e7] px-2 py-0.5 font-mono text-[11px] font-semibold text-[#71717a]">{request.status || 'n/a'}</span>
                        <span className="font-mono text-xs text-[#71717a]">{Math.round(request.time)}ms</span>
                      </div>
                      <p className="mt-2 break-all font-mono text-xs text-[#2563eb]">{request.url}</p>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-[#e4e4e7] bg-white p-3">
      <div className="font-mono text-2xl font-semibold text-[#09090b]">{value}</div>
      <div className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#71717a]">{label}</div>
    </div>
  );
}
