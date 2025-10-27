'use client';

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
  refreshTokenUrl?: string;
  refreshToken?: string;
  autoRefresh?: boolean;
  tokenExpiry?: number;
  loginUrl?: string;
  loginUsername?: string;
  loginPassword?: string;
  autoLogin?: boolean;
  tokenPath?: string; // Path to extract token from login response (e.g., "data.token" or "access_token")
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
  const [activeTab, setActiveTab] = useState<'params' | 'authorization' | 'headers' | 'body'>('params');
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
  const [showResponseHeaders, setShowResponseHeaders] = useState(false);
  const [showResponseBody, setShowResponseBody] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [responseFormat, setResponseFormat] = useState<'pretty' | 'raw'>('pretty');
  const [requestFormat, setRequestFormat] = useState<'pretty' | 'raw'>('pretty');
  const [autoFormat, setAutoFormat] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [showVariables, setShowVariables] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
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
      setShowVariables(settings.showVariables);
    }
  };

  useEffect(() => {
    setIsEditorMounted(true);
    loadSavedData();
  }, []);

  const saveData = () => {
    localStorage.setItem('requestHistory', JSON.stringify(requestHistory));
    localStorage.setItem('environments', JSON.stringify(environments));
    localStorage.setItem('presets', JSON.stringify(presets));
    localStorage.setItem('activeEnvironment', activeEnvironment);
    localStorage.setItem('settings', JSON.stringify({
      autoFormat,
      autoSave,
      showVariables
    }));
  };

  // JWT Token utilities
  const decodeJWT = (token: string): { exp?: number; iat?: number } | null => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = JSON.parse(atob(parts[1]));
      return payload;
    } catch {
      return null;
    }
  };

  const isTokenExpired = (token: string): boolean => {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) return false;
    const now = Math.floor(Date.now() / 1000);
    // Check if token expires in next 5 minutes
    return decoded.exp - now < 300;
  };

  const refreshAccessToken = async () => {
    if (!authConfig.refreshTokenUrl || !authConfig.refreshToken) {
      console.log('No refresh token URL or refresh token configured');
      return false;
    }

    try {
      const response = await fetch(authConfig.refreshTokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: authConfig.refreshToken
        })
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      const newToken = data.access_token || data.token;
      
      if (newToken) {
        const decoded = decodeJWT(newToken);
        setAuthConfig(prev => ({
          ...prev,
          token: newToken,
          tokenExpiry: decoded?.exp
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      setError('Failed to refresh authentication token. Please update your credentials.');
      return false;
    }
  };

  // Helper function to get nested property from object
  const getNestedProperty = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  // Auto-login function when token expires
  const performAutoLogin = async (): Promise<string | null> => {
    if (!authConfig.loginUrl || !authConfig.loginUsername || !authConfig.loginPassword) {
      console.log('Auto-login not configured');
      return null;
    }

    try {
      console.log('Performing auto-login...');
      const response = await fetch(authConfig.loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: authConfig.loginUsername,
          password: authConfig.loginPassword,
          email: authConfig.loginUsername, // Some APIs use email instead of username
        })
      });

      if (!response.ok) {
        throw new Error(`Login failed with status: ${response.status}`);
      }

      const data = await response.json();
      
      // Extract token using the configured path or try common paths
      const tokenPath = authConfig.tokenPath || 'access_token';
      let newToken = getNestedProperty(data, tokenPath);
      
      // Try common token paths if configured path didn't work
      if (!newToken) {
        newToken = data.access_token || data.token || data.data?.token || data.data?.access_token;
      }
      
      if (newToken) {
        const decoded = decodeJWT(newToken);
        setAuthConfig(prev => ({
          ...prev,
          token: newToken,
          tokenExpiry: decoded?.exp
        }));
        console.log('Auto-login successful, new token acquired');
        return newToken;
      } else {
        throw new Error('Token not found in login response');
      }
    } catch (error: any) {
      console.error('Auto-login failed:', error);
      setError(`Auto-login failed: ${error.message}. Please check your login credentials.`);
      return null;
    }
  };

  // Check if response indicates expired token
  const isTokenExpiredResponse = (status: number, data: any): boolean => {
    // Check common expired token status codes
    if (status === 401 || status === 403) {
      const dataStr = JSON.stringify(data).toLowerCase();
      return (
        dataStr.includes('token expired') ||
        dataStr.includes('token_expired') ||
        dataStr.includes('expired token') ||
        dataStr.includes('invalid token') ||
        dataStr.includes('unauthorized') ||
        dataStr.includes('authentication failed')
      );
    }
    return false;
  };

  // Check and refresh token before making requests
  useEffect(() => {
    if (authConfig.type === 'bearer' && authConfig.token && authConfig.autoRefresh) {
      const checkToken = async () => {
        if (isTokenExpired(authConfig.token!)) {
          console.log('Token expired or expiring soon, refreshing...');
          await refreshAccessToken();
        }
      };

      checkToken();
      // Check every minute
      const interval = setInterval(checkToken, 60000);
      return () => clearInterval(interval);
    }
  }, [authConfig.token, authConfig.autoRefresh]);

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
      let response = await fetch(processedUrl, {
        method,
        headers: requestHeaders,
        body: method !== 'GET' ? body : undefined,
      });

      let data = await response.json();
      
      // Check if token expired and auto-login is enabled
      if (authConfig.autoLogin && isTokenExpiredResponse(response.status, data)) {
        console.log('Token expired, attempting auto-login...');
        
        // Show notification to user
        const loginNotification = document.createElement('div');
        loginNotification.className = 'fixed top-4 right-4 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2';
        loginNotification.innerHTML = `
          <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Token expired. Auto-logging in...</span>
        `;
        document.body.appendChild(loginNotification);
        
        const newToken = await performAutoLogin();
        
        // Remove notification
        document.body.removeChild(loginNotification);
        
        if (newToken) {
          // Show success notification
          const successNotification = document.createElement('div');
          successNotification.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2';
          successNotification.innerHTML = `
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>Login successful! Retrying request...</span>
          `;
          document.body.appendChild(successNotification);
          setTimeout(() => document.body.removeChild(successNotification), 3000);
          
          // Retry the request with new token
          console.log('Retrying request with new token...');
          if (authConfig.type === 'bearer') {
            requestHeaders['Authorization'] = `Bearer ${newToken}`;
          }
          
          const retryStartTime = Date.now();
          response = await fetch(processedUrl, {
            method,
            headers: requestHeaders,
            body: method !== 'GET' ? body : undefined,
          });
          
          data = await response.json();
          const retryEndTime = Date.now();
          const duration = retryEndTime - retryStartTime;
          
          console.log('Request retried successfully with new token');
        } else {
          throw new Error('Failed to auto-login. Please check your credentials.');  
        }
      }
      
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
    const enabledHeaders = headers.filter(h => h.enabled);
    const headersObj = enabledHeaders.reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {});
    const headersStr = JSON.stringify(headersObj, null, 2);
    const bodyStr = method !== 'GET' ? body : '';
    
    const codeTemplates: Record<string, string> = {
      javascript: `fetch('${url}', {
  method: '${method}',
  headers: ${headersStr},
  body: ${method !== 'GET' ? `JSON.stringify(${body})` : 'undefined'}
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,
      python: `import requests
import json

response = requests.${method.toLowerCase()}(
    '${url}',
    headers=${headersStr},
    ${method !== 'GET' ? `json=${body}` : ''}
)

print(response.json())`,
      curl: `curl -X ${method} '${url}' ${enabledHeaders.map(h => `-H '${h.key}: ${h.value}'`).join(' ')} ${method !== 'GET' ? `-d '${bodyStr}'` : ''}`
    };
    return codeTemplates[language] || '';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 max-w-[1600px] mx-auto">
          <h1 className="text-2xl font-semibold text-gray-900">API Tester</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowVariables(!showVariables)}
              className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                showVariables 
                  ? 'bg-[#FF6C37] text-white' 
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
              title="Toggle Environment Variables"
            >
              <CodeBracketIcon className="h-5 w-5 inline mr-1" />
              Variables
            </button>
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded"
              title="Help"
            >
              <QuestionMarkCircleIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded"
              title="Settings"
            >
              <CogIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

      {showHelp && (
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mb-6 max-w-[1600px] mx-auto">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <QuestionMarkCircleIcon className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-900">Quick Start Guide</h3>
            </div>
            <button onClick={() => setShowHelp(false)} className="text-blue-600 hover:text-blue-800">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-blue-800">
            <div className="space-y-2">
              <p className="font-semibold flex items-center gap-2">
                <span className="text-lg">🚀</span> Getting Started
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Enter API URL and select method (GET, POST, etc.)</li>
                <li>Click "Send" or press Enter to make request</li>
                <li>View response with status, time, and size metrics</li>
              </ul>
            </div>
            <div className="space-y-2">
              <p className="font-semibold flex items-center gap-2">
                <span className="text-lg">🔐</span> Authentication
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Click "Authorization" tab for Bearer/Basic/API Key auth</li>
                <li>JWT tokens auto-refresh when expired</li>
                <li>Configure auto-login for seamless re-authentication</li>
              </ul>
            </div>
            <div className="space-y-2">
              <p className="font-semibold flex items-center gap-2">
                <span className="text-lg">⚙️</span> Variables
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Click "Variables" button to manage environment variables</li>
                <li>Use {'{{variable}}'} syntax in URL, headers, or body</li>
                <li>Switch between environments (Dev, Staging, Prod)</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Main Request Section */}
      <div className="bg-white border border-gray-200 rounded max-w-[1600px] mx-auto shadow-sm">
        {/* URL Bar */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex gap-2 flex-col sm:flex-row">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as HttpMethod)}
              className="w-full sm:w-32 px-4 py-2.5 bg-white border border-gray-300 rounded text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FF6C37] focus:border-transparent"
              title="Select HTTP method"
            >
              {['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'].map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <div className="flex-1 relative">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter request URL (e.g., https://api.example.com/users)"
                className="w-full px-4 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6C37] focus:border-transparent"
                title="Enter the full API endpoint URL"
              />
              {!url && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                  Press Enter to send
                </div>
              )}
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading || !url.trim()}
              className="w-full sm:w-auto px-8 py-2.5 bg-[#FF6C37] hover:bg-[#ff5722] text-white text-sm font-semibold rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              title={!url.trim() ? 'Enter a URL first' : 'Send request'}
            >
              {loading ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send'
              )}
            </button>
          </div>
          
          {/* Error Display */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
              <div className="flex items-start gap-2">
                <XMarkIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">Error</p>
                  <p className="mt-1">{error}</p>
                </div>
                <button
                  onClick={() => setError('')}
                  className="text-red-600 hover:text-red-800"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tabs for Request Configuration */}
        <div className="border-b border-gray-200 bg-white">
          <div className="flex gap-1 px-4">
            <button
              onClick={() => setActiveTab('params')}
              className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'params'
                  ? 'text-[#FF6C37]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Params
              {activeTab === 'params' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6C37]"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('authorization')}
              className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'authorization'
                  ? 'text-[#FF6C37]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Authorization
              {activeTab === 'authorization' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6C37]"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('headers')}
              className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'headers'
                  ? 'text-[#FF6C37]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Headers
              <span className="ml-1.5 text-xs text-gray-400">({headers.filter(h => h.enabled).length})</span>
              {activeTab === 'headers' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6C37]"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('body')}
              className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'body' && method !== 'GET'
                  ? 'text-[#FF6C37]'
                  : method === 'GET'
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              disabled={method === 'GET'}
            >
              Body
              {activeTab === 'body' && method !== 'GET' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6C37]"></div>
              )}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 bg-white min-h-[300px]">
          {/* Params Tab */}
          {activeTab === 'params' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Query parameters are appended to the URL</p>
              </div>
              <div className="text-center py-12 text-gray-500">
                <p className="text-sm">Query parameters can be added directly to the URL above</p>
                <p className="text-xs mt-2">Example: ?key=value&foo=bar</p>
              </div>
            </div>
          )}

          {/* Authorization Tab */}
          {activeTab === 'authorization' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">Configure authentication for your request</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Type</label>
                  <select
                    value={authConfig.type}
                    onChange={(e) => setAuthConfig({ ...authConfig, type: e.target.value as AuthType })}
                    className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#FF6C37] focus:border-transparent"
                  >
                    <option value="none">No Auth</option>
                    <option value="bearer">Bearer Token</option>
                    <option value="basic">Basic Auth</option>
                    <option value="apiKey">API Key</option>
                  </select>
                </div>

                {authConfig.type !== 'none' && (
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    {/* Auth type specific content will be rendered here */}
                    {authConfig.type === 'bearer' && (
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">Token</label>
                          <input
                            type="text"
                            placeholder="Enter your bearer token"
                            value={authConfig.token || ''}
                            onChange={(e) => {
                              const newToken = e.target.value;
                              const decoded = decodeJWT(newToken);
                              setAuthConfig({ 
                                ...authConfig, 
                                token: newToken,
                                tokenExpiry: decoded?.exp
                              });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:ring-2 focus:ring-[#FF6C37] focus:border-transparent"
                          />
                        </div>
                        {authConfig.token && decodeJWT(authConfig.token) && (
                          <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-md border border-gray-200">
                            {(() => {
                              const decoded = decodeJWT(authConfig.token!);
                              if (decoded?.exp) {
                                const expiryDate = new Date(decoded.exp * 1000);
                                const now = new Date();
                                const isExpired = expiryDate < now;
                                const minutesUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / 60000);
                                
                                return (
                                  <div className="flex items-center gap-2">
                                    {isExpired ? (
                                      <span className="text-red-600 font-medium">⚠️ Token expired</span>
                                    ) : minutesUntilExpiry < 5 ? (
                                      <span className="text-orange-600 font-medium">⚠️ Expires in {minutesUntilExpiry} minutes</span>
                                    ) : (
                                      <span className="text-green-600 font-medium">✓ Valid until {expiryDate.toLocaleString()}</span>
                                    )}
                                  </div>
                                );
                              }
                              return <span>JWT Token detected</span>;
                            })()}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Headers Tab */}
          {activeTab === 'headers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Headers are sent with every request</p>
                <button
                  onClick={addHeader}
                  className="px-4 py-2 text-sm font-medium text-[#FF6C37] hover:bg-orange-50 rounded transition-colors"
                >
                  + Add Header
                </button>
              </div>
              
              {headers.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <DocumentTextIcon className="h-12 w-12 mx-auto mb-3 opacity-40" />
                  <p className="text-sm mb-2">No headers added yet</p>
                  <button 
                    onClick={addHeader} 
                    className="text-[#FF6C37] hover:text-[#ff5722] text-sm font-medium"
                  >
                    Add your first header
                  </button>
                </div>
              ) : (
                <div className="space-y-0 border border-gray-200 rounded-md overflow-hidden">
                  {/* Header row */}
                  <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-600">
                    <div className="col-span-1"></div>
                    <div className="col-span-5">KEY</div>
                    <div className="col-span-5">VALUE</div>
                    <div className="col-span-1"></div>
                  </div>
                  {/* Header rows */}
                  {headers.map((header, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                      <div className="col-span-1 flex items-center">
                        <input
                          type="checkbox"
                          checked={header.enabled}
                          onChange={(e) => handleHeaderChange(index, 'enabled', e.target.checked)}
                          className="rounded text-[#FF6C37] focus:ring-[#FF6C37] cursor-pointer"
                        />
                      </div>
                      <div className="col-span-5">
                        <input
                          type="text"
                          value={header.key}
                          onChange={(e) => handleHeaderChange(index, 'key', e.target.value)}
                          placeholder="Key"
                          className="w-full px-2 py-1.5 text-sm border-none bg-transparent focus:outline-none focus:ring-0"
                        />
                      </div>
                      <div className="col-span-5">
                        <input
                          type="text"
                          value={header.value}
                          onChange={(e) => handleHeaderChange(index, 'value', e.target.value)}
                          placeholder="Value"
                          className="w-full px-2 py-1.5 text-sm border-none bg-transparent focus:outline-none focus:ring-0"
                        />
                      </div>
                      <div className="col-span-1 flex items-center justify-center">
                        <button
                          onClick={() => removeHeader(index)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Body Tab */}
          {activeTab === 'body' && method !== 'GET' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Request body content (JSON format)</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setRequestFormat(requestFormat === 'pretty' ? 'raw' : 'pretty')}
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded transition-colors"
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
                      className="px-3 py-1.5 text-xs font-medium text-[#FF6C37] hover:bg-orange-50 rounded transition-colors"
                    >
                      Beautify
                    </button>
                  )}
                </div>
              </div>
              
              {!body && (
                <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded border border-blue-100">
                  💡 <strong>Tip:</strong> Paste your JSON here. It will be automatically validated and formatted.
                </div>
              )}
              
              {isEditorMounted && (
                <div className="border border-gray-200 rounded-md overflow-hidden">
                  <Editor
                    height="400px"
                    defaultLanguage="json"
                    value={body}
                    onChange={(value: string | undefined) => setBody(value || '')}
                    theme="light"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 13,
                      lineNumbers: 'on',
                      folding: true,
                      wordWrap: 'on',
                      automaticLayout: true,
                      scrollBeyondLastLine: false,
                      renderWhitespace: 'selection',
                      tabSize: 2,
                      formatOnPaste: autoFormat,
                      formatOnType: autoFormat,
                      suggestOnTriggerCharacters: true,
                      quickSuggestions: true
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Environment Variables Section */}
      {showVariables && (
        <div className="bg-white border border-gray-200 rounded max-w-[1600px] mx-auto shadow-sm mb-4">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CodeBracketIcon className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-medium text-gray-900">Environment Variables</h3>
                <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                  Use {'{{variable}}'} in URL, headers, or body
                </span>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={activeEnvironment}
                  onChange={(e) => setActiveEnvironment(e.target.value)}
                  className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6C37]"
                >
                  {environments.map((env) => (
                    <option key={env.name} value={env.name}>{env.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => setShowVariables(false)}
                  className="p-2 text-gray-500 hover:text-gray-700"
                  title="Close variables"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
          <div className="p-4">
            <div className="space-y-2">
              {environments.find(env => env.name === activeEnvironment)?.variables.map((variable, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={variable.key}
                    onChange={(e) => {
                      const newEnvironments = [...environments];
                      const envIndex = newEnvironments.findIndex(env => env.name === activeEnvironment);
                      newEnvironments[envIndex].variables[index].key = e.target.value;
                      setEnvironments(newEnvironments);
                    }}
                    placeholder="Variable name (e.g., api_url)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FF6C37]"
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
                    placeholder="Value (e.g., https://api.example.com)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FF6C37]"
                  />
                  <button
                    onClick={() => {
                      const newEnvironments = [...environments];
                      const envIndex = newEnvironments.findIndex(env => env.name === activeEnvironment);
                      newEnvironments[envIndex].variables = newEnvironments[envIndex].variables.filter((_, i) => i !== index);
                      setEnvironments(newEnvironments);
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                    title="Remove variable"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
              {environments.find(env => env.name === activeEnvironment)?.variables.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <CodeBracketIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No variables yet. Add one to get started!</p>
                  <p className="text-xs mt-1">Variables help you reuse values across requests</p>
                </div>
              )}
              <button
                onClick={() => {
                  const newEnvironments = [...environments];
                  const envIndex = newEnvironments.findIndex(env => env.name === activeEnvironment);
                  newEnvironments[envIndex].variables.push({ key: '', value: '' });
                  setEnvironments(newEnvironments);
                }}
                className="w-full px-4 py-2 text-sm font-medium text-[#FF6C37] bg-orange-50 rounded-lg hover:bg-orange-100 border border-orange-200"
              >
                + Add Variable
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Response Section */}
      <div className="bg-white border border-gray-200 rounded max-w-[1600px] mx-auto shadow-sm">
        {/* Response Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-base font-semibold text-gray-900">Response</h2>
              {responseMetrics && (
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Status:</span>
                    <span className={`font-medium ${
                      responseMetrics.status >= 200 && responseMetrics.status < 300
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {responseMetrics.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Time:</span>
                    <span className="font-medium text-gray-900">{responseMetrics.time}ms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Size:</span>
                    <span className="font-medium text-gray-900">{(responseMetrics.size / 1024).toFixed(2)} KB</span>
                  </div>
                </div>
              )}
            </div>
            {loading && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
                <span>Loading...</span>
              </div>
            )}
          </div>
        </div>

        {/* Response Tabs */}
        {response && (
          <>
            <div className="border-b border-gray-200 bg-white">
              <div className="flex gap-1 px-6">
                <button
                  onClick={() => setShowResponseBody(true)}
                  className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                    showResponseBody
                      ? 'text-[#FF6C37]'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Body
                  {showResponseBody && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6C37]"></div>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowResponseBody(false);
                    setShowResponseHeaders(true);
                  }}
                  className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                    showResponseHeaders && !showResponseBody
                      ? 'text-[#FF6C37]'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Headers
                  {showResponseHeaders && !showResponseBody && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6C37]"></div>
                  )}
                </button>
              </div>
            </div>

            {/* Response Content */}
            <div className="p-6 bg-white min-h-[300px]">
              {showResponseBody && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">Response body</p>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setResponseFormat(responseFormat === 'pretty' ? 'raw' : 'pretty')}
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded transition-colors"
                      >
                        {responseFormat === 'pretty' ? 'Raw' : 'Pretty'}
                      </button>
                      <button
                        onClick={() => copyToClipboard(formatJSON(response?.data))}
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                  {isEditorMounted && (
                    <div className="border border-gray-200 rounded-md overflow-hidden">
                      <Editor
                        height="450px"
                        defaultLanguage="json"
                        value={response ? formatJSON(response.data) : ''}
                        theme="light"
                        options={{
                          readOnly: true,
                          minimap: { enabled: false },
                          fontSize: 13,
                          lineNumbers: 'on',
                          folding: true,
                          wordWrap: 'on',
                          automaticLayout: true,
                          scrollBeyondLastLine: false,
                          renderWhitespace: 'selection',
                          tabSize: 2
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              {showResponseHeaders && !showResponseBody && response && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">Response headers</p>
                  <div className="border border-gray-200 rounded-md overflow-hidden">
                    <div className="grid grid-cols-2 gap-2 px-4 py-2 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-600">
                      <div>KEY</div>
                      <div>VALUE</div>
                    </div>
                    {Object.entries(response.headers as Record<string, string>).map(([key, value]) => (
                      <div key={key} className="grid grid-cols-2 gap-2 px-4 py-2 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 text-sm">
                        <div className="font-medium text-gray-700">{key}</div>
                        <div className="text-gray-600 break-all">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* No Response State */}
        {!response && !loading && (
          <div className="p-12 text-center text-gray-400">
            <div className="mb-4">
              <svg className="h-16 w-16 mx-auto opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-base mb-1">No response yet</p>
            <p className="text-sm">Hit "Send" to see the response here</p>
          </div>
        )}
      </div>

      {/* Additional Panels */}
      {showAuthConfig && (
        <div className="bg-white p-4 rounded-lg border border-gray-200 max-w-[1600px] mx-auto mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Authentication</h3>
            <button
              onClick={() => setShowAuthConfig(false)}
              className="p-2 text-gray-500 hover:text-gray-700"
              title="Close authentication"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
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
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Access Token"
                  value={authConfig.token || ''}
                  onChange={(e) => {
                    const newToken = e.target.value;
                    const decoded = decodeJWT(newToken);
                    setAuthConfig({ 
                      ...authConfig, 
                      token: newToken,
                      tokenExpiry: decoded?.exp
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                />
                
                {authConfig.token && decodeJWT(authConfig.token) && (
                  <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                    {(() => {
                      const decoded = decodeJWT(authConfig.token!);
                      if (decoded?.exp) {
                        const expiryDate = new Date(decoded.exp * 1000);
                        const now = new Date();
                        const isExpired = expiryDate < now;
                        const minutesUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / 60000);
                        
                        return (
                          <div className="flex items-center gap-2">
                            {isExpired ? (
                              <span className="text-red-600 font-medium">⚠️ Token expired</span>
                            ) : minutesUntilExpiry < 5 ? (
                              <span className="text-orange-600 font-medium">⚠️ Expires in {minutesUntilExpiry} minutes</span>
                            ) : (
                              <span className="text-green-600 font-medium">✓ Valid until {expiryDate.toLocaleString()}</span>
                            )}
                          </div>
                        );
                      }
                      return <span>JWT Token detected</span>;
                    })()}
                  </div>
                )}

                <div className="border-t border-gray-200 pt-3">
                  <label className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                    <input
                      type="checkbox"
                      checked={authConfig.autoRefresh || false}
                      onChange={(e) => setAuthConfig({ ...authConfig, autoRefresh: e.target.checked })}
                      className="rounded"
                    />
                    <span>Auto-refresh token when expired</span>
                  </label>
                  
                  {authConfig.autoRefresh && (
                    <div className="space-y-2 ml-6">
                      <input
                        type="text"
                        placeholder="Refresh Token URL"
                        value={authConfig.refreshTokenUrl || ''}
                        onChange={(e) => setAuthConfig({ ...authConfig, refreshTokenUrl: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Refresh Token"
                        value={authConfig.refreshToken || ''}
                        onChange={(e) => setAuthConfig({ ...authConfig, refreshToken: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                      />
                      <button
                        onClick={refreshAccessToken}
                        className="px-3 py-1.5 bg-[#FF6C37] hover:bg-[#ff5722] text-white text-sm rounded"
                      >
                        Refresh Token Now
                      </button>
                    </div>
                  )}
                </div>

                {/* Auto-Login Configuration */}
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <label className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                    <input
                      type="checkbox"
                      checked={authConfig.autoLogin || false}
                      onChange={(e) => setAuthConfig({ ...authConfig, autoLogin: e.target.checked })}
                      className="rounded"
                    />
                    <span className="font-medium">Auto-login when token expires</span>
                  </label>
                  
                  <p className="text-xs text-gray-500 mb-3 ml-6">
                    Automatically login and get a new token when API returns 401/403 error
                  </p>
                  
                  {authConfig.autoLogin && (
                    <div className="space-y-2 ml-6 bg-blue-50 p-3 rounded border border-blue-200">
                      <div className="text-xs font-medium text-blue-900 mb-2">Login Configuration</div>
                      <input
                        type="text"
                        placeholder="Login URL (e.g., https://api.example.com/auth/login)"
                        value={authConfig.loginUrl || ''}
                        onChange={(e) => setAuthConfig({ ...authConfig, loginUrl: e.target.value })}
                        className="w-full px-3 py-2 border border-blue-300 rounded-md text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Username or Email"
                        value={authConfig.loginUsername || ''}
                        onChange={(e) => setAuthConfig({ ...authConfig, loginUsername: e.target.value })}
                        className="w-full px-3 py-2 border border-blue-300 rounded-md text-sm"
                      />
                      <input
                        type="password"
                        placeholder="Password"
                        value={authConfig.loginPassword || ''}
                        onChange={(e) => setAuthConfig({ ...authConfig, loginPassword: e.target.value })}
                        className="w-full px-3 py-2 border border-blue-300 rounded-md text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Token Path in Response (e.g., data.token or access_token)"
                        value={authConfig.tokenPath || ''}
                        onChange={(e) => setAuthConfig({ ...authConfig, tokenPath: e.target.value })}
                        className="w-full px-3 py-2 border border-blue-300 rounded-md text-sm font-mono"
                      />
                      <div className="text-xs text-blue-700 mt-2">
                        <p className="font-medium mb-1">💡 Common token paths:</p>
                        <ul className="list-disc ml-4 space-y-1">
                          <li><code className="bg-blue-100 px-1 rounded">access_token</code> - Root level</li>
                          <li><code className="bg-blue-100 px-1 rounded">token</code> - Root level</li>
                          <li><code className="bg-blue-100 px-1 rounded">data.token</code> - Nested in data</li>
                          <li><code className="bg-blue-100 px-1 rounded">data.access_token</code> - Nested in data</li>
                        </ul>
                      </div>
                      <button
                        onClick={async () => {
                          const token = await performAutoLogin();
                          if (token) {
                            alert('Login successful! Token acquired.');
                          }
                        }}
                        className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded"
                      >
                        Test Login Now
                      </button>
                    </div>
                  )}
                </div>
              </div>
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

      {showSettings && (
        <div className="bg-white p-4 rounded-lg border border-gray-200 max-w-[1600px] mx-auto mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Settings</h3>
            <button
              onClick={() => setShowSettings(false)}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <label className="text-sm font-medium text-gray-700">Auto-format JSON</label>
                <p className="text-xs text-gray-500 mt-0.5">Automatically format JSON in request body</p>
              </div>
              <input
                type="checkbox"
                checked={autoFormat}
                onChange={(e) => setAutoFormat(e.target.checked)}
                className="rounded border-gray-300 text-[#FF6C37] focus:ring-[#FF6C37] w-4 h-4"
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <label className="text-sm font-medium text-gray-700">Auto-save changes</label>
                <p className="text-xs text-gray-500 mt-0.5">Save requests automatically to localStorage</p>
              </div>
              <input
                type="checkbox"
                checked={autoSave}
                onChange={(e) => setAutoSave(e.target.checked)}
                className="rounded border-gray-300 text-[#FF6C37] focus:ring-[#FF6C37] w-4 h-4"
              />
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
} 