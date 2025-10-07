'use client';

import React, { useState, useEffect } from 'react';
import { 
  CodeBracketIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  ClipboardIcon,
  ArrowDownTrayIcon,
  SparklesIcon,
  LightBulbIcon,
  TrashIcon,
  DocumentTextIcon,
  SunIcon,
  MoonIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  BeakerIcon,
  ChartBarIcon,
  PlayIcon
} from '@heroicons/react/24/outline';

export default function JSONTools() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState<{ size: number; lines: number; nodes: number } | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true); // ChatGPT defaults to dark
  const [showHelp, setShowHelp] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const calculateStats = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      const countNodes = (obj: any): number => {
        if (typeof obj !== 'object' || obj === null) return 1;
        if (Array.isArray(obj)) return obj.reduce((count: number, item) => count + countNodes(item), 1);
        return Object.values(obj).reduce((count: number, value) => count + countNodes(value), 1);
      };
      
      return {
        size: new Blob([jsonString]).size,
        lines: jsonString.split('\n').length,
        nodes: countNodes(parsed)
      };
    } catch {
      return null;
    }
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, 2);
      setOutput(formatted);
      setError('');
      setSuccess('JSON formatted successfully!');
      setStats(calculateStats(input));
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError('Invalid JSON: ' + (e as Error).message);
      setOutput('');
      setStats(null);
    }
  };

  const handleMinify = () => {
    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      setError('');
      setSuccess('JSON minified successfully!');
      setStats(calculateStats(input));
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError('Invalid JSON: ' + (e as Error).message);
      setOutput('');
      setStats(null);
    }
  };

  const handleValidate = () => {
    try {
      JSON.parse(input);
      setError('');
      setSuccess('JSON is valid!');
      setStats(calculateStats(input));
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError('Invalid JSON: ' + (e as Error).message);
      setStats(null);
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
    setSuccess('');
    setStats(null);
  };

  const handleLoadSample = () => {
    const sampleData = {
      "name": "MyDebugTools JSON Example",
      "version": "2.0.0",
      "features": {
        "formatting": true,
        "validation": true,
        "minification": true
      },
      "users": [
        {
          "id": 1,
          "name": "John Developer",
          "role": "Frontend Developer",
          "active": true,
          "skills": ["React", "TypeScript", "JSON"]
        },
        {
          "id": 2,
          "name": "Sarah Designer",
          "role": "UI/UX Designer",
          "active": true,
          "skills": ["Figma", "CSS", "Design Systems"]
        }
      ],
      "metadata": {
        "created": "2024-01-01T00:00:00Z",
        "lastModified": new Date().toISOString(),
        "environment": "production"
      }
    };
    setInput(JSON.stringify(sampleData, null, 2));
    setError('');
    setSuccess('Sample JSON loaded!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setSuccess('File downloaded!');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div>
      <div>
        <div className="max-w-7xl mx-auto px-4 py-8">
        
          {/* Quick Actions Bar */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <button
              onClick={handleLoadSample}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center"
            >
              <LightBulbIcon className="h-4 w-4 mr-2" />
              Load Sample
            </button>
            <button
              onClick={handleClear}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              Clear All
            </button>
            <button
              onClick={handleFormat}
              className="bg-white/30 hover:bg-white/40 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center"
            >
              <SparklesIcon className="h-4 w-4 mr-2" />
              Quick Format
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Status Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
            <div className="flex items-center">
              <ExclamationCircleIcon className="h-5 w-5 text-red-400 mr-3" />
              <div>
                <p className="text-red-800 font-medium">Error</p>
                <p className="text-red-700 text-sm mt-1 font-mono">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-400 mr-3" />
              <p className="text-green-800 font-medium">{success}</p>
            </div>
          </div>
        )}

        {/* Statistics Bar */}
        {stats && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-blue-800 font-medium flex items-center">
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                JSON Statistics
              </h3>
              <div className="flex gap-6 text-sm text-blue-600">
                <span><strong>{stats.size}</strong> bytes</span>
                <span><strong>{stats.lines}</strong> lines</span>
                <span><strong>{stats.nodes}</strong> nodes</span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Input JSON</h3>
                <div className="border-2 border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 transition-colors">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="w-full h-96 p-4 font-mono text-sm bg-gray-50 border-0 focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none"
                    placeholder="Paste your JSON here..."
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleFormat}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                  >
                    <SparklesIcon className="h-4 w-4 mr-2" />
                    Format
                  </button>
                  <button
                    onClick={handleMinify}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                  >
                    <CodeBracketIcon className="h-4 w-4 mr-2" />
                    Minify
                  </button>
                  <button
                    onClick={handleValidate}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                  >
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    Validate
                  </button>
                  <button
                    onClick={() => navigator.clipboard.writeText(input)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                  >
                    <ClipboardIcon className="h-4 w-4 mr-2" />
                    Copy
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Formatted Output</h3>
                <div className="border-2 border-gray-200 rounded-lg overflow-hidden relative">
                  <textarea
                    value={output}
                    onChange={(e) => setOutput(e.target.value)}
                    className="w-full h-96 p-4 font-mono text-sm bg-gray-50 border-0 focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none"
                    placeholder="Formatted JSON will appear here..."
                  />
                  {!output && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/90">
                      <div className="text-gray-400 text-center">
                        <p className="font-medium">Formatted JSON will appear here</p>
                        <p className="text-sm mt-2">Enter JSON and click Format</p>
                      </div>
                    </div>
                  )}
                </div>
                {output && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(output);
                        setSuccess('Copied to clipboard!');
                        setTimeout(() => setSuccess(''), 3000);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                    >
                      <ClipboardIcon className="h-4 w-4 mr-2" />
                      Copy Result
                    </button>
                    <button
                      onClick={handleDownload}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                      Download
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
