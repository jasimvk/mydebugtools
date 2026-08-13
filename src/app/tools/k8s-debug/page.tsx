'use client';

import { useMemo, useState } from 'react';
import { ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { analyzeKubernetesDebug } from '@/app/tools/lib/debug-analyzers';

const sampleInput = `Name: api-7d9
Namespace: prod
State: Waiting
Reason: CrashLoopBackOff
Last State: Terminated
Exit Code: 137
Warning BackOff restarting failed container`;

export default function KubernetesDebugPage() {
  const [input, setInput] = useState(sampleInput);
  const [copyError, setCopyError] = useState('');
  const result = useMemo(() => analyzeKubernetesDebug(input), [input]);

  const copyCommands = async () => {
    setCopyError('');
    try {
      await navigator.clipboard.writeText(result.commands.join('\n'));
    } catch {
      setCopyError('Clipboard is unavailable in this browser.');
    }
  };

  return (
    <div className="mx-auto max-w-7xl overflow-hidden">
      <section className="min-w-0 rounded-md border border-[#e4e4e7] bg-white">
        <div className="border-b border-[#e4e4e7] px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-[#71717a]">tools / k8s-debug</p>
              <h1 className="mt-2 text-2xl font-semibold text-[#09090b]">Kubernetes Debug Helper</h1>
              <p className="mt-2 text-sm leading-6 text-[#71717a]">Paste pod descriptions, events, or logs to detect common failure signals and generate useful kubectl commands.</p>
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
        <div className="grid min-w-0 gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <textarea value={input} onChange={(event) => setInput(event.target.value)} spellCheck={false} className="min-h-[520px] min-w-0 max-w-full rounded-md border border-[#e4e4e7] bg-[#fafafa] p-4 font-mono text-sm outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/15" />
          <div className="min-w-0 space-y-4">
            <div className="rounded-md border border-[#e4e4e7] bg-[#fafafa] p-4">
              <h2 className="text-base font-semibold text-[#09090b]">{result.name}</h2>
              <p className="mt-1 break-all font-mono text-xs text-[#71717a]">namespace: {result.namespace}</p>
              <p className="mt-3 text-sm leading-6 text-[#09090b]">{result.likelyCause}</p>
            </div>
            <section className="rounded-md border border-[#e4e4e7] bg-white">
              <div className="border-b border-[#e4e4e7] px-4 py-3 text-sm font-semibold text-[#09090b]">Signals</div>
              <div className="flex flex-wrap gap-2 p-4">
                {result.signals.length ? result.signals.map((signal) => <span key={signal} className="max-w-full break-words rounded-full border border-[#e4e4e7] bg-[#fafafa] px-2.5 py-1 text-xs font-semibold text-[#71717a]">{signal}</span>) : <p className="text-sm text-[#71717a]">No common signal detected.</p>}
              </div>
            </section>
            <section className="rounded-md border border-[#e4e4e7] bg-white">
              <div className="border-b border-[#e4e4e7] px-4 py-3 text-sm font-semibold text-[#09090b]">Commands</div>
              <div className="divide-y divide-[#e4e4e7]">
                {result.commands.map((command) => <pre key={command} className="max-w-full overflow-x-auto whitespace-pre-wrap break-words p-3 font-mono text-xs text-[#09090b]">{command}</pre>)}
              </div>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}
