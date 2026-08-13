'use client';

import { useMemo, useState } from 'react';
import { KeyIcon, ClipboardIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { decodeJwtSegment } from '@/app/tools/lib/tool-utils';

interface JWTPayload {
  [key: string]: any;
}

/**
 * Tokens are rarely pasted clean — they arrive with a `Bearer ` prefix, or with
 * newlines from a wrapped log line. Both used to make `atob` throw and the tool
 * report a valid token as invalid, so strip them before splitting.
 */
function normalizeToken(raw: string) {
  return raw.trim().replace(/^Bearer\s+/i, '').replace(/\s+/g, '');
}

/** Claims are arbitrary JSON — an object claim rendered as a React child throws. */
function renderClaim(value: unknown) {
  return typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value);
}

export default function JWTDecoder() {
  const [token, setToken] = useState('');
  const [copySuccess, setCopySuccess] = useState<'header' | 'payload' | null>(null);
  const [copyError, setCopyError] = useState('');

  // Decoded reactively. This used to run only on a "Decode" click and left the
  // previous token's header, payload and claim cards on screen after the input
  // changed, so the user could read claims from a token no longer in the box.
  const { header, payload, error } = useMemo(() => {
    const empty = { header: null as JWTPayload | null, payload: null as JWTPayload | null, error: '' };
    const normalized = normalizeToken(token);
    if (!normalized) return empty;

    const parts = normalized.split('.');
    if (parts.length !== 3) {
      return { ...empty, error: 'Invalid JWT format: expected three dot-separated segments.' };
    }

    try {
      return {
        header: decodeJwtSegment(parts[0]) as JWTPayload,
        payload: decodeJwtSegment(parts[1]) as JWTPayload,
        error: '',
      };
    } catch {
      return { ...empty, error: 'Invalid JWT token: Please check your input' };
    }
  }, [token]);

  const isExpired =
    typeof payload?.exp === 'number' && payload.exp * 1000 < Date.now();

  const formatJSON = (obj: any) => {
    return JSON.stringify(obj, null, 2);
  };

  const copyToClipboard = async (text: string, type: 'header' | 'payload') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(type);
      setCopyError('');
      setTimeout(() => setCopySuccess(null), 2000);
    } catch {
      setCopyError('Could not copy to the clipboard. Select the JSON and copy it manually.');
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <KeyIcon className="h-8 w-8 text-[#2563eb]" />
              <h1 className="text-3xl font-bold text-gray-900">JWT Decoder</h1>
            </div>
            <p className="text-gray-600">Decode JSON Web Tokens locally in your browser</p>
          </div>
        </div>

      {/* Input */}
      <div className="space-y-2">
        <label htmlFor="jwt-token" className="block text-sm font-medium text-gray-700">JWT Token</label>
        {/* A textarea, not a single-line input: tokens run to hundreds of
            characters and could not be reviewed after pasting. */}
        <textarea
          id="jwt-token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          rows={4}
          spellCheck={false}
          placeholder="Paste your JWT token here..."
          className="w-full resize-y p-3 font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb]"
        />
        <p className="text-xs text-gray-500">Decodes as you type. A `Bearer ` prefix and line breaks are ignored.</p>
      </div>

      {copyError && <p role="alert" className="text-sm text-red-600">{copyError}</p>}

      {error ? (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
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
            {/* `!== undefined`, not truthiness: `exp: 0` and `iat: 0` are valid
                and used to hide the row entirely. */}
            {payload?.exp !== undefined && (
              <div className="p-4 bg-[#FFF5F2] border border-[#FFD4C8] rounded-lg">
                <div className="text-sm font-medium text-gray-600">Expires</div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-gray-900 font-semibold">
                    {new Date(payload.exp * 1000).toLocaleString()}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      isExpired ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {isExpired ? 'Expired' : 'Active'}
                  </span>
                </div>
              </div>
            )}
            {payload?.iat !== undefined && (
              <div className="p-4 bg-[#FFF5F2] border border-[#FFD4C8] rounded-lg">
                <div className="text-sm font-medium text-gray-600">Issued At</div>
                <div className="text-gray-900 font-semibold">
                  {new Date(payload.iat * 1000).toLocaleString()}
                </div>
              </div>
            )}
            {payload?.iss !== undefined && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="text-sm font-medium text-gray-600">Issuer</div>
                <div className="text-gray-900 font-semibold break-all">
                  {renderClaim(payload.iss)}
                </div>
              </div>
            )}
            {payload?.sub !== undefined && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="text-sm font-medium text-gray-600">Subject</div>
                <div className="text-gray-900 font-semibold break-all">
                  {renderClaim(payload.sub)}
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
              <span className="font-semibold text-[#2563eb]">•</span>
              <span>Compact, URL-safe token format</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-[#2563eb]">•</span>
              <span>Self-contained with user information</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-[#2563eb]">•</span>
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
              <span className="font-semibold text-[#2563eb]">•</span>
              <span>Do not trust the decoded data without verification</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-[#2563eb]">•</span>
              <span>Always validate tokens on your server</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-[#2563eb]">•</span>
              <span>Never expose your secret keys in client-side code</span>
            </li>
          </ul>
        </div>
      </div>
      </div>
    </div>
  );
}
