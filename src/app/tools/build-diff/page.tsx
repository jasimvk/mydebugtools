'use client';

import React, { useState } from 'react';
import { 
  ArrowDownTrayIcon,
  ClipboardIcon,
  CheckIcon,
  ArrowsRightLeftIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import PageWrapper from '@/components/PageWrapper';
import StructuredData from '@/components/StructuredData';
import { buildDiffFromText, type DiffData } from '@/app/tools/lib/tool-utils';

function BuildDiffViewer() {
  const [oldBuild, setOldBuild] = useState('');
  const [newBuild, setNewBuild] = useState('');
  const [diffData, setDiffData] = useState<DiffData | null>(null);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState('');

  const calculateDiff = (oldBuildInput = oldBuild, newBuildInput = newBuild) => {
    // One empty side is a meaningful diff (everything added, or everything removed);
    // only two empty sides mean there is nothing to show.
    if (!oldBuildInput.trim() && !newBuildInput.trim()) {
      setDiffData(null);
      return;
    }

    setDiffData(buildDiffFromText(oldBuildInput, newBuildInput));
  };

  const formatSignedKb = (bytes: number) => `${bytes >= 0 ? '+' : '-'}${(Math.abs(bytes) / 1024).toFixed(2)} KB`;

  // The headline "did my bundle get bigger?" number: totalModified sums absolute values,
  // so growth and shrinkage cancel out only in this signed total.
  const netDelta = (diffData?.changes || []).reduce((sum, change) => {
    if (change.type === 'added') return sum + (change.newSize || 0);
    if (change.type === 'removed') return sum - (change.oldSize || 0);
    return sum + (change.diff || 0);
  }, 0);

  const buildSummary = (data: DiffData, heading: string) => `Build Diff Summary:
Net change: ${formatSignedKb(netDelta)}
Added: ${(data.totalAdded / 1024).toFixed(2)} KB
Removed: ${(data.totalRemoved / 1024).toFixed(2)} KB
Modified: ${(data.totalModified / 1024).toFixed(2)} KB

${heading}:
${data.changes.map(c => {
  if (c.type === 'added') return `+ ${c.path} (${(c.newSize! / 1024).toFixed(2)} KB)`;
  if (c.type === 'removed') return `- ${c.path} (${(c.oldSize! / 1024).toFixed(2)} KB)`;
  return `~ ${c.path} (${formatSignedKb(c.diff!)})`;
}).join('\n')}`;

  const handleCopy = async () => {
    if (!diffData) return;
    try {
      await navigator.clipboard.writeText(buildSummary(diffData, 'Changes'));
      setCopied(true);
      setCopyError('');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyError('Could not copy to the clipboard. Use Download instead.');
    }
  };

  const handleDownload = () => {
    if (!diffData) return;
    const summary = buildSummary(diffData, 'Detailed Changes');

    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'build-diff.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadSample = () => {
    const oldSample = `app.js 140 KB
vendor.js 420 KB
styles.css 24 KB`;
    const newSample = `app.js 156 KB
vendor.js 390 KB
styles.css 24 KB
analytics.js 18 KB`;
    setOldBuild(oldSample);
    setNewBuild(newSample);
    calculateDiff(oldSample, newSample);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <StructuredData
        title="Build Diff Viewer | debugtools"
        description="Compare and analyze build differences"
        toolType="WebApplication"
      />

      <div className="mb-4 flex flex-col justify-between gap-3 rounded-md border border-[#e4e4e7] bg-white px-5 py-4 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-[#71717a]">tools/build-diff</p>
          <h1 className="mt-2 text-[#09090b]">Build Diff Viewer</h1>
        </div>
        <button
          type="button"
          onClick={loadSample}
          className="rounded-md border border-[#e4e4e7] bg-white px-3 py-2 text-sm font-semibold text-[#09090b] hover:bg-[#fafafa]"
        >
          Sample
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-medium text-gray-900">Old Build</h2>
              <p className="text-sm text-gray-600 mt-1">
                Paste your old build analysis here
              </p>
            </div>
            <textarea
              aria-label="Old build analysis"
              value={oldBuild}
              onChange={(e) => {
                const nextOldBuild = e.target.value;
                setOldBuild(nextOldBuild);
                calculateDiff(nextOldBuild, newBuild);
              }}
              placeholder="src/index.js 123.45 KB
src/components/App.js 45.67 KB
..."
              className="w-full h-[200px] font-mono text-sm p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <div className="mb-4">
              <h2 className="text-lg font-medium text-gray-900">New Build</h2>
              <p className="text-sm text-gray-600 mt-1">
                Paste your new build analysis here
              </p>
            </div>
            <textarea
              aria-label="New build analysis"
              value={newBuild}
              onChange={(e) => {
                const nextNewBuild = e.target.value;
                setNewBuild(nextNewBuild);
                calculateDiff(oldBuild, nextNewBuild);
              }}
              placeholder="src/index.js 132.11 KB
src/components/App.js 41.20 KB
..."
              className="w-full h-[200px] font-mono text-sm p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Output Section */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Diff Results</h2>
            <div className="flex space-x-2">
              <button
                onClick={handleCopy}
                disabled={!diffData}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {copied ? (
                  <CheckIcon className="h-4 w-4 mr-1.5 text-green-500" />
                ) : (
                  <ClipboardIcon className="h-4 w-4 mr-1.5" />
                )}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={handleDownload}
                disabled={!diffData}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-1.5" />
                Download
              </button>
            </div>
          </div>

          {copyError && <p role="alert" className="mb-4 text-sm text-red-600">{copyError}</p>}

          {diffData ? (
            <div className="space-y-6">
              {(!oldBuild.trim() || !newBuild.trim()) && (
                <p className="rounded-md border border-[#bf8700] bg-[#fff8c5] px-3 py-2 text-sm text-[#7d4e00]">
                  Only the {oldBuild.trim() ? 'old' : 'new'} build is filled in, so every file counts as{' '}
                  {oldBuild.trim() ? 'removed' : 'added'}.
                </p>
              )}

              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className={`p-4 rounded-lg ${netDelta > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
                  <div className={`text-sm font-medium ${netDelta > 0 ? 'text-red-600' : 'text-green-600'}`}>Net change</div>
                  <div className={`text-2xl font-bold ${netDelta > 0 ? 'text-red-900' : 'text-green-900'}`}>
                    {formatSignedKb(netDelta)}
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-green-600 font-medium">Added</div>
                  <div className="text-2xl font-bold text-green-900">
                    {(diffData.totalAdded / 1024).toFixed(2)} KB
                  </div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-sm text-red-600 font-medium">Removed</div>
                  <div className="text-2xl font-bold text-red-900">
                    {(diffData.totalRemoved / 1024).toFixed(2)} KB
                  </div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-sm text-yellow-600 font-medium">Modified</div>
                  <div className="text-2xl font-bold text-yellow-900">
                    {(diffData.totalModified / 1024).toFixed(2)} KB
                  </div>
                </div>
              </div>

              {/* Changes List */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Changes</h3>
                <div className="space-y-2">
                  {diffData.changes.map((change, index) => {
                    // A modified file that grew is bad news and a shrunk one is good news;
                    // one shared yellow hides the direction that matters.
                    const tone = (change.diff || 0) > 0 ? 'text-red-600' : 'text-green-600';

                    return (
                      <div key={index} className="relative">
                        <div className="flex justify-between text-sm">
                          <span className={`font-medium ${
                            change.type === 'added' ? 'text-green-600' :
                            change.type === 'removed' ? 'text-red-600' :
                            tone
                          }`}>
                            {change.type === 'added' ? '+' :
                             change.type === 'removed' ? '-' : '~'} {change.path}
                          </span>
                          <span className={change.type === 'modified' ? tone : 'text-gray-500'}>
                            {change.type === 'added' ?
                              `+${(change.newSize! / 1024).toFixed(2)} KB` :
                             change.type === 'removed' ?
                              `-${(change.oldSize! / 1024).toFixed(2)} KB` :
                              formatSignedKb(change.diff!)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[400px] flex items-center justify-center text-gray-500">
              <div className="text-center">
                <ArrowsRightLeftIcon className="h-12 w-12 mx-auto mb-4" />
                <p>Paste build analysis data to see differences</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 rounded-md border border-[#e4e4e7] bg-white px-4 py-3 text-sm text-[#71717a]">
        Accepts one file per line, for example <code>app.js 156 KB</code>.
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <PageWrapper>
      <BuildDiffViewer />
    </PageWrapper>
  );
}
