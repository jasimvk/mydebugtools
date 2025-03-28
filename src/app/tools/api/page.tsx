'use client';

import { useState } from 'react';
import { WrenchIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface Header {
  key: string;
  value: string;
}

export default function APITester() {
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [headers, setHeaders] = useState<Header[]>([{ key: '', value: '' }]);
  const [body, setBody] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

  const handleHeaderChange = (index: number, field: 'key' | 'value', value: string) => {
    const newHeaders = [...headers];
    newHeaders[index] = { ...newHeaders[index], [field]: value };
    setHeaders(newHeaders);
  };

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      setResponse(null);

      if (!url.trim()) {
        throw new Error('Please enter a URL');
      }

      const requestHeaders: Record<string, string> = {};
      headers.forEach(({ key, value }) => {
        if (key.trim() && value.trim()) {
          requestHeaders[key] = value;
        }
      });

      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: method !== 'GET' ? body : undefined,
      });

      const data = await response.json();
      setResponse({
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        data,
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">API Tester</h1>
          <p className="text-gray-600">Test your APIs with a simple interface</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Request Panel */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as HttpMethod)}
              className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {methods.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter URL..."
              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Headers</label>
              <button
                onClick={addHeader}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                + Add Header
              </button>
            </div>
            {headers.map((header, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={header.key}
                  onChange={(e) => handleHeaderChange(index, 'key', e.target.value)}
                  placeholder="Key"
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={header.value}
                  onChange={(e) => handleHeaderChange(index, 'value', e.target.value)}
                  placeholder="Value"
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => removeHeader(index)}
                  className="px-3 py-2 text-red-600 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {method !== 'GET' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Request Body</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Enter request body (JSON)..."
                className="w-full h-[200px] p-4 font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <ArrowPathIcon className="h-5 w-5 animate-spin" />
            ) : (
              <WrenchIcon className="h-5 w-5" />
            )}
            Send Request
          </button>
        </div>

        {/* Response Panel */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Response</label>
          <div className="h-[500px] bg-gray-50 border border-gray-200 rounded-lg overflow-auto">
            {error ? (
              <div className="p-4 text-red-500">{error}</div>
            ) : response ? (
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500">Status:</span>
                  <span className={`px-2 py-1 text-sm rounded ${
                    response.status >= 200 && response.status < 300
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {response.status}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Headers:</h3>
                  <pre className="text-sm">
                    <code>{JSON.stringify(response.headers, null, 2)}</code>
                  </pre>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Body:</h3>
                  <pre className="text-sm">
                    <code>{JSON.stringify(response.data, null, 2)}</code>
                  </pre>
                </div>
              </div>
            ) : (
              <div className="p-4 text-gray-500">
                Response will appear here after sending a request...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 