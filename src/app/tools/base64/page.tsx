'use client';

import { useState } from 'react';
import { CommandLineIcon, ClipboardIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/outline';

export default function Base64Tools() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [error, setError] = useState('');

  const handleConvert = () => {
    try {
      if (!input.trim()) {
        setOutput('');
        setError('Please enter some text to convert');
        return;
      }

      if (mode === 'encode') {
        const encoded = btoa(input);
        setOutput(encoded);
      } else {
        const decoded = atob(input);
        setOutput(decoded);
      }
      setError('');
    } catch (err) {
      setError(`Invalid ${mode === 'encode' ? 'text' : 'Base64'}: Please check your input`);
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

  const toggleMode = () => {
    setMode(mode === 'encode' ? 'decode' : 'encode');
    setInput(output);
    setOutput('');
    setError('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Base64 Tools</h1>
          <p className="text-gray-600">Encode and decode Base64 strings</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={toggleMode}
            className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ArrowsRightLeftIcon className="h-5 w-5" />
            Switch Mode
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
          <label className="block text-sm font-medium text-gray-700">
            {mode === 'encode' ? 'Text to Encode' : 'Base64 to Decode'}
          </label>
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 to decode...'}
              className="w-full h-[300px] p-4 font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={handleConvert}
              className="absolute bottom-4 right-4 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <CommandLineIcon className="h-5 w-5" />
              {mode === 'encode' ? 'Encode' : 'Decode'}
            </button>
          </div>
        </div>

        {/* Output */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Result</label>
          <pre className="w-full h-[300px] p-4 font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg overflow-auto">
            {error ? (
              <span className="text-red-500">{error}</span>
            ) : (
              <code>{output}</code>
            )}
          </pre>
        </div>
      </div>
    </div>
  );
} 