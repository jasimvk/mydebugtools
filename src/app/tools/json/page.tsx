'use client';

import { useState } from 'react';
import { CodeBracketIcon, ClipboardIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function JSONFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const formatJSON = () => {
    try {
      if (!input.trim()) {
        setOutput('');
        setError('Please enter some JSON to format');
        return;
      }

      // Parse and stringify with indentation
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, 2);
      setOutput(formatted);
      setError('');
    } catch (err) {
      setError('Invalid JSON: Please check your input');
      setOutput('');
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">JSON Formatter</h1>
          <p className="text-gray-600">Format, validate, and beautify your JSON data</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={formatJSON}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowPathIcon className="h-5 w-5" />
            Format
          </button>
          {output && (
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ClipboardIcon className="h-5 w-5" />
              Copy
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Input JSON</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your JSON here..."
            className="w-full h-[500px] p-4 font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Output */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Formatted JSON</label>
          <div className="relative">
            <pre className="w-full h-[500px] p-4 font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg overflow-auto">
              {error ? (
                <span className="text-red-500">{error}</span>
              ) : (
                <code>{output}</code>
              )}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
} 