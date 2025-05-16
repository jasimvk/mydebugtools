'use client';

import React, { useState } from 'react';
import TreeView from './components/TreeView';

export default function JSONFormatterContent() {
  const [input, setInput] = useState('');
  const [formatted, setFormatted] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showTree, setShowTree] = useState(false);

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(input);
      setFormatted(parsed);
      setError(null);
      setShowTree(true);
    } catch (err: any) {
      setError('Invalid JSON: ' + err.message);
      setShowTree(false);
    }
  };

  const handleClear = () => {
    setInput('');
    setFormatted(null);
    setError(null);
    setShowTree(false);
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-4">JSON Formatter & Validator</h1>
      <div className="mb-4">
        <textarea
          className="w-full h-40 p-3 border rounded font-mono text-sm"
          placeholder="Paste or type your JSON here..."
          value={input}
          onChange={e => setInput(e.target.value)}
        />
      </div>
      <div className="flex gap-2 mb-4">
        <button
          onClick={handleFormat}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Format & Validate
        </button>
        <button
          onClick={handleClear}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
        >
          Clear
        </button>
      </div>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {showTree && formatted && (
        <div className="mt-6 border rounded bg-gray-50 p-4">
          <TreeView data={formatted} />
        </div>
      )}
    </div>
  );
} 