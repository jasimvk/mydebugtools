'use client';

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from 'react';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import { useSession, signOut, signIn } from 'next-auth/react';
import { useCollections } from './hooks/useCollections';
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

interface RequestTab {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  headers: Header[];
  body: string;
  contentType: ContentType;
  authConfig: AuthConfig;
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

function APITesterContent() {
  const { data: session } = useSession();
  
  // Tab management
  const [tabs, setTabs] = useState<RequestTab[]>([{
    id: '1',
    name: 'API 1',
    method: 'GET',
    url: '',
    headers: [{ key: '', value: '', enabled: true }],
    body: '',
    contentType: 'application/json',
    authConfig: { type: 'none' },
    response: null,
    responseMetrics: null,
    hasUnsavedChanges: false
  }]);
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
  
  const responseMetrics = currentTab?.responseMetrics || null;
  const setResponseMetrics = (newMetrics: ResponseMetrics | null) => {
    updateCurrentTab({ responseMetrics: newMetrics });
  };
  
  const authConfig = currentTab?.authConfig || { type: 'none' };
  const setAuthConfig = (newAuthConfig: AuthConfig) => {
    // Automatically apply auth config to all tabs
    setTabs(prevTabs => {
      return prevTabs.map((tab, index) => {
        // Update all tabs with the new auth config
        return {
          ...tab,
          authConfig: newAuthConfig,
          hasUnsavedChanges: index === activeTabIndex ? true : tab.hasUnsavedChanges
        };
      });
    });
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
  const [responseTime, setResponseTime] = useState<number>(0);
  
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
  } = useCollections();
  
  const [showCollections, setShowCollections] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [syncingCollections, setSyncingCollections] = useState(false);
  const [saveRequestName, setSaveRequestName] = useState('');
  const [saveRequestDescription, setSaveRequestDescription] = useState('');
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('');
  const [showNewCollectionDialog, setShowNewCollectionDialog] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
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
    const savedHistory = localStorage.getItem('requestHistory');
    const savedEnvironments = localStorage.getItem('environments');
    const savedPresets = localStorage.getItem('presets');
    const savedActiveEnv = localStorage.getItem('activeEnvironment');
    const savedSettings = localStorage.getItem('settings');
    const savedTabs = localStorage.getItem('apiTesterTabs');
    const savedActiveTabIndex = localStorage.getItem('apiTesterActiveTabIndex');
    const savedCollections = localStorage.getItem('apiTesterCollections');

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
    if (savedTabs) {
      try {
        const parsedTabs = JSON.parse(savedTabs);
        if (Array.isArray(parsedTabs) && parsedTabs.length > 0) {
          setTabs(parsedTabs);
        }
      } catch (e) {
        console.error('Failed to load saved tabs:', e);
      }
    }
    if (savedActiveTabIndex) {
      const index = parseInt(savedActiveTabIndex, 10);
      if (!isNaN(index)) {
        setActiveTabIndex(index);
      }
    }
    // Collections are now loaded from Supabase via useCollections hook
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
    localStorage.setItem('apiTesterTabs', JSON.stringify(tabs));
    localStorage.setItem('apiTesterActiveTabIndex', activeTabIndex.toString());
    // Collections are now saved to Supabase automatically via API calls
  };

