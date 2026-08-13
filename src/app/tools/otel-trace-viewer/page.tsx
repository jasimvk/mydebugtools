'use client';

import { useMemo, useState } from 'react';
import { analyzeOtelTrace } from '@/app/tools/lib/debug-analyzers';

const sampleTrace = JSON.stringify({
  resourceSpans: [{
    scopeSpans: [{
      spans: [
        { name: 'GET /checkout', traceId: 'trace-1', spanId: 'root', startTimeUnixNano: '1000000000', endTimeUnixNano: '1800000000', status: { code: 1 } },
        { name: 'POST payment', traceId: 'trace-1', spanId: 'payment', parentSpanId: 'root', startTimeUnixNano: '1100000000', endTimeUnixNano: '1700000000', status: { code: 2, message: 'card declined' } },
      ],
    }],
  }],
}, null, 2);

export default function OtelTraceViewerPage() {
  const [input, setInput] = useState(sampleTrace);
  const analysis = useMemo(() => {
    // An empty editor is an empty state, not a JSON syntax error.
    if (!input.trim()) return { result: null, error: '' };

    try {
      return { result: analyzeOtelTrace(input), error: '' };
    } catch (error) {
      return { result: null, error: error instanceof Error ? error.message : 'Invalid OpenTelemetry JSON' };
    }
  }, [input]);

  return (
    <div className="mx-auto max-w-7xl">
      <section className="rounded-md border border-[#e4e4e7] bg-white">
        <div className="border-b border-[#e4e4e7] px-5 py-4">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-[#71717a]">tools / otel-trace-viewer</p>
          <h1 className="mt-2 text-2xl font-semibold text-[#09090b]">OpenTelemetry Trace Viewer</h1>
          <p className="mt-2 text-sm leading-6 text-[#71717a]">Paste OTLP-style JSON to summarize traces, spans, slow calls, root spans, and error spans locally.</p>
        </div>
        <div className="grid gap-5 p-5 lg:grid-cols-[1fr_1fr]">
          <textarea value={input} onChange={(event) => setInput(event.target.value)} spellCheck={false} className="min-h-[560px] rounded-md border border-[#e4e4e7] bg-[#fafafa] p-4 font-mono text-sm outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/15" />
          {!analysis.result && !analysis.error ? (
            <div className="rounded-md border border-dashed border-[#e4e4e7] bg-[#fafafa] p-4 text-sm text-[#71717a]">
              Paste OTLP-style JSON to see the trace summary.
            </div>
          ) : analysis.error || !analysis.result ? (
            <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">{analysis.error}</div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <Stat label="Spans" value={analysis.result.totalSpans} />
                <Stat label="Traces" value={analysis.result.traces.length} />
                <Stat label="Errors" value={analysis.result.errorSpans.length} />
              </div>
              <Panel title="Traces">
                {analysis.result.traces.map((trace) => (
                  <Row key={trace.traceId} title={trace.traceId} meta={`${trace.spanCount} spans · ${trace.totalDurationMs}ms · ${trace.errorCount} errors`} />
                ))}
              </Panel>
              <Panel title="Slowest spans">
                {analysis.result.slowest.map((span) => (
                  <Row key={`${span.traceId}-${span.spanId}`} title={span.name} meta={`${span.durationMs}ms · ${span.isError ? 'error' : 'ok'} · ${span.traceId}`} />
                ))}
              </Panel>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return <div className="rounded-md border border-[#e4e4e7] bg-white p-3"><div className="font-mono text-2xl font-semibold text-[#09090b]">{value}</div><div className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#71717a]">{label}</div></div>;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-md border border-[#e4e4e7] bg-white"><div className="border-b border-[#e4e4e7] px-4 py-3 text-sm font-semibold text-[#09090b]">{title}</div><div className="divide-y divide-[#e4e4e7]">{children}</div></section>;
}

function Row({ title, meta }: { title: string; meta: string }) {
  return <div className="p-3"><div className="break-words font-mono text-sm font-semibold text-[#2563eb]">{title}</div><div className="mt-1 break-words font-mono text-xs text-[#71717a]">{meta}</div></div>;
}
