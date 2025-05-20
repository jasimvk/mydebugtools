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

      lines.forEach(line => {
        // Match webpack-bundle-analyzer format
        const match = line.match(/(.+?)\s+(\d+\.?\d*)\s+([\d.]+)%/);
        if (match) {
          const [_, name, size, percentage] = match;
          const moduleSize = parseFloat(size);
          totalSize += moduleSize;

          let type: BundleModule['type'] = 'other';
          if (name.endsWith('.js')) type = 'js';
          else if (name.endsWith('.css')) type = 'css';
          else if (/\.(png|jpg|jpeg|gif|svg)$/i.test(name)) type = 'image';
          else if (/\.(woff|woff2|ttf|otf)$/i.test(name)) type = 'font';

          modules.push({
            name,
            size: moduleSize,
            percentage: parseFloat(percentage),
            type
          });
        }
      });

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
  `${m.name}: ${(m.size / 1024).toFixed(2)} KB (${m.percentage}%)`
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
  `${m.name}: ${(m.size / 1024).toFixed(2)} KB (${m.percentage}%)`
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <StructuredData
        title="Bundle Size Analyzer | MyDebugTools"
        description="Analyze and optimize your app bundle size"
        toolType="WebApplication"
      />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bundle Size Analyzer</h1>
        <p className="text-lg text-gray-600">
          Analyze and optimize your app bundle size
        </p>
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
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              const data = parseBundleData(e.target.value);
              setBundleData(data);
            }}
            placeholder="node_modules/react/index.js 123.45 15.6%
src/components/App.js 45.67 5.8%
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
                          {(module.size / 1024).toFixed(2)} KB ({module.percentage}%)
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
                            width: `${module.percentage}%`
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

      {/* Help Section */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h2 className="text-lg font-medium text-blue-900 mb-4">How to Get Bundle Analysis Data</h2>
        <div className="prose prose-blue">
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Install webpack-bundle-analyzer:
              <pre className="bg-blue-100 p-2 rounded mt-1 text-sm">
                npm install --save-dev webpack-bundle-analyzer
              </pre>
            </li>
            <li>Add to your webpack config:
              <pre className="bg-blue-100 p-2 rounded mt-1 text-sm">
                {`const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin()
  ]
}`}
              </pre>
            </li>
            <li>Run your build command</li>
            <li>Copy the analysis output</li>
            <li>Paste it here for detailed analysis</li>
          </ol>
        </div>
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