  // Tab management functions
  const createNewTab = () => {
    // Inherit auth config from current tab if it's not 'none'
    const inheritedAuthConfig = currentTab?.authConfig && currentTab.authConfig.type !== 'none' 
      ? currentTab.authConfig 
      : { type: 'none' as const };
    
    const hasInheritedAuth = inheritedAuthConfig.type !== 'none';
    
    const newTab: RequestTab = {
      id: Date.now().toString(),
      name: `API ${tabs.length + 1}`,
      method: 'GET',
      url: '',
      headers: [{ key: '', value: '', enabled: true }],
      body: '',
      contentType: 'application/json',
      authConfig: inheritedAuthConfig,
      response: null,
      responseMetrics: null,
      hasUnsavedChanges: false
    };
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
      setTabs([{
        id: Date.now().toString(),
        name: 'API 1',
        method: 'GET',
        url: '',
        headers: [{ key: '', value: '', enabled: true }],
        body: '',
        contentType: 'application/json',
        authConfig: { type: 'none' },
        response: null,
        responseMetrics: null,
        hasUnsavedChanges: false
      }]);
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
    if (tabs.length > 0) {
      saveData();
    }
  }, [tabs, activeTabIndex]);

  // Save collections whenever they change
  useEffect(() => {
    if (collections.length >= 0) {
      localStorage.setItem('apiTesterCollections', JSON.stringify(collections));
    }
  }, [collections]);

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
    
    await saveRequestAPI(selectedCollectionId, {
      name: saveRequestName.trim(),
      method: currentTab.method,
      url: currentTab.url,
      headers: currentTab.headers,
      body: currentTab.body,
      contentType: currentTab.contentType,
      authConfig: currentTab.authConfig,
      description: saveRequestDescription.trim(),
    });

    // Clear form
    setSaveRequestName('');
    setSaveRequestDescription('');
    setShowSaveDialog(false);
    
    // Mark tab as saved
    updateCurrentTab({ hasUnsavedChanges: false });
  };

  const loadRequestFromCollection = (request: SavedRequest) => {
    // Create a new tab with the saved request data
    const newTab: RequestTab = {
      id: Date.now().toString(),
      name: request.name,
      method: request.method,
      url: request.url,
      headers: request.headers,
      body: request.body,
      contentType: request.contentType,
      authConfig: request.authConfig,
      response: null,
      responseMetrics: null,
      hasUnsavedChanges: false
    };
    
    setTabs([...tabs, newTab]);
    setActiveTabIndex(tabs.length);
  };

  const deleteRequestFromCollection = async (collectionId: string, requestId: string) => {
    if (confirm('Are you sure you want to delete this request?')) {
      await deleteRequestAPI(collectionId, requestId);
    }
  };

  const exportCollection = (collection: Collection) => {
    const dataStr = JSON.stringify(collection, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${collection.name.replace(/\s+/g, '_')}_collection.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importCollection = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const importedCollection = JSON.parse(e.target?.result as string);
        
        // Create the collection via API
        const newCollection = await createCollectionAPI(
          importedCollection.name,
          importedCollection.description || '',
          importedCollection.color
        );
        
        if (!newCollection) {
          alert('Failed to import collection.');
          return;
        }
        
        // Import all requests
        for (const request of importedCollection.requests || []) {
          await saveRequestAPI(newCollection.id, {
            name: request.name,
            method: request.method,
            url: request.url,
            headers: request.headers || [],
            body: request.body || '',
            contentType: request.contentType || 'application/json',
            authConfig: request.authConfig || { type: 'none' },
            description: request.description || '',
          });
        }
        
        alert(`Successfully imported collection "${importedCollection.name}" with ${importedCollection.requests?.length || 0} requests!`);
      } catch (error) {
        alert('Failed to import collection. Please check the file format.');
        console.error('Import error:', error);
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
        alert('Please enter a login URL');
        return;
      }
      setBearerSetupStep(2);
    } else if (bearerSetupStep === 2) {
      // Validate payload
      if (!wizardRequestPayload.trim()) {
        alert('Please enter a request payload');
        return;
      }
      
      // Validate JSON
      try {
        JSON.parse(wizardRequestPayload);
      } catch (error) {
        alert('Invalid JSON payload. Please check your syntax.');
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
          alert(`✅ Bearer token configured successfully!\n\nToken extracted from: ${wizardTokenPath}\nAuto-login enabled for seamless re-authentication.`);
          
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
        alert(`❌ Bearer Token Wizard Failed:\n\n${error instanceof Error ? error.message : 'Unknown error'}\n\nTip: Try clicking the token field directly in the response instead!`);
        console.error('Wizard setup error:', error);
      }
    }
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
      alert('❌ No token value found');
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

      // Configure auth with clicked token - this will automatically apply to all tabs
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

      // setAuthConfig now automatically applies to all tabs
      setAuthConfig(newAuthConfig);

      // Show success and close dialog
      alert(`✅ Bearer token configured for all tabs!\n\n` +
            `Token Field: ${clickedTokenPath}\n` +
            `Token Preview: ${clickedTokenValue.substring(0, 20)}...\n` +
            `Auto-login URL: ${currentTab.url || 'Not set'}\n\n` +
            `Applied to ${tabs.length} tab${tabs.length > 1 ? 's' : ''} automatically.`);
      
      setShowTokenSetupConfirm(false);
      setClickedTokenValue('');
      setClickedTokenPath('');
    } catch (error) {
      alert(`❌ Failed to configure bearer token: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Token setup error:', error);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
      else if ((e.ctrlKey || e.metaKey) && e.key === 'Tab') {
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
          
          // Parse retry response safely
          const retryResponseText = await response.text();
          try {
            const retryContentType = response.headers.get('content-type');
            if (retryContentType?.includes('application/json') || (retryResponseText && (retryResponseText.trim().startsWith('{') || retryResponseText.trim().startsWith('[')))) {
              data = retryResponseText ? JSON.parse(retryResponseText) : null;
            } else {
              data = retryResponseText || null;
            }
          } catch (error) {
            console.warn('Failed to parse retry response as JSON, returning as text:', error);
            data = retryResponseText || null;
          }
          
          const retryEndTime = Date.now();
          const duration = retryEndTime - retryStartTime;
          
          console.log('Request retried successfully with new token');
        } else {
          throw new Error('Failed to auto-login. Please check your credentials.');  
        }
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Auto-detect token in response
      if (response.status >= 200 && response.status < 300) {
        const detected = detectTokenInResponse(data);
        if (detected && detected.token !== authConfig.token) {
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

  // Render JSON with clickable token fields
  const renderClickableJSON = (data: any, path: string = '') => {
    if (typeof data !== 'object' || data === null) {
      return <span className="text-gray-700">{JSON.stringify(data)}</span>;
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
              <span className="text-[#FF6C37] font-medium">"{key}"</span>
              <span className="text-gray-500 mx-2">:</span>
              {isTokenField && isStringValue ? (
                <button
                  onClick={() => handleTokenClick(value as string, currentPath)}
                  className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-all text-left break-all"
                  title="Click to use this as bearer token"
                >
                  "{value}"
                </button>
              ) : typeof value === 'object' && value !== null ? (
                renderClickableJSON(value, currentPath)
              ) : (
                <span className="text-gray-700">{JSON.stringify(value)}</span>
              )}
              {index < arr.length - 1 ? ',' : ''}
            </div>
          );
        })}
        {'}'}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Left Sidebar - Collections (Postman-style) */}
      <div className="w-80 bg-white border-r border-gray-300 flex flex-col">
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-[#FF6C37]">
          <h2 className="text-white font-semibold text-sm">Collections</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowNewCollectionDialog(true)}
              className="p-1.5 text-white hover:bg-[#ff5722] rounded transition-colors"
              title="New Collection"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
            <label className="p-1.5 text-white hover:bg-[#ff5722] rounded cursor-pointer transition-colors" title="Import Collection">
              <ArrowDownOnSquareIcon className="h-4 w-4" />
              <input
                type="file"
                accept=".json"
                onChange={importCollection}
                className="hidden"
              />
            </label>
            {session && (
              <button
                onClick={async () => {
                  setSyncingCollections(true);
                  console.log('🔄 Manually syncing collections...');
                  await loadCollections();
                  setTimeout(() => setSyncingCollections(false), 1000);
                }}
                disabled={syncingCollections}
                className="p-1.5 text-white hover:bg-[#ff5722] rounded transition-colors disabled:opacity-50"
                title="Sync Collections"
              >
                <ArrowPathIcon className={`h-4 w-4 ${syncingCollections ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Collections List */}
        <div className="flex-1 overflow-y-auto">
          {collections.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <TableCellsIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-medium mb-1">No Collections</p>
              <p className="text-xs">Create a collection to organize requests</p>
            </div>
          ) : (
            <div className="py-2">
              {collections.map((collection) => (
                <div key={collection.id} className="mb-1">
                  <div 
                    className="flex items-center justify-between px-3 py-2 mx-2 hover:bg-gray-100 rounded cursor-pointer group"
                    onClick={() => toggleCollectionExpanded(collection.id)}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <button 
                        className="flex-shrink-0 w-4 h-4 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded"
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
                      <FolderIcon className="h-4 w-4 text-[#FF6C37] flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-900 truncate">{collection.name}</span>
                      <span className="text-xs text-gray-500 flex-shrink-0">({collection.requests.length})</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          exportCollection(collection);
                        }}
                        className="p-1 text-gray-600 hover:bg-gray-200 rounded"
                        title="Export Collection"
                      >
                        <ArrowUpOnSquareIcon className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCollection(collection.id);
                        }}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
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
                          className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded cursor-pointer group"
                          onClick={() => loadRequestFromCollection(request)}
                        >
                          <DocumentTextIcon className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            request.method === 'GET' ? 'bg-green-100 text-green-700' :
                            request.method === 'POST' ? 'bg-blue-100 text-blue-700' :
                            request.method === 'PUT' ? 'bg-yellow-100 text-yellow-700' :
                            request.method === 'DELETE' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {request.method}
                          </span>
                          <span className="text-sm text-gray-700 truncate flex-1">{request.name}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteRequestFromCollection(collection.id, request.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 text-red-600 hover:bg-red-50 rounded"
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

        {/* Sidebar Footer */}
        <div className="border-t border-gray-200 p-3 space-y-2">
          <button
            onClick={() => setShowVariables(!showVariables)}
            className="w-full px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors flex items-center gap-2"
          >
            <CodeBracketIcon className="h-4 w-4" />
            Environment Variables
          </button>
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="w-full px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors flex items-center gap-2"
          >
            <QuestionMarkCircleIcon className="h-4 w-4" />
            Help & Shortcuts
          </button>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <div className="bg-white border-b border-gray-300 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-gray-900">My Workspace</h1>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">API Tester</span>
          </div>
          <div className="flex items-center gap-2">
            {session && (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded text-xs">
                  <CheckIcon className="h-3 w-3 text-green-600" />
                  <span className="text-green-700 font-medium">{session.user?.email}</span>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/tools/api' })}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Sign Out
                </button>
                <button
                  onClick={() => setShowSaveDialog(true)}
                  className="px-3 py-1.5 text-sm font-medium bg-[#FF6C37] text-white rounded hover:bg-[#ff5722] transition-colors flex items-center gap-1.5"
                >
                  <DocumentDuplicateIcon className="h-4 w-4" />
                  Save
                </button>
              </>
            )}
            {!session && (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-4 py-1.5 text-sm font-medium bg-white text-[#FF6C37] border-2 border-[#FF6C37] rounded hover:bg-[#FF6C37] hover:text-white transition-colors"
                title="Sync collections across devices"
              >
                Save My Workspace
              </button>
            )}
          </div>
        </div>

      {/* Help Panel */}
      {showHelp && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-4">
          <div className="flex items-start justify-between mb-3">
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
          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <CommandLineIcon className="h-5 w-5" />
              <span>Keyboard Shortcuts</span>
            </p>
            <div className="grid md:grid-cols-2 gap-2 text-xs text-blue-800">
              <div><kbd className="px-2 py-1 bg-white rounded border border-blue-300">Ctrl/Cmd + T</kbd> New tab</div>
              <div><kbd className="px-2 py-1 bg-white rounded border border-blue-300">Ctrl/Cmd + W</kbd> Close tab</div>
              <div><kbd className="px-2 py-1 bg-white rounded border border-blue-300">Ctrl/Cmd + D</kbd> Duplicate tab</div>
              <div><kbd className="px-2 py-1 bg-white rounded border border-blue-300">Ctrl/Cmd + R</kbd> Rename tab</div>
              <div><kbd className="px-2 py-1 bg-white rounded border border-blue-300">Double-click</kbd> Rename tab</div>
              <div><kbd className="px-2 py-1 bg-white rounded border border-blue-300">Ctrl/Cmd + Tab</kbd> Next tab</div>
            </div>
          </div>
        </div>
      )}

      {/* Save Request Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Save Request to Collection</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Request Name</label>
                <input
                  type="text"
                  value={saveRequestName}
                  onChange={(e) => setSaveRequestName(e.target.value)}
                  placeholder="e.g., Get User Profile"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#FF6C37]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <textarea
                  value={saveRequestDescription}
                      onChange={(e) => setSaveRequestDescription(e.target.value)}
                      placeholder="Describe what this request does..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#FF6C37]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Collection</label>
                    <select
                      value={selectedCollectionId}
                      onChange={(e) => setSelectedCollectionId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#FF6C37]"
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
                    <p className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded">
                      No collections available. Create one first!
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <button
                    onClick={() => {
                      setShowSaveDialog(false);
                      setSaveRequestName('');
                      setSaveRequestDescription('');
                  setSelectedCollectionId('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveCurrentRequestToCollection}
                disabled={!saveRequestName.trim() || !selectedCollectionId}
                className="px-4 py-2 text-sm font-medium bg-[#FF6C37] text-white rounded hover:bg-[#ff5722] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Save Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Collection Dialog */}
      {showNewCollectionDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Collection</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Collection Name</label>
                <input
                  type="text"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="e.g., User API, Payment Endpoints"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#FF6C37]"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <textarea
                  value={newCollectionDescription}
                  onChange={(e) => setNewCollectionDescription(e.target.value)}
                  placeholder="Describe this collection..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#FF6C37]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowNewCollectionDialog(false);
                  setNewCollectionName('');
                  setNewCollectionDescription('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createCollection}
                disabled={!newCollectionName.trim()}
                className="px-4 py-2 text-sm font-medium bg-[#FF6C37] text-white rounded hover:bg-[#ff5722] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Create Collection
              </button>
            </div>
          </div>
        </div>
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
                  className="px-4 py-2 bg-white text-green-600 font-medium text-sm rounded hover:bg-green-50 transition-colors"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <LightBulbIcon className="h-6 w-6 text-indigo-600" />
                Bearer Token Quick Setup
              </h3>
              <button
                onClick={() => {
                  setShowBearerSetupWizard(false);
                  setBearerSetupStep(1);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-8">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center flex-1">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                    bearerSetupStep >= step
                      ? 'bg-[#FF6C37] text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step}
                  </div>
                  {step < 3 && (
                    <div className={`flex-1 h-1 mx-2 ${
                      bearerSetupStep > step ? 'bg-[#FF6C37]' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Login URL */}
            {bearerSetupStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Step 1: Enter Login API Endpoint
                  </label>
                  <input
                    type="text"
                    value={wizardLoginUrl}
                    onChange={(e) => setWizardLoginUrl(e.target.value)}
                    placeholder="https://api.example.com/auth/login"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6C37] focus:border-[#FF6C37]"
                    autoFocus
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Enter the URL of your login/authentication endpoint
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Login Payload */}
            {bearerSetupStep === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Step 2: Enter Login Payload (JSON)
                  </label>
                  <textarea
                    value={wizardRequestPayload}
                    onChange={(e) => setWizardRequestPayload(e.target.value)}
                    placeholder='{"username": "your_username", "password": "your_password"}'
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6C37] focus:border-[#FF6C37] font-mono text-sm"
                    rows={8}
                    autoFocus
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    This JSON payload will be sent in the login request body. It will be saved for auto-login when token expires.
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Token Path */}
            {bearerSetupStep === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Step 3: Token Field Name
                  </label>
                  <input
                    type="text"
                    value={wizardTokenPath}
                    onChange={(e) => setWizardTokenPath(e.target.value)}
                    placeholder="access_token"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6C37] focus:border-[#FF6C37]"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Where is the token in the response? Examples: <code className="bg-gray-100 px-1.5 py-0.5 rounded">access_token</code>, <code className="bg-gray-100 px-1.5 py-0.5 rounded">data.token</code>, <code className="bg-gray-100 px-1.5 py-0.5 rounded">result.jwt</code>
                  </p>
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800 flex items-start gap-2">
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
                    setShowBearerSetupWizard(false);
                  }
                }}
                className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {bearerSetupStep === 1 ? 'Cancel' : 'Back'}
              </button>
              <button
                onClick={setupBearerTokenWizard}
                className="px-6 py-3 text-sm font-bold bg-[#FF6C37] text-white rounded-lg hover:bg-[#ff5722] transition-colors shadow-sm hover:shadow-md"
              >
                {bearerSetupStep === 3 ? 'Test & Configure' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Token Setup Confirmation Dialog */}
      {showTokenSetupConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">🔐 Setup Bearer Token</h3>
              <button
                onClick={() => {
                  setShowTokenSetupConfirm(false);
                  setClickedTokenValue('');
                  setClickedTokenPath('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Token Field
                </label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm text-blue-600">
                  {clickedTokenPath}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Token Value
                </label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg font-mono text-xs text-gray-700 break-all">
                  {clickedTokenValue && clickedTokenValue.length > 100 
                    ? `${clickedTokenValue.substring(0, 50)}...${clickedTokenValue.substring(clickedTokenValue.length - 50)}`
                    : clickedTokenValue}
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 mb-2">
                  <strong>Auto-Login Configuration:</strong>
                </p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li className="flex items-start gap-1.5">
                    <CheckIcon className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                    <span>Login URL: <code className="bg-blue-100 px-1 py-0.5 rounded">{currentTab.url || 'Current URL'}</code></span>
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

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowTokenSetupConfirm(false);
                    setClickedTokenValue('');
                    setClickedTokenPath('');
                  }}
                  className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmTokenSetup}
                  className="flex-1 px-4 py-3 text-sm font-bold bg-[#FF6C37] text-white rounded-lg hover:bg-[#ff5722] transition-colors shadow-sm hover:shadow-md"
                >
                  Configure Bearer Auth
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Request Tabs */}
      <div className="bg-white border-b border-gray-300">
        <div className="flex items-center overflow-x-auto">
          <div className="flex flex-1 min-w-0">
            {tabs.map((tab, index) => (
              <div
                key={tab.id}
                className={`group flex items-center gap-2 px-4 py-2.5 border-r border-gray-200 cursor-pointer transition-colors min-w-fit ${
                  activeTabIndex === index
                    ? 'bg-white border-b-2 border-b-[#FF6C37]'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => setActiveTabIndex(index)}
                onDoubleClick={() => startRenaming(index)}
              >
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  activeTabIndex === index ? 'bg-[#FF6C37] text-white' : 'bg-gray-300 text-gray-700'
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
                    className="w-32 px-2 py-0.5 text-sm border border-[#FF6C37] rounded focus:outline-none"
                    autoFocus
                  />
                ) : (
                  <span className={`text-sm truncate max-w-[150px] ${
                    activeTabIndex === index ? 'text-gray-900 font-medium' : 'text-gray-600'
                  }`} title={tab.name}>
                    {tab.name}
                  </span>
                )}
                {tab.hasUnsavedChanges && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF6C37]" title="Unsaved changes" />
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
                  className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-gray-200 rounded transition-opacity"
                  title="Close tab"
                >
                  <XMarkIcon className="h-3.5 w-3.5 text-gray-500" />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={createNewTab}
            className="flex-shrink-0 px-3 py-2.5 hover:bg-gray-100 border-l border-gray-200 transition-colors"
            title="New request tab (Ctrl+T)"
          >
            <PlusIcon className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Main Content Area with Scroll */}
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="p-4">

      {/* Main Request Section */}
      <div className="bg-white rounded-lg shadow-sm">
        {/* URL Bar - Postman Style */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex gap-2 items-center">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as HttpMethod)}
              className={`px-3 py-2 border border-gray-300 rounded font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[100px] ${
                method === 'GET' ? 'text-green-600' :
                method === 'POST' ? 'text-orange-600' :
                method === 'PUT' ? 'text-yellow-600' :
                method === 'DELETE' ? 'text-red-600' :
                'text-gray-600'
              }`}
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && url.trim() && !loading) {
                    handleSubmit();
                  }
                }}
                placeholder="Enter URL or paste text"
                className="w-full px-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading || !url.trim()}
              className="px-6 py-2 bg-[#6366F1] hover:bg-[#5558E3] text-white text-sm font-semibold rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
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
            <button
              onClick={() => setShowSaveDialog(true)}
              className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium rounded transition-all flex items-center gap-1"
            >
              <DocumentDuplicateIcon className="h-4 w-4" />
              Save
            </button>
          </div>
          
          {/* Error Display */}
          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
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

        {/* Tabs for Request Configuration - Postman Style */}
        <div className="border-b border-gray-200 bg-white">
          <div className="flex px-6">
            <button
              onClick={() => setActiveTab('params')}
              className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'params'
                  ? 'text-gray-900 border-b-2 border-orange-500'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Parameters
            </button>
            <button
              onClick={() => setActiveTab('authorization')}
              className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'authorization'
                  ? 'text-gray-900 border-b-2 border-orange-500'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Authorization
            </button>
            <button
              onClick={() => setActiveTab('headers')}
              className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'headers'
                  ? 'text-gray-900 border-b-2 border-orange-500'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Headers
            </button>
            <button
              onClick={() => method !== 'GET' && setActiveTab('body')}
              className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'body' && method !== 'GET'
                  ? 'text-gray-900 border-b-2 border-orange-500'
                  : method === 'GET'
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              disabled={method === 'GET'}
              title={method === 'GET' ? 'GET requests cannot have a request body' : 'Request body content'}
            >
              Body
              {method === 'GET' && (
                <XMarkIcon className="h-3 w-3 inline-block ml-1" />
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
                <p className="text-sm text-gray-600">Configure authentication for your request (applies to all tabs automatically)</p>
                <button
                  onClick={() => setShowBearerSetupWizard(true)}
                  className="px-4 py-2 text-sm font-medium bg-[#FF6C37] text-white rounded hover:bg-[#ff5722] transition-colors flex items-center gap-2"
                >
                  <WrenchIcon className="h-4 w-4" />
                  Quick Setup Bearer Token
                </button>
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
                                const secondsUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / 1000);
                                
                                return (
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        {isExpired ? (
                                          <span className="text-red-600 font-medium flex items-center gap-1.5">
                                            <XMarkIcon className="h-4 w-4" />
                                            Token expired
                                          </span>
                                        ) : minutesUntilExpiry < 5 ? (
                                          <span className="text-orange-600 font-medium flex items-center gap-1.5">
                                            <ClockIcon className="h-4 w-4" />
                                            Expires in {minutesUntilExpiry}m {secondsUntilExpiry % 60}s
                                          </span>
                                        ) : (
                                          <span className="text-green-600 font-medium flex items-center gap-1.5">
                                            <CheckIcon className="h-4 w-4" />
                                            Valid until {expiryDate.toLocaleString()}
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-gray-500 text-[10px]">
                                        {isExpired ? 'EXPIRED' : `${minutesUntilExpiry}m ${secondsUntilExpiry % 60}s left`}
                                      </span>
                                    </div>
                                    
                                    {/* Testing Tools */}
                                    <div className="border-t border-gray-200 pt-2 mt-2">
                                      <p className="text-[10px] text-gray-500 mb-1.5 font-semibold uppercase tracking-wide">🧪 Testing Tools</p>
                                      <button
                                        onClick={() => {
                                          // Force expire the token by setting expiry to past
                                          const pastTimestamp = Math.floor(Date.now() / 1000) - 60;
                                          setAuthConfig({ 
                                            ...authConfig, 
                                            tokenExpiry: pastTimestamp
                                          });
                                          alert('✅ Token manually expired!\n\nOn your next request, the system will:\n1. Detect the expired token\n2. Automatically call your login endpoint\n3. Extract and use the new token\n\nMake a request to test the auto-refresh!');
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
                                          alert('Token expiry set to 30 seconds!\n\nWatch the countdown timer above.\nMake a request after 30 seconds to test auto-refresh.');
                                        }}
                                        className="px-3 py-1.5 text-[10px] font-medium bg-orange-100 text-orange-700 hover:bg-orange-200 rounded transition-colors flex items-center gap-1"
                                      >
                                        <ClockIcon className="h-3 w-3" />
                                        Expire in 30s
                                      </button>
                                    </div>
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
          {activeTab === 'body' && method === 'GET' && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <svg className="h-16 w-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              <p className="text-lg font-medium mb-2">Body Not Available for GET Requests</p>
              <p className="text-sm text-center max-w-md">
                GET requests cannot have a request body according to HTTP standards. 
                Use POST, PUT, PATCH, or DELETE to send data in the request body.
              </p>
              <div className="mt-6 flex gap-2">
                <button
                  onClick={() => setMethod('POST')}
                  className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Switch to POST
                </button>
                <button
                  onClick={() => setActiveTab('params')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                  Use Query Params Instead
                </button>
              </div>
            </div>
          )}

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
                <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded border border-blue-100 flex items-start gap-2">
                  <LightBulbIcon className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span><strong>Tip:</strong> Paste your JSON here. It will be automatically validated and formatted.</span>
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
                <div className="flex items-center gap-3 text-sm">
                  <span className={`font-medium ${
                    responseMetrics.status >= 200 && responseMetrics.status < 300
                      ? 'text-green-600'
                      : responseMetrics.status >= 400 && responseMetrics.status < 500
                      ? 'text-orange-600'
                      : 'text-red-600'
                  }`}>
                    {responseMetrics.status} • {getStatusText(responseMetrics.status)}
                  </span>
                  <span className="text-gray-400">•</span>
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <ClockIcon className="h-4 w-4" />
                    <span>{responseMetrics.time}ms</span>
                  </div>
                  <span className="text-gray-400">•</span>
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <DocumentTextIcon className="h-4 w-4" />
                    <span>{(responseMetrics.size / 1024).toFixed(2)} KB</span>
                  </div>
                </div>
              )}
            </div>
            {loading && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Loading...</span>
              </div>
            )}
          </div>
        </div>

        {/* Response Tabs */}
        {response && (
          <>
            <div className="border-b border-gray-200 bg-white">
              <div className="flex px-6">
                <button
                  onClick={() => setShowResponseBody(true)}
                  className={`px-4 py-3 text-sm font-medium transition-colors ${
                    showResponseBody
                      ? 'text-orange-600 border-b-2 border-orange-500'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Body
                </button>
                <button
                  onClick={() => {
                    setShowResponseBody(false);
                    setShowResponseHeaders(true);
                  }}
                  className={`px-4 py-3 text-sm font-medium transition-colors ${
                    showResponseHeaders && !showResponseBody
                      ? 'text-orange-600 border-b-2 border-orange-500'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Headers
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
                  
                  {/* Clickable JSON View */}
                  <div className="border border-gray-200 rounded-md p-4 bg-gray-50 overflow-auto max-h-[450px]">
                    <div className="text-xs mb-3 text-gray-500 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Click token fields to setup bearer auth
                      </span>
                    </div>
                    <div className="font-mono text-sm">
                      {response && renderClickableJSON(response.data)}
                    </div>
                  </div>
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
                              <span className="text-red-600 font-medium flex items-center gap-1.5">
                                <XMarkIcon className="h-4 w-4" />
                                Token expired
                              </span>
                            ) : minutesUntilExpiry < 5 ? (
                              <span className="text-orange-600 font-medium flex items-center gap-1.5">
                                <ClockIcon className="h-4 w-4" />
                                Expires in {minutesUntilExpiry} minutes
                              </span>
                            ) : (
                              <span className="text-green-600 font-medium flex items-center gap-1.5">
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
                        <p className="font-medium mb-1 flex items-center gap-1.5">
                          <LightBulbIcon className="h-4 w-4" />
                          Common token paths:
                        </p>
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

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-900">Save Your Workspace</h3>
              <button
                onClick={() => setShowAuthModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            
            <p className="text-gray-600 mb-6 text-sm">
              Connect with your Google account to sync your API collections across all devices
            </p>

            {/* Benefits */}
            <div className="mb-6 space-y-2.5">
              <div className="flex items-start gap-2.5">
                <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">Save and organize API requests in collections</p>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">Sync your data across all devices</p>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">Access your collections from anywhere</p>
              </div>
            </div>

            {/* Google Sign In Button */}
            <button
              onClick={() => signIn('google', { callbackUrl: window.location.pathname })}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
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
              <span className="font-semibold text-gray-700">Continue with Google</span>
            </button>

            {/* Info Note */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <p className="text-xs text-blue-800">
                <span className="font-semibold">Note:</span> You can continue using the API Tester without connecting. Your collections will be saved locally in your browser.
              </p>
            </div>

            {/* Footer */}
            <p className="mt-4 text-center text-xs text-gray-500">
              By connecting, you agree to our{' '}
              <a href="/terms-of-service" className="text-[#FF6C37] hover:underline">
                Terms of Service
              </a>
              {' '}and{' '}
              <a href="/privacy-policy" className="text-[#FF6C37] hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      )}
      </div>
      </div>
      </div>
    </div>
  );
} 

// Export without authentication requirement
// Users can use API Tester freely, but need to connect to save collections
export default function APITester() {
  return <APITesterContent />;
}
