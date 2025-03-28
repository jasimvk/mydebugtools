'use client';

import { useState, useEffect } from 'react';
import { ArrowPathIcon, DocumentDuplicateIcon, ArrowDownTrayIcon, CheckIcon, ViewColumnsIcon, CodeBracketIcon, TableCellsIcon } from '@heroicons/react/24/outline';
import Editor from '@monaco-editor/react';
import TreeView from './components/TreeView';
import { jsonrepair } from 'jsonrepair';

type ViewMode = 'code' | 'tree' | 'table';

export default function JSONFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [indentSize, setIndentSize] = useState(2);
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<'beautify' | 'minify'>('beautify');
  const [viewMode, setViewMode] = useState<ViewMode>('code');
  const [parsedData, setParsedData] = useState<any>(null);

  const formatJSON = () => {
    try {
      let jsonToFormat = input;
      
      // Try to repair JSON if it's invalid
      try {
        JSON.parse(input);
      } catch {
        jsonToFormat = jsonrepair(input);
      }

      const parsedJSON = JSON.parse(jsonToFormat);
      setParsedData(parsedJSON);
      
      if (mode === 'beautify') {
        setOutput(JSON.stringify(parsedJSON, null, indentSize));
      } else {
        setOutput(JSON.stringify(parsedJSON));
      }
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON');
      setOutput('');
      setParsedData(null);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setInput(text);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">JSON Formatter</h1>
          <p className="text-gray-600 dark:text-gray-300">Format, validate, and beautify your JSON data</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-4">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
                  >
                    Upload JSON
                  </label>
                </label>
              </div>
            </div>
            <Editor
              height="500px"
              defaultLanguage="json"
              value={input}
              onChange={(value) => setInput(value || '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>

          {/* Output Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-4">
                <select
                  value={indentSize}
                  onChange={(e) => setIndentSize(Number(e.target.value))}
                  className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-200"
                >
                  <option value={2}>2 Spaces</option>
                  <option value={4}>4 Spaces</option>
                  <option value={6}>6 Spaces</option>
                </select>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as 'beautify' | 'minify')}
                  className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-200"
                >
                  <option value="beautify">Beautify</option>
                  <option value="minify">Minify</option>
                </select>
                <button
                  onClick={formatJSON}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 flex items-center space-x-2"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                  <span>Format</span>
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('code')}
                    className={`p-2 ${
                      viewMode === 'code'
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400'
                    }`}
                  >
                    <CodeBracketIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('tree')}
                    className={`p-2 ${
                      viewMode === 'tree'
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400'
                    }`}
                  >
                    <ViewColumnsIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-2 ${
                      viewMode === 'table'
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400'
                    }`}
                  >
                    <TableCellsIcon className="h-5 w-5" />
                  </button>
                </div>
                <button
                  onClick={handleCopy}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
                  disabled={!output}
                >
                  {copied ? (
                    <CheckIcon className="h-5 w-5 text-green-500" />
                  ) : (
                    <DocumentDuplicateIcon className="h-5 w-5" />
                  )}
                </button>
                <button
                  onClick={handleDownload}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
                  disabled={!output}
                >
                  <ArrowDownTrayIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            {error ? (
              <div className="p-4 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
                {error}
              </div>
            ) : (
              <div className="h-[500px]">
                {viewMode === 'code' && (
                  <Editor
                    height="500px"
                    defaultLanguage="json"
                    value={output}
                    theme="vs-dark"
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                    }}
                  />
                )}
                {viewMode === 'tree' && parsedData && (
                  <TreeView data={parsedData} />
                )}
                {viewMode === 'table' && parsedData && (
                  <div className="p-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg overflow-auto h-[500px]">
                    <pre className="text-sm font-mono text-gray-900 dark:text-white">
                      {JSON.stringify(parsedData, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 