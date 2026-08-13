'use client';

import { useMemo, useState } from 'react';
import { ClipboardDocumentIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { analyzeDebugWorkflow, getDebugWorkflowConfig } from '../lib/debug-workflow-configs';

export default function DebugWorkflowToolPage({ slug }: { slug: string }) {
  const config = getDebugWorkflowConfig(slug);

  // Hooks must run before any early return — an unknown slug used to bail out
  // above them, which changes the hook count between renders.
  const [input, setInput] = useState(config?.sampleInput ?? '');
  const result = useMemo(
    () => (config ? analyzeDebugWorkflow(config, input) : null),
    [config, input]
  );

  if (!config || !result) {
    return null;
  }

  const copyReport = async () => {
    await navigator.clipboard.writeText(result.report);
  };

  const downloadReport = () => {
    const blob = new Blob([result.report], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${config.slug}-report.md`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-7xl">
      <section className="rounded-md border border-[#d0d7de] bg-white">
        <div className="border-b border-[#d0d7de] px-5 py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-[#6e7781]">
                tools / {config.slug}
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-[#24292f]">{config.title}</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#57606a]">{config.description}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={copyReport} className="inline-flex items-center gap-2 rounded-md border border-[#d0d7de] bg-white px-3 py-2 text-sm font-semibold text-[#24292f] hover:bg-[#f6f8fa]">
                <ClipboardDocumentIcon className="h-4 w-4" />
                Copy report
              </button>
              <button type="button" onClick={downloadReport} className="inline-flex items-center gap-2 rounded-md bg-[#24292f] px-3 py-2 text-sm font-semibold text-white hover:bg-[#32383f]">
                <DocumentArrowDownIcon className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-5 p-5 xl:grid-cols-[minmax(0,1fr)_minmax(380px,0.75fr)]">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge>{config.priority}</Badge>
              <Badge>{config.pillar}</Badge>
              <Badge>{result.severity} severity</Badge>
            </div>
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              spellCheck={false}
              placeholder={config.placeholder}
              className="min-h-[560px] w-full resize-y rounded-md border border-[#d0d7de] bg-[#f6f8fa] p-4 font-mono text-sm leading-6 text-[#24292f] outline-none focus:border-[#0969da] focus:ring-2 focus:ring-[#0969da]/15"
            />
          </div>

          <div className="space-y-4">
            <section className="rounded-md border border-[#d0d7de] bg-[#f6f8fa] p-4">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <div className="font-mono text-4xl font-semibold text-[#24292f]">{result.score}</div>
                  <div className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#6e7781]">debug signal score</div>
                </div>
                <div className="rounded-md border border-[#d0d7de] bg-white px-3 py-2 text-sm font-semibold text-[#24292f]">
                  {result.detectedSignals.length} signals
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-[#57606a]">{result.summary}</p>
            </section>

            <Panel title="Detected signals">
              {result.detectedSignals.length ? result.detectedSignals.map((signal) => (
                <div key={signal.id} className="border-b border-[#d0d7de] p-3 last:border-b-0">
                  <h2 className="text-sm font-semibold text-[#0969da]">{signal.label}</h2>
                  <p className="mt-1 text-xs leading-5 text-[#57606a]">{signal.detail}</p>
                  <p className="mt-2 text-xs font-medium leading-5 text-[#24292f]">{signal.fix}</p>
                </div>
              )) : <Empty>No known signatures detected yet.</Empty>}
            </Panel>

            <Panel title="Highlighted lines">
              {result.highlightedLines.length ? result.highlightedLines.map((line) => (
                <div key={`${line.lineNumber}-${line.text}`} className="border-b border-[#d0d7de] p-3 last:border-b-0">
                  <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6e7781]">line {line.lineNumber}</div>
                  <pre className="mt-1 whitespace-pre-wrap break-words font-mono text-xs leading-5 text-[#24292f]">{line.text}</pre>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {line.signals.map((label) => <span key={label} className="rounded-full bg-[#ddf4ff] px-2 py-0.5 text-[11px] font-semibold text-[#0969da]">{label}</span>)}
                  </div>
                </div>
              )) : <Empty>Important matching lines appear here after detection.</Empty>}
            </Panel>

            <Panel title="Fix checklist">
              <div className="divide-y divide-[#d0d7de]">
                {result.checklist.map((item) => (
                  <div key={item} className="p-3 text-sm leading-6 text-[#24292f]">{item}</div>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      </section>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-md border border-[#d0d7de] bg-white">
      <div className="border-b border-[#d0d7de] bg-[#f6f8fa] px-4 py-3 text-sm font-semibold text-[#24292f]">{title}</div>
      {children}
    </section>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-[#d0d7de] bg-white px-2.5 py-1 text-xs font-semibold text-[#57606a]">{children}</span>;
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="p-4 text-sm text-[#57606a]">{children}</p>;
}
