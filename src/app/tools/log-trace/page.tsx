'use client';

import { useMemo, useState } from 'react';
import { ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { analyzeLogs } from '@/app/tools/lib/debug-analyzers';

const sampleLogs = `[2026-05-17T07:00:00Z] INFO trace_id=checkout-42 request started
[2026-05-17T07:00:01Z] WARN trace_id=checkout-42 slow inventory lookup
[2026-05-17T07:00:02Z] ERROR trace_id=checkout-42 payment failed
    at chargeCard (/app/payments.ts:18:4)
[2026-05-17T07:00:03Z] INFO trace_id=profile-11 request complete`;

export default function LogTracePage() {
  const [input, setInput] = useState(sampleLogs);
  const [copyError, setCopyError] = useState('');
  const result = useMemo(() => analyzeLogs(input), [input]);

  const copyTrace = async (traceId: string) => {
    const trace = result.traces.find((item) => item.id === traceId);
    if (!trace) return;
    setCopyError('');
    try {
      await navigator.clipboard.writeText(trace.entries.map((entry) => [entry.message, ...entry.details].join('\n')).join('\n'));
    } catch {
      setCopyError('Clipboard is unavailable in this browser.');
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <section className="rounded-md border border-[#e4e4e7] bg-white">
        <div className="border-b border-[#e4e4e7] px-5 py-4">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-[#71717a]">tools / log-trace</p>
          <h1 className="mt-2 text-2xl font-semibold text-[#09090b]">Log Trace Rebuilder</h1>
          <p className="mt-2 text-sm leading-6 text-[#71717a]">Paste logs to group entries by trace ID, request ID, correlation ID, severity, and multiline details.</p>
        </div>

        <div className="grid gap-5 p-5 lg:grid-cols-[1fr_1fr]">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            className="min-h-[560px] rounded-md border border-[#e4e4e7] bg-[#fafafa] p-4 font-mono text-sm text-[#09090b] outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/15"
            spellCheck={false}
          />

          <div className="space-y-4">
            {copyError && <p className="text-xs text-red-600">{copyError}</p>}

            {/* Every severity the analyzer can emit, so a plain log without levels does not
                render as four zeroes. */}
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
              {['ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE', 'UNKNOWN'].map((severity) => (
                <div key={severity} className="rounded-md border border-[#e4e4e7] bg-white p-3">
                  <div className="font-mono text-2xl font-semibold text-[#09090b]">{result.severityCounts[severity] || 0}</div>
                  <div className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#71717a]">{severity}</div>
                </div>
              ))}
            </div>

            <section className="rounded-md border border-[#e4e4e7] bg-white">
              <div className="border-b border-[#e4e4e7] px-4 py-3">
                <h2 className="text-sm font-semibold text-[#09090b]">Trace groups</h2>
              </div>
              <div className="divide-y divide-[#e4e4e7]">
                {result.traces.map((trace) => (
                  <article key={trace.id} className="p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="font-mono text-sm font-semibold text-[#2563eb]">{trace.id}</h3>
                        <p className="mt-1 text-xs text-[#71717a]">{trace.entries.length} entries {trace.hasError ? 'with errors' : 'without errors'}</p>
                      </div>
                      <button type="button" onClick={() => copyTrace(trace.id)} className="inline-flex items-center gap-1 rounded-md border border-[#e4e4e7] px-2 py-1 text-xs font-semibold text-[#71717a] hover:bg-[#fafafa]">
                        <ClipboardDocumentIcon className="h-4 w-4" />
                        Copy
                      </button>
                    </div>
                    <div className="mt-3 space-y-2">
                      {trace.entries.map((entry, index) => (
                        <div key={`${trace.id}-${index}`} className="rounded-md bg-[#fafafa] p-3">
                          <div className="flex flex-wrap gap-2">
                            <span className="rounded-full border border-[#e4e4e7] px-2 py-0.5 text-[11px] font-semibold text-[#71717a]">{entry.severity}</span>
                            {entry.timestamp && <span className="font-mono text-xs text-[#71717a]">{entry.timestamp}</span>}
                          </div>
                          <p className="mt-2 break-words font-mono text-xs text-[#09090b]">{entry.message}</p>
                          {entry.details.length > 0 && <pre className="mt-2 whitespace-pre-wrap break-words rounded bg-white p-2 font-mono text-xs text-[#71717a]">{entry.details.join('\n')}</pre>}
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
                {result.traces.length === 0 && <p className="p-4 text-sm text-[#71717a]">No trace IDs detected. Try logs with trace_id, request_id, correlation_id, or rid.</p>}
              </div>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}
