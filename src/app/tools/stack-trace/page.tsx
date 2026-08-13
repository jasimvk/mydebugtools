'use client';

import { useMemo, useState } from 'react';
import { BoltIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { analyzeStackTrace } from '@/app/tools/lib/debug-analyzers';

const sampleTrace = `TypeError: Cannot read properties of undefined (reading 'id')
    at getUser (/app/src/users.ts:42:18)
    at async GET (/app/src/api/users/route.ts:12:5)
    at node_modules/next/dist/server.js:10:1`;

export default function StackTracePage() {
  const [input, setInput] = useState(sampleTrace);
  const [copyError, setCopyError] = useState('');
  const result = useMemo(() => analyzeStackTrace(input), [input]);

  const copyReport = async () => {
    setCopyError('');
    try {
      await navigator.clipboard.writeText([
        `${result.errorType}: ${result.message}`,
        `Likely cause: ${result.likelyCause}`,
        result.rootFrame ? `Root frame: ${result.rootFrame.functionName} (${result.rootFrame.file}:${result.rootFrame.line || '?'})` : 'Root frame: not found',
      ].join('\n'));
    } catch {
      setCopyError('Clipboard is unavailable in this browser.');
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <section className="rounded-md border border-[#e4e4e7] bg-white">
        <div className="border-b border-[#e4e4e7] px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-[#71717a]">tools / stack-trace</p>
              <h1 className="mt-2 text-2xl font-semibold text-[#09090b]">Stack Trace Explainer</h1>
              <p className="mt-2 text-sm leading-6 text-[#71717a]">Paste a stack trace to identify the error, root frame, app frames, dependency frames, and likely cause.</p>
            </div>
            <div>
              <button type="button" onClick={copyReport} className="inline-flex items-center gap-2 rounded-md border border-[#e4e4e7] bg-white px-3 py-2 text-sm font-semibold text-[#09090b] hover:bg-[#fafafa]">
                <ClipboardDocumentIcon className="h-4 w-4" />
                Copy report
              </button>
              {copyError && <p className="mt-2 text-xs text-red-600">{copyError}</p>}
            </div>
          </div>
        </div>

        <div className="grid gap-5 p-5 lg:grid-cols-[1fr_1fr]">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            className="min-h-[520px] rounded-md border border-[#e4e4e7] bg-[#fafafa] p-4 font-mono text-sm text-[#09090b] outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/15"
            spellCheck={false}
          />

          <div className="space-y-4">
            <div className="rounded-md border border-[#e4e4e7] bg-[#fafafa] p-4">
              <div className="flex items-center gap-2">
                <BoltIcon className="h-5 w-5 text-[#2563eb]" />
                <h2 className="text-base font-semibold text-[#09090b]">{result.errorType}</h2>
              </div>
              <p className="mt-2 break-words font-mono text-sm text-[#71717a]">{result.message || 'No error message detected.'}</p>
              <p className="mt-3 text-sm leading-6 text-[#09090b]">{result.likelyCause}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Stat label="Frames" value={result.frames.length} />
              <Stat label="App frames" value={result.appFrames.length} />
              <Stat label="Dependencies" value={result.dependencyFrames.length} />
            </div>

            {result.rootFrame && (
              <div className="rounded-md border border-[#e4e4e7] bg-white p-4">
                <h2 className="text-sm font-semibold text-[#09090b]">Root application frame</h2>
                <p className="mt-2 font-mono text-sm text-[#2563eb]">{result.rootFrame.functionName}</p>
                <p className="mt-1 break-all font-mono text-xs text-[#71717a]">{result.rootFrame.file}:{result.rootFrame.line || '?'}</p>
              </div>
            )}

            <div className="rounded-md border border-[#e4e4e7] bg-white">
              <div className="border-b border-[#e4e4e7] px-4 py-3 text-sm font-semibold text-[#09090b]">Frames</div>
              <div className="divide-y divide-[#e4e4e7]">
                {result.frames.map((frame, index) => (
                  <div key={`${frame.raw}-${index}`} className="p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-[#2563eb]">{frame.functionName}</span>
                      <span className="rounded-full border border-[#e4e4e7] px-2 py-0.5 text-[11px] font-semibold text-[#71717a]">{frame.isDependency ? 'dependency' : 'app'}</span>
                    </div>
                    <p className="mt-1 break-all font-mono text-xs text-[#71717a]">{frame.file}:{frame.line || '?'}</p>
                  </div>
                ))}
                {result.frames.length === 0 && <p className="p-4 text-sm text-[#71717a]">No stack frames detected yet.</p>}
              </div>
            </div>
          </div>
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
