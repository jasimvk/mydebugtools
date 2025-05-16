'use client';

import { useState } from 'react';
import { KeyIcon, ClipboardIcon } from '@heroicons/react/24/outline';

interface JWTPayload {
  [key: string]: any;
}

export default function JWTContent() {
  const [token, setToken] = useState('');
  const [header, setHeader] = useState<JWTPayload | null>(null);
  const [payload, setPayload] = useState<JWTPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const decodeToken = () => {
    try {
      setError(null);
      const [headerB64, payloadB64] = token.split('.');
      
      if (!headerB64 || !payloadB64) {
        throw new Error('Invalid JWT format');
      }

      const header = JSON.parse(atob(headerB64));
      const payload = JSON.parse(atob(payloadB64));

      setHeader(header);
      setPayload(payload);
    } catch (err) {
      setError('Invalid JWT token');
      setHeader(null);
      setPayload(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">JWT Decoder</h1>
      
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <KeyIcon className="h-5 w-5 text-gray-500" />
          <label htmlFor="token" className="text-sm font-medium text-gray-700">
            JWT Token
          </label>
        </div>
        <div className="flex gap-2">
          <input
            id="token"
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter your JWT token..."
            className="flex-1 p-2 border rounded-md font-mono text-sm"
          />
          <button
            onClick={decodeToken}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Decode
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      {(header || payload) && (
        <div className="space-y-6">
          {header && (
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold">Header</h2>
                <button
                  onClick={() => copyToClipboard(JSON.stringify(header, null, 2))}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Copy to clipboard"
                >
                  <ClipboardIcon className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <pre className="text-sm overflow-x-auto">
                {JSON.stringify(header, null, 2)}
              </pre>
            </div>
          )}

          {payload && (
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold">Payload</h2>
                <button
                  onClick={() => copyToClipboard(JSON.stringify(payload, null, 2))}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Copy to clipboard"
                >
                  <ClipboardIcon className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <pre className="text-sm overflow-x-auto">
                {JSON.stringify(payload, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {copied && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg">
          Copied to clipboard!
        </div>
      )}
    </div>
  );
} 