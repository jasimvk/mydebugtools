'use client';

import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'JWT Decoder – Decode and Verify Tokens | MyDebugTools',
  description: 'Instantly decode and inspect JSON Web Tokens (JWT). View headers, payloads, and signature details securely in your browser.',
  path: '/tools/jwt',
  keywords: ['jwt decoder','jwt viewer','decode jwt','verify jwt','jwt inspector'],
})

import { useState } from 'react';
import { KeyIcon, ClipboardIcon } from '@heroicons/react/24/outline';

interface JWTPayload {
  [key: string]: any;
}

export default function JWTDecoder() {
  const [token, setToken] = useState('');
  const [header, setHeader] = useState<JWTPayload | null>(null);
  const [payload, setPayload] = useState<JWTPayload | null>(null);
  const [error, setError] = useState('');

  const decodeToken = () => {
    try {
      if (!token.trim()) {
        setError('Please enter a JWT token');
        setHeader(null);
        setPayload(null);
        return;
      }

      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }

      const decodedHeader = JSON.parse(atob(parts[0]));
      const decodedPayload = JSON.parse(atob(parts[1]));

      setHeader(decodedHeader);
      setPayload(decodedPayload);
      setError('');
    } catch (err) {
      setError('Invalid JWT token: Please check your input');
      setHeader(null);
      setPayload(null);
    }
  };

  const formatJSON = (obj: any) => {
    return JSON.stringify(obj, null, 2);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">JWT Decoder</h1>
          <p className="text-gray-600">Decode and verify JSON Web Tokens</p>
        </div>
      </div>

      {/* Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">JWT Token</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste your JWT token here..."
            className="flex-1 p-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={decodeToken}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <KeyIcon className="h-5 w-5" />
            Decode
          </button>
        </div>
      </div>

      {error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {/* Header */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Header</label>
            <pre className="w-full h-[300px] p-4 font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg overflow-auto">
              <code>{header ? formatJSON(header) : ''}</code>
            </pre>
          </div>

          {/* Payload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Payload</label>
            <pre className="w-full h-[300px] p-4 font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg overflow-auto">
              <code>{payload ? formatJSON(payload) : ''}</code>
            </pre>
          </div>
        </div>
      )}

      {(header || payload) && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Token Information</h2>
          <div className="grid grid-cols-2 gap-4">
            {payload?.exp && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-500">Expires</div>
                <div className="text-gray-900">
                  {new Date(payload.exp * 1000).toLocaleString()}
                </div>
              </div>
            )}
            {payload?.iat && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-500">Issued At</div>
                <div className="text-gray-900">
                  {new Date(payload.iat * 1000).toLocaleString()}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 