'use client';

import { useMemo, useState } from 'react';
import { ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { analyzeCiWorkflow } from '@/app/tools/lib/debug-analyzers';

const sampleWorkflow = `name: ci
on: [pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm test
      - run: curl \${{ secrets.DEPLOY_TOKEN }}`;

export default function CiDebuggerPage() {
  const [input, setInput] = useState(sampleWorkflow);
  const [copyError, setCopyError] = useState('');
  const result = useMemo(() => analyzeCiWorkflow(input), [input]);

  const copyCommands = async () => {
    setCopyError('');
    try {
      await navigator.clipboard.writeText(result.commands.join('\n'));
    } catch {
      setCopyError('Clipboard is unavailable in this browser.');
    }
  };

  return (
    <div className="mx-auto max-w-7xl">
      <section className="rounded-md border border-[#e4e4e7] bg-white">
        <div className="border-b border-[#e4e4e7] px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-[#71717a]">tools / ci-debugger</p>
              <h1 className="mt-2 text-2xl font-semibold text-[#09090b]">CI / GitHub Actions Debugger</h1>
              <p className="mt-2 text-sm leading-6 text-[#71717a]">Paste workflow YAML to inspect jobs, steps, local-run commands, and risky CI patterns.</p>
            </div>
            <div>
              <button type="button" onClick={copyCommands} className="inline-flex items-center gap-2 rounded-md border border-[#e4e4e7] bg-white px-3 py-2 text-sm font-semibold text-[#09090b] hover:bg-[#fafafa]">
                <ClipboardDocumentIcon className="h-4 w-4" />
                Copy commands
              </button>
              {copyError && <p className="mt-2 text-xs text-red-600">{copyError}</p>}
            </div>
          </div>
        </div>
        <div className="grid gap-5 p-5 lg:grid-cols-[1fr_1fr]">
          <textarea value={input} onChange={(event) => setInput(event.target.value)} spellCheck={false} className="min-h-[520px] rounded-md border border-[#e4e4e7] bg-[#fafafa] p-4 font-mono text-sm outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/15" />
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <Stat label="Jobs" value={result.jobs.length} />
              <Stat label="Steps" value={result.stepCount} />
              <Stat label="Risks" value={result.risks.length} />
            </div>
            <Panel title="Jobs">{result.jobs.map((job) => <Row key={job} title={job} meta="workflow job" />)}</Panel>
            <Panel title="Risks">{result.risks.length ? result.risks.map((risk) => <Row key={risk} title={risk} meta="debug note" />) : <p className="p-4 text-sm text-[#71717a]">No common risks detected.</p>}</Panel>
            <Panel title="Local commands">{result.commands.map((command) => <Row key={command} title={command} meta="command" />)}</Panel>
          </div>
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
  return <div className="p-3"><div className="break-words font-mono text-sm text-[#2563eb]">{title}</div><div className="mt-1 text-xs text-[#71717a]">{meta}</div></div>;
}
