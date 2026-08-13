'use client';

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession, signOut, signIn } from 'next-auth/react';
import { useCollections } from './hooks/useCollections';
import { useWorkspaces } from './hooks/useWorkspaces';
import { parseImportedCollection } from './lib/collectionImport';
import {
  applyPreRequestDirectives,
  parseSetCookieHeader,
  runPostmanStyleTests,
  type PostmanTestResult,
} from './lib/postmanScripts';
import {
  describeResponseBody,
  formatBytes,
  searchResponseSections,
  type ResponseSearchMatch,
} from './lib/responseInspection';
import { decodeJwtSegment } from '@/app/tools/lib/tool-utils';
import { 
  WrenchIcon, 
  ClipboardIcon,
  ClockIcon,
  CogIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon,
  FolderIcon,
  CheckIcon,
  XMarkIcon,
  DocumentTextIcon,
  DocumentDuplicateIcon,
  ArrowDownOnSquareIcon,
  ArrowUpOnSquareIcon,
  QuestionMarkCircleIcon,
  LightBulbIcon,
  CodeBracketIcon,
  TableCellsIcon,
  MagnifyingGlassIcon,
  ShareIcon,
  ArrowsRightLeftIcon,
  ArrowPathIcon,
  CommandLineIcon,
  DocumentCheckIcon,
  AdjustmentsHorizontalIcon,
  EyeIcon,
  EyeSlashIcon,
  FunnelIcon
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
type CodeSnippetLanguage = 'curl' | 'javascript' | 'python';
type RequestEditorTab = 'params' | 'authorization' | 'headers' | 'body' | 'preRequest' | 'tests';
type ResponseViewerTab = 'body' | 'headers' | 'cookies' | 'tests' | 'details';
type SidebarMode = 'collections' | 'environments' | 'history';

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

interface RequestTab {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  headers: Header[];
  body: string;
  contentType: ContentType;
  authConfig: AuthConfig;
  preRequestScript: string;
  testScript: string;
  testResults: PostmanTestResult[];
  response: any;
  responseMetrics: ResponseMetrics | null;
  hasUnsavedChanges: boolean;
}

interface SavedRequest {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  headers: Header[];
  body: string;
  contentType: ContentType;
  authConfig: AuthConfig;
  preRequestScript?: string;
  testScript?: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
}

interface Collection {
  id: string;
  name: string;
  description?: string;
  requests: SavedRequest[];
  createdAt: number;
  updatedAt: number;
  color?: string;
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
const PRIVATE_MODE_KEYS = [
  'requestHistory',
  'environments',
  'presets',
  'activeEnvironment',
  'apiTesterTabs',
  'apiTesterActiveTabIndex',
  'api-collections',
  'apiTesterCollections',
  'settings'
];
const SENSITIVE_KEY_PATTERN = /(authorization|cookie|token|secret|password|passwd|api[-_\s]?key|x-api-key|client[-_\s]?secret|access[-_\s]?key|private[-_\s]?key)/i;

const isSensitiveKey = (key = '') => SENSITIVE_KEY_PATTERN.test(key);

const sanitizeHeaders = (headersToSanitize: Header[]) =>
  headersToSanitize.map((header) => ({
    ...header,
    value: isSensitiveKey(header.key) ? '' : header.value
  }));

const sanitizeAuthConfig = (config: AuthConfig): AuthConfig => {
  if (config.type === 'none') return config;

  return {
    type: config.type,
    apiKeyLocation: config.apiKeyLocation,
    apiKeyName: config.apiKeyName,
    autoRefresh: false,
    autoLogin: false
  };
};

const sanitizeSavedRequest = (request: Omit<SavedRequest, 'id' | 'createdAt' | 'updatedAt'>) => ({
  ...request,
  headers: sanitizeHeaders(request.headers),
  authConfig: sanitizeAuthConfig(request.authConfig)
});

const clearPrivateModeStorage = () => {
  PRIVATE_MODE_KEYS.forEach((key) => localStorage.removeItem(key));
};

function safeParseStored<T>(rawValue: string | null, fallback: T): T {
  if (!rawValue) return fallback;
  try {
    return JSON.parse(rawValue) as T;
  } catch {
    return fallback;
  }
}

const looksLikeBrowserNetworkBlock = (message: string) =>
  /(failed to fetch|networkerror|load failed|cors|blocked|fetch failed)/i.test(message);

const methodSupportsBody = (method: HttpMethod) => !['GET', 'HEAD'].includes(method);

const normalizeRequestUrl = (rawUrl: string) => {
  const trimmed = rawUrl.trim();
  if (!trimmed || /^[a-z][a-z\d+\-.]*:/i.test(trimmed) || trimmed.startsWith('{{')) {
    return trimmed;
  }

  if (/^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])(?::\d+)?(\/|$)/i.test(trimmed)) {
    return `http://${trimmed}`;
  }

  return `https://${trimmed}`;
};

const VARIABLE_PATTERN = /{{\s*([^{}\s]+)\s*}}/g;

const findTemplateVariables = (value: string) =>
  Array.from(value.matchAll(VARIABLE_PATTERN), (match) => match[1]);

const applyEnvironmentVariables = (value: string, environment?: Environment) => {
  if (!value || !environment) return value;

  const variables = new Map(
    environment.variables
      .filter((variable) => variable.key.trim())
      .map((variable) => [variable.key.trim(), variable.value])
  );

  return value.replace(VARIABLE_PATTERN, (match, key) => (
    variables.has(key) ? variables.get(key) || '' : match
  ));
};

const mergeVariables = (
  existing: Environment['variables'],
  incoming: Environment['variables']
) => {
  const seen = new Set(existing.map((variable) => variable.key.trim()).filter(Boolean));
  return [
    ...existing,
    ...incoming.filter((variable) => variable.key.trim() && !seen.has(variable.key.trim())),
  ];
};

const upsertVariables = (
  existing: Environment['variables'],
  incoming: Environment['variables']
) => {
  const next = [...existing];
  incoming.forEach((variable) => {
    const key = variable.key.trim();
    if (!key) return;
    const index = next.findIndex((item) => item.key.trim() === key);
    if (index >= 0) {
      next[index] = { ...next[index], value: variable.value };
    } else {
      next.push({ key, value: variable.value });
    }
  });
  return next;
};

const createRequestTab = (index: number, overrides: Partial<RequestTab> = {}): RequestTab => ({
  id: Date.now().toString(),
  name: `API ${index}`,
  method: 'GET',
  url: '',
  headers: [{ key: '', value: '', enabled: true }],
  body: '',
  contentType: 'application/json',
  authConfig: { type: 'none' },
  preRequestScript: '',
  testScript: '',
  testResults: [],
  response: null,
  responseMetrics: null,
  hasUnsavedChanges: false,
  ...overrides,
});

const normalizeRequestTab = (tab: Partial<RequestTab>, index: number): RequestTab => createRequestTab(index + 1, {
  ...tab,
  id: tab.id || Date.now().toString(),
  name: tab.name || `API ${index + 1}`,
  method: tab.method || 'GET',
  url: tab.url || '',
  headers: Array.isArray(tab.headers) ? tab.headers : [{ key: '', value: '', enabled: true }],
  body: tab.body || '',
  contentType: tab.contentType || 'application/json',
  authConfig: tab.authConfig || { type: 'none' },
  preRequestScript: tab.preRequestScript || '',
  testScript: tab.testScript || '',
  testResults: Array.isArray(tab.testResults) ? tab.testResults : [],
  response: tab.response || null,
  responseMetrics: tab.responseMetrics || null,
  hasUnsavedChanges: tab.hasUnsavedChanges || false,
});

