'use client';

import React, { useState } from 'react';
import { 
  ArrowDownTrayIcon,
  ClipboardIcon,
  CheckIcon,
  ChartBarIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import PageWrapper from '@/components/PageWrapper';
import StructuredData from '@/components/StructuredData';
import { parseSizeToBytes } from '@/app/tools/lib/tool-utils';

interface BundleModule {
  name: string;
  size: number;
  percentage: number;
  type: 'js' | 'css' | 'image' | 'font' | 'other';
}

interface BundleData {
  totalSize: number;
  modules: BundleModule[];
}

function BundleAnalyzer() {
  const [input, setInput] = useState('');
  const [bundleData, setBundleData] = useState<BundleData | null>(null);
  const [copied, setCopied] = useState(false);

  const parseBundleData = (log: string): BundleData | null => {
    try {
      const lines = log.split('\n');
      const modules: BundleModule[] = [];
      let totalSize = 0;

      // The percentage column is specific to webpack-bundle-analyzer; plain build output
      // (`app.js 42 KB`) has only a size, so the share is derived from the total below.
      const parsed: Array<Omit<BundleModule, 'percentage'> & { percentage?: number }> = [];

      lines.forEach(line => {
        const match = line.trim().match(/^(.+?)\s+(\d+(?:\.\d+)?)\s*(b|bytes|kb|kib|mb|mib|gb|gib)?(?:\s+(\d+(?:\.\d+)?)%)?\s*$/i);
        if (!match) return;

        const [, name, size, unit = '', percentage] = match;
        // Without a unit or a percentage the line is just prose that happens to hold a number.
        if (!unit && percentage === undefined) return;

        const moduleSize = parseSizeToBytes(size, unit);
        totalSize += moduleSize;

        let type: BundleModule['type'] = 'other';
        if (name.endsWith('.js')) type = 'js';
        else if (name.endsWith('.css')) type = 'css';
        else if (/\.(png|jpg|jpeg|gif|svg)$/i.test(name)) type = 'image';
        else if (/\.(woff|woff2|ttf|otf)$/i.test(name)) type = 'font';

        parsed.push({
          name,
          size: moduleSize,
          percentage: percentage === undefined ? undefined : parseFloat(percentage),
          type
        });
      });

      // Unparseable text must not render a confident all-zero dashboard.
      if (parsed.length === 0) {
        return null;
      }

      modules.push(...parsed.map(module => ({
        ...module,
        percentage: module.percentage ?? (totalSize > 0 ? (module.size / totalSize) * 100 : 0)
      })));

      return {
        totalSize,
        modules: modules.sort((a, b) => b.size - a.size)
      };
    } catch (error) {
      console.error('Error parsing bundle data:', error);
      return null;
    }
  };

  const handleCopy = () => {
    if (!bundleData) return;
    const summary = `Bundle Size Analysis Summary:
Total Size: ${(bundleData.totalSize / 1024).toFixed(2)} KB

Top Modules:
${bundleData.modules.slice(0, 10).map(m => 
  `${m.name}: ${(m.size / 1024).toFixed(2)} KB (${m.percentage.toFixed(1)}%)`
).join('\n')}`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!bundleData) return;
    const summary = `Bundle Size Analysis Summary:
Total Size: ${(bundleData.totalSize / 1024).toFixed(2)} KB

Detailed Analysis:
${bundleData.modules.map(m => 
  `${m.name}: ${(m.size / 1024).toFixed(2)} KB (${m.percentage.toFixed(1)}%)`
).join('\n')}`;

    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bundle-analysis.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadSample = () => {
    const sample = `node_modules/react/index.js 42.1 KB 18.2%
src/app/tools/api/page.tsx 88.4 KB 38.2%
src/app/tools/json/page.tsx 7.3 KB 3.1%
public/fonts/roboto-mono-latin-variable.woff2 64 KB 27.7%
src/app/globals.css 18.5 KB 8.0%`;
    setInput(sample);
    setBundleData(parseBundleData(sample));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <StructuredData
        title="Bundle Size Analyzer | debugtools"
        description="Analyze and optimize your app bundle size"
        toolType="WebApplication"
      />

      <div className="mb-4 flex flex-col justify-between gap-3 rounded-md border border-[#e4e4e7] bg-white px-5 py-4 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-[#71717a]">tools/bundle</p>
          <h1 className="mt-2 text-[#09090b]">Bundle Size Analyzer</h1>
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
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-medium text-gray-900">Bundle Analysis Input</h2>
            <p className="text-sm text-gray-600 mt-1">
              Paste your webpack-bundle-analyzer output here
            </p>
          </div>
          <textarea
            aria-label="Bundle analysis input"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              const data = parseBundleData(e.target.value);
              setBundleData(data);
            }}
            placeholder="node_modules/react/index.js 123.45 KB 15.6%
src/components/App.js 45.67 KB 5.8%
..."
            className="w-full h-[400px] font-mono text-sm p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Output Section */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Analysis Results</h2>
            <div className="flex space-x-2">
              <button
                onClick={handleCopy}
                disabled={!bundleData}
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
                disabled={!bundleData}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-1.5" />
                Download
              </button>
            </div>
          </div>

          {bundleData ? (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-blue-600 font-medium">Total Size</div>
                  <div className="text-2xl font-bold text-blue-900">
                    {(bundleData.totalSize / 1024).toFixed(2)} KB
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-green-600 font-medium">Module Count</div>
                  <div className="text-2xl font-bold text-green-900">
                    {bundleData.modules.length}
                  </div>
                </div>
              </div>

              {/* Module List */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Top Modules</h3>
                <div className="space-y-2">
                  {bundleData.modules.slice(0, 10).map((module, index) => (
                    <div key={index} className="relative">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{module.name}</span>
                        <span className="text-gray-500">
                          {(module.size / 1024).toFixed(2)} KB ({module.percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="h-2 relative w-full bg-gray-200 rounded mt-1">
                        <div
                          className={`absolute h-full rounded ${
                            module.type === 'js' ? 'bg-blue-500' :
                            module.type === 'css' ? 'bg-green-500' :
                            module.type === 'image' ? 'bg-yellow-500' :
                            module.type === 'font' ? 'bg-purple-500' :
                            'bg-gray-500'
                          }`}
                          style={{
                            // Percentages come straight from pasted input.
                            width: `${Math.min(100, Math.max(0, module.percentage))}%`
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[400px] flex items-center justify-center text-gray-500">
              <div className="text-center">
                <ChartBarIcon className="h-12 w-12 mx-auto mb-4" />
                <p>Paste bundle analysis data to see results</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 rounded-md border border-[#e4e4e7] bg-white px-4 py-3 text-sm text-[#71717a]">
        Accepts lines like <code>src/app/page.tsx 42 KB 12.5%</code>.
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <PageWrapper>
      <BundleAnalyzer />
    </PageWrapper>
  );
} 
