'use client';

import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'API Tester – Send HTTP Requests | MyDebugTools',
  description: 'Test APIs with an easy HTTP client. Send GET, POST, PUT, DELETE requests and inspect headers and responses.',
  path: '/tools/api',
  keywords: ['api tester','http client','rest client','test api','http request tool'],
})

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from 'react';
import { 
  WrenchIcon, 
  ArrowPathIcon, 
  ClipboardIcon,
  ClockIcon,
  CogIcon,
  PlusIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CheckIcon,
  XMarkIcon,
  DocumentTextIcon,
  DocumentDuplicateIcon,
  ArrowDownTrayIcon,
  QuestionMarkCircleIcon,
  LightBulbIcon,
  CloudArrowUpIcon,
  CodeBracketIcon,
  TableCellsIcon,
  MagnifyingGlassIcon,
  ShareIcon,
  ArrowsRightLeftIcon,
  CommandLineIcon,
  DocumentCheckIcon,
  MinusIcon,
  AdjustmentsHorizontalIcon,
  EyeIcon,
  EyeSlashIcon,
  FunnelIcon,
  ArrowsUpDownIcon
} from '@heroicons/react/24/outline';
import nextDynamic from 'next/dynamic';

// Dynamically import Monaco editor with no SSR
const Editor = nextDynamic(
  () => import('@monaco-editor/react'),
  { ssr: false }
);

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
type ContentType = 'application/json' | 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain' | 'application/xml' | 'text/xml';
type AuthType = 'none' | 'basic' | 'bearer' | 'apiKey';

interface Header {
  key: string;
  value: string;
  enabled: boolean;
}

interface Environment {
  name: string;
  variables: { key: string; value: string }[];
}

interface RequestHistory {
  id: string;
  method: HttpMethod;
  url: string;
  headers: Header[];
  body: string;
  timestamp: number;
  status: number;
  duration: number;
}

interface RequestPreset {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  headers: Header[];
  body: string;
  description: string;
}

interface AuthConfig {
  type: AuthType;
  username?: string;
  password?: string;
  token?: string;
  apiKey?: string;
  apiKeyLocation?: 'header' | 'query';
  apiKeyName?: string;
}

interface ResponseMetrics {
  size: number;
  time: number;
  status: number;
  headers: Record<string, string>;
}