const shellSingleQuote = (value: string) => `'${value.replace(/'/g, `'\\''`)}'`;

const REQUEST_TIMEOUT_MS = 30000;

// Rendering one node per key/element locks the tab up on large payloads.
const RENDERED_JSON_NODE_LIMIT = 2000;

const countJsonNodes = (value: any): number => {
  if (typeof value !== 'object' || value === null) return 1;

  let total = 1;
  for (const entry of Array.isArray(value) ? value : Object.values(value)) {
    total += countJsonNodes(entry);
    if (total > RENDERED_JSON_NODE_LIMIT) return total;
  }
  return total;
};

// Response bodies can be megabytes, and localStorage tops out around 5MB.
const stripPersistedTabState = (tab: RequestTab): RequestTab => ({
  ...tab,
  response: null,
  responseMetrics: null,
});

interface ModalShellProps {
  onClose: () => void;
  label: string;
  overlayClassName?: string;
  panelClassName?: string;
  children: React.ReactNode;
}

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Shared dialog wrapper: labels the dialog, traps Tab inside it, and closes on Escape.
function ModalShell({ onClose, label, overlayClassName, panelClassName, children }: ModalShellProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  // Held in a ref so inline onClose handlers do not re-run (and re-focus) the trap.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const focusableItems = () =>
      Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
        .filter((item) => item.offsetParent !== null || item === document.activeElement);

    // React already applied any autoFocus, so only take focus when it is still outside.
    if (!panel.contains(document.activeElement)) {
      (focusableItems()[0] || panel).focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onCloseRef.current();
        return;
      }

      if (event.key !== 'Tab') return;

      const items = focusableItems();
      if (items.length === 0) {
        event.preventDefault();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (!panel.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      previouslyFocused?.focus?.();
    };
  }, []);

  return (
    <div className={overlayClassName}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={panelClassName}
      >
        {children}
      </div>
    </div>
  );
}

function APITesterContent() {
  const { data: session } = useSession();
  const importFileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [storageReady, setStorageReady] = useState(false);
  
  // Tab management
  const [tabs, setTabs] = useState<RequestTab[]>([
    createRequestTab(1, { id: '1' })
  ]);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  
  // Get current tab
  const currentTab = tabs[activeTabIndex];
  
  // Legacy state for backward compatibility (now derived from currentTab)
  const url = currentTab?.url || '';
  const setUrl = (newUrl: string) => {
    updateCurrentTab({ url: newUrl, hasUnsavedChanges: true });
  };
  
  const method = currentTab?.method || 'GET';
  const setMethod = (newMethod: HttpMethod) => {
    updateCurrentTab({ method: newMethod, hasUnsavedChanges: true });
  };
  
  const headers = currentTab?.headers || [{ key: '', value: '', enabled: true }];
  const setHeaders = (newHeaders: Header[]) => {
    updateCurrentTab({ headers: newHeaders, hasUnsavedChanges: true });
  };
  
  const body = currentTab?.body || '';
  const setBody = (newBody: string) => {
    updateCurrentTab({ body: newBody, hasUnsavedChanges: true });
  };
  
  const response = currentTab?.response || null;
  const setResponse = (newResponse: any) => {
    updateCurrentTab({ response: newResponse });
  };
  
  const contentType = currentTab?.contentType || 'application/json';
  const setContentType = (newContentType: ContentType) => {
    updateCurrentTab({ contentType: newContentType, hasUnsavedChanges: true });
  };

  const preRequestScript = currentTab?.preRequestScript || '';
  const setPreRequestScript = (newScript: string) => {
    updateCurrentTab({ preRequestScript: newScript, hasUnsavedChanges: true });
  };

  const testScript = currentTab?.testScript || '';
  const setTestScript = (newScript: string) => {
    updateCurrentTab({ testScript: newScript, hasUnsavedChanges: true });
  };

  const testResults = currentTab?.testResults || [];
  const setTestResults = (newResults: PostmanTestResult[]) => {
    updateCurrentTab({ testResults: newResults });
  };
  
  const responseMetrics = currentTab?.responseMetrics || null;
  const setResponseMetrics = (newMetrics: ResponseMetrics | null) => {
    updateCurrentTab({ responseMetrics: newMetrics });
  };
  
  const authConfig = currentTab?.authConfig || { type: 'none' };
  const setAuthConfig = (newAuthConfig: AuthConfig) => {
    // Auth belongs to the tab being edited; new tabs inherit it via createNewTab.
    updateCurrentTab({ authConfig: newAuthConfig, hasUnsavedChanges: true });
  };

  // Helper function to update a tab by id. Async work must use this rather than the
  // index, which goes stale as soon as the user switches tabs mid-flight.
  const updateTabById = (tabId: string, updates: Partial<RequestTab>) => {
    setTabs(prevTabs => prevTabs.map(tab => (tab.id === tabId ? { ...tab, ...updates } : tab)));
  };

  // Helper function to update current tab
  const updateCurrentTab = (updates: Partial<RequestTab>) => {
    setTabs(prevTabs => {
      const newTabs = [...prevTabs];
      newTabs[activeTabIndex] = { ...newTabs[activeTabIndex], ...updates };
      return newTabs;
    });
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<RequestEditorTab>('params');
  const [activeResponseTab, setActiveResponseTab] = useState<ResponseViewerTab>('body');
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>('collections');
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
  const [responseTime, setResponseTime] = useState<number>(0);
  const [privateMode, setPrivateMode] = useState(false);
  const {
    workspaces,
    activeWorkspace,
    activeWorkspaceId,
    setActiveWorkspaceId,
    createWorkspace,
  } = useWorkspaces(privateMode);
  
  // Collections state - now using Supabase hook
  const {
    collections,
    isLoading: collectionsLoading,
    error: collectionsError,
    loadCollections,
    createCollection: createCollectionAPI,
    deleteCollection: deleteCollectionAPI,
    saveRequest: saveRequestAPI,
    deleteRequest: deleteRequestAPI,
    renameCollection: renameCollectionAPI,
  } = useCollections(privateMode, activeWorkspaceId);
  
  const [showCollections, setShowCollections] = useState(true);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [syncingCollections, setSyncingCollections] = useState(false);
  const [saveRequestName, setSaveRequestName] = useState('');
  const [saveRequestDescription, setSaveRequestDescription] = useState('');
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('');
  const [showNewCollectionDialog, setShowNewCollectionDialog] = useState(false);
  const [showNewWorkspaceDialog, setShowNewWorkspaceDialog] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set());
  
  // Token detection state
  const [detectedToken, setDetectedToken] = useState<string | null>(null);
  const [detectedTokenPath, setDetectedTokenPath] = useState<string>('');
  const [showTokenDetection, setShowTokenDetection] = useState(false);
  const [showBearerSetupWizard, setShowBearerSetupWizard] = useState(false);
  const [showTokenSetupConfirm, setShowTokenSetupConfirm] = useState(false);
  const [clickedTokenValue, setClickedTokenValue] = useState<string>('');
  const [clickedTokenPath, setClickedTokenPath] = useState<string>('');
  const [bearerSetupStep, setBearerSetupStep] = useState(1);
  const [wizardLoginUrl, setWizardLoginUrl] = useState('');
  const [wizardRequestPayload, setWizardRequestPayload] = useState('{\n  "username": "",\n  "password": ""\n}');
  const [wizardTokenPath, setWizardTokenPath] = useState('access_token');
  
  const [showAuthConfig, setShowAuthConfig] = useState(false);
  const [isEditorMounted, setIsEditorMounted] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [responseFormat, setResponseFormat] = useState<'pretty' | 'raw'>('pretty');
  const [responseSearchQuery, setResponseSearchQuery] = useState('');
  const [activeResponseSearchIndex, setActiveResponseSearchIndex] = useState(0);
  const [requestFormat, setRequestFormat] = useState<'pretty' | 'raw'>('pretty');
  const [autoFormat, setAutoFormat] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [showVariables, setShowVariables] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAdvancedAuth, setShowAdvancedAuth] = useState(false);
  const [showDocsPanel, setShowDocsPanel] = useState(false);
  const [showAiContextPanel, setShowAiContextPanel] = useState(false);
  const [showSnippetsPanel, setShowSnippetsPanel] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [codeSnippetLanguage, setCodeSnippetLanguage] = useState<CodeSnippetLanguage>('curl');
  const [apiDocFormat, setApiDocFormat] = useState<'markdown' | 'openapi'>('markdown');
  const [aiContextNotes, setAiContextNotes] = useState('');
  const [aiContextEnvironment, setAiContextEnvironment] = useState('Development');
  const [importNotice, setImportNotice] = useState<{ type: 'success' | 'error'; message: string; detail?: string } | null>(null);
  const [importingCollection, setImportingCollection] = useState(false);
  const [importProgress, setImportProgress] = useState<{ done: number; total: number } | null>(null);
  const [workbenchNotice, setWorkbenchNotice] = useState<{ type: 'success' | 'error' | 'info'; message: string; detail?: string } | null>(null);
  const [networkHint, setNetworkHint] = useState<{ title: string; message: string; curl: string } | null>(null);
  const [showValidation, setShowValidation] = useState(false);
  const [showTesting, setShowTesting] = useState(false);
  const [tokenCountdownTrigger, setTokenCountdownTrigger] = useState(0); // Force re-render for countdown
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
    const savedSettings = localStorage.getItem('settings');
    const settings = safeParseStored<{ autoFormat?: boolean; autoSave?: boolean; privateMode?: boolean } | null>(savedSettings, null);
    const storedPrivateMode = Boolean(settings?.privateMode);

    if (settings) {
      setAutoFormat(settings.autoFormat ?? true);
      setAutoSave(settings.autoSave ?? true);
      setPrivateMode(storedPrivateMode);
    }

    if (storedPrivateMode) {
      clearPrivateModeStorage();
      return;
    }

    const savedHistory = localStorage.getItem('requestHistory');
    const savedEnvironments = localStorage.getItem('environments');
    const savedPresets = localStorage.getItem('presets');
    const savedActiveEnv = localStorage.getItem('activeEnvironment');
    const savedTabs = localStorage.getItem('apiTesterTabs');
    const savedActiveTabIndex = localStorage.getItem('apiTesterActiveTabIndex');

    const parsedHistory = safeParseStored<RequestHistory[]>(savedHistory, []);
    const parsedEnvironments = safeParseStored<Environment[]>(savedEnvironments, []);
    const parsedPresets = safeParseStored<RequestPreset[]>(savedPresets, []);
    const parsedTabs = safeParseStored<RequestTab[]>(savedTabs, []);

    if (Array.isArray(parsedHistory)) setRequestHistory(parsedHistory);
    if (Array.isArray(parsedEnvironments) && parsedEnvironments.length > 0) setEnvironments(parsedEnvironments);
    if (Array.isArray(parsedPresets)) setPresets(parsedPresets);
    if (savedActiveEnv) setActiveEnvironment(savedActiveEnv);
    if (Array.isArray(parsedTabs) && parsedTabs.length > 0) {
      setTabs(parsedTabs.map((tab, index) => normalizeRequestTab(tab, index)));
    }
    if (savedActiveTabIndex) {
      const index = parseInt(savedActiveTabIndex, 10);
      if (!isNaN(index) && Array.isArray(parsedTabs) && parsedTabs.length > 0) {
        setActiveTabIndex(Math.max(0, Math.min(index, parsedTabs.length - 1)));
      }
    }
    // Collections are now loaded from Supabase via useCollections hook
  };

  useEffect(() => {
    setIsEditorMounted(true);
    loadSavedData();
    setStorageReady(true);
    // Below lg the sidebar is an overlay drawer, so it must not cover the workbench on load.
    if (window.innerWidth < 1024) {
      setShowCollections(false);
    }
  }, []);

  useEffect(() => {
    if (privateMode) {
      clearPrivateModeStorage();
    }
  }, [privateMode]);

  const saveData = () => {
    // Runs from effects, so a quota error here would otherwise break the render.
    try {
      if (privateMode) {
        clearPrivateModeStorage();
        localStorage.setItem('settings', JSON.stringify({
          autoFormat,
          autoSave,
          privateMode: true
        }));
        return;
      }

      localStorage.setItem('settings', JSON.stringify({
        autoFormat,
        autoSave,
        privateMode
      }));

      localStorage.setItem('requestHistory', JSON.stringify(requestHistory));
      localStorage.setItem('environments', JSON.stringify(environments));
      localStorage.setItem('presets', JSON.stringify(presets));
      localStorage.setItem('activeEnvironment', activeEnvironment);
      localStorage.setItem('apiTesterTabs', JSON.stringify(tabs.map(stripPersistedTabState)));
      localStorage.setItem('apiTesterActiveTabIndex', activeTabIndex.toString());
      // Collections are now saved to Supabase automatically via API calls
    } catch (err) {
      console.error('Failed to save workbench state:', err);
      showWorkbenchNotice({
        type: 'error',
        message: 'Could not save this workbench locally',
        detail: 'Browser storage is full or blocked. Requests still run, but tabs may not be restored.',
      });
    }
  };

  // Tab management functions
  const createNewTab = () => {
    // Inherit auth config from current tab if it's not 'none'
    const inheritedAuthConfig = currentTab?.authConfig && currentTab.authConfig.type !== 'none' 
      ? currentTab.authConfig 
      : { type: 'none' as const };
    
    const hasInheritedAuth = inheritedAuthConfig.type !== 'none';
    
    const newTab = createRequestTab(tabs.length + 1, {
      authConfig: inheritedAuthConfig,
    });
    setTabs([...tabs, newTab]);
    setActiveTabIndex(tabs.length);
    
    // Show notification if auth was inherited
    if (hasInheritedAuth) {
      setTimeout(() => {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2';
        notification.innerHTML = `
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>Auth config inherited from previous tab</span>
        `;
        document.body.appendChild(notification);
        setTimeout(() => document.body.removeChild(notification), 3000);
      }, 100);
    }
  };

  const closeTab = (index: number) => {
    if (tabs.length === 1) {
      // Don't allow closing the last tab, instead reset it
      setTabs([createRequestTab(1)]);
      setActiveTabIndex(0);
      return;
    }

    const newTabs = tabs.filter((_, i) => i !== index);
    setTabs(newTabs);
    
    // Adjust active tab index if necessary
    if (activeTabIndex >= index && activeTabIndex > 0) {
      setActiveTabIndex(activeTabIndex - 1);
    } else if (activeTabIndex >= newTabs.length) {
      setActiveTabIndex(newTabs.length - 1);
    }
  };

  const duplicateTab = (index: number) => {
    const tabToDuplicate = tabs[index];
    const newTab: RequestTab = {
      ...tabToDuplicate,
      id: Date.now().toString(),
      name: `${tabToDuplicate.name} (Copy)`,
      response: null,
      responseMetrics: null,
      hasUnsavedChanges: false
    };
    const newTabs = [...tabs];
    newTabs.splice(index + 1, 0, newTab);
    setTabs(newTabs);
    setActiveTabIndex(index + 1);
  };

  const renameTab = (index: number, newName: string) => {
    const newTabs = [...tabs];
    newTabs[index] = { ...newTabs[index], name: newName, hasUnsavedChanges: true };
    setTabs(newTabs);
  };

  // State for tab rename
  const [renamingTabIndex, setRenamingTabIndex] = useState<number | null>(null);
  const [tempTabName, setTempTabName] = useState('');

  const startRenaming = (index: number) => {
    setRenamingTabIndex(index);
    setTempTabName(tabs[index].name);
  };

  const finishRenaming = () => {
    if (renamingTabIndex !== null && tempTabName.trim()) {
      renameTab(renamingTabIndex, tempTabName.trim());
    }
    setRenamingTabIndex(null);
    setTempTabName('');
  };

  // Save tabs whenever they change
  useEffect(() => {
    if (storageReady && autoSave && tabs.length > 0) {
      saveData();
    }
  }, [tabs, activeTabIndex, autoSave, privateMode, storageReady]);

  // Collection management functions
  const createCollection = async () => {
    if (!newCollectionName.trim()) return;
    
    await createCollectionAPI(
      newCollectionName.trim(),
      newCollectionDescription.trim()
    );
    
    setNewCollectionName('');
    setNewCollectionDescription('');
    setShowNewCollectionDialog(false);
  };

  const closeNewCollectionDialog = () => {
    setShowNewCollectionDialog(false);
    setNewCollectionName('');
    setNewCollectionDescription('');
  };

  const closeNewWorkspaceDialog = () => {
    setShowNewWorkspaceDialog(false);
    setNewWorkspaceName('');
  };

  const createWorkspaceFromDialog = async () => {
    if (!newWorkspaceName.trim()) return;

    try {
      await createWorkspace(newWorkspaceName.trim());
      setNewWorkspaceName('');
      setShowNewWorkspaceDialog(false);
    } catch (err) {
      setImportNotice({
        type: 'error',
        message: 'Workspace creation failed',
        detail: err instanceof Error ? err.message : 'Try again after checking Cloud Sync.'
      });
    }
  };

  const deleteCollection = async (collectionId: string) => {
    if (confirm('Are you sure you want to delete this collection?')) {
      await deleteCollectionAPI(collectionId);
    }
  };

  const renameCollection = (collectionId: string, newName: string) => {
    renameCollectionAPI(collectionId, newName);
  };

  const saveCurrentRequestToCollection = async () => {
    if (!selectedCollectionId || !saveRequestName.trim()) return;

    const requestToSave = sanitizeSavedRequest({
      name: saveRequestName.trim(),
      method: currentTab.method,
      url: currentTab.url,
      headers: currentTab.headers,
      body: currentTab.body,
      contentType: currentTab.contentType,
      authConfig: currentTab.authConfig,
      preRequestScript: currentTab.preRequestScript,
      testScript: currentTab.testScript,
      description: saveRequestDescription.trim(),
    });
    
    await saveRequestAPI(selectedCollectionId, privateMode ? requestToSave : {
      ...requestToSave,
      headers: currentTab.headers,
      authConfig: currentTab.authConfig,
      preRequestScript: currentTab.preRequestScript,
      testScript: currentTab.testScript
    });

    // Clear form
    setSaveRequestName('');
    setSaveRequestDescription('');
    setShowSaveDialog(false);
    
    // Mark tab as saved
    updateCurrentTab({ hasUnsavedChanges: false });
  };

  const closeSaveDialog = () => {
    setShowSaveDialog(false);
    setSaveRequestName('');
    setSaveRequestDescription('');
    setSelectedCollectionId('');
  };

  const loadRequestFromCollection = (request: SavedRequest) => {
    // Create a new tab with the saved request data
    const newTab = createRequestTab(tabs.length + 1, {
      name: request.name,
      method: request.method,
      url: request.url,
      headers: request.headers,
      body: request.body,
      contentType: request.contentType,
      authConfig: request.authConfig,
      preRequestScript: request.preRequestScript || '',
      testScript: request.testScript || '',
      response: null,
      responseMetrics: null,
      hasUnsavedChanges: false
    });
    
    setTabs([...tabs, newTab]);
    setActiveTabIndex(tabs.length);
  };

  const deleteRequestFromCollection = async (collectionId: string, requestId: string) => {
    if (confirm('Are you sure you want to delete this request?')) {
      await deleteRequestAPI(collectionId, requestId);
    }
  };

  const exportCollection = (collection: Collection) => {
    // Exported files leave the browser, so redact credentials like every save path does.
    const exportedCollection = {
      ...collection,
      requests: collection.requests.map((request) => ({ ...request, ...sanitizeSavedRequest(request) })),
    };

    // A Blob URL avoids the browser length cap that data: URIs have on big collections.
    const blob = new Blob([JSON.stringify(exportedCollection, null, 2)], { type: 'application/json;charset=utf-8' });
    const linkElement = document.createElement('a');
    linkElement.href = URL.createObjectURL(blob);
    linkElement.download = `${collection.name.replace(/\s+/g, '_')}_collection.json`;
    linkElement.click();
    URL.revokeObjectURL(linkElement.href);
  };

  const generateApiDocumentation = () => {
    const selectedCollection = collections.find((collection) => collection.id === selectedCollectionId);
    const docRequests = selectedCollection?.requests.length
      ? selectedCollection.requests
      : [{
          id: currentTab.id,
          name: currentTab.name,
          method: currentTab.method,
          url: currentTab.url,
          headers: currentTab.headers,
          body: currentTab.body,
          contentType: currentTab.contentType,
          authConfig: currentTab.authConfig,
          description: saveRequestDescription,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }];

    if (apiDocFormat === 'openapi') {
      const paths = docRequests.reduce<Record<string, any>>((acc, request) => {
        const normalizedUrl = normalizeRequestUrl(request.url || '/');
        let pathname = normalizedUrl || '/';
        try {
          pathname = new URL(normalizedUrl).pathname || '/';
        } catch {
          pathname = normalizedUrl.startsWith('/') ? normalizedUrl : `/${normalizedUrl.replace(/^https?:\/\//, '')}`;
        }

        acc[pathname] = {
          ...(acc[pathname] || {}),
          [request.method.toLowerCase()]: {
            summary: request.name,
            description: request.description || '',
            parameters: request.headers
              .filter((header) => header.enabled && header.key.trim())
              .map((header) => ({
                name: header.key,
                in: 'header',
                required: false,
                schema: { type: 'string' },
              })),
            responses: {
              [responseMetrics?.status || 200]: {
                description: responseMetrics ? getStatusText(responseMetrics.status) : 'Successful response',
              },
            },
          },
        };

        if (methodSupportsBody(request.method) && request.body.trim()) {
          acc[pathname][request.method.toLowerCase()].requestBody = {
            required: true,
            content: {
              [request.contentType || 'application/json']: {
                schema: { type: 'object' },
                example: (() => {
                  try {
                    return JSON.parse(request.body);
                  } catch {
                    return request.body;
                  }
                })(),
              },
            },
          };
        }

        return acc;
      }, {});

      return JSON.stringify({
        openapi: '3.1.0',
        info: {
          title: selectedCollection?.name || currentTab.name || 'DebugTools API',
          version: '1.0.0',
          description: selectedCollection?.description || 'Generated from DebugTools API Workbench.',
        },
        paths,
      }, null, 2);
    }

    return [
      `# ${selectedCollection?.name || currentTab.name || 'API documentation'}`,
      '',
      selectedCollection?.description || 'Generated from DebugTools API Workbench.',
      '',
      `Workspace: ${activeWorkspace?.name || 'Local browser'}`,
      '',
      ...docRequests.flatMap((request) => [
        `## ${request.method} ${request.name}`,
        '',
        request.description || 'No description provided.',
        '',
        `Endpoint: \`${normalizeRequestUrl(request.url || '') || 'Not set'}\``,
        '',
        '### Headers',
        '',
        ...(request.headers.filter((header) => header.enabled && header.key.trim()).length
          ? request.headers
              .filter((header) => header.enabled && header.key.trim())
              .map((header) => `- \`${header.key}\`: ${isSensitiveKey(header.key) ? '[redacted]' : header.value || '(empty)'}`)
          : ['No custom headers.']),
        '',
        ...(methodSupportsBody(request.method) && request.body.trim()
          ? ['### Request body', '', '```json', request.body, '```', '']
          : []),
        ...(responseMetrics
          ? ['### Last observed response', '', `Status: \`${responseMetrics.status} ${getStatusText(responseMetrics.status)}\``, `Time: \`${responseMetrics.time}ms\``, `Size: \`${(responseMetrics.size / 1024).toFixed(2)} KB\``, '']
          : []),
      ]),
    ].join('\n');
  };

  const generateAiContext = () => {
    const enabledHeaders = headers.filter((header) => header.enabled && header.key.trim());
    const safeHeaders = sanitizeHeaders(enabledHeaders);
    return [
      '# DebugTools AI context',
      '',
      `Workspace: ${activeWorkspace?.name || 'Local browser'}`,
      `Environment: ${aiContextEnvironment || activeEnvironment}`,
      `Request: ${method} ${normalizeRequestUrl(url) || '(no URL)'}`,
      '',
      '## Notes',
      aiContextNotes.trim() || 'No extra notes added.',
      '',
      '## Request headers',
      safeHeaders.length ? JSON.stringify(safeHeaders, null, 2) : 'No enabled headers.',
      '',
      ...(methodSupportsBody(method) && body.trim() ? ['## Request body', body, ''] : []),
      '## Auth',
      JSON.stringify(sanitizeAuthConfig(authConfig), null, 2),
      '',
      '## Last response',
      response
        ? [
            `Status: ${responseMetrics?.status || response.status || 'unknown'} ${responseMetrics ? getStatusText(responseMetrics.status) : ''}`,
            `Time: ${responseMetrics?.time ?? 'unknown'}ms`,
            `Size: ${responseMetrics ? `${(responseMetrics.size / 1024).toFixed(2)} KB` : 'unknown'}`,
            '',
            '```json',
            formatResponseBody(response.data).slice(0, 12000),
            '```',
          ].join('\n')
        : 'No response captured yet.',
      '',
      '## Ask',
      'Explain the likely root cause, risky assumptions, and the next debugging checks. Keep secrets redacted.',
    ].join('\n');
  };

  const importCollection = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || importingCollection) return;

    setImportingCollection(true);
    setImportProgress(null);

    const reader = new FileReader();
    reader.onerror = () => {
      setImportingCollection(false);
      setImportProgress(null);
      setImportNotice({
        type: 'error',
        message: 'Import failed',
        detail: 'The file could not be read. Check that it is still available and try again.'
      });
      event.target.value = '';
    };
    reader.onload = async (e) => {
      try {
        const importedCollection = parseImportedCollection(
          JSON.parse(e.target?.result as string),
          file.name
        );
        
        // Create the collection via API
        const newCollection = await createCollectionAPI(
          importedCollection.name,
          importedCollection.description || '',
          importedCollection.color
        );
        
        if (!newCollection) {
          setImportNotice({
            type: 'error',
            message: 'Import failed',
            detail: 'The collection could not be created. Try again or check your sync state.'
          });
          return;
        }

        const importedVariables = importedCollection.variables || [];
        if (importedVariables.length > 0) {
          setEnvironments((currentEnvironments) => {
            const envIndex = currentEnvironments.findIndex(env => env.name === activeEnvironment);
            if (envIndex === -1) return currentEnvironments;

            const nextEnvironments = [...currentEnvironments];
            nextEnvironments[envIndex] = {
              ...nextEnvironments[envIndex],
              variables: mergeVariables(nextEnvironments[envIndex].variables, importedVariables),
            };
            return nextEnvironments;
          });
        }
        
        // Import all requests
        let importedRequestCount = 0;
        const requestsToImport = importedCollection.requests || [];
        setImportProgress({ done: 0, total: requestsToImport.length });
        for (const request of requestsToImport) {
          const requestToImport = {
            name: request.name,
            method: request.method,
            url: request.url,
            headers: request.headers || [],
            body: request.body || '',
            contentType: request.contentType || 'application/json',
            authConfig: request.authConfig || { type: 'none' },
            preRequestScript: request.preRequestScript || '',
            testScript: request.testScript || '',
            description: request.description || '',
          };
          const savedRequest = await saveRequestAPI(
            newCollection.id,
            privateMode ? sanitizeSavedRequest(requestToImport) : requestToImport
          );

          if (savedRequest) importedRequestCount += 1;
          setImportProgress({ done: importedRequestCount, total: requestsToImport.length });
        }
        const totalRequests = requestsToImport.length;
        const skippedRequests = Math.max(totalRequests - importedRequestCount, 0);

        setImportNotice({
          type: 'success',
          message: `Imported "${importedCollection.name}"`,
          detail: `${importedRequestCount} request${importedRequestCount === 1 ? '' : 's'} added${skippedRequests ? `, ${skippedRequests} skipped` : ''}${importedVariables.length ? `, ${importedVariables.length} variable${importedVariables.length === 1 ? '' : 's'} added` : ''}.`
        });
      } catch (error) {
        setImportNotice({
          type: 'error',
          message: 'Import failed',
          detail: error instanceof Error ? error.message : 'Check that the file is a valid Postman, Insomnia, OpenAPI, or debugtools JSON export.'
        });
        console.error('Import error:', error);
      } finally {
        setImportingCollection(false);
        setImportProgress(null);
        event.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const toggleCollectionExpanded = (collectionId: string) => {
    const newExpanded = new Set(expandedCollections);
    if (newExpanded.has(collectionId)) {
      newExpanded.delete(collectionId);
    } else {
      newExpanded.add(collectionId);
    }
    setExpandedCollections(newExpanded);
  };

  // Token detection and automation
  const detectTokenInResponse = (data: any): { token: string; path: string } | null => {
    // Empty bodies (204 and empty 2xx) arrive as null and must not be indexed.
    if (!data || typeof data !== 'object') return null;

    // Common token field names
    const tokenFields = [
      'access_token',
      'accessToken',
      'token',
      'jwt',
      'bearer',
      'auth_token',
      'authToken',
      'id_token',
      'idToken',
      'session_token',
      'sessionToken'
    ];

    // Check top level
    for (const field of tokenFields) {
      if (data[field] && typeof data[field] === 'string') {
        return { token: data[field], path: field };
      }
    }

    // Check nested data object
    if (data.data && typeof data.data === 'object') {
      for (const field of tokenFields) {
        if (data.data[field] && typeof data.data[field] === 'string') {
          return { token: data.data[field], path: `data.${field}` };
        }
      }
    }

    // Check result object
    if (data.result && typeof data.result === 'object') {
      for (const field of tokenFields) {
        if (data.result[field] && typeof data.result[field] === 'string') {
          return { token: data.result[field], path: `result.${field}` };
        }
      }
    }

    // Check user object (common in auth responses)
    if (data.user && typeof data.user === 'object') {
      for (const field of tokenFields) {
        if (data.user[field] && typeof data.user[field] === 'string') {
          return { token: data.user[field], path: `user.${field}` };
        }
      }
    }

    return null;
  };

  const applyDetectedToken = () => {
    if (detectedToken) {
      setAuthConfig({
        ...authConfig,
        type: 'bearer',
        token: detectedToken,
        tokenPath: detectedTokenPath,
        tokenExpiry: decodeJWT(detectedToken)?.exp
      });
      setShowTokenDetection(false);
      setDetectedToken(null);
      
      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2';
      notification.innerHTML = `
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>Bearer token saved successfully!</span>
      `;
      document.body.appendChild(notification);
      setTimeout(() => document.body.removeChild(notification), 3000);
    }
  };

  const setupBearerTokenWizard = async () => {
    if (bearerSetupStep === 1) {
      // Validate URL
      if (!wizardLoginUrl.trim()) {
        showWorkbenchNotice({ type: 'error', message: 'Please enter a login URL' });
        return;
      }
      setBearerSetupStep(2);
    } else if (bearerSetupStep === 2) {
      // Validate payload
      if (!wizardRequestPayload.trim()) {
        showWorkbenchNotice({ type: 'error', message: 'Please enter a request payload' });
        return;
      }
      
      // Validate JSON
      try {
        JSON.parse(wizardRequestPayload);
      } catch (error) {
        showWorkbenchNotice({ type: 'error', message: 'Invalid JSON payload', detail: 'Check the request payload syntax.' });
        return;
      }
      
      setBearerSetupStep(3);
    } else if (bearerSetupStep === 3) {
      // Test login and extract token
      try {
        const response = await fetch(wizardLoginUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: wizardRequestPayload
        });

        if (!response.ok) {
          throw new Error(`Login failed: ${response.statusText}`);
        }

        // Parse response safely
        const responseText = await response.text();
        let data: any;
        try {
          data = responseText ? JSON.parse(responseText) : {};
        } catch (error) {
          throw new Error(`Invalid JSON response from login endpoint: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        
        // Try to extract token using the specified path
        let extractedToken = getNestedProperty(data, wizardTokenPath);
        
        // If not found, try auto-detection
        if (!extractedToken) {
          const detected = detectTokenInResponse(data);
          if (detected) {
            extractedToken = detected.token;
            setWizardTokenPath(detected.path);
          }
        }

        if (extractedToken) {
          // Parse the payload to extract credentials if present
          let parsedPayload: any = {};
          try {
            parsedPayload = JSON.parse(wizardRequestPayload);
          } catch {}

          // Configure auth with extracted token
          setAuthConfig({
            type: 'bearer',
            token: extractedToken,
            loginUrl: wizardLoginUrl,
            loginUsername: parsedPayload.username || parsedPayload.email || '',
            loginPassword: parsedPayload.password || '',
            tokenPath: wizardTokenPath,
            autoLogin: true,
            tokenExpiry: decodeJWT(extractedToken)?.exp
          });

          // Show success and close wizard
          showWorkbenchNotice({
            type: 'success',
            message: 'Bearer token configured',
            detail: `Token extracted from ${wizardTokenPath}. Auto-login is enabled.`,
          });
          
          setShowBearerSetupWizard(false);
          setBearerSetupStep(1);
          setWizardLoginUrl('');
          setWizardRequestPayload('{\n  "username": "",\n  "password": ""\n}');
          setWizardTokenPath('access_token');
        } else {
          // Show the response structure to help debug
          console.error('Token extraction failed. Response structure:', data);
          throw new Error(
            `Token not found at path: ${wizardTokenPath}\n\n` +
            `Response structure: ${JSON.stringify(data, null, 2).substring(0, 200)}...\n\n` +
            `Try using auto-detection or check the response structure in the console.`
          );
        }
      } catch (error) {
        showWorkbenchNotice({
          type: 'error',
          message: 'Bearer token wizard failed',
          detail: `${error instanceof Error ? error.message : 'Unknown error'} Try clicking the token field directly in the response.`,
        });
        console.error('Wizard setup error:', error);
      }
    }
  };

  const closeBearerSetupWizard = () => {
    setShowBearerSetupWizard(false);
    setBearerSetupStep(1);
  };

  const closeTokenSetupConfirm = () => {
    setShowTokenSetupConfirm(false);
    setClickedTokenValue('');
    setClickedTokenPath('');
  };

  // Handle clicking on token fields in response
  const handleTokenClick = (tokenValue: string, tokenPath: string) => {
    console.log('Token clicked:', { tokenPath, tokenValue: tokenValue.substring(0, 50) + '...' });
    setClickedTokenValue(tokenValue);
    setClickedTokenPath(tokenPath);
    setShowTokenSetupConfirm(true);
  };

  // Confirm and setup bearer token from clicked field
  const confirmTokenSetup = () => {
    if (!clickedTokenValue) {
      showWorkbenchNotice({ type: 'error', message: 'No token value found' });
      return;
    }

    try {
      // Parse login payload from current request body if it exists
      let loginUsername = '';
      let loginPassword = '';
      
      try {
        const payload = JSON.parse(currentTab.body || '{}');
        loginUsername = payload.username || payload.email || '';
        loginPassword = payload.password || '';
      } catch {
        // Ignore JSON parse errors, use empty credentials
      }

      // Configure auth with clicked token for this tab
      const newAuthConfig = {
        type: 'bearer' as const,
        token: clickedTokenValue,
        loginUrl: currentTab.url || '',
        loginUsername,
        loginPassword,
        tokenPath: clickedTokenPath || 'access_token',
        autoLogin: true,
        tokenExpiry: decodeJWT(clickedTokenValue)?.exp
      };

      setAuthConfig(newAuthConfig);

      // Show success and close dialog
      showWorkbenchNotice({
        type: 'success',
        message: 'Bearer token configured for this tab',
        detail: `Token field: ${clickedTokenPath}. New tabs inherit this auth.`,
      });
      
      setShowTokenSetupConfirm(false);
      setClickedTokenValue('');
      setClickedTokenPath('');
    } catch (error) {
      showWorkbenchNotice({
        type: 'error',
        message: 'Failed to configure bearer token',
        detail: error instanceof Error ? error.message : 'Unknown error',
      });
      console.error('Token setup error:', error);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // These shortcuts shadow browser defaults, so never steal them from a field
      // the user is typing in (Cmd+R in the URL bar must not rename the tab).
      const target = e.target as HTMLElement | null;
      if (
        target
        && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
      ) {
        return;
      }

      // Ctrl/Cmd + T: New tab
      if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        createNewTab();
      }
      // Ctrl/Cmd + W: Close current tab
      else if ((e.ctrlKey || e.metaKey) && e.key === 'w') {
        e.preventDefault();
        closeTab(activeTabIndex);
      }
      // Ctrl/Cmd + Tab: Next tab
      else if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'Tab') {
        e.preventDefault();
        setActiveTabIndex((activeTabIndex + 1) % tabs.length);
      }
      // Ctrl/Cmd + Shift + Tab: Previous tab
      else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Tab') {
        e.preventDefault();
        setActiveTabIndex((activeTabIndex - 1 + tabs.length) % tabs.length);
      }
      // Ctrl/Cmd + D: Duplicate tab
      else if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        duplicateTab(activeTabIndex);
      }
      // Ctrl/Cmd + R: Rename tab
      else if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        startRenaming(activeTabIndex);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTabIndex, tabs.length]);

  // Token expiry countdown updater - updates every second
  useEffect(() => {
    if (authConfig.type === 'bearer' && authConfig.token && authConfig.tokenExpiry) {
      const interval = setInterval(() => {
        setTokenCountdownTrigger(prev => prev + 1); // Force re-render to update countdown
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [authConfig.type, authConfig.token, authConfig.tokenExpiry]);

  // JWT Token utilities
  const decodeJWT = (token: string): { exp?: number; iat?: number } | null => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      return decodeJwtSegment(parts[1]) as { exp?: number; iat?: number };
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

      // Parse response safely
      const responseText = await response.text();
      let data: any;
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (error) {
        throw new Error(`Invalid JSON response from refresh endpoint: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      const newToken = data.access_token || data.token;
      
      if (newToken) {
        const decoded = decodeJWT(newToken);
        setAuthConfig({
          ...authConfig,
          token: newToken,
          tokenExpiry: decoded?.exp
        });
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

      // Parse response safely
      const responseText = await response.text();
      let data: any;
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (error) {
        throw new Error(`Invalid JSON response from login endpoint: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      // Extract token using the configured path or try common paths
      const tokenPath = authConfig.tokenPath || 'access_token';
      let newToken = getNestedProperty(data, tokenPath);
      
      // Try common token paths if configured path didn't work
      if (!newToken) {
        newToken = data.access_token || data.token || data.data?.token || data.data?.access_token;
      }
      
      if (newToken) {
        const decoded = decodeJWT(newToken);
        setAuthConfig({
          ...authConfig,
          token: newToken,
          tokenExpiry: decoded?.exp
        });
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
    setActiveResponseSearchIndex(0);
  }, [responseSearchQuery, response]);

  useEffect(() => {
    if (storageReady && autoSave) {
      saveData();
    }
  }, [requestHistory, environments, presets, activeEnvironment, autoSave, privateMode, storageReady]);

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

  const setEnvironmentVariableValue = (key: string, value: string) => {
    setEnvironments((currentEnvironments) => {
      const envIndex = currentEnvironments.findIndex(env => env.name === activeEnvironment);
      if (envIndex === -1) return currentEnvironments;

      const nextEnvironments = [...currentEnvironments];
      const variables = [...nextEnvironments[envIndex].variables];
      const varIndex = variables.findIndex(variable => variable.key.trim() === key);

      if (varIndex >= 0) {
        variables[varIndex] = { ...variables[varIndex], value };
      } else {
        variables.push({ key, value });
      }

      nextEnvironments[envIndex] = {
        ...nextEnvironments[envIndex],
        variables,
      };
      return nextEnvironments;
    });

    if (error.startsWith('Missing environment variable')) {
      setError('');
    }
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

  const showWorkbenchNotice = (notice: { type: 'success' | 'error' | 'info'; message: string; detail?: string }) => {
    setWorkbenchNotice(notice);
    window.setTimeout(() => {
      setWorkbenchNotice((current) => (current?.message === notice.message ? null : current));
    }, 5000);
  };

  const loadSampleRequest = () => {
    setMethod('GET');
    setUrl('https://jsonplaceholder.typicode.com/todos/1');
    setHeaders([{ key: 'Accept', value: 'application/json', enabled: true }]);
    setBody('');
    setContentType('application/json');
    setAuthConfig({ type: 'none' });
    setPreRequestScript('// Safe directives run before fetch()\n// set header X-DebugTools: true');
    setTestScript('status is 200\nheader content-type contains json\njson id equals 1\nresponse time below 2000');
    setTestResults([]);
    setActiveTab('params');
    setResponse(null);
    setResponseMetrics(null);
    setError('');
    setNetworkHint(null);
    showWorkbenchNotice({
      type: 'info',
      message: 'Sample request loaded',
      detail: 'Press Send to try a public JSON endpoint.',
    });
  };

  const buildCurrentRequestParts = (
    authOverride: AuthConfig = authConfig,
    environmentOverride?: Environment
  ) => {
    const activeEnv = environmentOverride || environments.find(env => env.name === activeEnvironment);
    let processedUrl = normalizeRequestUrl(applyEnvironmentVariables(url, activeEnv));
    const processedBody = methodSupportsBody(method)
      ? applyEnvironmentVariables(body, activeEnv)
      : '';

    const requestHeaders: Record<string, string> = {};
    if (methodSupportsBody(method)) {
      requestHeaders['Content-Type'] = contentType;
    }

    if (authOverride.type !== 'none') {
      switch (authOverride.type) {
        case 'basic': {
          const basicAuth = btoa(`${authOverride.username || ''}:${authOverride.password || ''}`);
          requestHeaders.Authorization = `Basic ${basicAuth}`;
          break;
        }
        case 'bearer':
          requestHeaders.Authorization = `Bearer ${authOverride.token || ''}`;
          break;
        case 'apiKey': {
          const apiKeyName = authOverride.apiKeyName || 'api_key';
          const apiKeyValue = authOverride.apiKey || '';
          if (authOverride.apiKeyLocation === 'header') {
            requestHeaders[apiKeyName] = apiKeyValue;
          } else if (apiKeyValue) {
            const separator = processedUrl.includes('?') ? '&' : '?';
            processedUrl += `${separator}${encodeURIComponent(apiKeyName)}=${encodeURIComponent(apiKeyValue)}`;
          }
          break;
        }
      }
    }

    headers.forEach(({ key, value, enabled }) => {
      // An empty value is a valid header, so only the key is required.
      if (enabled && key.trim()) {
        requestHeaders[key] = applyEnvironmentVariables(value, activeEnv);
      }
    });

    const unresolvedVariables = Array.from(new Set([
      ...findTemplateVariables(processedUrl),
      ...Object.values(requestHeaders).flatMap(findTemplateVariables),
      ...findTemplateVariables(processedBody),
    ]));

    return { processedUrl, processedBody, requestHeaders, unresolvedVariables };
  };

  const requestCanUseCache = (requestHeaders: Record<string, string>, authOverride: AuthConfig = authConfig) =>
    ['GET', 'HEAD'].includes(method)
    && authOverride.type === 'none'
    && !Object.keys(requestHeaders).some(isSensitiveKey);

  const executeRequest = useCallback(async function runRequest(
    options: { authOverride?: AuthConfig; retried?: boolean; bypassCache?: boolean } = {}
  ): Promise<void> {
    const { authOverride, retried = false, bypassCache = false } = options;
    const effectiveAuth = authOverride || authConfig;
    // The response belongs to the tab that started the request, even if the user
    // switches tabs before it lands.
    const requestTabId = currentTab?.id;
    const applyToRequestTab = (updates: Partial<RequestTab>) => {
      if (requestTabId) updateTabById(requestTabId, updates);
    };

    let timeoutId: number | undefined;
    let timedOut = false;
    let controller: AbortController | null = null;

    try {
      setLoading(true);
      setError('');
      setNetworkHint(null);
      applyToRequestTab({ response: null, testResults: [] });
      setActiveResponseTab('body');

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

      const preRequestPreview = applyPreRequestDirectives(preRequestScript, {});
      const activeEnv = environments.find(env => env.name === activeEnvironment);
      const requestEnvironment = activeEnv && preRequestPreview.variables.length > 0
        ? {
            ...activeEnv,
            variables: upsertVariables(activeEnv.variables, preRequestPreview.variables),
          }
        : activeEnv;

      const requestParts = buildCurrentRequestParts(effectiveAuth, requestEnvironment);
      const { processedUrl, processedBody, unresolvedVariables } = requestParts;
      let { requestHeaders } = requestParts;
      const preRequestResult = applyPreRequestDirectives(preRequestScript, requestHeaders);
      requestHeaders = preRequestResult.headers;

      if (preRequestResult.variables.length > 0) {
        setEnvironments((currentEnvironments) => {
          const envIndex = currentEnvironments.findIndex(env => env.name === activeEnvironment);
          if (envIndex === -1) return currentEnvironments;

          const nextEnvironments = [...currentEnvironments];
          nextEnvironments[envIndex] = {
            ...nextEnvironments[envIndex],
            variables: upsertVariables(nextEnvironments[envIndex].variables, preRequestResult.variables),
          };
          return nextEnvironments;
        });
      }

      if (preRequestResult.warnings.length > 0) {
        showWorkbenchNotice({
          type: 'info',
          message: 'Some pre-request lines were skipped',
          detail: preRequestResult.warnings.slice(0, 2).join(' '),
        });
      }

      if (unresolvedVariables.length > 0) {
        setEnvironments((currentEnvironments) => {
          const envIndex = currentEnvironments.findIndex(env => env.name === activeEnvironment);
          if (envIndex === -1) return currentEnvironments;

          const existingKeys = new Set(
            currentEnvironments[envIndex].variables
              .map((variable) => variable.key.trim())
              .filter(Boolean)
          );
          const missingRows = unresolvedVariables
            .filter((variable) => !existingKeys.has(variable))
            .map((variable) => ({ key: variable, value: '' }));

          if (missingRows.length === 0) return currentEnvironments;

          const nextEnvironments = [...currentEnvironments];
          nextEnvironments[envIndex] = {
            ...nextEnvironments[envIndex],
            variables: [...nextEnvironments[envIndex].variables, ...missingRows],
          };
          return nextEnvironments;
        });
        throw new Error(
          `Missing environment variable${unresolvedVariables.length === 1 ? '' : 's'}: ${unresolvedVariables.join(', ')}. Add ${unresolvedVariables.length === 1 ? 'it' : 'them'} in Environment Variables or choose the right environment.`
        );
      }

      const cacheKey = JSON.stringify({
        method,
        url: processedUrl,
        headers: requestHeaders,
        body: processedBody
      });
      const useCache = requestCanUseCache(requestHeaders, effectiveAuth);
      const cachedResponse = requestCache[cacheKey];

      // Pressing Send is an explicit "ask the server again", so it never reads the cache.
      if (!bypassCache && useCache && cachedResponse && now - cachedResponse.timestamp < CACHE_DURATION) {
        const cachedBodyText = typeof cachedResponse.data === 'string'
          ? cachedResponse.data
          : JSON.stringify(cachedResponse.data ?? '');
        applyToRequestTab({
          response: {
            status: cachedResponse.status,
            headers: cachedResponse.headers,
            data: cachedResponse.data,
          },
          responseMetrics: {
            size: new Blob([JSON.stringify(cachedResponse.data)]).size,
            time: 0,
            status: cachedResponse.status,
            headers: cachedResponse.headers
          },
          testResults: runPostmanStyleTests(testScript, {
            status: cachedResponse.status,
            headers: cachedResponse.headers,
            bodyText: cachedBodyText,
            durationMs: 0,
          }),
        });
        return;
      }

      controller = new AbortController();
      abortControllerRef.current = controller;
      timeoutId = window.setTimeout(() => {
        timedOut = true;
        controller?.abort();
      }, REQUEST_TIMEOUT_MS);

      const startTime = Date.now();
      const response = await fetch(processedUrl, {
        method,
        headers: requestHeaders,
        body: methodSupportsBody(method) ? processedBody : undefined,
        signal: controller.signal,
      });

      // Parse response data safely
      let data: any;
      const responseContentType = response.headers.get('content-type');
      const responseText = await response.text();
      
      try {
        // Try to parse as JSON if content-type is JSON or if response text looks like JSON
        if (responseContentType?.includes('application/json') || (responseText && (responseText.trim().startsWith('{') || responseText.trim().startsWith('[')))) {
          data = responseText ? JSON.parse(responseText) : null;
        } else {
          // Not JSON, return as text
          data = responseText || null;
        }
      } catch (error) {
        console.warn('Failed to parse response as JSON, returning as text:', error);
        data = responseText || null;
      }
      
      // Check if token expired and auto-login is enabled. `retried` makes this one-shot:
      // without it a still-rejected token would trigger login/request forever.
      if (effectiveAuth.autoLogin && !retried && isTokenExpiredResponse(response.status, data)) {
        console.log('Token expired, attempting auto-login and token refresh...');

        const newToken = await performAutoLogin();

        if (newToken) {
          // Show brief success notification
          const successNotification = document.createElement('div');
          successNotification.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2 text-sm';
          successNotification.innerHTML = `
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>Token refreshed automatically</span>
          `;
          document.body.appendChild(successNotification);
          setTimeout(() => {
            if (document.body.contains(successNotification)) {
              document.body.removeChild(successNotification);
            }
          }, 2000);
          
          // Retry once, passing the fresh token explicitly: this callback closes over
          // the authConfig captured at render, so re-reading it would resend the old one.
          console.log('Retrying request with refreshed token...');
          await runRequest({
            authOverride: {
              ...effectiveAuth,
              token: newToken,
              tokenExpiry: decodeJWT(newToken)?.exp,
            },
            retried: true,
            bypassCache: true,
          });
          return;
        }

        setError('Token expired and auto-refresh failed. Please login manually.');
        return;
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Auto-detect token in response
      if (response.status >= 200 && response.status < 300) {
        const detected = detectTokenInResponse(data);
        if (detected && detected.token !== effectiveAuth.token) {
          setDetectedToken(detected.token);
          setDetectedTokenPath(detected.path);
          setShowTokenDetection(true);
        }
      }

      // Update rate limit timestamps
      setRequestTimestamps(prev => [...prev, now].filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW));

      // Cache the response
      const responseData = {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        data,
      };
      const responseTestResults = runPostmanStyleTests(testScript, {
        status: response.status,
        headers: responseData.headers,
        bodyText: responseText,
        durationMs: duration,
      });

      // Only successful responses are cacheable; replaying a 404/500 for five minutes
      // hides the fact that the server was fixed.
      if (useCache && response.status >= 200 && response.status < 300) {
        setRequestCache(prev => ({
          ...prev,
          [cacheKey]: {
            data,
            timestamp: now,
            headers: responseData.headers,
            status: response.status
          }
        }));
      }

      setResponseTime(duration);
      applyToRequestTab({
        response: responseData,
        responseMetrics: {
          size: new Blob([JSON.stringify(data)]).size,
          time: duration,
          status: response.status,
          headers: responseData.headers
        },
        testResults: responseTestResults,
      });

      // Add to history
      const historyItem: RequestHistory = {
        id: Date.now().toString(),
        method,
        url: processedUrl,
        headers,
        body: processedBody,
        timestamp: now,
        status: response.status,
        duration
      };
      if (!privateMode) {
        setRequestHistory([historyItem, ...requestHistory].slice(0, 50));
      }
    } catch (err: any) {
      const message = err.message || 'An error occurred';
      if (err?.name === 'AbortError') {
        setError(timedOut
          ? `Request timed out after ${REQUEST_TIMEOUT_MS / 1000}s. The endpoint never responded.`
          : 'Request cancelled.');
      } else if (looksLikeBrowserNetworkBlock(message)) {
        setError('The browser could not complete this request.');
        setNetworkHint({
          title: 'Likely CORS or browser network block',
          message: 'Browsers enforce CORS and mixed-content rules that CLI tools do not. If this API does not allow this origin, run the same request as cURL or through a server-side proxy.',
          curl: generateCode('curl')
        });
      } else {
        setError(message);
      }
    } finally {
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      if (controller && abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
      setLoading(false);
    }
  }, [url, method, headers, body, environments, activeEnvironment, contentType, authConfig, currentTab?.id, requestCache, requestTimestamps, privateMode, requestHistory, preRequestScript, testScript]);

  const handleSubmit = useCallback(() => executeRequest({ bypassCache: true }), [executeRequest]);

  const cancelRequest = () => {
    abortControllerRef.current?.abort();
  };

  const copyToClipboard = async (text: string, message = 'Copied to clipboard') => {
    try {
      await navigator.clipboard.writeText(text);
      showWorkbenchNotice({ type: 'success', message });
    } catch (err) {
      console.error('Failed to copy:', err);
      showWorkbenchNotice({
        type: 'error',
        message: 'Copy failed',
        detail: 'Your browser blocked clipboard access. Select the text manually.',
      });
    }
  };

  const formatJSON = (json: any) => {
    try {
      return JSON.stringify(json, null, 2);
    } catch {
      return json;
    }
  };

  const formatResponseBody = (data: any) => {
    if (typeof data === 'string') return data;
    try {
      return responseFormat === 'raw'
        ? JSON.stringify(data)
        : JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  const getStatusText = (status: number): string => {
    const statusTexts: Record<number, string> = {
      200: 'OK',
      201: 'Created',
      202: 'Accepted',
      204: 'No Content',
      301: 'Moved Permanently',
      302: 'Found',
      304: 'Not Modified',
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      405: 'Method Not Allowed',
      408: 'Request Timeout',
      409: 'Conflict',
      422: 'Unprocessable Entity',
      429: 'Too Many Requests',
      500: 'Internal Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
      504: 'Gateway Timeout'
    };
    return statusTexts[status] || 'Unknown Status';
  };

  const generateCode = (language: CodeSnippetLanguage) => {
    const { processedUrl, processedBody, requestHeaders } = buildCurrentRequestParts();
    const enabledHeaders = Object.entries(requestHeaders).filter(([, value]) => value.trim());
    const headersObj = Object.fromEntries(enabledHeaders);
    const headersStr = JSON.stringify(headersObj, null, 2);
    const curlParts = [
      'curl',
      '-X',
      method,
      shellSingleQuote(processedUrl),
      ...enabledHeaders.flatMap(([key, value]) => ['-H', shellSingleQuote(`${key}: ${value}`)]),
      ...(methodSupportsBody(method) && processedBody ? ['--data-raw', shellSingleQuote(processedBody)] : [])
    ];
    
    const codeTemplates: Record<string, string> = {
      javascript: `fetch('${processedUrl}', {
  method: '${method}',
  headers: ${headersStr},
  body: ${methodSupportsBody(method) && processedBody ? JSON.stringify(processedBody) : 'undefined'}
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,
      python: `import requests
import json

response = requests.${method.toLowerCase()}(
    '${processedUrl}',
    headers=${headersStr},
    ${methodSupportsBody(method) && processedBody ? `data=${JSON.stringify(processedBody)}` : ''}
)

print(response.json())`,
      curl: curlParts.join(' ')
    };
    return codeTemplates[language] || '';
  };

  const downloadSnippet = () => {
    const filenames: Record<CodeSnippetLanguage, string> = {
      curl: 'request.curl',
      javascript: 'request.fetch.js',
      python: 'request.py',
    };
    const blob = new Blob([generateCode(codeSnippetLanguage)], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filenames[codeSnippetLanguage];
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // Render JSON with clickable token fields
  const renderClickableJSON = (data: any, path: string = '') => {
    if (typeof data === 'string') {
      return <span className="whitespace-pre-wrap break-words text-[#d7d7dc]">{data}</span>;
    }

    if (typeof data !== 'object' || data === null) {
      return <span className="text-[#d7d7dc]">{JSON.stringify(data)}</span>;
    }

    const tokenFields = ['token', 'access_token', 'accessToken', 'auth_token', 'authToken', 
                        'jwt', 'bearer', 'id_token', 'idToken', 'refresh_token', 'refreshToken'];

    if (Array.isArray(data)) {
      return (
        <div className="ml-4">
          {'['}
          {data.map((item, index) => (
            <div key={index} className="ml-4">
              {renderClickableJSON(item, `${path}[${index}]`)}{index < data.length - 1 ? ',' : ''}
            </div>
          ))}
          {']'}
        </div>
      );
    }

    return (
      <div className="ml-4">
        {'{'}
        {Object.entries(data).map(([key, value], index, arr) => {
          const currentPath = path ? `${path}.${key}` : key;
          const isTokenField = tokenFields.includes(key.toLowerCase());
          const isStringValue = typeof value === 'string';
          
          return (
            <div key={key} className="ml-4 flex items-start">
              <span className="font-medium text-[#8f83ff]">"{key}"</span>
              <span className="mx-2 text-[#85858e]">:</span>
              {isTokenField && isStringValue ? (
                <button
                  onClick={() => handleTokenClick(value as string, currentPath)}
                  className="cursor-pointer break-all rounded bg-[#252234] px-2 py-1 text-left text-[#c8c2ff] transition-all hover:bg-[#302a4a] hover:underline"
                  title="Click to use this as bearer token"
                >
                  "{value}"
                </button>
              ) : typeof value === 'object' && value !== null ? (
                renderClickableJSON(value, currentPath)
              ) : (
                <span className="text-[#d7d7dc]">{JSON.stringify(value)}</span>
              )}
              {index < arr.length - 1 ? ',' : ''}
            </div>
          );
        })}
        {'}'}
      </div>
    );
  };

  const renderSearchPreview = (match: ResponseSearchMatch) => {
    if (!responseSearchQuery.trim()) return match.preview;

    const before = match.preview.slice(0, match.start);
    const hit = match.preview.slice(match.start, match.end);
    const after = match.preview.slice(match.end);

    if (!hit) return match.preview;

    return (
      <>
        {before}
        <mark className="rounded bg-amber-300 px-0.5 text-[#101011]">{hit}</mark>
        {after}
      </>
    );
  };

  const activeEnvironmentDetails = environments.find(env => env.name === activeEnvironment);
  const currentTemplateVariables = Array.from(new Set([
    ...findTemplateVariables(url),
    ...headers
      .filter(header => header.enabled)
      .flatMap(header => findTemplateVariables(header.value)),
    ...(methodSupportsBody(method) ? findTemplateVariables(body) : []),
  ]));
  const missingEnvironmentVariables = currentTemplateVariables.filter((key) => {
    const variable = activeEnvironmentDetails?.variables.find(item => item.key.trim() === key);
    return !variable || !variable.value.trim();
  });
  const getEnvironmentVariableValue = (key: string) =>
    activeEnvironmentDetails?.variables.find(item => item.key.trim() === key)?.value || '';
  const enabledHeaderKeys = headers
    .filter((header) => header.enabled && header.key.trim())
    .map((header) => header.key.trim());
  const requestSummary = {
    environment: activeEnvironmentDetails?.name || 'No environment',
    auth: authConfig.type === 'none' ? 'No auth' : authConfig.type,
    body: methodSupportsBody(method) ? contentType : 'No body',
    cache: ['GET', 'HEAD'].includes(method) && authConfig.type === 'none' && !enabledHeaderKeys.some(isSensitiveKey)
      ? 'Cache eligible'
      : 'Live request',
    variables: missingEnvironmentVariables.length,
  };
  const responseHeaders = response?.headers as Record<string, string> | undefined;
  const getResponseHeader = (headerName: string) => {
    if (!responseHeaders) return '';
    const key = Object.keys(responseHeaders).find((item) => item.toLowerCase() === headerName.toLowerCase());
    return key ? responseHeaders[key] : '';
  };
  const responseCookies = parseSetCookieHeader(responseHeaders?.['set-cookie'] || responseHeaders?.['Set-Cookie']);
  const passedTestCount = testResults.filter((result) => result.passed).length;
  const failedTestCount = testResults.filter((result) => !result.passed).length;
  const responseBodyText = response ? formatResponseBody(response.data) : '';
  const responseHeaderText = responseHeaders
    ? Object.entries(responseHeaders).map(([key, value]) => `${key}: ${value}`).join('\n')
    : '';
  const responseCookieText = responseCookies
    .map((cookie) => `${cookie.name}=${cookie.value}; ${cookie.attributes.join('; ')}`)
    .join('\n');
  const responseTestText = testResults
    .map((result) => `${result.passed ? 'PASS' : 'FAIL'} ${result.name}${result.message ? ` - ${result.message}` : ''}`)
    .join('\n');
  const responseBodyDescription = response ? describeResponseBody(response.data) : null;
  const responseBodyIsObject = Boolean(response) && typeof response?.data === 'object' && response?.data !== null;
  // Fall back to the raw view instead of mounting tens of thousands of nodes.
  const canRenderClickableJson = responseBodyIsObject && countJsonNodes(response.data) <= RENDERED_JSON_NODE_LIMIT;
  const responseDetailsText = responseMetrics
    ? [
        `${method} ${url}`,
        `Status: ${responseMetrics.status} ${getStatusText(responseMetrics.status)}`,
        `Time: ${responseMetrics.time}ms`,
        `Size: ${formatBytes(responseMetrics.size)}`,
        `Body: ${responseBodyDescription?.kind || 'Unknown'} ${responseBodyDescription?.detail || ''}`,
        `Content-Type: ${getResponseHeader('content-type') || 'Unknown'}`,
        `Headers: ${responseHeaders ? Object.keys(responseHeaders).length : 0}`,
        `Cookies: ${responseCookies.length}`,
        `Tests: ${testResults.length ? `${passedTestCount}/${testResults.length} passed` : 'None'}`,
      ].join('\n')
    : '';
  const responseSearchMatches = searchResponseSections([
    { id: 'body', label: 'Body', text: responseBodyText },
    { id: 'headers', label: 'Headers', text: responseHeaderText },
    { id: 'cookies', label: 'Cookies', text: responseCookieText },
    { id: 'tests', label: 'Tests', text: responseTestText },
    { id: 'details', label: 'Details', text: responseDetailsText },
  ], responseSearchQuery);
  const activeResponseSearchMatch = responseSearchMatches[activeResponseSearchIndex];
  const selectResponseSearchMatch = (index: number) => {
    const match = responseSearchMatches[index];
    if (!match) return;
    setActiveResponseSearchIndex(index);
    setActiveResponseTab(match.sectionId as ResponseViewerTab);
  };
  const moveResponseSearchMatch = (direction: 1 | -1) => {
    if (responseSearchMatches.length === 0) return;
    const nextIndex = (activeResponseSearchIndex + direction + responseSearchMatches.length) % responseSearchMatches.length;
    selectResponseSearchMatch(nextIndex);
  };
  const responseDetailCards = responseMetrics ? [
    { label: 'Status', value: `${responseMetrics.status} ${getStatusText(responseMetrics.status)}`, tone: responseMetrics.status >= 200 && responseMetrics.status < 300 ? 'good' : responseMetrics.status >= 400 ? 'bad' : 'neutral' },
    { label: 'Time', value: `${responseMetrics.time}ms`, tone: responseMetrics.time > 1000 ? 'warn' : 'neutral' },
    { label: 'Size', value: formatBytes(responseMetrics.size), tone: 'neutral' },
    { label: 'Body', value: `${responseBodyDescription?.kind || 'Unknown'} / ${responseBodyDescription?.detail || '-'}`, tone: 'neutral' },
    { label: 'Content-Type', value: getResponseHeader('content-type') || 'Unknown', tone: 'neutral' },
    { label: 'Headers', value: `${responseHeaders ? Object.keys(responseHeaders).length : 0}`, tone: 'neutral' },
    { label: 'Cookies', value: `${responseCookies.length}`, tone: responseCookies.length ? 'good' : 'neutral' },
    { label: 'Tests', value: testResults.length ? `${passedTestCount}/${testResults.length} passed` : 'No tests', tone: failedTestCount ? 'bad' : testResults.length ? 'good' : 'neutral' },
  ] : [];

  return (
    <div className="dt-api-workbench flex min-h-screen overflow-hidden bg-[#101011] text-[13px] leading-5 text-[#d7d7dc]">
      {/* Workspace Sidebar - overlay drawer below lg, docked column at lg and up */}
      {showCollections && (
      <>
      <div
        className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        onClick={() => setShowCollections(false)}
        aria-hidden="true"
      />
      <div className="fixed inset-y-0 left-0 z-50 flex w-[86vw] max-w-[340px] flex-col border-r border-[#26262c] bg-[#151516] text-[#d7d7dc] lg:static lg:order-1 lg:z-auto lg:w-[340px] lg:max-w-none">
        {/* Sidebar Header */}
        <div className="flex items-center justify-between gap-3 border-b border-[#26262c] bg-[#171719] px-3 py-2.5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#85858e]">Workspace</p>
            <h2 className="mt-0.5 text-sm font-semibold text-[#f2f2f3]">
              {sidebarMode === 'collections' ? 'Collections' : sidebarMode === 'environments' ? 'Environments' : 'History'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {sidebarMode === 'collections' && (
              <>
                <button
                  onClick={() => setShowNewCollectionDialog(true)}
                  className="inline-flex items-center gap-1 rounded-md border border-[#34343b] bg-[#202024] px-2 py-1.5 text-xs font-semibold text-[#d7d7dc] transition-colors hover:bg-[#27272d]"
                  title="New Collection"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => importFileInputRef.current?.click()}
                  disabled={importingCollection}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-[#34343b] bg-[#202024] px-2 py-1.5 text-xs font-semibold text-[#d7d7dc] transition-colors hover:bg-[#27272d] disabled:cursor-not-allowed disabled:opacity-50"
                  title={importingCollection ? 'Import in progress' : 'Import Collection'}
                >
                  <ArrowDownOnSquareIcon className={`h-4 w-4 ${importingCollection ? 'animate-pulse' : ''}`} />
                </button>
              </>
            )}
            {sidebarMode === 'environments' && (
              <button
                onClick={addEnvironment}
                className="inline-flex items-center gap-1 rounded-md border border-[#34343b] bg-[#202024] px-2 py-1.5 text-xs font-semibold text-[#d7d7dc] transition-colors hover:bg-[#27272d]"
                title="New Environment"
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            )}
            {sidebarMode === 'history' && requestHistory.length > 0 && (
              <button
                onClick={() => setRequestHistory([])}
                className="inline-flex items-center gap-1 rounded-md border border-[#34343b] bg-[#202024] px-2 py-1.5 text-xs font-semibold text-[#d7d7dc] transition-colors hover:bg-[#27272d]"
                title="Clear History"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            )}
            <input
              ref={importFileInputRef}
              type="file"
              accept=".json"
              onChange={importCollection}
              className="hidden"
            />
            {session && sidebarMode === 'collections' && (
              <button
                onClick={async () => {
                  setSyncingCollections(true);
                  console.log('🔄 Manually syncing collections...');
                  await loadCollections();
                  setTimeout(() => setSyncingCollections(false), 1000);
                }}
                disabled={syncingCollections}
                className="inline-flex items-center gap-1 rounded-md border border-[#34343b] bg-[#202024] px-2 py-1.5 text-xs font-semibold text-[#d7d7dc] transition-colors hover:bg-[#27272d] disabled:opacity-50"
                title="Sync Collections"
              >
                <ArrowPathIcon className={`h-4 w-4 ${syncingCollections ? 'animate-spin' : ''}`} />
              </button>
            )}
            <button
              onClick={() => setShowCollections(false)}
              className="inline-flex items-center gap-1 rounded-md border border-[#34343b] bg-[#202024] px-2 py-1.5 text-xs font-semibold text-[#d7d7dc] transition-colors hover:bg-[#27272d]"
              title="Hide Collections"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="space-y-2 border-b border-[#26262c] bg-[#121214] px-3 py-2">
          <div className="grid grid-cols-3 gap-1 rounded-lg border border-[#29292f] bg-[#101011] p-1">
            {([
              { id: 'collections', label: 'Collections', icon: FolderIcon },
              { id: 'environments', label: 'Env', icon: CodeBracketIcon },
              { id: 'history', label: 'History', icon: ClockIcon },
            ] as { id: SidebarMode; label: string; icon: typeof FolderIcon }[]).map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSidebarMode(item.id);
                    if (item.id === 'history') setShowHistory(true);
                  }}
                  className={`flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] font-semibold transition-colors ${
                    sidebarMode === item.id
                      ? 'bg-[#6d5dfc] text-white'
                      : 'text-[#a4a4ad] hover:bg-[#202024] hover:text-white'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </button>
              );
            })}
          </div>
          {privateMode && (
            <div className="rounded-md border border-amber-300/25 bg-amber-300/10 px-3 py-2 text-xs text-amber-200">
              Private mode is on. Nothing sensitive is saved locally.
            </div>
          )}
          {importingCollection && (
            <div className="rounded-md border border-[#34343b] bg-[#1c1c20] px-3 py-2 text-xs text-[#d7d7dc]">
              <p className="font-semibold">Importing collection...</p>
              <p className="mt-0.5 text-[#a4a4ad]">
                {importProgress
                  ? `${importProgress.done} of ${importProgress.total} request${importProgress.total === 1 ? '' : 's'} saved`
                  : 'Reading file'}
              </p>
            </div>
          )}
          {importNotice && (
            <div className={`rounded-md border px-3 py-2 text-xs ${
              importNotice.type === 'success'
                ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-100'
                : 'border-rose-400/25 bg-rose-400/10 text-rose-100'
            }`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{importNotice.message}</p>
                  {importNotice.detail && <p className="mt-0.5">{importNotice.detail}</p>}
                </div>
                <button
                  onClick={() => setImportNotice(null)}
                  className="text-current opacity-70 hover:opacity-100"
                  aria-label="Dismiss import message"
                >
                  <XMarkIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Collections List */}
        {sidebarMode === 'collections' && (
        <div className="flex-1 overflow-y-auto">
          {collectionsLoading && collections.length === 0 ? (
            <div className="space-y-2 p-3" aria-busy="true" aria-label="Loading collections">
              {[0, 1, 2].map((row) => (
                <div key={row} className="animate-pulse rounded-md border border-[#26262c] bg-[#181819] px-3 py-3">
                  <div className="h-3 w-1/2 rounded bg-[#2a2a30]" />
                  <div className="mt-2 h-2.5 w-3/4 rounded bg-[#232329]" />
                </div>
              ))}
            </div>
          ) : collectionsError ? (
            <div className="m-3 rounded-md border border-rose-400/25 bg-rose-400/10 p-4 text-rose-100">
              <p className="text-sm font-semibold">Could not load collections</p>
              <p className="mt-1 text-xs opacity-90">{collectionsError}</p>
              <button
                type="button"
                onClick={() => loadCollections()}
                className="mt-3 rounded-md border border-rose-300/30 bg-rose-400/10 px-3 py-1.5 text-xs font-semibold text-rose-100 hover:bg-rose-400/20"
              >
                Try again
              </button>
            </div>
          ) : collections.length === 0 ? (
            <div className="p-6 text-center text-[#85858e]">
              <TableCellsIcon className="h-12 w-12 mx-auto mb-3 text-[#4b4b52]" />
              <p className="text-sm font-medium mb-1">No Collections</p>
              <p className="text-xs">Create a collection to organize requests</p>
            </div>
          ) : (
            <div className="py-2">
              {collections.map((collection) => (
                <div key={collection.id} className="mb-1">
                  <div 
                    className="group mx-2 flex cursor-pointer items-center justify-between rounded px-3 py-2 hover:bg-[#202024]"
                    onClick={() => toggleCollectionExpanded(collection.id)}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <button 
                        className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded text-[#85858e] hover:bg-[#2a2a30]"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCollectionExpanded(collection.id);
                        }}
                      >
                        {expandedCollections.has(collection.id) ? (
                          <MinusIcon className="h-3 w-3" />
                        ) : (
                          <PlusIcon className="h-3 w-3" />
                        )}
                      </button>
                      <FolderIcon className="h-4 w-4 flex-shrink-0 text-[#8f83ff]" />
                      <span className="truncate text-sm font-medium text-[#f4f4f5]">{collection.name}</span>
                      <span className="flex-shrink-0 text-xs text-[#85858e]">({collection.requests.length})</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          exportCollection(collection);
                        }}
                        className="rounded p-1 text-[#85858e] hover:bg-[#2a2a30] hover:text-white"
                        title="Export Collection"
                      >
                        <ArrowUpOnSquareIcon className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCollection(collection.id);
                        }}
                        className="rounded p-1 text-red-300 hover:bg-red-400/10"
                        title="Delete"
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {expandedCollections.has(collection.id) && (
                    <div className="ml-6 mr-2">
                      {collection.requests.map((request) => (
                        <div
                          key={request.id}
                          className="group flex cursor-pointer items-center gap-2 rounded px-3 py-2 hover:bg-[#202024]"
                          onClick={() => loadRequestFromCollection(request)}
                        >
                          <DocumentTextIcon className="h-3.5 w-3.5 flex-shrink-0 text-[#85858e]" />
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            request.method === 'GET' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' :
                            request.method === 'POST' ? 'bg-blue-100 text-blue-700' :
                            request.method === 'PUT' ? 'bg-yellow-100 text-yellow-700' :
                            request.method === 'DELETE' ? 'bg-red-100 text-red-700' :
                            'bg-[#2a2a30] text-[#d7d7dc]'
                          }`}>
                            {request.method}
                          </span>
                          <span className="flex-1 truncate text-sm text-[#d7d7dc]">{request.name}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteRequestFromCollection(collection.id, request.id);
                            }}
                            className="rounded p-1 text-red-300 opacity-0 hover:bg-red-400/10 group-hover:opacity-100"
                          >
                            <TrashIcon className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        )}

        {sidebarMode === 'environments' && (
          <div className="flex-1 overflow-y-auto p-3">
            <div className="space-y-2">
              {environments.map((env, envIndex) => (
                <div
                  key={`${env.name}-${envIndex}`}
                  className={`rounded-lg border ${
                    activeEnvironment === env.name
                      ? 'border-[#6d5dfc] bg-[#252234]'
                      : 'border-[#29292f] bg-[#141416]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveEnvironment(env.name)}
                    className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left"
                  >
                    <span className="truncate text-sm font-semibold text-[#f4f4f5]">{env.name}</span>
                    <span className="rounded bg-[#202024] px-2 py-0.5 text-[10px] font-semibold text-[#a4a4ad]">
                      {env.variables.length}
                    </span>
                  </button>
                  {activeEnvironment === env.name && (
                    <div className="space-y-2 border-t border-[#29292f] p-3">
                      {env.variables.map((variable, variableIndex) => (
                        <div key={`${variable.key}-${variableIndex}`} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                          <input
                            type="text"
                            value={variable.key}
                            onChange={(event) => {
                              const nextEnvironments = [...environments];
                              nextEnvironments[envIndex].variables[variableIndex].key = event.target.value;
                              setEnvironments(nextEnvironments);
                            }}
                            placeholder="key"
                            className="min-w-0 rounded-md border border-[#34343b] bg-[#101011] px-2 py-1.5 text-xs text-[#f4f4f5] outline-none focus:border-[#6d5dfc]"
                          />
                          <input
                            type="text"
                            value={variable.value}
                            onChange={(event) => {
                              const nextEnvironments = [...environments];
                              nextEnvironments[envIndex].variables[variableIndex].value = event.target.value;
                              setEnvironments(nextEnvironments);
                            }}
                            placeholder="value"
                            className="min-w-0 rounded-md border border-[#34343b] bg-[#101011] px-2 py-1.5 text-xs text-[#f4f4f5] outline-none focus:border-[#6d5dfc]"
                          />
                          <button
                            type="button"
                            onClick={() => removeEnvironmentVariable(envIndex, variableIndex)}
                            className="rounded-md border border-[#34343b] bg-[#202024] p-1.5 text-[#85858e] hover:text-rose-200"
                            title="Remove variable"
                          >
                            <XMarkIcon className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                      {env.variables.length === 0 && (
                        <div className="rounded-md border border-dashed border-[#34343b] p-4 text-center text-xs text-[#85858e]">
                          No variables in this environment.
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => addEnvironmentVariable(envIndex)}
                        className="w-full rounded-md border border-[#34343b] bg-[#202024] px-3 py-2 text-xs font-semibold text-[#d7d7dc] hover:bg-[#27272d]"
                      >
                        + Add variable
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {sidebarMode === 'history' && (
          <div className="flex-1 overflow-y-auto p-3">
            {requestHistory.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[#34343b] p-6 text-center text-[#85858e]">
                <ClockIcon className="mx-auto mb-3 h-10 w-10 text-[#4b4b52]" />
                <p className="text-sm font-semibold text-[#d7d7dc]">No request history</p>
                <p className="mt-1 text-xs">Send a request to keep a local history for this workbench.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {requestHistory.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setMethod(item.method);
                      setUrl(item.url);
                      setHeaders(item.headers);
                      setBody(item.body);
                      setActiveTab('params');
                    }}
                    className="w-full rounded-lg border border-[#29292f] bg-[#141416] p-3 text-left transition-colors hover:border-[#3b3b44] hover:bg-[#1c1c20]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                        item.method === 'GET' ? 'bg-emerald-400/10 text-emerald-200' :
                        item.method === 'POST' ? 'bg-sky-400/10 text-sky-200' :
                        item.method === 'DELETE' ? 'bg-rose-400/10 text-rose-200' :
                        'bg-amber-400/10 text-amber-200'
                      }`}>
                        {item.method}
                      </span>
                      <span className={`text-[11px] font-semibold ${
                        item.status >= 200 && item.status < 300 ? 'text-emerald-200' : 'text-rose-200'
                      }`}>
                        {item.status} / {item.duration}ms
                      </span>
                    </div>
                    <p className="mt-2 truncate font-mono text-xs text-[#d7d7dc]">{item.url}</p>
                    <p className="mt-1 text-[11px] text-[#85858e]">{new Date(item.timestamp).toLocaleString()}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
      </>
      )}

      {/* Right Content Area */}
      <div className="order-2 flex flex-1 flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <div className="border-b border-[#25252b] bg-[#151516] px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSidebarMode('collections');
                  setShowCollections(!showCollections || sidebarMode !== 'collections');
                }}
                className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border px-3 text-[13px] font-semibold transition-colors ${
                  showCollections
                    ? 'border-[#6d5dfc] bg-[#252234] text-white'
                    : 'border-[#34343b] bg-[#202024] text-[#d7d7dc] hover:bg-[#27272d]'
                }`}
              >
                <FolderIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Workspace</span>
                {collections.length > 0 && (
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                    showCollections ? 'bg-white/15 text-white' : 'bg-[#2b2b31] text-[#aaaab3]'
                  }`}>
                    {collections.length}
                  </span>
                )}
              </button>

              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-2">
                  <h1 className="truncate text-base font-semibold tracking-tight text-[#f4f4f5]">API Workbench</h1>
                  {privateMode && (
                    <span className="shrink-0 rounded bg-amber-300/10 px-2 py-0.5 text-[11px] font-medium text-amber-200 ring-1 ring-amber-300/20">
                      private
                    </span>
                  )}
                </div>
                <div className="mt-1 hidden items-center gap-2 text-xs text-[#85858e] md:flex">
                  <span>{activeWorkspace?.name || 'Local browser'}</span>
                  <span className="text-[#4b4b52]">/</span>
                  <span>{activeEnvironmentDetails?.name || 'No environment'}</span>
                  {session && (
                    <>
                      <span className="text-[#4b4b52]">/</span>
                      <span className="inline-flex items-center gap-1 text-emerald-300">
                        <CheckIcon className="h-3 w-3" />
                        Synced
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {session && (
                <div className="flex items-center gap-1 rounded-lg border border-[#34343b] bg-[#202024] px-2 py-1">
                  <select
                    value={activeWorkspaceId}
                    onChange={(event) => setActiveWorkspaceId(event.target.value)}
                    className="max-w-[104px] border-0 bg-transparent px-1 py-0 text-xs font-semibold text-[#d7d7dc] outline-none focus:ring-0 lg:max-w-[180px]"
                    title="Active workspace"
                  >
                    {workspaces.map((workspace) => (
                      <option key={workspace.id} value={workspace.id}>
                        {workspace.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNewWorkspaceDialog(true)}
                    className="rounded px-1.5 py-0.5 text-xs font-semibold text-[#9b9ba5] hover:bg-[#29292f] hover:text-white"
                    title="New workspace"
                  >
                    +
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={createNewTab}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#6d5dfc] px-3.5 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-[#5948f2]"
              >
                <PlusIcon className="h-4 w-4" />
                <span className="hidden sm:inline">New</span>
              </button>
              <button
                type="button"
                onClick={() => setShowSaveDialog(true)}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#34343b] bg-[#202024] px-3.5 text-[13px] font-semibold text-[#d7d7dc] shadow-sm transition-colors hover:bg-[#27272d] hover:text-white"
                title="Save request"
              >
                <DocumentDuplicateIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Save</span>
              </button>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowActionMenu(!showActionMenu)}
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#34343b] bg-[#202024] px-3.5 text-[13px] font-semibold text-[#d7d7dc] shadow-sm transition-colors hover:bg-[#27272d] hover:text-white"
                  aria-expanded={showActionMenu}
                >
                  <AdjustmentsHorizontalIcon className="h-4 w-4" />
                  Panels
                </button>
                {showActionMenu && (
                  <div className="absolute right-0 top-full z-40 mt-2 w-64 overflow-hidden rounded-xl border border-[#34343b] bg-[#151516] p-1.5 shadow-2xl shadow-black/40">
                    {[
                      { label: 'Sample request', icon: CommandLineIcon, onClick: loadSampleRequest },
                      { label: 'Environments', icon: CodeBracketIcon, onClick: () => {
                        setSidebarMode('environments');
                        setShowCollections(true);
                      } },
                      { label: 'Documentation', icon: DocumentCheckIcon, onClick: () => setShowDocsPanel(true) },
                      { label: 'Snippets', icon: CommandLineIcon, onClick: () => setShowSnippetsPanel(true) },
                      { label: 'AI context', icon: LightBulbIcon, onClick: () => setShowAiContextPanel(true) },
                      { label: 'History', icon: ClockIcon, onClick: () => {
                        setShowCollections(true);
                        setSidebarMode('history');
                        setShowHistory(true);
                      } },
                      { label: showHelp ? 'Hide help' : 'Help', icon: QuestionMarkCircleIcon, onClick: () => setShowHelp(!showHelp) },
                      { label: 'Settings', icon: CogIcon, onClick: () => setShowSettings(true) },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => {
                            item.onClick();
                            setShowActionMenu(false);
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-[#d7d7dc] hover:bg-[#24242a] hover:text-white"
                        >
                          <Icon className="h-4 w-4 text-[#85858e]" />
                          {item.label}
                        </button>
                      );
                    })}
                    {session && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowActionMenu(false);
                          signOut({ callbackUrl: '/tools/api' });
                        }}
                        className="mt-1 flex w-full items-center gap-2 rounded-lg border-t border-[#2b2b31] px-3 py-2 text-left text-sm font-medium text-[#a4a4ad] hover:bg-[#24242a] hover:text-white"
                      >
                        <XMarkIcon className="h-4 w-4 text-[#85858e]" />
                        Sign out
                      </button>
                    )}
                  </div>
                )}
              </div>
              {!session && (
                <button
                  type="button"
                  onClick={() => setShowAuthModal(true)}
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#34343b] bg-[#202024] px-3.5 text-[13px] font-semibold text-[#d7d7dc] transition-colors hover:bg-[#27272d] hover:text-white"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Sync</span>
                </button>
              )}
            </div>
          </div>
        </div>

      {workbenchNotice && (
        <div className={`border-b px-4 py-3 text-sm ${
          workbenchNotice.type === 'success'
            ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-100'
            : workbenchNotice.type === 'error'
              ? 'border-red-500/25 bg-red-500/10 text-red-100'
              : 'border-indigo-400/25 bg-indigo-400/10 text-indigo-100'
        }`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold">{workbenchNotice.message}</p>
              {workbenchNotice.detail && <p className="mt-0.5">{workbenchNotice.detail}</p>}
            </div>
            <button
              type="button"
              onClick={() => setWorkbenchNotice(null)}
              className="opacity-70 hover:opacity-100"
              aria-label="Dismiss message"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Help Panel */}
      {showHelp && (
        <div className="border-b border-[#25252b] bg-[#151516] px-4 py-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <QuestionMarkCircleIcon className="h-6 w-6 text-[#8f83ff]" />
              <h3 className="text-lg font-semibold text-[#f4f4f5]">Quick Start Guide</h3>
            </div>
            <button onClick={() => setShowHelp(false)} className="text-[#85858e] hover:text-white">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-[#a4a4ad]">
            <div className="space-y-2">
              <p className="font-semibold flex items-center gap-2">
                <WrenchIcon className="h-5 w-5" />
                <span>Getting Started</span>
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
                <CogIcon className="h-5 w-5" />
                <span>Variables</span>
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Click "Variables" button to manage environment variables</li>
                <li>Use {'{{variable}}'} syntax in URL, headers, or body</li>
                <li>Switch between environments (Dev, Staging, Prod)</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-[#25252b]">
            <p className="font-semibold text-[#f4f4f5] mb-2 flex items-center gap-2">
              <CommandLineIcon className="h-5 w-5" />
              <span>Keyboard Shortcuts</span>
            </p>
            <div className="grid md:grid-cols-2 gap-2 text-xs text-[#a4a4ad]">
              <div><kbd className="px-2 py-1 bg-[#202024] rounded border border-[#34343b] text-[#d7d7dc]">Ctrl/Cmd + T</kbd> New tab</div>
              <div><kbd className="px-2 py-1 bg-[#202024] rounded border border-[#34343b] text-[#d7d7dc]">Ctrl/Cmd + W</kbd> Close tab</div>
              <div><kbd className="px-2 py-1 bg-[#202024] rounded border border-[#34343b] text-[#d7d7dc]">Ctrl/Cmd + D</kbd> Duplicate tab</div>
              <div><kbd className="px-2 py-1 bg-[#202024] rounded border border-[#34343b] text-[#d7d7dc]">Ctrl/Cmd + R</kbd> Rename tab</div>
              <div><kbd className="px-2 py-1 bg-[#202024] rounded border border-[#34343b] text-[#d7d7dc]">Double-click</kbd> Rename tab</div>
              <div><kbd className="px-2 py-1 bg-[#202024] rounded border border-[#34343b] text-[#d7d7dc]">Ctrl/Cmd + Tab</kbd> Next tab</div>
            </div>
          </div>
        </div>
      )}

      {/* Save Request Dialog */}
      {showSaveDialog && (
        <ModalShell
          onClose={closeSaveDialog}
          label="Save request to collection"
          overlayClassName="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          panelClassName="w-full max-w-md rounded-lg border border-[#2b2b31] bg-[#171719] p-6 shadow-2xl outline-none"
        >
            <h3 className="mb-4 text-lg font-semibold text-[#f4f4f5]">Save Request to Collection</h3>
            
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-[#d7d7dc]">Request Name</label>
                <input
                  type="text"
                  value={saveRequestName}
                  onChange={(e) => setSaveRequestName(e.target.value)}
                  placeholder="e.g., Get User Profile"
                  className="w-full rounded border border-[#34343b] bg-[#202024] px-3 py-2 text-[#f4f4f5] outline-none placeholder:text-[#777781] focus:border-[#6d5dfc] focus:ring-2 focus:ring-[#6d5dfc]/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[#d7d7dc]">Description (Optional)</label>
                <textarea
                  value={saveRequestDescription}
                      onChange={(e) => setSaveRequestDescription(e.target.value)}
                      placeholder="Describe what this request does..."
                      rows={3}
                      className="w-full rounded border border-[#34343b] bg-[#202024] px-3 py-2 text-[#f4f4f5] outline-none placeholder:text-[#777781] focus:border-[#6d5dfc] focus:ring-2 focus:ring-[#6d5dfc]/20"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#d7d7dc]">Collection</label>
                    <select
                      value={selectedCollectionId}
                      onChange={(e) => setSelectedCollectionId(e.target.value)}
                      className="w-full rounded border border-[#34343b] bg-[#202024] px-3 py-2 text-[#f4f4f5] outline-none focus:border-[#6d5dfc] focus:ring-2 focus:ring-[#6d5dfc]/20"
                    >
                      <option value="">Select a collection</option>
                      {collections.map((collection) => (
                        <option key={collection.id} value={collection.id}>
                          {collection.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {collections.length === 0 && (
                    <p className="rounded border border-amber-300/25 bg-amber-300/10 p-3 text-sm text-amber-100">
                      No collections available. Create one first!
                    </p>
                  )}
                </div>

                <div className="mt-6 flex justify-end gap-2">
                  <button
                    onClick={closeSaveDialog}
                className="rounded border border-[#34343b] bg-[#202024] px-4 py-2 text-sm font-medium text-[#d7d7dc] transition-colors hover:bg-[#27272d]"
              >
                Cancel
              </button>
              <button
                onClick={saveCurrentRequestToCollection}
                disabled={!saveRequestName.trim() || !selectedCollectionId}
                className="rounded bg-[#6d5dfc] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#5948f2] disabled:cursor-not-allowed disabled:bg-[#2f2f36] disabled:text-[#777781]"
              >
                Save Request
              </button>
            </div>
        </ModalShell>
      )}

      {/* New Collection Dialog */}
      {showNewCollectionDialog && (
        <ModalShell
          onClose={closeNewCollectionDialog}
          label="Create new collection"
          overlayClassName="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          panelClassName="w-full max-w-md rounded-lg border border-[#2b2b31] bg-[#171719] p-6 shadow-2xl outline-none"
        >
            <h3 className="mb-4 text-lg font-semibold text-[#f4f4f5]">Create New Collection</h3>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-[#d7d7dc]">Collection Name</label>
                <input
                  type="text"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="e.g., User API, Payment Endpoints"
                  className="w-full rounded border border-[#34343b] bg-[#202024] px-3 py-2 text-[#f4f4f5] outline-none placeholder:text-[#777781] focus:border-[#6d5dfc] focus:ring-2 focus:ring-[#6d5dfc]/20"
                  autoFocus
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[#d7d7dc]">Description (Optional)</label>
                <textarea
                  value={newCollectionDescription}
                  onChange={(e) => setNewCollectionDescription(e.target.value)}
                  placeholder="Describe this collection..."
                  rows={3}
                  className="w-full rounded border border-[#34343b] bg-[#202024] px-3 py-2 text-[#f4f4f5] outline-none placeholder:text-[#777781] focus:border-[#6d5dfc] focus:ring-2 focus:ring-[#6d5dfc]/20"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={closeNewCollectionDialog}
                className="rounded border border-[#34343b] bg-[#202024] px-4 py-2 text-sm font-medium text-[#d7d7dc] transition-colors hover:bg-[#27272d]"
              >
                Cancel
              </button>
              <button
                onClick={createCollection}
                disabled={!newCollectionName.trim()}
                className="rounded bg-[#6d5dfc] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#5948f2] disabled:cursor-not-allowed disabled:bg-[#2f2f36] disabled:text-[#777781]"
              >
                Create Collection
              </button>
            </div>
        </ModalShell>
      )}

      {/* New Workspace Dialog */}
      {showNewWorkspaceDialog && (
        <ModalShell
          onClose={closeNewWorkspaceDialog}
          label="Create workspace"
          overlayClassName="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          panelClassName="w-full max-w-md rounded-lg border border-[#2b2b31] bg-[#171719] p-6 shadow-2xl outline-none"
        >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-[#f4f4f5]">Create workspace</h3>
                <p className="mt-1 text-sm text-[#a4a4ad]">Use workspaces to separate team collections, environments, and generated docs.</p>
              </div>
              <button onClick={closeNewWorkspaceDialog} className="rounded p-1 text-[#85858e] hover:bg-[#24242a] hover:text-white">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <label className="mb-1 block text-sm font-medium text-[#d7d7dc]">Workspace name</label>
            <input
              type="text"
              value={newWorkspaceName}
              onChange={(event) => setNewWorkspaceName(event.target.value)}
              placeholder="e.g., Backend Team"
              className="w-full rounded border border-[#34343b] bg-[#202024] px-3 py-2 text-[#f4f4f5] outline-none placeholder:text-[#777781] focus:border-[#6d5dfc] focus:ring-2 focus:ring-[#6d5dfc]/20"
              autoFocus
            />
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={closeNewWorkspaceDialog}
                className="rounded border border-[#34343b] bg-[#202024] px-4 py-2 text-sm font-medium text-[#d7d7dc] hover:bg-[#27272d]"
              >
                Cancel
              </button>
              <button
                onClick={createWorkspaceFromDialog}
                disabled={!newWorkspaceName.trim()}
                className="rounded bg-[#6d5dfc] px-4 py-2 text-sm font-medium text-white hover:bg-[#5948f2] disabled:cursor-not-allowed disabled:bg-[#2f2f36] disabled:text-[#777781]"
              >
                Create workspace
              </button>
            </div>
        </ModalShell>
      )}

      {/* Token Detection Notification */}
      {showTokenDetection && detectedToken && (
        <div className="fixed top-20 right-4 bg-gradient-to-r from-green-600 to-green-500 text-white px-6 py-4 rounded-lg shadow-2xl z-50 max-w-md">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm mb-1">🎉 Token Detected!</h4>
              <p className="text-sm mb-3 opacity-90">Found a bearer token in the response at: <code className="bg-white/20 px-1.5 py-0.5 rounded">{detectedTokenPath}</code></p>
              <div className="flex gap-2">
                <button
                  onClick={applyDetectedToken}
                  className="px-4 py-2 bg-white text-emerald-900 font-semibold text-sm rounded hover:bg-emerald-50 transition-colors"
                >
                  Use as Bearer Token
                </button>
                <button
                  onClick={() => {
                    setShowTokenDetection(false);
                    setDetectedToken(null);
                  }}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 font-medium text-sm rounded transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
            <button
              onClick={() => {
                setShowTokenDetection(false);
                setDetectedToken(null);
              }}
              className="flex-shrink-0 text-white/80 hover:text-white"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Bearer Token Setup Wizard */}
      {showBearerSetupWizard && (
        <ModalShell
          onClose={closeBearerSetupWizard}
          label="Bearer token quick setup"
          overlayClassName="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          panelClassName="w-full max-w-lg rounded-lg border border-[#2b2b31] bg-[#171719] p-6 shadow-2xl outline-none"
        >
            <div className="flex items-center justify-between mb-6">
              <h3 className="flex items-center gap-2 text-xl font-bold text-[#f4f4f5]">
                <LightBulbIcon className="h-6 w-6 text-[#8f83ff]" />
                Bearer Token Quick Setup
              </h3>
              <button
                onClick={closeBearerSetupWizard}
                className="rounded p-1 text-[#85858e] hover:bg-[#24242a] hover:text-white"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-8">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center flex-1">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${
                    bearerSetupStep >= step
                      ? 'bg-[#6d5dfc] text-white'
                      : 'bg-[#252529] text-[#85858e]'
                  }`}>
                    {step}
                  </div>
                  {step < 3 && (
                    <div className={`mx-2 h-1 flex-1 ${
                      bearerSetupStep > step ? 'bg-[#6d5dfc]' : 'bg-[#252529]'
                    }`} />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Login URL */}
            {bearerSetupStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#d7d7dc]">
                    Step 1: Enter Login API Endpoint
                  </label>
                  <input
                    type="text"
                    value={wizardLoginUrl}
                    onChange={(e) => setWizardLoginUrl(e.target.value)}
                    placeholder="https://api.example.com/auth/login"
                    className="w-full rounded-lg border border-[#34343b] bg-[#202024] px-4 py-3 text-[#f4f4f5] outline-none placeholder:text-[#777781] focus:border-[#6d5dfc] focus:ring-2 focus:ring-[#6d5dfc]/20"
                    autoFocus
                  />
                  <p className="mt-2 text-sm text-[#85858e]">
                    Enter the URL of your login/authentication endpoint
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Login Payload */}
            {bearerSetupStep === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#d7d7dc]">
                    Step 2: Enter Login Payload (JSON)
                  </label>
                  <textarea
                    value={wizardRequestPayload}
                    onChange={(e) => setWizardRequestPayload(e.target.value)}
                    placeholder='{"username": "your_username", "password": "your_password"}'
                    className="w-full rounded-lg border border-[#34343b] bg-[#202024] px-4 py-3 font-mono text-sm text-[#f4f4f5] outline-none placeholder:text-[#777781] focus:border-[#6d5dfc] focus:ring-2 focus:ring-[#6d5dfc]/20"
                    rows={8}
                    autoFocus
                  />
                  <p className="mt-2 text-sm text-[#85858e]">
                    This JSON payload will be sent in the login request body. It will be saved for auto-login when token expires.
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Token Path */}
            {bearerSetupStep === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#d7d7dc]">
                    Step 3: Token Field Name
                  </label>
                  <input
                    type="text"
                    value={wizardTokenPath}
                    onChange={(e) => setWizardTokenPath(e.target.value)}
                    placeholder="access_token"
                    className="w-full rounded-lg border border-[#34343b] bg-[#202024] px-4 py-3 text-[#f4f4f5] outline-none placeholder:text-[#777781] focus:border-[#6d5dfc] focus:ring-2 focus:ring-[#6d5dfc]/20"
                  />
                  <p className="mt-2 text-sm text-[#85858e]">
                    Where is the token in the response? Examples: <code className="rounded bg-[#202024] px-1.5 py-0.5 text-[#d7d7dc]">access_token</code>, <code className="rounded bg-[#202024] px-1.5 py-0.5 text-[#d7d7dc]">data.token</code>, <code className="rounded bg-[#202024] px-1.5 py-0.5 text-[#d7d7dc]">result.jwt</code>
                  </p>
                  <div className="mt-3 rounded-lg border border-[#2b2b31] bg-[#101011] p-3">
                    <p className="flex items-start gap-2 text-sm text-[#a4a4ad]">
                      <LightBulbIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span><strong>Auto-detection:</strong> If not found at this path, we'll automatically search common token fields</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between mt-8">
              <button
                onClick={() => {
                  if (bearerSetupStep > 1) {
                    setBearerSetupStep(bearerSetupStep - 1);
                  } else {
                    closeBearerSetupWizard();
                  }
                }}
                className="rounded-lg border border-[#34343b] bg-[#202024] px-6 py-3 text-sm font-medium text-[#d7d7dc] transition-colors hover:bg-[#27272d]"
              >
                {bearerSetupStep === 1 ? 'Cancel' : 'Back'}
              </button>
              <button
                onClick={setupBearerTokenWizard}
                className="rounded-lg bg-[#6d5dfc] px-6 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#5948f2]"
              >
                {bearerSetupStep === 3 ? 'Test & Configure' : 'Next'}
              </button>
            </div>
        </ModalShell>
      )}

      {/* Token Setup Confirmation Dialog */}
      {showTokenSetupConfirm && (
        <ModalShell
          onClose={closeTokenSetupConfirm}
          label="Setup bearer token"
          overlayClassName="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          panelClassName="w-full max-w-md rounded-lg border border-[#2b2b31] bg-[#171719] p-6 shadow-2xl outline-none"
        >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#f4f4f5]">🔐 Setup Bearer Token</h3>
              <button
                onClick={closeTokenSetupConfirm}
                className="rounded p-1 text-[#85858e] hover:bg-[#24242a] hover:text-white"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#d7d7dc]">
                  Token Field
                </label>
                <div className="rounded-lg border border-[#2b2b31] bg-[#101011] px-4 py-2 font-mono text-sm text-[#8f83ff]">
                  {clickedTokenPath}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#d7d7dc]">
                  Token Value
                </label>
                <div className="break-all rounded-lg border border-[#2b2b31] bg-[#101011] px-4 py-2 font-mono text-xs text-[#d7d7dc]">
                  {clickedTokenValue && clickedTokenValue.length > 100 
                    ? `${clickedTokenValue.substring(0, 50)}...${clickedTokenValue.substring(clickedTokenValue.length - 50)}`
                    : clickedTokenValue}
                </div>
              </div>

              <div className="rounded-lg border border-[#2b2b31] bg-[#101011] p-4">
                <p className="mb-2 text-sm text-[#d7d7dc]">
                  <strong>Auto-Login Configuration:</strong>
                </p>
                <ul className="space-y-1 text-xs text-[#a4a4ad]">
                  <li className="flex items-start gap-1.5">
                    <CheckIcon className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                    <span>Login URL: <code className="rounded bg-[#202024] px-1 py-0.5 text-[#d7d7dc]">{currentTab.url || 'Current URL'}</code></span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckIcon className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                    <span>Login Payload: Current request body will be saved</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckIcon className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                    <span>Token will auto-refresh when expired</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={closeTokenSetupConfirm}
                  className="flex-1 rounded-lg border border-[#34343b] bg-[#202024] px-4 py-3 text-sm font-medium text-[#d7d7dc] transition-colors hover:bg-[#27272d]"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmTokenSetup}
                  className="flex-1 rounded-lg bg-[#6d5dfc] px-4 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#5948f2]"
                >
                  Configure Bearer Auth
                </button>
              </div>
            </div>
        </ModalShell>
      )}

      {/* Request Tabs */}
      {tabs.length > 1 && (
      <div className="border-b border-[#25252b] bg-[#151516]">
        <div className="flex items-center overflow-x-auto">
          <div className="flex flex-1 min-w-0">
            {tabs.map((tab, index) => (
              <div
                key={tab.id}
                className={`group flex min-w-fit cursor-pointer items-center gap-2 border-r border-[#25252b] px-4 py-2.5 transition-colors ${
                  activeTabIndex === index
                    ? 'border-b-2 border-b-[#6d5dfc] bg-[#1c1c20]'
                    : 'hover:bg-[#1c1c20]'
                }`}
                onClick={() => setActiveTabIndex(index)}
                onDoubleClick={() => startRenaming(index)}
              >
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  activeTabIndex === index ? 'bg-[#6d5dfc] text-white' : 'bg-[#2a2a30] text-[#d7d7dc]'
                }`}>
                  {tab.method}
                </span>
                {renamingTabIndex === index ? (
                  <input
                    type="text"
                    value={tempTabName}
                    onChange={(e) => setTempTabName(e.target.value)}
                    onBlur={finishRenaming}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') finishRenaming();
                      if (e.key === 'Escape') setRenamingTabIndex(null);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-32 rounded border border-[#6d5dfc] bg-[#202024] px-2 py-0.5 text-sm text-white focus:outline-none"
                    autoFocus
                  />
                ) : (
                  <span className={`text-sm truncate max-w-[150px] ${
                    activeTabIndex === index ? 'font-medium text-[#f4f4f5]' : 'text-[#a4a4ad]'
                  }`} title={tab.name}>
                    {tab.name}
                  </span>
                )}
                {tab.hasUnsavedChanges && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2563eb]" title="Unsaved changes" />
                )}
                {tab.authConfig && tab.authConfig.type !== 'none' && (
                  <span title={`Auth: ${tab.authConfig.type}`}>
                    <svg className="h-3 w-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(index);
                  }}
                  className="rounded p-0.5 opacity-0 transition-opacity hover:bg-[#2a2a30] group-hover:opacity-100"
                  title="Close tab"
                >
                <XMarkIcon className="h-3.5 w-3.5 text-[#85858e]" />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={createNewTab}
            className="flex-shrink-0 border-l border-[#25252b] px-3 py-2.5 transition-colors hover:bg-[#1c1c20]"
            title="New request tab (Ctrl+T)"
          >
            <PlusIcon className="h-4 w-4 text-[#a4a4ad]" />
          </button>
        </div>
      </div>
      )}

      {/* Main Content Area with Scroll */}
      <div className="flex-1 overflow-auto bg-[#101011]">
        <div className="mx-auto flex max-w-[1760px] flex-col gap-4 p-4">

      {/* Main Request Section */}
      <div className="overflow-hidden rounded-xl border border-[#25252b] bg-[#171719] shadow-2xl shadow-black/20">
        {/* URL Bar - Postman Style */}
        <div className="border-b border-[#25252b] bg-[#171719] p-4">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as HttpMethod)}
              className={`h-10 min-w-[96px] rounded-md border border-[#34343b] bg-[#202024] px-3 font-mono text-[12px] font-bold outline-none transition focus:border-[#6d5dfc] focus:ring-2 focus:ring-[#6d5dfc]/20 ${
                method === 'GET' ? 'text-emerald-300' :
                method === 'POST' ? 'text-sky-300' :
                method === 'PUT' ? 'text-amber-300' :
                method === 'DELETE' ? 'text-rose-300' :
                'text-slate-300'
              }`}
              title="Select HTTP method"
            >
              {['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'].map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <div className="relative min-w-[240px] flex-1">
              <input
                type="text"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (error.startsWith('Missing environment variable')) {
                    setError('');
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && url.trim() && !loading) {
                    handleSubmit();
                  }
                }}
                placeholder="https://api.example.com/v1/resource"
                className="h-10 w-full rounded-md border border-[#34343b] bg-[#202024] px-3 font-mono text-[13px] text-[#f4f4f5] outline-none transition placeholder:text-[#777781] focus:border-[#6d5dfc] focus:bg-[#202024] focus:ring-2 focus:ring-[#6d5dfc]/20"
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading || !url.trim()}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-[#6d5dfc] px-6 text-[13px] font-bold text-white transition-all hover:bg-[#5948f2] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : (
                'Send'
              )}
            </button>
            {loading && (
              <button
                onClick={cancelRequest}
                className="inline-flex h-10 items-center gap-2 rounded-md border border-[#34343b] bg-[#202024] px-4 text-[13px] font-semibold text-[#d7d7dc] transition-colors hover:bg-[#27272d] hover:text-white"
                title="Cancel the in-flight request"
              >
                Cancel
              </button>
            )}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-[#a4a4ad]">
            <span className="rounded-md border border-[#34343b] bg-[#202024] px-2.5 py-1">
              Env: <strong className="text-[#f4f4f5]">{requestSummary.environment}</strong>
            </span>
            <span className="rounded-md border border-[#34343b] bg-[#202024] px-2.5 py-1">
              Auth: <strong className="text-[#f4f4f5]">{requestSummary.auth}</strong>
            </span>
            <span className="rounded-md border border-[#34343b] bg-[#202024] px-2.5 py-1">
              Body: <strong className="text-[#f4f4f5]">{requestSummary.body}</strong>
            </span>
            <span className="rounded-md border border-[#34343b] bg-[#202024] px-2.5 py-1">
              {requestSummary.cache}
            </span>
            {requestSummary.variables > 0 && (
              <button
                type="button"
                onClick={() => setShowVariables(true)}
                className="rounded-md border border-amber-300/25 bg-amber-300/10 px-2.5 py-1 font-semibold text-amber-200 hover:bg-amber-300/15"
              >
                {requestSummary.variables} missing variable{requestSummary.variables === 1 ? '' : 's'}
              </button>
            )}
          </div>
          {missingEnvironmentVariables.length > 0 && (
            <div className="mt-3 rounded-md border border-amber-300/25 bg-amber-300/10 p-3 text-sm text-amber-100">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">Set missing variable{missingEnvironmentVariables.length === 1 ? '' : 's'}</p>
                  <p className="mt-0.5 text-xs text-amber-200/80">
                    These values are replaced before the request is sent.
                  </p>
                </div>
                <button
                  onClick={() => setShowVariables(true)}
                  className="rounded-md border border-amber-300/30 bg-amber-300/10 px-3 py-1.5 text-xs font-semibold text-amber-100 hover:bg-amber-300/20"
                >
                  Advanced variables
                </button>
              </div>
              <div className="mt-3 grid gap-2">
                {missingEnvironmentVariables.map((key) => (
                  <div key={key} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <code className="rounded border border-amber-300/25 bg-[#101011] px-2 py-2 text-xs text-amber-100 sm:w-56">
                      {'{{'}{key}{'}}'}
                    </code>
                    <input
                      type="text"
                      value={getEnvironmentVariableValue(key)}
                      onChange={(event) => setEnvironmentVariableValue(key, event.target.value)}
                      placeholder="https://api.example.com"
                      className="min-w-0 flex-1 rounded border border-amber-300/25 bg-[#101011] px-3 py-2 text-sm text-[#f4f4f5] outline-none placeholder:text-[#777781] focus:border-amber-300/60 focus:ring-2 focus:ring-amber-300/20"
                    />
                  </div>
                ))}
              </div>
              {error && error.startsWith('Missing environment variable') && (
                <p className="mt-2 text-xs text-amber-200/80">{error}</p>
              )}
            </div>
          )}
          
          {/* Error Display */}
          {error && !error.startsWith('Missing environment variable') && (
            <div className="mt-3 rounded border border-rose-400/25 bg-rose-400/10 p-3 text-sm text-rose-100">
              <div className="flex items-start gap-2">
                <XMarkIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">Error</p>
                  <p className="mt-1">{error}</p>
                  {networkHint && (
                    <div className="mt-3 rounded-md border border-rose-400/25 bg-[#101011] p-3 text-rose-100">
                      <p className="font-semibold">{networkHint.title}</p>
                      <p className="mt-1 text-xs leading-5">{networkHint.message}</p>
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          onClick={() => copyToClipboard(networkHint.curl)}
                          className="inline-flex items-center gap-1.5 rounded-md bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500"
                        >
                          <ClipboardIcon className="h-3.5 w-3.5" />
                          Copy cURL
                        </button>
                        <code className="max-w-[520px] truncate rounded bg-[#171719] px-2 py-1 text-[11px] text-rose-100">
                          {networkHint.curl}
                        </code>
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    setError('');
                    setNetworkHint(null);
                  }}
                  className="text-rose-200 hover:text-white"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tabs for Request Configuration - Postman Style */}
        <div className="border-b border-[#25252b] bg-[#171719]">
          <div className="flex overflow-x-auto px-3 scrollbar-hide">
            <button
              onClick={() => setActiveTab('params')}
              className={`shrink-0 px-3 py-2.5 text-[13px] font-medium transition-colors relative sm:px-4 ${
                activeTab === 'params'
                  ? 'border-b-2 border-[#6d5dfc] text-white'
                  : 'text-[#a4a4ad] hover:text-white'
              }`}
            >
              Parameters
            </button>
            <button
              onClick={() => setActiveTab('authorization')}
              className={`shrink-0 px-3 py-2.5 text-[13px] font-medium transition-colors relative sm:px-4 ${
                activeTab === 'authorization'
                  ? 'border-b-2 border-[#6d5dfc] text-white'
                  : 'text-[#a4a4ad] hover:text-white'
              }`}
            >
              Authorization
            </button>
            <button
              onClick={() => setActiveTab('headers')}
              className={`shrink-0 px-3 py-2.5 text-[13px] font-medium transition-colors relative sm:px-4 ${
                activeTab === 'headers'
                  ? 'border-b-2 border-[#6d5dfc] text-white'
                  : 'text-[#a4a4ad] hover:text-white'
              }`}
            >
              Headers
            </button>
            <button
              onClick={() => methodSupportsBody(method) && setActiveTab('body')}
              className={`shrink-0 px-3 py-2.5 text-[13px] font-medium transition-colors relative sm:px-4 ${
                activeTab === 'body' && methodSupportsBody(method)
                  ? 'border-b-2 border-[#6d5dfc] text-white'
                : !methodSupportsBody(method)
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-[#a4a4ad] hover:text-white'
              }`}
              disabled={!methodSupportsBody(method)}
              title={!methodSupportsBody(method) ? `${method} requests cannot have a request body` : 'Request body content'}
            >
              Body
              {!methodSupportsBody(method) && (
                <XMarkIcon className="h-3 w-3 inline-block ml-1" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('preRequest')}
              className={`shrink-0 px-3 py-2.5 text-[13px] font-medium transition-colors relative sm:px-4 ${
                activeTab === 'preRequest'
                  ? 'border-b-2 border-[#6d5dfc] text-white'
                  : 'text-[#a4a4ad] hover:text-white'
              }`}
            >
              Pre-request Script
            </button>
            <button
              onClick={() => setActiveTab('tests')}
              className={`shrink-0 px-3 py-2.5 text-[13px] font-medium transition-colors relative sm:px-4 ${
                activeTab === 'tests'
                  ? 'border-b-2 border-[#6d5dfc] text-white'
                  : 'text-[#a4a4ad] hover:text-white'
              }`}
            >
              Tests
              {testResults.length > 0 && (
                <span className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] ${
                  failedTestCount > 0
                    ? 'bg-rose-400/15 text-rose-200'
                    : 'bg-emerald-400/15 text-emerald-200'
                }`}>
                  {passedTestCount}/{testResults.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[260px] bg-[#171719] p-4">
          {/* Params Tab */}
          {activeTab === 'params' && (
            <div className="space-y-4">
              <div className="rounded-lg border border-dashed border-[#34343b] bg-[#141416] px-4 py-10 text-center text-[#a4a4ad]">
                <p className="text-[13px] font-semibold text-[#d7d7dc]">Add query parameters in the URL.</p>
                <p className="mt-1 font-mono text-[11px] text-[#85858e]">?key=value&foo=bar</p>
              </div>
            </div>
          )}

          {/* Authorization Tab */}
          {activeTab === 'authorization' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-[#a4a4ad]">Configure authentication for your request. It applies across request tabs.</p>
                <button
                  onClick={() => setShowBearerSetupWizard(true)}
                  className="flex items-center gap-2 rounded bg-[#252234] px-4 py-2 text-sm font-medium text-[#c8c2ff] transition-colors hover:bg-[#302a4a]"
                >
                  <WrenchIcon className="h-4 w-4" />
                  Bearer setup
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#d7d7dc]">Type</label>
                  <select
                    value={authConfig.type}
                    onChange={(e) => setAuthConfig({ ...authConfig, type: e.target.value as AuthType })}
                    className="w-full max-w-xs rounded-md border border-[#34343b] bg-[#202024] px-3 py-2 text-sm text-[#f4f4f5] focus:border-transparent focus:ring-2 focus:ring-[#6d5dfc]"
                  >
                    <option value="none">No Auth</option>
                    <option value="bearer">Bearer Token</option>
                    <option value="basic">Basic Auth</option>
                    <option value="apiKey">API Key</option>
                  </select>
                </div>

                {authConfig.type !== 'none' && (
                  <div className="mt-4 border-t border-[#25252b] pt-4">
                    {/* Auth type specific content will be rendered here */}
                    {authConfig.type === 'bearer' && (
                      <div className="space-y-4">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-[#d7d7dc]">Token</label>
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
                            className="w-full rounded-md border border-[#34343b] bg-[#202024] px-3 py-2 font-mono text-sm text-[#f4f4f5] placeholder:text-[#777781] focus:border-transparent focus:ring-2 focus:ring-[#6d5dfc]"
                          />
                        </div>
                        {authConfig.token && decodeJWT(authConfig.token) && (
                          <div className="rounded-md border border-[#34343b] bg-[#141416] p-3 text-xs text-[#a4a4ad]">
                            {(() => {
                              const decoded = decodeJWT(authConfig.token!);
                              if (decoded?.exp) {
                                const expiryDate = new Date(decoded.exp * 1000);
                                const now = new Date();
                                const isExpired = expiryDate < now;
                                const minutesUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / 60000);
                                const secondsUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / 1000);
                                
                                return (
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        {isExpired ? (
                                          authConfig.autoRefresh || authConfig.autoLogin ? (
                                            <span className="text-blue-600 font-medium flex items-center gap-1.5">
                                              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                              </svg>
                                              Token refreshing...
                                            </span>
                                          ) : (
                                            <span className="text-red-600 font-medium flex items-center gap-1.5">
                                              <XMarkIcon className="h-4 w-4" />
                                              Token expired
                                            </span>
                                          )
                                        ) : minutesUntilExpiry < 5 ? (
                                          <span className="text-blue-600 font-medium flex items-center gap-1.5">
                                            <ClockIcon className="h-4 w-4" />
                                            Expires in {minutesUntilExpiry}m {secondsUntilExpiry % 60}s
                                          </span>
                                        ) : (
                                          <span className="text-emerald-800 font-medium flex items-center gap-1.5">
                                            <CheckIcon className="h-4 w-4" />
                                            Valid until {expiryDate.toLocaleString()}
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-gray-500 text-[10px]">
                                        {isExpired ? 'EXPIRED' : `${minutesUntilExpiry}m ${secondsUntilExpiry % 60}s left`}
                                      </span>
                                    </div>
                                    
                                    <button
                                      type="button"
                                      onClick={() => setShowAdvancedAuth(!showAdvancedAuth)}
                                      className="mt-2 text-[11px] font-semibold text-[#2563eb] hover:text-[#0550ae]"
                                    >
                                      {showAdvancedAuth ? 'Hide advanced token tools' : 'Show advanced token tools'}
                                    </button>
                                    {showAdvancedAuth && (
                                    <div className="border-t border-gray-200 pt-2 mt-2">
                                      <p className="text-[10px] text-gray-500 mb-1.5 font-semibold uppercase tracking-wide">Testing tools</p>
                                      <button
                                        onClick={() => {
                                          // Force expire the token by setting expiry to past
                                          const pastTimestamp = Math.floor(Date.now() / 1000) - 60;
                                          setAuthConfig({ 
                                            ...authConfig, 
                                            tokenExpiry: pastTimestamp
                                          });
                                          showWorkbenchNotice({
                                            type: 'info',
                                            message: 'Token manually expired',
                                            detail: 'Send the request again to test auto-login and token refresh.',
                                          });
                                        }}
                                        className="px-3 py-1.5 text-[10px] font-medium bg-red-100 text-red-700 hover:bg-red-200 rounded transition-colors mr-2"
                                      >
                                        🔴 Force Expire Token
                                      </button>
                                      <button
                                        onClick={() => {
                                          // Set token to expire in 30 seconds for quick testing
                                          const shortExpiry = Math.floor(Date.now() / 1000) + 30;
                                          setAuthConfig({ 
                                            ...authConfig, 
                                            tokenExpiry: shortExpiry
                                          });
                                          showWorkbenchNotice({
                                            type: 'info',
                                            message: 'Token expires in 30 seconds',
                                            detail: 'Wait for the countdown, then send the request to test refresh.',
                                          });
                                        }}
                                        className="px-3 py-1.5 text-[10px] font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition-colors flex items-center gap-1"
                                      >
                                        <ClockIcon className="h-3 w-3" />
                                        Expire in 30s
                                      </button>
                                    </div>
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
                <p className="text-sm text-[#a4a4ad]">Headers are sent with every request</p>
                <button
                  onClick={addHeader}
                  className="rounded px-4 py-2 text-sm font-medium text-[#8f83ff] transition-colors hover:bg-[#252234]"
                >
                  + Add Header
                </button>
              </div>
              
              {headers.length === 0 ? (
                <div className="py-16 text-center text-[#85858e]">
                  <DocumentTextIcon className="h-12 w-12 mx-auto mb-3 opacity-40" />
                  <p className="text-sm mb-2">No headers added yet</p>
                  <button 
                    onClick={addHeader} 
                    className="text-sm font-medium text-[#8f83ff] hover:text-[#c8c2ff]"
                  >
                    Add your first header
                  </button>
                </div>
              ) : (
                <div className="space-y-0 overflow-hidden rounded-md border border-[#2b2b31]">
                  {/* Header row */}
                  <div className="grid grid-cols-12 gap-2 border-b border-[#2b2b31] bg-[#141416] px-4 py-2 text-xs font-medium text-[#85858e]">
                    <div className="col-span-1"></div>
                    <div className="col-span-5">KEY</div>
                    <div className="col-span-5">VALUE</div>
                    <div className="col-span-1"></div>
                  </div>
                  {/* Header rows */}
                  {headers.map((header, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 border-b border-[#24242a] px-4 py-2 last:border-b-0 hover:bg-[#1f1f24]">
                      <div className="col-span-1 flex items-center">
                        <input
                          type="checkbox"
                          checked={header.enabled}
                          onChange={(e) => handleHeaderChange(index, 'enabled', e.target.checked)}
                          className="cursor-pointer rounded bg-[#202024] text-[#6d5dfc] focus:ring-[#6d5dfc]"
                        />
                      </div>
                      <div className="col-span-5">
                        <input
                          type="text"
                          value={header.key}
                          onChange={(e) => handleHeaderChange(index, 'key', e.target.value)}
                          placeholder="Key"
                          className="w-full border-none bg-transparent px-2 py-1.5 text-sm text-[#f4f4f5] placeholder:text-[#777781] focus:outline-none focus:ring-0"
                        />
                      </div>
                      <div className="col-span-5">
                        <input
                          type="text"
                          value={header.value}
                          onChange={(e) => handleHeaderChange(index, 'value', e.target.value)}
                          placeholder="Value"
                          className="w-full border-none bg-transparent px-2 py-1.5 text-sm text-[#f4f4f5] placeholder:text-[#777781] focus:outline-none focus:ring-0"
                        />
                      </div>
                      <div className="col-span-1 flex items-center justify-center">
                        <button
                          onClick={() => removeHeader(index)}
                          className="p-1 text-[#85858e] transition-colors hover:text-red-300"
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
          {activeTab === 'body' && !methodSupportsBody(method) && (
            <div className="flex flex-col items-center justify-center py-12 text-[#a4a4ad]">
              <svg className="h-16 w-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              <p className="text-lg font-medium mb-2">Body Not Available for {method} Requests</p>
              <p className="text-sm text-center max-w-md">
                {method} requests cannot have a request body according to HTTP standards. 
                Use POST, PUT, PATCH, or DELETE to send data in the request body.
              </p>
              <div className="mt-6 flex gap-2">
                <button
                  onClick={() => setMethod('POST')}
                className="rounded bg-[#6d5dfc] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#5948f2]"
                >
                  Switch to POST
                </button>
                <button
                  onClick={() => setActiveTab('params')}
                className="rounded bg-[#24242a] px-4 py-2 text-sm font-medium text-[#d7d7dc] transition-colors hover:bg-[#2c2c33]"
                >
                  Use Query Params Instead
                </button>
              </div>
            </div>
          )}

          {activeTab === 'body' && methodSupportsBody(method) && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[#a4a4ad]">Request body content</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setRequestFormat(requestFormat === 'pretty' ? 'raw' : 'pretty')}
                    className="rounded px-3 py-1.5 text-xs font-medium text-[#a4a4ad] transition-colors hover:bg-[#24242a] hover:text-white"
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
                      className="rounded px-3 py-1.5 text-xs font-medium text-[#8f83ff] transition-colors hover:bg-[#252234]"
                    >
                      Beautify
                    </button>
                  )}
                </div>
              </div>
              
              {!body && (
                <div className="flex items-start gap-2 rounded border border-[#34343b] bg-[#141416] p-3 text-xs text-[#a4a4ad]">
                  <LightBulbIcon className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span><strong>Tip:</strong> Paste your JSON here. It will be automatically validated and formatted.</span>
                </div>
              )}
              
              {isEditorMounted && (
                <div className="overflow-hidden rounded-md border border-[#2b2b31]">
                  <Editor
                    height="400px"
                    defaultLanguage="json"
                    value={body}
                    onChange={(value: string | undefined) => setBody(value || '')}
                    theme="vs-dark"
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

          {activeTab === 'preRequest' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#d7d7dc]">Safe pre-request directives</p>
                  <p className="mt-1 text-xs text-[#85858e]">Runs before Send. Supports setting headers and environment variables.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPreRequestScript('// Safe directives run before fetch()\nset header X-DebugTools: true\nset variable api_version = v1')}
                  className="rounded-md border border-[#34343b] bg-[#202024] px-3 py-1.5 text-xs font-semibold text-[#d7d7dc] hover:bg-[#27272d]"
                >
                  Insert sample
                </button>
              </div>
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="overflow-hidden rounded-md border border-[#2b2b31]">
                  {isEditorMounted ? (
                    <Editor
                      height="300px"
                      defaultLanguage="javascript"
                      value={preRequestScript}
                      onChange={(value: string | undefined) => setPreRequestScript(value || '')}
                      theme="vs-dark"
                      options={{
                        minimap: { enabled: false },
                        fontSize: 13,
                        lineNumbers: 'on',
                        wordWrap: 'on',
                        automaticLayout: true,
                        scrollBeyondLastLine: false,
                        tabSize: 2,
                      }}
                    />
                  ) : (
                    <textarea
                      value={preRequestScript}
                      onChange={(event) => setPreRequestScript(event.target.value)}
                      className="h-[300px] w-full bg-[#101011] p-4 font-mono text-sm text-[#f4f4f5] outline-none"
                    />
                  )}
                </div>
                <div className="rounded-md border border-[#2b2b31] bg-[#141416] p-4 text-xs text-[#a4a4ad]">
                  <p className="mb-3 font-semibold text-[#f4f4f5]">Supported syntax</p>
                  <pre className="whitespace-pre-wrap rounded border border-[#25252b] bg-[#101011] p-3 font-mono leading-5 text-[#d7d7dc]">{`set header X-Trace: true
unset header X-Trace
set variable token = abc123`}</pre>
                  <p className="mt-3 leading-5">This is intentionally safe: no arbitrary JavaScript runs in the browser.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tests' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#d7d7dc]">Response tests</p>
                  <p className="mt-1 text-xs text-[#85858e]">Assertions run after each response and stay with this request tab.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setTestScript('status in 200..299\nheader content-type contains json\nbody contains "id"\nresponse time below 2000')}
                  className="rounded-md border border-[#34343b] bg-[#202024] px-3 py-1.5 text-xs font-semibold text-[#d7d7dc] hover:bg-[#27272d]"
                >
                  Insert sample
                </button>
              </div>
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
                <div className="overflow-hidden rounded-md border border-[#2b2b31]">
                  {isEditorMounted ? (
                    <Editor
                      height="300px"
                      defaultLanguage="javascript"
                      value={testScript}
                      onChange={(value: string | undefined) => setTestScript(value || '')}
                      theme="vs-dark"
                      options={{
                        minimap: { enabled: false },
                        fontSize: 13,
                        lineNumbers: 'on',
                        wordWrap: 'on',
                        automaticLayout: true,
                        scrollBeyondLastLine: false,
                        tabSize: 2,
                      }}
                    />
                  ) : (
                    <textarea
                      value={testScript}
                      onChange={(event) => setTestScript(event.target.value)}
                      className="h-[300px] w-full bg-[#101011] p-4 font-mono text-sm text-[#f4f4f5] outline-none"
                    />
                  )}
                </div>
                <div className="rounded-md border border-[#2b2b31] bg-[#141416] p-4 text-xs text-[#a4a4ad]">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-[#f4f4f5]">Last run</p>
                    {testResults.length > 0 && (
                      <span className={failedTestCount > 0 ? 'text-rose-200' : 'text-emerald-200'}>
                        {passedTestCount}/{testResults.length} passing
                      </span>
                    )}
                  </div>
                  {testResults.length > 0 ? (
                    <div className="mt-3 space-y-2">
                      {testResults.map((result, index) => (
                        <div
                          key={`${result.name}-${index}`}
                          className={`rounded border px-3 py-2 ${
                            result.passed
                              ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100'
                              : 'border-rose-400/20 bg-rose-400/10 text-rose-100'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {result.passed ? <CheckIcon className="mt-0.5 h-4 w-4 shrink-0" /> : <XMarkIcon className="mt-0.5 h-4 w-4 shrink-0" />}
                            <div className="min-w-0">
                              <p className="break-words font-mono">{result.name}</p>
                              {result.message && <p className="mt-1 text-[11px] opacity-80">{result.message}</p>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-3 rounded border border-[#25252b] bg-[#101011] p-3 leading-5">
                      Send a request to run tests.
                    </div>
                  )}
                  <pre className="mt-3 whitespace-pre-wrap rounded border border-[#25252b] bg-[#101011] p-3 font-mono leading-5 text-[#d7d7dc]">{`status is 200
status in 200..299
header content-type contains json
body contains "ok"
json user.id equals 42
response time below 1000`}</pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Environment Variables Section */}
      {showVariables && (
        <ModalShell
          onClose={() => setShowVariables(false)}
          label="Environment variables"
          overlayClassName="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4"
          panelClassName="w-full max-w-3xl rounded-lg border border-[#2b2b31] bg-[#171719] shadow-2xl outline-none"
        >
          <div className="rounded-t-lg border-b border-[#2b2b31] bg-[#171719] p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CodeBracketIcon className="h-5 w-5 text-[#85858e]" />
                <h3 className="text-lg font-medium text-[#f4f4f5]">Environment Variables</h3>
                <span className="rounded bg-[#202024] px-2 py-1 text-xs text-[#a4a4ad]">
                  Use {'{{variable}}'} in URL, headers, or body
                </span>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={activeEnvironment}
                  onChange={(e) => setActiveEnvironment(e.target.value)}
                  className="rounded-lg border border-[#34343b] bg-[#202024] px-3 py-2 text-sm text-[#f4f4f5] outline-none focus:border-[#6d5dfc]"
                >
                  {environments.map((env) => (
                    <option key={env.name} value={env.name}>{env.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => setShowVariables(false)}
                  className="rounded p-2 text-[#85858e] hover:bg-[#24242a] hover:text-white"
                  title="Close variables"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
          <div className="max-h-[60vh] overflow-y-auto p-4">
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
                    className="flex-1 rounded-lg border border-[#34343b] bg-[#202024] px-3 py-2 text-sm text-[#f4f4f5] outline-none placeholder:text-[#777781] focus:border-[#6d5dfc]"
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
                    className="flex-1 rounded-lg border border-[#34343b] bg-[#202024] px-3 py-2 text-sm text-[#f4f4f5] outline-none placeholder:text-[#777781] focus:border-[#6d5dfc]"
                  />
                  <button
                    onClick={() => {
                      const newEnvironments = [...environments];
                      const envIndex = newEnvironments.findIndex(env => env.name === activeEnvironment);
                      newEnvironments[envIndex].variables = newEnvironments[envIndex].variables.filter((_, i) => i !== index);
                      setEnvironments(newEnvironments);
                    }}
                    className="rounded p-2 text-rose-300 hover:bg-rose-400/10"
                    title="Remove variable"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
              {environments.find(env => env.name === activeEnvironment)?.variables.length === 0 && (
                <div className="py-8 text-center text-[#85858e]">
                  <CodeBracketIcon className="mx-auto mb-2 h-12 w-12 text-[#4b4b52]" />
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
                className="w-full rounded-lg border border-[#34343b] bg-[#202024] px-4 py-2 text-sm font-medium text-[#d7d7dc] hover:bg-[#27272d]"
              >
                + Add Variable
              </button>
            </div>
          </div>
        </ModalShell>
      )}

      {/* Response Section */}
      <div className="w-full overflow-hidden rounded-lg border border-[#25252b] bg-[#171719] shadow-2xl shadow-black/20">
        {/* Response Header */}
        <div className="border-b border-[#25252b] bg-[#171719] px-4 py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-sm font-semibold text-[#f4f4f5]">Response</h2>
              {responseMetrics && (
                <div className="flex flex-wrap items-center gap-2 text-[12px]">
                  <span className={`rounded px-2 py-1 font-mono font-semibold ring-1 ${
                    responseMetrics.status >= 200 && responseMetrics.status < 300
                      ? 'bg-emerald-400/10 text-emerald-200 ring-emerald-400/20'
                    : responseMetrics.status >= 400 && responseMetrics.status < 500
                      ? 'bg-amber-400/10 text-amber-200 ring-amber-400/20'
                      : 'bg-rose-400/10 text-rose-200 ring-rose-400/20'
                  }`}>
                    {responseMetrics.status} / {getStatusText(responseMetrics.status)}
                  </span>
                  <div className="flex items-center gap-1.5 rounded bg-[#202024] px-2 py-1 text-[#a4a4ad] ring-1 ring-[#34343b]">
                    <ClockIcon className="h-4 w-4" />
                    <span>{responseMetrics.time}ms</span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded bg-[#202024] px-2 py-1 text-[#a4a4ad] ring-1 ring-[#34343b]">
                    <DocumentTextIcon className="h-4 w-4" />
                    <span>{formatBytes(responseMetrics.size)}</span>
                  </div>
                </div>
              )}
            </div>
            {loading && (
              <div className="flex items-center gap-2 text-sm text-[#a4a4ad]">
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Loading...</span>
              </div>
            )}
            {!loading && response && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => copyToClipboard(generateCode('curl'), 'cURL copied')}
                  className="rounded-md border border-[#34343b] bg-[#202024] px-3 py-1.5 text-xs font-semibold text-[#d7d7dc] hover:bg-[#27272d]"
                >
                  Copy cURL
                </button>
                <button
                  type="button"
                  onClick={() => setShowSnippetsPanel(true)}
                  className="rounded-md border border-[#34343b] bg-[#202024] px-3 py-1.5 text-xs font-semibold text-[#d7d7dc] hover:bg-[#27272d]"
                >
                  Snippets
                </button>
              </div>
            )}
          </div>
          {response && (
            <div className="mt-3 flex flex-col gap-2 border-t border-[#25252b] pt-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative min-w-[220px] max-w-xl flex-1">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#777781]" />
                <input
                  type="search"
                  value={responseSearchQuery}
                  onChange={(event) => setResponseSearchQuery(event.target.value)}
                  placeholder="Search response body, headers, cookies, tests..."
                  className="h-9 w-full rounded-md border border-[#34343b] bg-[#101011] pl-9 pr-10 text-sm text-[#f4f4f5] outline-none placeholder:text-[#777781] focus:border-[#6d5dfc] focus:ring-2 focus:ring-[#6d5dfc]/20"
                />
                {responseSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setResponseSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-[#85858e] hover:bg-[#24242a] hover:text-white"
                    aria-label="Clear response search"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#a4a4ad]">
                {responseSearchQuery.trim() ? (
                  <>
                    <span className={`rounded-md border px-2.5 py-1 font-semibold ${
                      responseSearchMatches.length
                        ? 'border-[#34343b] bg-[#202024] text-[#d7d7dc]'
                        : 'border-amber-300/25 bg-amber-300/10 text-amber-200'
                    }`}>
                      {responseSearchMatches.length
                        ? `${activeResponseSearchIndex + 1}/${responseSearchMatches.length} matches`
                        : 'No matches'}
                    </span>
                    <button
                      type="button"
                      onClick={() => moveResponseSearchMatch(-1)}
                      disabled={responseSearchMatches.length === 0}
                      className="rounded-md border border-[#34343b] bg-[#202024] px-2.5 py-1 font-semibold text-[#d7d7dc] hover:bg-[#27272d] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Prev
                    </button>
                    <button
                      type="button"
                      onClick={() => moveResponseSearchMatch(1)}
                      disabled={responseSearchMatches.length === 0}
                      className="rounded-md border border-[#34343b] bg-[#202024] px-2.5 py-1 font-semibold text-[#d7d7dc] hover:bg-[#27272d] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                    </button>
                  </>
                ) : (
                  <span className="rounded-md border border-[#34343b] bg-[#202024] px-2.5 py-1">
                    Search inside response
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Response Tabs */}
        {response && (
          <>
            <div className="border-b border-[#25252b] bg-[#171719]">
              <div className="flex overflow-x-auto px-4">
                {([
                  { id: 'body', label: 'Body' },
                  { id: 'headers', label: 'Headers' },
                  { id: 'cookies', label: `Cookies${responseCookies.length ? ` (${responseCookies.length})` : ''}` },
                  { id: 'tests', label: `Tests${testResults.length ? ` (${passedTestCount}/${testResults.length})` : ''}` },
                  { id: 'details', label: 'Details' },
                ] as { id: ResponseViewerTab; label: string }[]).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveResponseTab(tab.id)}
                    className={`shrink-0 px-4 py-2.5 text-[13px] font-medium transition-colors ${
                      activeResponseTab === tab.id
                        ? 'border-b-2 border-[#6d5dfc] text-white'
                        : 'text-[#a4a4ad] hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Response Content */}
            <div className="min-h-[260px] bg-[#171719] p-4">
              {responseSearchQuery.trim() && (
                <div className="mb-4 rounded-xl border border-[#2b2b31] bg-[#141416] p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#85858e]">Search results</p>
                    {activeResponseSearchMatch && (
                      <button
                        type="button"
                        onClick={() => selectResponseSearchMatch(activeResponseSearchIndex)}
                        className="rounded-md border border-[#34343b] bg-[#202024] px-2.5 py-1 text-xs font-semibold text-[#d7d7dc] hover:bg-[#27272d]"
                      >
                        Open {activeResponseSearchMatch.sectionLabel}
                      </button>
                    )}
                  </div>
                  {responseSearchMatches.length > 0 ? (
                    <div className="mt-3 grid gap-2 lg:grid-cols-2">
                      {responseSearchMatches.slice(0, 8).map((match, index) => (
                        <button
                          key={`${match.sectionId}-${match.lineNumber}-${match.columnNumber}-${index}`}
                          type="button"
                          onClick={() => selectResponseSearchMatch(index)}
                          className={`rounded-lg border p-3 text-left transition-colors ${
                            activeResponseSearchIndex === index
                              ? 'border-[#6d5dfc] bg-[#252234]'
                              : 'border-[#29292f] bg-[#101011] hover:border-[#3b3b44] hover:bg-[#1c1c20]'
                          }`}
                        >
                          <div className="mb-1 flex items-center justify-between gap-2">
                            <span className="rounded bg-[#202024] px-2 py-0.5 text-[11px] font-semibold text-[#d7d7dc]">
                              {match.sectionLabel}
                            </span>
                            <span className="font-mono text-[11px] text-[#85858e]">
                              L{match.lineNumber}:C{match.columnNumber}
                            </span>
                          </div>
                          <p className="line-clamp-2 break-words font-mono text-xs leading-5 text-[#cfd0d6]">
                            {renderSearchPreview(match)}
                          </p>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 rounded-lg border border-dashed border-[#34343b] p-4 text-sm text-[#85858e]">
                      No matches in body, headers, cookies, tests, or details.
                    </p>
                  )}
                </div>
              )}

              {activeResponseTab === 'body' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[13px] font-semibold text-[#a4a4ad]">Response body</p>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setResponseFormat(responseFormat === 'pretty' ? 'raw' : 'pretty')}
                        className="rounded-lg px-3 py-1.5 text-xs font-semibold text-[#a4a4ad] transition-colors hover:bg-[#24242a] hover:text-white"
                      >
                        {responseFormat === 'pretty' ? 'Raw' : 'Pretty'}
                      </button>
                      <button
                        onClick={() => copyToClipboard(formatJSON(response?.data))}
                        className="rounded-lg px-3 py-1.5 text-xs font-semibold text-[#a4a4ad] transition-colors hover:bg-[#24242a] hover:text-white"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                  
                  {responseFormat === 'pretty' && responseBodyIsObject && !canRenderClickableJson && (
                    <p className="rounded-lg border border-amber-300/25 bg-amber-300/10 px-3 py-2 text-xs text-amber-200">
                      This response is too large for the interactive view. Showing raw JSON instead.
                    </p>
                  )}

                  <div className="max-h-[560px] overflow-auto rounded-xl border border-[#2b2b31] bg-[#101011]">
                    {response && responseFormat === 'pretty' && canRenderClickableJson ? (
                      <div className="p-4 font-mono text-[12px] leading-5 text-[#d7d7dc]">
                        {renderClickableJSON(response.data)}
                      </div>
                    ) : (
                      <pre className="m-0 whitespace-pre-wrap break-words bg-transparent p-4 font-mono text-[12px] leading-5 text-[#d7d7dc]">
                        {response ? formatResponseBody(response.data) : ''}
                      </pre>
                    )}
                  </div>
                </div>
              )}

              {activeResponseTab === 'headers' && response && (
                <div className="space-y-3">
                  <p className="text-[13px] font-semibold text-[#a4a4ad]">Response headers</p>
                  <div className="overflow-hidden rounded-xl border border-[#2b2b31]">
                    <div className="grid grid-cols-2 gap-2 border-b border-[#2b2b31] bg-[#141416] px-4 py-2 text-xs font-semibold text-[#85858e]">
                      <div>KEY</div>
                      <div>VALUE</div>
                    </div>
                    {Object.entries(response.headers as Record<string, string>).map(([key, value]) => (
                      <div key={key} className="grid grid-cols-2 gap-2 border-b border-[#24242a] px-4 py-2 text-[13px] last:border-b-0 hover:bg-[#1f1f24]">
                        <div className="font-medium text-[#d7d7dc]">{key}</div>
                        <div className="break-all text-[#a4a4ad]">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeResponseTab === 'cookies' && response && (
                <div className="space-y-3">
                  <p className="text-[13px] font-semibold text-[#a4a4ad]">Response cookies</p>
                  {responseCookies.length > 0 ? (
                    <div className="overflow-hidden rounded-xl border border-[#2b2b31]">
                      <div className="grid grid-cols-12 gap-2 border-b border-[#2b2b31] bg-[#141416] px-4 py-2 text-xs font-semibold text-[#85858e]">
                        <div className="col-span-3">NAME</div>
                        <div className="col-span-4">VALUE</div>
                        <div className="col-span-5">ATTRIBUTES</div>
                      </div>
                      {responseCookies.map((cookie) => (
                        <div key={`${cookie.name}-${cookie.value}`} className="grid grid-cols-12 gap-2 border-b border-[#24242a] px-4 py-2 text-[13px] last:border-b-0 hover:bg-[#1f1f24]">
                          <div className="col-span-3 break-all font-medium text-[#d7d7dc]">{cookie.name}</div>
                          <div className="col-span-4 break-all font-mono text-xs text-[#a4a4ad]">{cookie.value}</div>
                          <div className="col-span-5 break-all text-[#a4a4ad]">{cookie.attributes.join('; ') || '-'}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-[#34343b] bg-[#141416] p-8 text-center text-sm text-[#85858e]">
                      No readable Set-Cookie header in this response. Browsers hide some cookie headers for security.
                    </div>
                  )}
                </div>
              )}

              {activeResponseTab === 'tests' && response && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[13px] font-semibold text-[#a4a4ad]">Test results</p>
                    {testResults.length > 0 && (
                      <span className={`rounded px-2 py-1 text-xs font-semibold ${
                        failedTestCount > 0
                          ? 'bg-rose-400/10 text-rose-200 ring-1 ring-rose-400/20'
                          : 'bg-emerald-400/10 text-emerald-200 ring-1 ring-emerald-400/20'
                      }`}>
                        {passedTestCount}/{testResults.length} passed
                      </span>
                    )}
                  </div>
                  {testResults.length > 0 ? (
                    <div className="space-y-2">
                      {testResults.map((result, index) => (
                        <div
                          key={`${result.name}-${index}`}
                          className={`rounded-lg border px-4 py-3 ${
                            result.passed
                              ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100'
                              : 'border-rose-400/20 bg-rose-400/10 text-rose-100'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {result.passed ? <CheckIcon className="mt-0.5 h-4 w-4 shrink-0" /> : <XMarkIcon className="mt-0.5 h-4 w-4 shrink-0" />}
                            <div className="min-w-0">
                              <p className="break-words font-mono text-xs">{result.name}</p>
                              {result.message && <p className="mt-1 text-xs opacity-80">{result.message}</p>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-[#34343b] bg-[#141416] p-8 text-center text-sm text-[#85858e]">
                      No tests configured for this request.
                    </div>
                  )}
                </div>
              )}

              {activeResponseTab === 'details' && response && responseMetrics && (
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {responseDetailCards.map((card) => (
                      <div
                        key={card.label}
                        className={`rounded-xl border p-4 ${
                          card.tone === 'good'
                            ? 'border-emerald-400/20 bg-emerald-400/10'
                          : card.tone === 'bad'
                            ? 'border-rose-400/20 bg-rose-400/10'
                          : card.tone === 'warn'
                            ? 'border-amber-400/20 bg-amber-400/10'
                          : 'border-[#2b2b31] bg-[#141416]'
                        }`}
                      >
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#85858e]">{card.label}</p>
                        <p className="mt-2 break-words text-sm font-semibold text-[#f4f4f5]">{card.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-4 xl:grid-cols-2">
                    <div className="rounded-xl border border-[#2b2b31] bg-[#141416] p-4">
                      <p className="text-[13px] font-semibold text-[#f4f4f5]">Request snapshot</p>
                      <div className="mt-3 space-y-2 text-sm">
                        {[
                          ['Method', method],
                          ['URL', normalizeRequestUrl(url) || '(empty)'],
                          ['Environment', activeEnvironmentDetails?.name || 'No environment'],
                          ['Auth', authConfig.type === 'none' ? 'No auth' : authConfig.type],
                          ['Cache mode', requestSummary.cache],
                        ].map(([label, value]) => (
                          <div key={label} className="grid grid-cols-[120px_minmax(0,1fr)] gap-3 border-b border-[#24242a] pb-2 last:border-b-0 last:pb-0">
                            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#85858e]">{label}</span>
                            <span className="break-all font-mono text-xs text-[#d7d7dc]">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl border border-[#2b2b31] bg-[#141416] p-4">
                      <p className="text-[13px] font-semibold text-[#f4f4f5]">Header diagnostics</p>
                      <div className="mt-3 space-y-2 text-sm">
                        {[
                          ['Content-Type', getResponseHeader('content-type') || 'Unknown'],
                          ['Cache-Control', getResponseHeader('cache-control') || 'Not provided'],
                          ['Server', getResponseHeader('server') || 'Not provided'],
                          ['CORS', getResponseHeader('access-control-allow-origin') || 'Not provided'],
                          ['Date', getResponseHeader('date') || 'Not provided'],
                        ].map(([label, value]) => (
                          <div key={label} className="grid grid-cols-[120px_minmax(0,1fr)] gap-3 border-b border-[#24242a] pb-2 last:border-b-0 last:pb-0">
                            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#85858e]">{label}</span>
                            <span className="break-all font-mono text-xs text-[#d7d7dc]">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#2b2b31] bg-[#101011] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[13px] font-semibold text-[#f4f4f5]">Raw details</p>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(responseDetailsText, 'Response details copied')}
                        className="rounded-md border border-[#34343b] bg-[#202024] px-3 py-1.5 text-xs font-semibold text-[#d7d7dc] hover:bg-[#27272d]"
                      >
                        Copy details
                      </button>
                    </div>
                    <pre className="mt-3 whitespace-pre-wrap break-words font-mono text-xs leading-6 text-[#d7d7dc]">
                      {responseDetailsText}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* No Response State */}
        {!response && !loading && (
          <div className="flex min-h-[220px] items-center justify-center p-8 text-center text-[#85858e]">
            <div className="rounded-md border border-dashed border-[#34343b] bg-[#141416] px-8 py-6">
              <p className="mb-1 text-[13px] font-semibold text-[#d7d7dc]">No response yet</p>
              <p className="text-[12px]">Send a request to inspect status, headers, and body.</p>
            </div>
          </div>
        )}
      </div>

      {/* Additional Panels */}
      {showAuthConfig && (
        <div className="mx-auto mb-4 max-w-[1600px] rounded-lg border border-[#25252b] bg-[#171719] p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-[#f4f4f5]">Authentication</h3>
            <button
              onClick={() => setShowAuthConfig(false)}
              className="rounded p-2 text-[#85858e] hover:bg-[#24242a] hover:text-white"
              title="Close authentication"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="space-y-4">
            <select
              value={authConfig.type}
              onChange={(e) => setAuthConfig({ ...authConfig, type: e.target.value as AuthType })}
              className="w-full rounded-md border border-[#34343b] bg-[#202024] px-3 py-2 text-[#f4f4f5] outline-none focus:border-[#6d5dfc]"
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
                  className="w-full rounded-md border border-[#34343b] bg-[#202024] px-3 py-2 text-[#f4f4f5] outline-none placeholder:text-[#777781] focus:border-[#6d5dfc]"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={authConfig.password || ''}
                  onChange={(e) => setAuthConfig({ ...authConfig, password: e.target.value })}
                  className="w-full rounded-md border border-[#34343b] bg-[#202024] px-3 py-2 text-[#f4f4f5] outline-none placeholder:text-[#777781] focus:border-[#6d5dfc]"
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
                  className="w-full rounded-md border border-[#34343b] bg-[#202024] px-3 py-2 font-mono text-sm text-[#f4f4f5] outline-none placeholder:text-[#777781] focus:border-[#6d5dfc]"
                />

                {authConfig.token && decodeJWT(authConfig.token) && (
                  <div className="rounded bg-[#101011] p-2 text-xs text-[#a4a4ad]">
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
                              <span className="flex items-center gap-1.5 font-medium text-rose-300">
                                <XMarkIcon className="h-4 w-4" />
                                Token expired
                              </span>
                            ) : minutesUntilExpiry < 5 ? (
                              <span className="flex items-center gap-1.5 font-medium text-amber-200">
                                <ClockIcon className="h-4 w-4" />
                                Expires in {minutesUntilExpiry} minutes
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5 font-medium text-emerald-300">
                                <CheckIcon className="h-4 w-4" />
                                Valid until {expiryDate.toLocaleString()}
                              </span>
                            )}
                          </div>
                        );
                      }
                      return <span>JWT Token detected</span>;
                    })()}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setShowAdvancedAuth(!showAdvancedAuth)}
                  className="text-sm font-medium text-[#8f83ff] hover:text-[#c8c2ff]"
                >
                  {showAdvancedAuth ? 'Hide advanced token automation' : 'Show advanced token automation'}
                </button>

                {showAdvancedAuth && (
                  <div className="space-y-3 border-t border-[#25252b] pt-3">
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm text-[#d7d7dc]">
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
                            className="w-full rounded-md border border-[#34343b] bg-[#202024] px-3 py-2 text-sm text-[#f4f4f5] outline-none placeholder:text-[#777781] focus:border-[#6d5dfc]"
                          />
                          <input
                            type="text"
                            placeholder="Refresh Token"
                            value={authConfig.refreshToken || ''}
                            onChange={(e) => setAuthConfig({ ...authConfig, refreshToken: e.target.value })}
                            className="w-full rounded-md border border-[#34343b] bg-[#202024] px-3 py-2 font-mono text-sm text-[#f4f4f5] outline-none placeholder:text-[#777781] focus:border-[#6d5dfc]"
                          />
                          <button
                            onClick={refreshAccessToken}
                            className="rounded bg-[#6d5dfc] px-3 py-1.5 text-sm text-white hover:bg-[#5948f2]"
                          >
                            Refresh Token Now
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-[#25252b] pt-3">
                      <label className="mb-2 flex items-center gap-2 text-sm text-[#d7d7dc]">
                        <input
                          type="checkbox"
                          checked={authConfig.autoLogin || false}
                          onChange={(e) => setAuthConfig({ ...authConfig, autoLogin: e.target.checked })}
                          className="rounded"
                        />
                        <span className="font-medium">Auto-login when token expires</span>
                      </label>
                      
                      <p className="mb-3 ml-6 text-xs text-[#85858e]">
                        Automatically login and get a new token when API returns 401/403 error
                      </p>
                      
                      {authConfig.autoLogin && (
                        <div className="ml-6 space-y-2 rounded border border-[#2b2b31] bg-[#101011] p-3">
                          <div className="mb-2 text-xs font-medium text-[#f4f4f5]">Login Configuration</div>
                          <input
                            type="text"
                            placeholder="Login URL (e.g., https://api.example.com/auth/login)"
                            value={authConfig.loginUrl || ''}
                            onChange={(e) => setAuthConfig({ ...authConfig, loginUrl: e.target.value })}
                            className="w-full rounded-md border border-[#34343b] bg-[#202024] px-3 py-2 text-sm text-[#f4f4f5] outline-none placeholder:text-[#777781] focus:border-[#6d5dfc]"
                          />
                          <input
                            type="text"
                            placeholder="Username or Email"
                            value={authConfig.loginUsername || ''}
                            onChange={(e) => setAuthConfig({ ...authConfig, loginUsername: e.target.value })}
                            className="w-full rounded-md border border-[#34343b] bg-[#202024] px-3 py-2 text-sm text-[#f4f4f5] outline-none placeholder:text-[#777781] focus:border-[#6d5dfc]"
                          />
                          <input
                            type="password"
                            placeholder="Password"
                            value={authConfig.loginPassword || ''}
                            onChange={(e) => setAuthConfig({ ...authConfig, loginPassword: e.target.value })}
                            className="w-full rounded-md border border-[#34343b] bg-[#202024] px-3 py-2 text-sm text-[#f4f4f5] outline-none placeholder:text-[#777781] focus:border-[#6d5dfc]"
                          />
                          <input
                            type="text"
                            placeholder="Token Path in Response (e.g., data.token or access_token)"
                            value={authConfig.tokenPath || ''}
                            onChange={(e) => setAuthConfig({ ...authConfig, tokenPath: e.target.value })}
                            className="w-full rounded-md border border-[#34343b] bg-[#202024] px-3 py-2 font-mono text-sm text-[#f4f4f5] outline-none placeholder:text-[#777781] focus:border-[#6d5dfc]"
                          />
                          <div className="mt-2 text-xs text-[#a4a4ad]">
                            <p className="font-medium mb-1 flex items-center gap-1.5">
                              <LightBulbIcon className="h-4 w-4" />
                              Common token paths:
                            </p>
                            <ul className="list-disc ml-4 space-y-1">
                              <li><code className="rounded bg-[#202024] px-1 text-[#d7d7dc]">access_token</code> - Root level</li>
                              <li><code className="rounded bg-[#202024] px-1 text-[#d7d7dc]">token</code> - Root level</li>
                              <li><code className="rounded bg-[#202024] px-1 text-[#d7d7dc]">data.token</code> - Nested in data</li>
                              <li><code className="rounded bg-[#202024] px-1 text-[#d7d7dc]">data.access_token</code> - Nested in data</li>
                            </ul>
                          </div>
                          <button
                            onClick={async () => {
                              const token = await performAutoLogin();
                              if (token) {
                                showWorkbenchNotice({ type: 'success', message: 'Login successful', detail: 'Token acquired.' });
                              }
                            }}
                            className="w-full rounded bg-[#6d5dfc] px-3 py-2 text-sm font-medium text-white hover:bg-[#5948f2]"
                          >
                            Test Login Now
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {authConfig.type === 'apiKey' && (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="API Key"
                  value={authConfig.apiKey || ''}
                  onChange={(e) => setAuthConfig({ ...authConfig, apiKey: e.target.value })}
                  className="w-full rounded-md border border-[#34343b] bg-[#202024] px-3 py-2 text-[#f4f4f5] outline-none placeholder:text-[#777781] focus:border-[#6d5dfc]"
                />
                <div className="flex space-x-4">
                  <select
                    value={authConfig.apiKeyLocation || 'header'}
                    onChange={(e) => setAuthConfig({ ...authConfig, apiKeyLocation: e.target.value as 'header' | 'query' })}
                    className="flex-1 rounded-md border border-[#34343b] bg-[#202024] px-3 py-2 text-[#f4f4f5] outline-none focus:border-[#6d5dfc]"
                  >
                    <option value="header">Header</option>
                    <option value="query">Query Parameter</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Key Name"
                    value={authConfig.apiKeyName || ''}
                    onChange={(e) => setAuthConfig({ ...authConfig, apiKeyName: e.target.value })}
                    className="flex-1 rounded-md border border-[#34343b] bg-[#202024] px-3 py-2 text-[#f4f4f5] outline-none placeholder:text-[#777781] focus:border-[#6d5dfc]"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showSettings && (
        <div className="mx-auto mb-4 max-w-[1600px] rounded-lg border border-[#25252b] bg-[#171719] p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-[#f4f4f5]">Settings</h3>
            <button
              onClick={() => setShowSettings(false)}
              className="rounded p-2 text-[#85858e] hover:bg-[#24242a] hover:text-white"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-[#25252b] bg-[#101011] p-3">
              <div>
                <label className="text-sm font-medium text-[#d7d7dc]">Auto-format JSON</label>
                <p className="mt-0.5 text-xs text-[#85858e]">Automatically format JSON in request body</p>
              </div>
              <input
                type="checkbox"
                checked={autoFormat}
                onChange={(e) => setAutoFormat(e.target.checked)}
                className="h-4 w-4 rounded border-[#34343b] bg-[#202024] text-[#6d5dfc] focus:ring-[#6d5dfc]"
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-[#25252b] bg-[#101011] p-3">
              <div>
                <label className="text-sm font-medium text-[#d7d7dc]">Auto-save changes</label>
                <p className="mt-0.5 text-xs text-[#85858e]">Save requests automatically to localStorage</p>
              </div>
              <input
                type="checkbox"
                checked={autoSave}
                onChange={(e) => setAutoSave(e.target.checked)}
                className="h-4 w-4 rounded border-[#34343b] bg-[#202024] text-[#6d5dfc] focus:ring-[#6d5dfc]"
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-amber-300/25 bg-amber-300/10 p-3">
              <div>
                <label className="text-sm font-medium text-amber-100">Private mode</label>
                <p className="mt-0.5 text-xs text-amber-200/80">Do not save tabs, history, auth tokens, passwords, or environment secrets locally.</p>
              </div>
              <input
                type="checkbox"
                checked={privateMode}
                onChange={(e) => setPrivateMode(e.target.checked)}
                className="h-4 w-4 rounded border-amber-300/40 bg-[#202024] text-[#6d5dfc] focus:ring-[#6d5dfc]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Request Snippets Panel */}
      {showSnippetsPanel && (
        <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col border-l border-[#2b2b31] bg-[#151516] text-[#d7d7dc] shadow-2xl">
          <div className="flex items-start justify-between gap-3 border-b border-[#2b2b31] px-5 py-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#85858e]">Snippets</p>
              <h3 className="mt-1 text-lg font-semibold text-[#f4f4f5]">Request code</h3>
              <p className="mt-1 text-sm text-[#a4a4ad]">Uses the processed URL, auth, headers, environment variables, and body.</p>
            </div>
            <button
              onClick={() => setShowSnippetsPanel(false)}
              className="rounded p-1 text-[#85858e] hover:bg-[#24242a] hover:text-white"
              aria-label="Close request snippets panel"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="border-b border-[#2b2b31] px-5 py-4">
            <div className="flex flex-wrap items-center gap-2">
              {(['curl', 'javascript', 'python'] as CodeSnippetLanguage[]).map((language) => (
                <button
                  key={language}
                  type="button"
                  onClick={() => setCodeSnippetLanguage(language)}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                    codeSnippetLanguage === language
                      ? 'bg-[#6d5dfc] text-white'
                      : 'border border-[#34343b] bg-[#202024] text-[#a4a4ad] hover:bg-[#27272d] hover:text-white'
                  }`}
                >
                  {language === 'curl' ? 'cURL' : language === 'javascript' ? 'JavaScript' : 'Python'}
                </button>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => copyToClipboard(generateCode(codeSnippetLanguage), 'Snippet copied')}
                className="inline-flex items-center gap-1.5 rounded-md bg-[#f4f4f5] px-3 py-2 text-sm font-semibold text-[#101011] hover:bg-white"
              >
                <ClipboardIcon className="h-4 w-4" />
                Copy
              </button>
              <button
                onClick={downloadSnippet}
                className="inline-flex items-center gap-1.5 rounded-md border border-[#34343b] bg-[#202024] px-3 py-2 text-sm font-semibold text-[#d7d7dc] hover:bg-[#27272d]"
              >
                <ArrowDownOnSquareIcon className="h-4 w-4" />
                Download
              </button>
            </div>
          </div>
          <pre className="min-h-0 flex-1 overflow-auto bg-[#0f0f10] p-5 font-mono text-xs leading-6 text-[#e8e8ec]">
            {generateCode(codeSnippetLanguage)}
          </pre>
        </div>
      )}

      {/* API Documentation Panel */}
      {showDocsPanel && (
        <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-2xl flex-col border-l border-[#2b2b31] bg-[#151516] text-[#d7d7dc] shadow-2xl">
          <div className="flex items-start justify-between gap-3 border-b border-[#2b2b31] px-5 py-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#85858e]">API docs</p>
              <h3 className="mt-1 text-lg font-semibold text-[#f4f4f5]">Generate documentation</h3>
              <p className="mt-1 text-sm text-[#a4a4ad]">Generate Markdown or OpenAPI from the selected collection, or from the active request.</p>
            </div>
            <button
              onClick={() => setShowDocsPanel(false)}
              className="rounded p-1 text-[#85858e] hover:bg-[#24242a] hover:text-white"
              aria-label="Close API documentation panel"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="border-b border-[#2b2b31] px-5 py-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-medium text-[#f4f4f5]">
                Source
                <select
                  value={selectedCollectionId}
                  onChange={(event) => setSelectedCollectionId(event.target.value)}
                  className="mt-1 w-full rounded-md border border-[#34343b] bg-[#202024] px-3 py-2 text-sm text-[#f4f4f5] outline-none focus:border-[#6d5dfc]"
                >
                  <option value="">Active request</option>
                  {collections.map((collection) => (
                    <option key={collection.id} value={collection.id}>{collection.name}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium text-[#f4f4f5]">
                Format
                <select
                  value={apiDocFormat}
                  onChange={(event) => setApiDocFormat(event.target.value as 'markdown' | 'openapi')}
                  className="mt-1 w-full rounded-md border border-[#34343b] bg-[#202024] px-3 py-2 text-sm text-[#f4f4f5] outline-none focus:border-[#6d5dfc]"
                >
                  <option value="markdown">Markdown</option>
                  <option value="openapi">OpenAPI 3.1 JSON</option>
                </select>
              </label>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => copyToClipboard(generateApiDocumentation())}
                className="inline-flex items-center gap-1.5 rounded-md bg-[#f4f4f5] px-3 py-2 text-sm font-semibold text-[#101011] hover:bg-white"
              >
                <ClipboardIcon className="h-4 w-4" />
                Copy
              </button>
              <button
                onClick={() => {
                  const output = generateApiDocumentation();
                  const blob = new Blob([output], { type: apiDocFormat === 'openapi' ? 'application/json' : 'text/markdown' });
                  const link = document.createElement('a');
                  link.href = URL.createObjectURL(blob);
                  link.download = apiDocFormat === 'openapi' ? 'openapi.json' : 'api-docs.md';
                  link.click();
                  URL.revokeObjectURL(link.href);
                }}
                className="inline-flex items-center gap-1.5 rounded-md border border-[#34343b] bg-[#202024] px-3 py-2 text-sm font-semibold text-[#d7d7dc] hover:bg-[#27272d]"
              >
                <ArrowDownOnSquareIcon className="h-4 w-4" />
                Download
              </button>
            </div>
          </div>
          <pre className="min-h-0 flex-1 overflow-auto bg-[#0f0f10] p-5 font-mono text-xs leading-6 text-[#e8e8ec]">
            {generateApiDocumentation()}
          </pre>
        </div>
      )}

      {/* AI Context Side Panel */}
      {showAiContextPanel && (
        <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col border-l border-[#2b2b31] bg-[#151516] text-[#d7d7dc] shadow-2xl">
          <div className="flex items-start justify-between gap-3 border-b border-[#2b2b31] px-5 py-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#85858e]">AI context</p>
              <h3 className="mt-1 text-lg font-semibold text-[#f4f4f5]">Debug brief</h3>
              <p className="mt-1 text-sm text-[#a4a4ad]">Prepare a redacted context package for your own AI provider or teammate.</p>
            </div>
            <button
              onClick={() => setShowAiContextPanel(false)}
              className="rounded p-1 text-[#85858e] hover:bg-[#24242a] hover:text-white"
              aria-label="Close AI context panel"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="space-y-3 border-b border-[#2b2b31] px-5 py-4">
            <label className="block text-sm font-medium text-[#f4f4f5]">
              Environment
              <input
                type="text"
                value={aiContextEnvironment}
                onChange={(event) => setAiContextEnvironment(event.target.value)}
                className="mt-1 w-full rounded-md border border-[#34343b] bg-[#202024] px-3 py-2 text-sm text-[#f4f4f5] outline-none placeholder:text-[#777781] focus:border-[#6d5dfc]"
                placeholder="Production, staging, local..."
              />
            </label>
            <label className="block text-sm font-medium text-[#f4f4f5]">
              Notes
              <textarea
                value={aiContextNotes}
                onChange={(event) => setAiContextNotes(event.target.value)}
                className="mt-1 h-28 w-full rounded-md border border-[#34343b] bg-[#202024] px-3 py-2 text-sm text-[#f4f4f5] outline-none placeholder:text-[#777781] focus:border-[#6d5dfc]"
                placeholder="What changed, what you expected, affected user, deploy/version..."
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => copyToClipboard(generateAiContext())}
                className="inline-flex items-center gap-1.5 rounded-md bg-[#f4f4f5] px-3 py-2 text-sm font-semibold text-[#101011] hover:bg-white"
              >
                <ClipboardIcon className="h-4 w-4" />
                Copy context
              </button>
              <button
                onClick={() => setAiContextNotes('')}
                className="rounded-md border border-[#34343b] bg-[#202024] px-3 py-2 text-sm font-semibold text-[#d7d7dc] hover:bg-[#27272d]"
              >
                Clear notes
              </button>
            </div>
          </div>
          <pre className="min-h-0 flex-1 overflow-auto bg-[#0f0f10] p-5 font-mono text-xs leading-6 text-[#e8e8ec]">
            {generateAiContext()}
          </pre>
        </div>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <ModalShell
          onClose={() => setShowAuthModal(false)}
          label="Cloud sync"
          overlayClassName="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          panelClassName="w-full max-w-md rounded-lg border border-[#2b2b31] bg-[#171719] p-6 shadow-2xl outline-none"
        >
            <div className="mb-4 flex items-start justify-between">
              <h3 className="text-xl font-bold text-[#f4f4f5]">Cloud Sync</h3>
              <button
                onClick={() => setShowAuthModal(false)}
                className="rounded p-1 text-[#85858e] hover:bg-[#24242a] hover:text-white"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <p className="mb-6 text-sm text-[#a4a4ad]">
              API Workbench works fully without login. Connect Google only if you want collection sync across devices.
            </p>

            {/* Benefits */}
            <div className="mb-6 space-y-2.5">
              <div className="flex items-start gap-2.5">
                <CheckIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-400" />
                <p className="text-sm text-[#d7d7dc]">Keep using the local workspace with no account required</p>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-400" />
                <p className="text-sm text-[#d7d7dc]">Sync selected collections across all devices</p>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-400" />
                <p className="text-sm text-[#d7d7dc]">Avoid vendor lock-in with JSON import and export</p>
              </div>
            </div>

            {/* Google Sign In Button */}
            <button
              onClick={() => signIn('google', { callbackUrl: window.location.pathname })}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-[#34343b] bg-[#202024] px-6 py-3 shadow-sm transition-all hover:border-[#3f3f48] hover:bg-[#27272d]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
                <span className="font-semibold text-[#f4f4f5]">Enable Cloud Sync with Google</span>
            </button>

            {/* Info Note */}
            <div className="mt-4 rounded-lg border border-[#2b2b31] bg-[#101011] p-3">
              <p className="text-xs text-[#a4a4ad]">
                <span className="font-semibold">Local-first:</span> Skip this and the tester still sends requests, imports collections, and saves locally in this browser.
              </p>
            </div>

            {/* Footer */}
            <p className="mt-4 text-center text-xs text-[#85858e]">
              By connecting, you agree to our{' '}
              <a href="/terms-of-service" className="text-[#8f83ff] hover:underline">
                Terms of Service
              </a>
              {' '}and{' '}
              <a href="/privacy-policy" className="text-[#8f83ff] hover:underline">
                Privacy Policy
              </a>
            </p>
        </ModalShell>
      )}
      </div>
      </div>
      </div>
    </div>
  );
} 

// Export without authentication requirement
// Users can use API Workbench freely, but need to connect to save collections
export default function APITester() {
  return <APITesterContent />;
}
