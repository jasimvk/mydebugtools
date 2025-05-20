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

interface DiffChange {
  type: 'added' | 'removed' | 'modified';
  path: string;
  oldSize?: number;
  newSize?: number;
  diff?: number;
}

interface DiffData {
  changes: DiffChange[];
  totalAdded: number;
  totalRemoved: number;
  totalModified: number;
}

function BuildDiffViewer() {
  const [oldBuild, setOldBuild] = useState('');
  const [newBuild, setNewBuild] = useState('');
  const [diffData, setDiffData] = useState<DiffData | null>(null);
  const [copied, setCopied] = useState(false);

  const parseBuildData = (build: string): Map<string, number> => {
    const files = new Map<string, number>();
    const lines = build.split('\n');
    
    lines.forEach(line => {
      const match = line.match(/(.+?)\s+(\d+\.?\d*)/);
      if (match) {
        const [_, path, size] = match;
        files.set(path, parseFloat(size));
      }
    });

    return files;
  };

  const calculateDiff = () => {
    if (!oldBuild || !newBuild) return;

    const oldFiles = parseBuildData(oldBuild);
    const newFiles = parseBuildData(newBuild);
    const changes: DiffChange[] = [];
    let totalAdded = 0;
    let totalRemoved = 0;
    let totalModified = 0;

    // Find added and modified files
    newFiles.forEach((newSize, path) => {
      const oldSize = oldFiles.get(path);
      if (!oldSize) {
        changes.push({
          type: 'added',
          path,
          newSize
        });
        totalAdded += newSize;
      } else if (oldSize !== newSize) {
        changes.push({
          type: 'modified',
          path,
          oldSize,
          newSize,
          diff: newSize - oldSize
        });
        totalModified += Math.abs(newSize - oldSize);
      }
    });

    // Find removed files
    oldFiles.forEach((oldSize, path) => {
      if (!newFiles.has(path)) {
        changes.push({
          type: 'removed',
          path,
          oldSize
        });
        totalRemoved += oldSize;
      }
    });

    setDiffData({
      changes: changes.sort((a, b) => {
        // Sort by type (added, modified, removed) then by absolute size change
        const typeOrder = { added: 0, modified: 1, removed: 2 };
        const typeDiff = typeOrder[a.type] - typeOrder[b.type];
        if (typeDiff !== 0) return typeDiff;
        
        const aSize = Math.abs(a.diff || a.newSize || a.oldSize || 0);
        const bSize = Math.abs(b.diff || b.newSize || b.oldSize || 0);
        return bSize - aSize;
      }),
      totalAdded,
      totalRemoved,
      totalModified
    });
  };

  const handleCopy = () => {
    if (!diffData) return;
    const summary = `Build Diff Summary:
Added: ${(diffData.totalAdded / 1024).toFixed(2)} KB
Removed: ${(diffData.totalRemoved / 1024).toFixed(2)} KB
Modified: ${(diffData.totalModified / 1024).toFixed(2)} KB

Changes:
${diffData.changes.map(c => {
  if (c.type === 'added') return `+ ${c.path} (${(c.newSize! / 1024).toFixed(2)} KB)`;
  if (c.type === 'removed') return `- ${c.path} (${(c.oldSize! / 1024).toFixed(2)} KB)`;
  return `~ ${c.path} (${(c.diff! / 1024).toFixed(2)} KB)`;
}).join('\n')}`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!diffData) return;
    const summary = `Build Diff Summary:
Added: ${(diffData.totalAdded / 1024).toFixed(2)} KB
Removed: ${(diffData.totalRemoved / 1024).toFixed(2)} KB
Modified: ${(diffData.totalModified / 1024).toFixed(2)} KB

Detailed Changes:
${diffData.changes.map(c => {
  if (c.type === 'added') return `+ ${c.path} (${(c.newSize! / 1024).toFixed(2)} KB)`;
  if (c.type === 'removed') return `- ${c.path} (${(c.oldSize! / 1024).toFixed(2)} KB)`;
  return `~ ${c.path} (${(c.diff! / 1024).toFixed(2)} KB)`;
}).join('\n')}`;

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

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <StructuredData
        title="Build Diff Viewer | MyDebugTools"
        description="Compare and analyze build differences"
        toolType="WebApplication"
      />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Build Diff Viewer</h1>
        <p className="text-lg text-gray-600">
          Compare and analyze differences between builds
        </p>
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
              value={oldBuild}
              onChange={(e) => {
                setOldBuild(e.target.value);
                calculateDiff();
              }}
              placeholder="src/index.js 123.45
src/components/App.js 45.67
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
              value={newBuild}
              onChange={(e) => {
                setNewBuild(e.target.value);
                calculateDiff();
              }}
              placeholder="src/index.js 123.45
src/components/App.js 45.67
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

          {diffData ? (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-4">
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
                  {diffData.changes.map((change, index) => (
                    <div key={index} className="relative">
                      <div className="flex justify-between text-sm">
                        <span className={`font-medium ${
                          change.type === 'added' ? 'text-green-600' :
                          change.type === 'removed' ? 'text-red-600' :
                          'text-yellow-600'
                        }`}>
                          {change.type === 'added' ? '+' :
                           change.type === 'removed' ? '-' : '~'} {change.path}
                        </span>
                        <span className="text-gray-500">
                          {change.type === 'added' ? 
                            `+${(change.newSize! / 1024).toFixed(2)} KB` :
                           change.type === 'removed' ? 
                            `-${(change.oldSize! / 1024).toFixed(2)} KB` :
                            `${(change.diff! / 1024).toFixed(2)} KB`}
                        </span>
                      </div>
                    </div>
                  ))}
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

      {/* Help Section */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h2 className="text-lg font-medium text-blue-900 mb-4">How to Get Build Analysis Data</h2>
        <div className="prose prose-blue">
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Run your build command with size analysis:
              <pre className="bg-blue-100 p-2 rounded mt-1 text-sm">
                webpack --profile --json {'>'} stats.json
              </pre>
            </li>
            <li>Use webpack-bundle-analyzer to generate the analysis:
              <pre className="bg-blue-100 p-2 rounded mt-1 text-sm">
                webpack-bundle-analyzer stats.json
              </pre>
            </li>
            <li>Copy the file sizes from the analysis</li>
            <li>Paste them here to compare builds</li>
          </ol>
        </div>
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