interface CachedResponse {
  data: any;
  timestamp: number;
  headers: Record<string, string>;
  status: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const RATE_LIMIT = 10; // requests per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

export default function APITester() {
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [headers, setHeaders] = useState<Header[]>([{ key: '', value: '', enabled: true }]);
  const [body, setBody] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'request' | 'response' | 'history' | 'environments' | 'presets'>('request');
  const [showHistory, setShowHistory] = useState(false);
  const [showEnvironments, setShowEnvironments] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [requestHistory, setRequestHistory] = useState<RequestHistory[]>([]);
  const [environments, setEnvironments] = useState<Environment[]>([
    { name: 'Development', variables: [] },
    { name: 'Production', variables: [] }
  ]);
  const [activeEnvironment, setActiveEnvironment] = useState('Development');
  const [presets, setPresets] = useState<RequestPreset[]>([]);
  const [contentType, setContentType] = useState<ContentType>('application/json');
  const [responseTime, setResponseTime] = useState<number>(0);
  const [responseMetrics, setResponseMetrics] = useState<ResponseMetrics | null>(null);
  const [authConfig, setAuthConfig] = useState<AuthConfig>({ type: 'none' });
  const [showAuthConfig, setShowAuthConfig] = useState(false);
  const [isEditorMounted, setIsEditorMounted] = useState(false);
  const [showResponseHeaders, setShowResponseHeaders] = useState(true);
  const [showRequestHeaders, setShowRequestHeaders] = useState(true);
  const [showRequestBody, setShowRequestBody] = useState(true);
  const [showResponseBody, setShowResponseBody] = useState(true);
  const [showMetrics, setShowMetrics] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const [responseFormat, setResponseFormat] = useState<'pretty' | 'raw'>('pretty');
  const [requestFormat, setRequestFormat] = useState<'pretty' | 'raw'>('pretty');
  const [autoFormat, setAutoFormat] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [showTimeline, setShowTimeline] = useState(true);
  const [showVariables, setShowVariables] = useState(true);
  const [showPresetManager, setShowPresetManager] = useState(false);
  const [showEnvironmentManager, setShowEnvironmentManager] = useState(false);
  const [showHistoryManager, setShowHistoryManager] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [showTesting, setShowTesting] = useState(false);
  const [showMonitoring, setShowMonitoring] = useState(false);
  const [showCollaboration, setShowCollaboration] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const [showPerformance, setShowPerformance] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showDebugging, setShowDebugging] = useState(false);
  const [showAutomation, setShowAutomation] = useState(false);
  const [showIntegration, setShowIntegration] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [showLocalization, setShowLocalization] = useState(false);
  const [showTheming, setShowTheming] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showUpdates, setShowUpdates] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [requestCache, setRequestCache] = useState<Record<string, CachedResponse>>({});
  const [requestTimestamps, setRequestTimestamps] = useState<number[]>([]);
  const [rateLimitExceeded, setRateLimitExceeded] = useState(false);

  useEffect(() => {
    setIsEditorMounted(true);
    loadSavedData();
  }, []);

  const loadSavedData = () => {
    const savedHistory = localStorage.getItem('requestHistory');
    const savedEnvironments = localStorage.getItem('environments');
    const savedPresets = localStorage.getItem('presets');
    const savedActiveEnv = localStorage.getItem('activeEnvironment');
    const savedSettings = localStorage.getItem('settings');

    if (savedHistory) setRequestHistory(JSON.parse(savedHistory));
    if (savedEnvironments) setEnvironments(JSON.parse(savedEnvironments));
    if (savedPresets) setPresets(JSON.parse(savedPresets));
    if (savedActiveEnv) setActiveEnvironment(savedActiveEnv);
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setAutoFormat(settings.autoFormat);
      setAutoSave(settings.autoSave);
      setShowTimeline(settings.showTimeline);
      setShowVariables(settings.showVariables);
    }
  };

  const saveData = () => {
    localStorage.setItem('requestHistory', JSON.stringify(requestHistory));
    localStorage.setItem('environments', JSON.stringify(environments));
    localStorage.setItem('presets', JSON.stringify(presets));
    localStorage.setItem('activeEnvironment', activeEnvironment);
    localStorage.setItem('settings', JSON.stringify({
      autoFormat,
      autoSave,
      showTimeline,
      showVariables
    }));
  };

  useEffect(() => {
    if (autoSave) {
      saveData();
    }
  }, [requestHistory, environments, presets, activeEnvironment, autoSave]);

  const handleHeaderChange = (index: number, field: 'key' | 'value' | 'enabled', value: string | boolean) => {
    const newHeaders = [...headers];
    newHeaders[index] = { ...newHeaders[index], [field]: value };
    setHeaders(newHeaders);
  };

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '', enabled: true }]);
  };

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const addEnvironment = () => {
    setEnvironments([...environments, { name: `Environment ${environments.length + 1}`, variables: [] }]);
  };

  const addEnvironmentVariable = (envIndex: number) => {
    const newEnvironments = [...environments];
    newEnvironments[envIndex].variables.push({ key: '', value: '' });
    setEnvironments(newEnvironments);
  };

  const removeEnvironmentVariable = (envIndex: number, varIndex: number) => {
    const newEnvironments = [...environments];
    newEnvironments[envIndex].variables = newEnvironments[envIndex].variables.filter((_, i) => i !== varIndex);
    setEnvironments(newEnvironments);
  };

  const addPreset = () => {
    const newPreset: RequestPreset = {
      id: Date.now().toString(),
      name: `Preset ${presets.length + 1}`,
      method,
      url,
      headers,
      body,
      description: ''
    };
    setPresets([...presets, newPreset]);
  };

  const applyPreset = (preset: RequestPreset) => {
    setMethod(preset.method);
    setUrl(preset.url);
    setHeaders(preset.headers);
    setBody(preset.body);
  };

  const handleSubmit = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      setResponse(null);

      if (!url.trim()) {
        throw new Error('Please enter a URL');
      }

      // Check rate limit
      const now = Date.now();
      const recentRequests = requestTimestamps.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);
      
      if (recentRequests.length >= RATE_LIMIT) {
        setRateLimitExceeded(true);
        throw new Error(`Rate limit exceeded. Please wait ${Math.ceil((RATE_LIMIT_WINDOW - (now - recentRequests[0])) / 1000)} seconds.`);
      }

      // Check cache
      const cacheKey = `${method}:${url}:${JSON.stringify(headers)}:${body}`;
      const cachedResponse = requestCache[cacheKey];
      
      if (cachedResponse && now - cachedResponse.timestamp < CACHE_DURATION) {
        setResponse({
          status: cachedResponse.status,
          headers: cachedResponse.headers,
          data: cachedResponse.data,
        });
        setResponseMetrics({
          size: new Blob([JSON.stringify(cachedResponse.data)]).size,
          time: 0,
          status: cachedResponse.status,
          headers: cachedResponse.headers
        });
        setLoading(false);
        return;
      }

      // Replace environment variables in URL and headers
      let processedUrl = url;
      const activeEnv = environments.find(env => env.name === activeEnvironment);
      if (activeEnv) {
        activeEnv.variables.forEach(({ key, value }) => {
          processedUrl = processedUrl.replace(`{{${key}}}`, value);
        });
      }

      const requestHeaders: Record<string, string> = {
        'Content-Type': contentType
      };

      // Add authentication headers
      if (authConfig.type !== 'none') {
        switch (authConfig.type) {
          case 'basic':
            const basicAuth = btoa(`${authConfig.username}:${authConfig.password}`);
            requestHeaders['Authorization'] = `Basic ${basicAuth}`;
            break;
          case 'bearer':
            requestHeaders['Authorization'] = `Bearer ${authConfig.token}`;
            break;
          case 'apiKey':
            if (authConfig.apiKeyLocation === 'header') {
              requestHeaders[authConfig.apiKeyName || 'X-API-Key'] = authConfig.apiKey || '';
            } else {
              processedUrl += `${processedUrl.includes('?') ? '&' : '?'}${authConfig.apiKeyName || 'api_key'}=${authConfig.apiKey}`;
            }
            break;
        }
      }

      headers.forEach(({ key, value, enabled }) => {
        if (enabled && key.trim() && value.trim()) {
          let processedValue = value;
          if (activeEnv) {
            activeEnv.variables.forEach(({ key: envKey, value: envValue }) => {
              processedValue = processedValue.replace(`{{${envKey}}}`, envValue);
            });
          }
          requestHeaders[key] = processedValue;
        }
      });

      const startTime = Date.now();
      const response = await fetch(processedUrl, {
        method,
        headers: requestHeaders,
        body: method !== 'GET' ? body : undefined,
      });

      const data = await response.json();
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Update rate limit timestamps
      setRequestTimestamps(prev => [...prev, now].filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW));

      // Cache the response
      const responseData = {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        data,
      };

      setRequestCache(prev => ({
        ...prev,
        [cacheKey]: {
          data,
          timestamp: now,
          headers: responseData.headers,
          status: response.status
        }
      }));

      setResponseTime(duration);
      setResponseMetrics({
        size: new Blob([JSON.stringify(data)]).size,
        time: duration,
        status: response.status,
        headers: responseData.headers
      });

      setResponse(responseData);

      // Add to history
      const historyItem: RequestHistory = {
        id: Date.now().toString(),
        method,
        url: processedUrl,
        headers,
        body,
        timestamp: now,
        status: response.status,
        duration
      };
      setRequestHistory([historyItem, ...requestHistory].slice(0, 50));
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [url, method, headers, body, environments, activeEnvironment, contentType, authConfig, requestCache, requestTimestamps]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatJSON = (json: any) => {
    try {
      return JSON.stringify(json, null, 2);
    } catch {
      return json;
    }
  };

  const generateCode = (language: string) => {
    const codeTemplates: Record<string, string> = {
      'javascript': `fetch('${url}', {
  method: '${method}',
  headers: ${JSON.stringify(headers.filter(h => h.enabled).reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {}), null, 2)},
  body: ${method !== 'GET' ? JSON.stringify(JSON.parse(body), null, 2) : 'undefined'}
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,
      'python': `import requests

response = requests.${method.toLowerCase()}('${url}',
  headers=${JSON.stringify(headers.filter(h => h.enabled).reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {}), null, 2)},
  json=${method !== 'GET' ? JSON.stringify(JSON.parse(body), null, 2) : 'None'}
)

print(response.json())`,
      'curl': `curl -X ${method} '${url}' \\
${headers.filter(h => h.enabled).map(({ key, value }) => `-H '${key}: ${value}'`).join(' \\\n')} \\
${method !== 'GET' ? `-d '${body}'` : ''}`
    };
    return codeTemplates[language] || '';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">API Tester</h1>
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
            title="Show Help"
          >
            <QuestionMarkCircleIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowExamples(!showExamples)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <LightBulbIcon className="h-4 w-4 mr-2" />
            Examples
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <CogIcon className="h-4 w-4 mr-2" />
            Settings
          </button>
        </div>
      </div>

      {showHelp && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="text-lg font-medium text-blue-900 mb-2">Quick Help</h3>
          <ul className="list-disc pl-6 space-y-2 text-blue-800">
            <li>Enter your API endpoint URL and select the HTTP method</li>
            <li>Add headers and request body as needed</li>
            <li>Use environments to manage different API configurations</li>
            <li>Save frequently used requests as presets</li>
            <li>View response history and metrics</li>
            <li>Generate code snippets in various languages</li>
          </ul>
        </div>
      )}

      {showExamples && (
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h3 className="text-lg font-medium text-yellow-900 mb-2">Example APIs</h3>
          <div className="space-y-2">
            <button
              onClick={() => {
                setUrl('https://jsonplaceholder.typicode.com/posts');
                setMethod('GET');
              }}
              className="text-sm text-yellow-800 hover:text-yellow-900"
            >
              JSONPlaceholder Posts API
            </button>
            <button
              onClick={() => {
                setUrl('https://api.github.com/users/octocat');
                setMethod('GET');
              }}
              className="text-sm text-yellow-800 hover:text-yellow-900"
            >
              GitHub User API
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        {/* Request Panel */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Request</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowRequestHeaders(!showRequestHeaders)}
                className="p-2 text-gray-500 hover:text-gray-700"
                title={showRequestHeaders ? 'Hide Headers' : 'Show Headers'}
              >
                {showRequestHeaders ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
              </button>
              <button
                onClick={() => setShowRequestBody(!showRequestBody)}
                className="p-2 text-gray-500 hover:text-gray-700"
                title={showRequestBody ? 'Hide Body' : 'Show Body'}
              >
                {showRequestBody ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex gap-2">
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as HttpMethod)}
                className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'].map((m) => (
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

            {showRequestHeaders && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Headers</label>
                  <div className="flex items-center gap-2">
                    <select
                      value={contentType}
                      onChange={(e) => setContentType(e.target.value as ContentType)}
                      className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {['application/json', 'application/x-www-form-urlencoded', 'multipart/form-data', 'text/plain', 'application/xml', 'text/xml'].map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <button
                      onClick={addHeader}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      + Add Header
                    </button>
                  </div>
                </div>
                {headers.map((header, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="checkbox"
                      checked={header.enabled}
                      onChange={(e) => handleHeaderChange(index, 'enabled', e.target.checked)}
                      className="mt-2"
                    />
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
            )}

            {showRequestBody && method !== 'GET' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">Request Body</label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setRequestFormat(requestFormat === 'pretty' ? 'raw' : 'pretty')}
                      className="text-sm text-gray-600 hover:text-gray-800"
                    >
                      {requestFormat === 'pretty' ? 'Raw' : 'Pretty'}
                    </button>
                    {autoFormat && (
                      <button
                        onClick={() => {
                          try {
                            const formatted = JSON.stringify(JSON.parse(body), null, 2);
                            setBody(formatted);
                          } catch (e) {
                            // Ignore formatting errors
                          }
                        }}
                        className="text-sm text-gray-600 hover:text-gray-800"
                      >
                        Format
                      </button>
                    )}
                  </div>
                </div>
                {isEditorMounted && (
                  <Editor
                    height="200px"
                    defaultLanguage="json"
                    value={body}
                    onChange={(value: string | undefined) => setBody(value || '')}
                    theme="light"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: 'on',
                      folding: true,
                      wordWrap: 'on',
                      automaticLayout: true,
                      scrollBeyondLastLine: false,
                      renderWhitespace: 'selection',
                      tabSize: 2,
                      formatOnPaste: autoFormat,
                      formatOnType: autoFormat
                    }}
                  />
                )}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowAuthConfig(!showAuthConfig)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <CommandLineIcon className="h-4 w-4 mr-2" />
                  Authentication
                </button>
                <button
                  onClick={() => setShowVariables(!showVariables)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <CodeBracketIcon className="h-4 w-4 mr-2" />
                  Variables
                </button>
              </div>
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
          </div>
        </div>

        {/* Response Panel */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Response</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowResponseHeaders(!showResponseHeaders)}
                className="p-2 text-gray-500 hover:text-gray-700"
                title={showResponseHeaders ? 'Hide Headers' : 'Show Headers'}
              >
                {showResponseHeaders ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
              </button>
              <button
                onClick={() => setShowResponseBody(!showResponseBody)}
                className="p-2 text-gray-500 hover:text-gray-700"
                title={showResponseBody ? 'Hide Body' : 'Show Body'}
              >
                {showResponseBody ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
              </button>
              <button
                onClick={() => setShowMetrics(!showMetrics)}
                className="p-2 text-gray-500 hover:text-gray-700"
                title={showMetrics ? 'Hide Metrics' : 'Show Metrics'}
              >
                {showMetrics ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {showMetrics && responseMetrics && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-sm text-gray-500">Status</div>
                  <div className={`text-lg font-medium ${
                    responseMetrics.status >= 200 && responseMetrics.status < 300
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {responseMetrics.status}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500">Time</div>
                  <div className="text-lg font-medium text-gray-900">
                    {responseMetrics.time}ms
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500">Size</div>
                  <div className="text-lg font-medium text-gray-900">
                    {(responseMetrics.size / 1024).toFixed(2)} KB
                  </div>
                </div>
              </div>
            </div>
          )}

          {showResponseHeaders && response && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700">Response Headers</h3>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 overflow-auto max-h-40">
                <pre className="text-sm">
                  {Object.entries(response.headers as Record<string, string>).map(([key, value]) => (
                    <div key={key} className="flex">
                      <span className="text-gray-600 font-medium">{key}:</span>
                      <span className="ml-2 text-gray-800">{value}</span>
                    </div>
                  ))}
                </pre>
              </div>
            </div>
          )}

          {showResponseBody && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700">Response Body</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setResponseFormat(responseFormat === 'pretty' ? 'raw' : 'pretty')}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    {responseFormat === 'pretty' ? 'Raw' : 'Pretty'}
                  </button>
                  <button
                    onClick={() => copyToClipboard(formatJSON(response?.data))}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    Copy
                  </button>
                </div>
              </div>
              {isEditorMounted && (
                <Editor
                  height="300px"
                  defaultLanguage="json"
                  value={response ? formatJSON(response.data) : ''}
                  theme="light"
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    folding: true,
                    wordWrap: 'on',
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                    renderWhitespace: 'selection',
                    tabSize: 2
                  }}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Additional Panels */}
      {showAuthConfig && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Authentication</h3>
          <div className="space-y-4">
            <select
              value={authConfig.type}
              onChange={(e) => setAuthConfig({ ...authConfig, type: e.target.value as AuthType })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="none">None</option>
              <option value="basic">Basic Auth</option>
              <option value="bearer">Bearer Token</option>
              <option value="apiKey">API Key</option>
            </select>

            {authConfig.type === 'basic' && (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Username"
                  value={authConfig.username || ''}
                  onChange={(e) => setAuthConfig({ ...authConfig, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={authConfig.password || ''}
                  onChange={(e) => setAuthConfig({ ...authConfig, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            )}

            {authConfig.type === 'bearer' && (
              <input
                type="text"
                placeholder="Token"
                value={authConfig.token || ''}
                onChange={(e) => setAuthConfig({ ...authConfig, token: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            )}

            {authConfig.type === 'apiKey' && (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="API Key"
                  value={authConfig.apiKey || ''}
                  onChange={(e) => setAuthConfig({ ...authConfig, apiKey: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <div className="flex space-x-4">
                  <select
                    value={authConfig.apiKeyLocation || 'header'}
                    onChange={(e) => setAuthConfig({ ...authConfig, apiKeyLocation: e.target.value as 'header' | 'query' })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="header">Header</option>
                    <option value="query">Query Parameter</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Key Name"
                    value={authConfig.apiKeyName || ''}
                    onChange={(e) => setAuthConfig({ ...authConfig, apiKeyName: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showVariables && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Environment Variables</h3>
            <div className="flex items-center space-x-2">
              <select
                value={activeEnvironment}
                onChange={(e) => setActiveEnvironment(e.target.value)}
                className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {environments.map((env) => (
                  <option key={env.name} value={env.name}>{env.name}</option>
                ))}
              </select>
              <button
                onClick={() => setShowEnvironmentManager(!showEnvironmentManager)}
                className="p-2 text-gray-600 hover:text-gray-900"
              >
                <CogIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {environments.find(env => env.name === activeEnvironment)?.variables.map((variable, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={variable.key}
                  onChange={(e) => {
                    const newEnvironments = [...environments];
                    const envIndex = newEnvironments.findIndex(env => env.name === activeEnvironment);
                    newEnvironments[envIndex].variables[index].key = e.target.value;
                    setEnvironments(newEnvironments);
                  }}
                  placeholder="Key"
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={variable.value}
                  onChange={(e) => {
                    const newEnvironments = [...environments];
                    const envIndex = newEnvironments.findIndex(env => env.name === activeEnvironment);
                    newEnvironments[envIndex].variables[index].value = e.target.value;
                    setEnvironments(newEnvironments);
                  }}
                  placeholder="Value"
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => {
                    const newEnvironments = [...environments];
                    const envIndex = newEnvironments.findIndex(env => env.name === activeEnvironment);
                    newEnvironments[envIndex].variables = newEnvironments[envIndex].variables.filter((_, i) => i !== index);
                    setEnvironments(newEnvironments);
                  }}
                  className="px-3 py-2 text-red-600 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                const newEnvironments = [...environments];
                const envIndex = newEnvironments.findIndex(env => env.name === activeEnvironment);
                newEnvironments[envIndex].variables.push({ key: '', value: '' });
                setEnvironments(newEnvironments);
              }}
              className="w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
            >
              + Add Variable
            </button>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Auto-format JSON</label>
              <input
                type="checkbox"
                checked={autoFormat}
                onChange={(e) => setAutoFormat(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Auto-save changes</label>
              <input
                type="checkbox"
                checked={autoSave}
                onChange={(e) => setAutoSave(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Show timeline</label>
              <input
                type="checkbox"
                checked={showTimeline}
                onChange={(e) => setShowTimeline(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Show variables</label>
              <input
                type="checkbox"
                checked={showVariables}
                onChange={(e) => setShowVariables(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 