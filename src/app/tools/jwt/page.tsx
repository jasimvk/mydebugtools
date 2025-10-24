'use client';

import { useState } from 'react';
import { KeyIcon, ClipboardIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface JWTPayload {
  [key: string]: any;
}

export default function JWTDecoder() {
  const [token, setToken] = useState('');
  const [header, setHeader] = useState<JWTPayload | null>(null);
  const [payload, setPayload] = useState<JWTPayload | null>(null);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState<'header' | 'payload' | null>(null);

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

  const copyToClipboard = async (text: string, type: 'header' | 'payload') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(type);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      decodeToken();
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <KeyIcon className="h-8 w-8 text-[#FF6C37]" />
              <h1 className="text-3xl font-bold text-gray-900">JWT Decoder</h1>
            </div>
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
            onKeyDown={handleKeyPress}
            placeholder="Paste your JWT token here..."
            className="flex-1 p-3 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF6C37] focus:border-[#FF6C37]"
          />
          <button
            onClick={decodeToken}
            className="flex items-center gap-2 bg-[#FF6C37] text-white px-6 py-3 rounded-lg hover:bg-[#ff5722] transition-colors font-medium"
            title="Decode JWT (Cmd/Ctrl + Enter)"
          >
            <KeyIcon className="h-5 w-5" />
            Decode
          </button>
        </div>
        <p className="text-xs text-gray-500">Press Cmd/Ctrl + Enter to decode</p>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <svg className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        </div>
      ) : (
        (header || payload) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-gray-900">Header</label>
              {header && (
                <button
                  onClick={() => copyToClipboard(formatJSON(header), 'header')}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                >
                  {copySuccess === 'header' ? (
                    <>
                      <CheckCircleIcon className="h-4 w-4 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <ClipboardIcon className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </button>
              )}
            </div>
            <pre className="w-full h-[400px] p-4 font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg overflow-auto">
              <code>{header ? formatJSON(header) : ''}</code>
            </pre>
          </div>

          {/* Payload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-gray-900">Payload</label>
              {payload && (
                <button
                  onClick={() => copyToClipboard(formatJSON(payload), 'payload')}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                >
                  {copySuccess === 'payload' ? (
                    <>
                      <CheckCircleIcon className="h-4 w-4 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <ClipboardIcon className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </button>
              )}
            </div>
            <pre className="w-full h-[400px] p-4 font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg overflow-auto">
              <code>{payload ? formatJSON(payload) : ''}</code>
            </pre>
          </div>
        </div>
        )
      )}

      {(header || payload) && (
        <div className="space-y-4 mt-6">
          <h2 className="text-lg font-semibold text-gray-900">Token Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {payload?.exp && (
              <div className="p-4 bg-[#FFF5F2] border border-[#FFD4C8] rounded-lg">
                <div className="text-sm font-medium text-gray-600">Expires</div>
                <div className="text-gray-900 font-semibold">
                  {new Date(payload.exp * 1000).toLocaleString()}
                </div>
              </div>
            )}
            {payload?.iat && (
              <div className="p-4 bg-[#FFF5F2] border border-[#FFD4C8] rounded-lg">
                <div className="text-sm font-medium text-gray-600">Issued At</div>
                <div className="text-gray-900 font-semibold">
                  {new Date(payload.iat * 1000).toLocaleString()}
                </div>
              </div>
            )}
            {payload?.iss && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="text-sm font-medium text-gray-600">Issuer</div>
                <div className="text-gray-900 font-semibold">
                  {payload.iss}
                </div>
              </div>
            )}
            {payload?.sub && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="text-sm font-medium text-gray-600">Subject</div>
                <div className="text-gray-900 font-semibold">
                  {payload.sub}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">What is JWT?</h3>
          <p className="text-sm text-gray-700 mb-3">
            JSON Web Tokens (JWT) are an open standard for securely transmitting information between parties as a JSON object.
          </p>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="font-semibold text-[#FF6C37]">•</span>
              <span>Compact, URL-safe token format</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-[#FF6C37]">•</span>
              <span>Self-contained with user information</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-[#FF6C37]">•</span>
              <span>Digitally signed for verification</span>
            </li>
          </ul>
        </div>

        <div className="bg-[#FFF5F2] rounded-lg p-6 border border-[#FFD4C8]">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Security Note</h3>
          <p className="text-sm text-gray-700 mb-3">
            This decoder only decodes the JWT - it does not verify the signature.
          </p>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="font-semibold text-[#FF6C37]">•</span>
              <span>Do not trust the decoded data without verification</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-[#FF6C37]">•</span>
              <span>Always validate tokens on your server</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-[#FF6C37]">•</span>
              <span>Never expose your secret keys in client-side code</span>
            </li>
          </ul>
        </div>
      </div>
      </div>
    </div>
  );
} 