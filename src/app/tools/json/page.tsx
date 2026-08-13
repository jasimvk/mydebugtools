'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  ClipboardIcon, 
  ArrowDownTrayIcon, 
  FolderOpenIcon, 
  LinkIcon, 
  ChevronDownIcon, 
  ChevronUpIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  ArrowsPointingInIcon,
  XMarkIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';
import { jsonrepair } from 'jsonrepair';

type JsonValue = any;

// Simple Minimal JSON Tree Component
interface JSONTreeNodeProps {
  data: any;
  name?: string;
  path?: string;
  // Structured key chain for this node. Unlike `path` it survives keys that
  // themselves contain '.', '[' or ']', so lookups never have to re-parse.
  keys?: Array<string | number>;
  level?: number;
  searchTerm?: string;
  onSelect?: (path: string, node: any, keys: Array<string | number>) => void;
  expandAll?: boolean;
}

const JSONTreeNode: React.FC<JSONTreeNodeProps> = ({
  data,
  name,
  path = '',
  keys = [],
  level = 0,
  searchTerm = '',
  onSelect,
  expandAll = false
}) => {
  const [isExpanded, setIsExpanded] = useState(expandAll || level === 0);
  const isExpandable = data !== null && typeof data === 'object';
  const isArray = Array.isArray(data);
  
  // Update expansion when expandAll prop changes
  useEffect(() => {
    if (expandAll !== undefined) {
      setIsExpanded(expandAll);
    }
  }, [expandAll]);
  
  const getValueColor = (value: any): string => {
    if (value === null) return '#999';
    if (typeof value === 'string') return '#059669';
    if (typeof value === 'number') return '#2563eb';
    if (typeof value === 'boolean') return '#7c3aed';
    return '#333';
  };

  const getValueDisplay = (value: any): string => {
    if (value === null) return 'null';
    if (typeof value === 'string') return `"${value}"`;
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    return String(value);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleClick = () => {
    if (onSelect && path) {
      onSelect(path, data, keys);
    }
  };

  // Check if this node matches search
  const matchesSearch = (obj: any, term: string): boolean => {
    if (!term) return true;
    const termLower = term.toLowerCase();
    
    const checkValue = (val: any): boolean => {
      if (val === null && 'null'.includes(termLower)) return true;
      if (typeof val === 'string' && val.toLowerCase().includes(termLower)) return true;
      if (typeof val === 'number' && val.toString().includes(termLower)) return true;
      if (typeof val === 'boolean' && val.toString().includes(termLower)) return true;
      
      if (typeof val === 'object' && val !== null) {
        if (Array.isArray(val)) {
          return val.some(checkValue);
        }
        return Object.entries(val).some(([k, v]) => 
          k.toLowerCase().includes(termLower) || checkValue(v)
        );
      }
      return false;
    };
    
    return checkValue(obj);
  };

  // Expand automatically if searching
  useEffect(() => {
    if (searchTerm && isExpandable) {
      setIsExpanded(true);
    }
  }, [searchTerm, isExpandable]);

  const shouldShow = !searchTerm || matchesSearch(data, searchTerm) || (name && name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (!shouldShow) {
    return null;
  }

  // Highlight search matches
  const highlightMatch = (text: string, term: string) => {
    if (!term) return text;
    const index = text.toLowerCase().indexOf(term.toLowerCase());
    if (index === -1) return text;
    
    return (
      <>
        {text.substring(0, index)}
        <mark className="bg-yellow-200 text-gray-900 px-0.5 rounded">{text.substring(index, index + term.length)}</mark>
        {text.substring(index + term.length)}
      </>
    );
  };

  // Leaf node (primitive value)
  if (!isExpandable) {
    const nameMatches = searchTerm && name && name.toLowerCase().includes(searchTerm.toLowerCase());
    const valueStr = getValueDisplay(data);
    const valueMatches = searchTerm && valueStr.toLowerCase().includes(searchTerm.toLowerCase());

    return (
      <div 
        className="flex items-center font-mono text-sm py-0.5 hover:bg-gray-50 cursor-pointer"
        onClick={handleClick}
      >
        <span className="w-4"></span>
        {name && (
          <>
            <span className="text-blue-600 font-medium mr-1">
              {nameMatches ? highlightMatch(name, searchTerm) : name}
            </span>
            <span className="text-gray-400 mr-1">:</span>
          </>
        )}
        <span style={{ color: getValueColor(data) }}>
          {valueMatches ? highlightMatch(valueStr, searchTerm) : valueStr}
        </span>
      </div>
    );
  }

  const entries = isArray 
    ? (data as any[]).map((item, index) => [index, item])
    : Object.entries(data);

  const nameMatches = searchTerm && name && name.toLowerCase().includes(searchTerm.toLowerCase());

  return (
    <div className="font-mono text-sm">
      <div 
        className="flex items-center py-0.5 hover:bg-gray-50 cursor-pointer"
        onClick={handleToggle}
      >
        {/* Simple Plus/Minus Button */}
        <button
          onClick={handleToggle}
          className="flex-shrink-0 w-4 h-4 flex items-center justify-center text-gray-500 hover:text-gray-700 mr-1.5 text-xs font-bold"
          title={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded ? '−' : '+'}
        </button>

        {/* Key Name */}
        {name && (
          <>
            <span className="text-blue-600 font-medium mr-1">
              {nameMatches ? highlightMatch(name, searchTerm) : name}
            </span>
            <span className="text-gray-400 mr-1">:</span>
          </>
        )}

        {/* Opening Bracket */}
        <span className="text-gray-600">{isArray ? '[' : '{'}</span>
        
        {/* Item count when collapsed */}
        {!isExpanded && entries.length > 0 && (
          <span className="text-gray-400 text-xs ml-1">
            {entries.length}
          </span>
        )}
        
        {/* Closing bracket when collapsed */}
        {!isExpanded && (
          <span className="text-gray-600 ml-1">{isArray ? ']' : '}'}</span>
        )}
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <>
          <div className="ml-5 border-l border-gray-300 pl-2">
            {entries.length === 0 ? (
              <div className="text-gray-400 text-xs py-1">empty</div>
            ) : (
              entries.map(([key, value], index) => {
                const childPath = path ? `${path}.${key}` : String(key);
                return (
                  <JSONTreeNode
                    key={index}
                    data={value}
                    name={String(key)}
                    path={childPath}
                    keys={[...keys, key as string | number]}
                    level={level + 1}
                    searchTerm={searchTerm}
                    onSelect={onSelect}
                    expandAll={expandAll}
                  />
                );
              })
            )}
          </div>
          <div className="text-gray-600">{isArray ? ']' : '}'}</div>
        </>
      )}
    </div>
  );
};

export default function JSONTools() {
  const [jsonInput, setJsonInput] = useState<string>(`{
  "name": "debugtools",
  "version": "1.0.0",
  "description": "JSON Viewer Tool",
  "features": {
    "formatting": true,
    "validation": true,
    "search": true
  },
  "users": [
    {
      "id": 1,
      "name": "John Developer",
      "role": "Frontend Developer",
      "active": true
    },
    {
      "id": 2,
      "name": "Sarah Designer",
      "role": "UI/UX Designer",
      "active": true
    }
  ],
  "metadata": {
    "created": "2024-01-01",
    "environment": "production"
  }
}`);
  const [parsedJson, setParsedJson] = useState<JsonValue>({});
  const [expandAll, setExpandAll] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'tree' | 'text'>('text');
  const [isPretty, setIsPretty] = useState(true);
  const [loadingUrl, setLoadingUrl] = useState(false);
  const [selectedPath, setSelectedPath] = useState<string>('');
  const [selectedKeys, setSelectedKeys] = useState<Array<string | number>>([]);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [jsonStats, setJsonStats] = useState({ lines: 0, chars: 0, size: '0 B' });
  const [isValid, setIsValid] = useState(true);
  const [showStatsModal, setShowStatsModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);
  const treeContainerRef = useRef<HTMLDivElement>(null);

  // Parse JSON input text to object
  const parseJsonInput = useCallback((input = jsonInput) => {
    try {
      const parsed = JSON.parse(input);
      setParsedJson(parsed);
      setError('');
      setIsValid(true);

      // Update stats
      const lines = input.split('\n').length;
      const chars = input.length;
      const size = new Blob([input]).size;
      const sizeStr = size < 1024 ? `${size} B` : 
                     size < 1024 * 1024 ? `${(size / 1024).toFixed(2)} KB` :
                     `${(size / (1024 * 1024)).toFixed(2)} MB`;
      setJsonStats({ lines, chars, size: sizeStr });
    } catch (e) {
      setError('Invalid JSON: ' + (e as Error).message);
      setIsValid(false);
    }
  }, [jsonInput]);

  // On initial load parse the default JSON input
  useEffect(() => {
    parseJsonInput();
  }, [parseJsonInput]);

  // Auto-parse when switching to tree tab
  useEffect(() => {
    if (activeTab === 'tree') {
      parseJsonInput();
    }
  }, [activeTab, parseJsonInput]);

  // Copy text to clipboard
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setError('');
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      setError('Failed to copy to clipboard: ' + (e as Error).message);
    }
  };

  // Download JSON file
  const handleDownload = () => {
    try {
      const blob = new Blob([jsonInput], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'json-data.json';
      // Firefox only honours the click when the anchor is in the document, and
      // revoking the URL synchronously cancels the download in flight.
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      setError('Failed to download JSON: ' + (e as Error).message);
    }
  };

  // Load file from input
  const handleFileLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setJsonInput(text);
      setActiveTab('text');
      parseJsonInput(text);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Load JSON from URL
  const handleLoadUrl = async () => {
    const url = urlInputRef.current?.value.trim();
    if (!url) return;
    setLoadingUrl(true);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      const text = await res.text();
      setJsonInput(text);
      setActiveTab('text');
      parseJsonInput(text);
      urlInputRef.current!.value = '';
      setError('');
    } catch (e) {
      setError('Failed to load URL: ' + (e as Error).message);
    } finally {
      setLoadingUrl(false);
    }
  };

  // Expand or collapse all in tree view
  const toggleExpandCollapse = () => {
    setExpandAll(!expandAll);
  };

  // Pretty or minify toggle
  const togglePretty = () => {
    try {
      const obj = JSON.parse(jsonInput);
      if (isPretty) {
        // Minify
        setJsonInput(JSON.stringify(obj));
        setIsPretty(false);
      } else {
        // Pretty
        setJsonInput(JSON.stringify(obj, null, 2));
        setIsPretty(true);
      }
      setError('');
    } catch (e) {
      setError('Invalid JSON: ' + (e as Error).message);
    }
  };

  // Format JSON (always prettify)
  const handleFormat = () => {
    try {
      const obj = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(obj, null, 2));
      setIsPretty(true);
      setError('');
    } catch (e) {
      setError('Invalid JSON: ' + (e as Error).message);
    }
  };

  // Remove white space (minify)
  const handleRemoveWhiteSpace = () => {
    try {
      const obj = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(obj));
      setIsPretty(false);
      setError('');
    } catch (e) {
      setError('Invalid JSON: ' + (e as Error).message);
    }
  };

  const handleRepair = () => {
    try {
      const repaired = jsonrepair(jsonInput);
      const parsed = JSON.parse(repaired);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonInput(formatted);
      parseJsonInput(formatted);
      setIsPretty(true);
      setActiveTab('text');
      setError('');
    } catch (e) {
      setError('Repair failed: ' + (e as Error).message);
    }
  };

  // Paste from clipboard
  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setJsonInput(text);
      setActiveTab('text');
      parseJsonInput(text);
      try {
        const obj = JSON.parse(text);
        const formatted = JSON.stringify(obj, null, 2);
        setJsonInput(formatted);
        setIsPretty(true);
        parseJsonInput(formatted);
      } catch {
        // If invalid, just show the pasted text
      }
    } catch (e) {
      setError('Failed to paste from clipboard. Please paste manually.');
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    // True while the user is typing somewhere — the URL field, the editor, etc.
    // Hijacking clipboard/format shortcuts there clobbers what they are editing.
    const isEditing = () => {
      const el = document.activeElement as HTMLElement | null;
      if (!el) return false;
      return el.tagName === 'TEXTAREA' || el.tagName === 'INPUT' || el.isContentEditable;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + F for format
      if ((e.ctrlKey || e.metaKey) && e.key === 'f' && !isEditing()) {
        e.preventDefault();
        handleFormat();
      }
      // Ctrl/Cmd + M for minify
      if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
        e.preventDefault();
        handleRemoveWhiteSpace();
      }
      // Ctrl/Cmd + V when not editing
      if ((e.ctrlKey || e.metaKey) && e.key === 'v' && !isEditing()) {
        e.preventDefault();
        handlePasteFromClipboard();
      }
      // Ctrl/Cmd + C for copy
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && !isEditing()) {
        e.preventDefault();
        handleCopy(jsonInput);
      }
      // Ctrl/Cmd + E for expand/collapse all (in tree view)
      if ((e.ctrlKey || e.metaKey) && e.key === 'e' && activeTab === 'tree') {
        e.preventDefault();
        toggleExpandCollapse();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jsonInput, activeTab]);

  // Filter JSON for search term (keys and all values: strings, numbers, booleans, null)
  const filteredJson = (obj: any, term: string): any => {
    if (!term) return obj;
    const termLower = term.toLowerCase();

    const filterRecursive = (value: any): any => {
      // Check if the value itself matches
      if (value === null && 'null'.includes(termLower)) return value;
      if (typeof value === 'string' && value.toLowerCase().includes(termLower)) return value;
      if (typeof value === 'number' && value.toString().includes(termLower)) return value;
      if (typeof value === 'boolean' && value.toString().includes(termLower)) return value;
      
      // If not an object, return null (no match)
      if (typeof value !== 'object' || value === null) return null;

      if (Array.isArray(value)) {
        const filteredArr = value.map(filterRecursive).filter(v => v !== null);
        return filteredArr.length > 0 ? filteredArr : null;
      }

      const filteredObj: any = {};
      for (const key in value) {
        const keyMatch = key.toLowerCase().includes(termLower);
        const filteredValue = filterRecursive(value[key]);
        if (keyMatch) {
          // If key matches, include entire value
          filteredObj[key] = value[key];
        } else if (filteredValue !== null) {
          // If value matches, include it
          filteredObj[key] = filteredValue;
        }
      }
      return Object.keys(filteredObj).length > 0 ? filteredObj : null;
    };

    return filterRecursive(obj);
  };

  // Count search results
  const countSearchResults = (obj: any, term: string): number => {
    if (!term || !obj) return 0;
    const termLower = term.toLowerCase();
    let count = 0;

    const countRecursive = (value: any): void => {
      if (value === null && 'null'.includes(termLower)) {
        count++;
        return;
      }
      if (typeof value === 'string' && value.toLowerCase().includes(termLower)) {
        count++;
        return;
      }
      if (typeof value === 'number' && value.toString().includes(termLower)) {
        count++;
        return;
      }
      if (typeof value === 'boolean' && value.toString().includes(termLower)) {
        count++;
        return;
      }
      
      if (typeof value !== 'object' || value === null) return;

      if (Array.isArray(value)) {
        value.forEach(countRecursive);
      } else {
        for (const key in value) {
          if (key.toLowerCase().includes(termLower)) {
            count++;
          }
          countRecursive(value[key]);
        }
      }
    };

    countRecursive(obj);
    return count;
  };

  // Count every object key in the document (arrays contribute their items' keys)
  const countTotalKeys = (value: any): number => {
    if (value === null || typeof value !== 'object') return 0;
    if (Array.isArray(value)) {
      return value.reduce((sum: number, item) => sum + countTotalKeys(item), 0);
    }
    return Object.keys(value).length +
      Object.values(value).reduce((sum: number, item) => sum + countTotalKeys(item), 0);
  };

  // Highlight matching keys and values in react-json-view by overriding style
  // react-json-view does not support custom highlight natively, so we rely on filteredJson to reduce displayed nodes.

  // Sample JSON for demo
  const handleSample = () => {
    const sample = {
      name: "debugtools JSON Example",
      version: "2.0.0",
      features: { formatting: true, validation: true, minification: true },
      users: [
        { id: 1, name: "John Developer", role: "Frontend Developer", active: true, skills: ["React", "TypeScript", "JSON"] },
        { id: 2, name: "Sarah Designer", role: "UI/UX Designer", active: true, skills: ["Figma", "CSS", "Design Systems"] }
      ],
      metadata: { created: "2024-01-01T00:00:00Z", lastModified: new Date().toISOString(), environment: "production" }
    };
    const text = JSON.stringify(sample, null, 2);
    setJsonInput(text);
    setActiveTab('text');
    parseJsonInput(text);
  };

  // Reset all
  const handleReset = () => {
    setJsonInput('{}');
    setParsedJson({});
    setError('');
    setSearchTerm('');
    setActiveTab('tree');
  };

  // Handle paste in tree view area
  const handlePasteInTree = async (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text');
    if (text) {
      setJsonInput(text);
      parseJsonInput(text);
    }
  };

  // Extract immediate keys and values for right panel
  const extractImmediateProperties = (obj: any): Array<[string, any]> => {
    if (obj === null || obj === undefined) return [];
    if (typeof obj !== 'object') return [];
    
    if (Array.isArray(obj)) {
      return obj.map((item, index) => [String(index), item]);
    }
    
    return Object.entries(obj);
  };

  // Navigate by key chain rather than by parsing a path string, so keys that
  // contain '.', '[' or ']' still resolve.
  const handleSelectKeys = (keys: Array<string | number>) => {
    if (keys.length === 0) {
      setSelectedNode(null);
      setSelectedPath('');
      setSelectedKeys([]);
      setSearchTerm('');
      return;
    }

    let node: any = parsedJson;
    for (const key of keys) {
      if (node && typeof node === 'object') {
        node = node[key as keyof typeof node];
      } else {
        node = undefined;
        break;
      }
    }

    setSelectedNode(node ?? null);
    setSelectedKeys(keys);
    setSelectedPath(keys.join('.'));
    setSearchTerm('');

    if (activeTab !== 'tree') {
      setActiveTab('tree');
    }
  };

  // Note: Custom click handler removed - using react-json-view's onSelect instead

  return (
    <div className="mx-auto max-w-[1600px] text-[#09090b]">
      <section className="rounded-md border border-[#e4e4e7] bg-white">
        <div className="flex flex-col justify-between gap-4 border-b border-[#e4e4e7] px-5 py-4 lg:flex-row lg:items-end">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-[#71717a]">
              tools/json
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-[#09090b]">JSON Tools</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <button title="Load sample JSON" onClick={handleSample} className="rounded-md border border-[#e4e4e7] bg-white px-3 py-2 text-sm font-semibold text-[#09090b] hover:bg-[#fafafa]">
              Sample
            </button>
            <button onClick={() => setShowStatsModal(true)} className="rounded-md border border-[#e4e4e7] bg-white px-3 py-2 text-sm font-semibold text-[#09090b] hover:bg-[#fafafa]">
              Stats
            </button>
            <button onClick={handleDownload} className="inline-flex items-center gap-2 rounded-md bg-[#09090b] px-3 py-2 text-sm font-semibold text-white hover:bg-[#32383f]">
              <ArrowDownTrayIcon className="h-4 w-4" />
              Download
            </button>
          </div>
        </div>

        <div className="grid gap-3 border-b border-[#e4e4e7] bg-[#fafafa] px-4 py-3 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex overflow-hidden rounded-md border border-[#e4e4e7] bg-white" role="tablist" aria-label="JSON view">
              {(['text', 'tree'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 text-sm font-semibold capitalize transition-colors ${
                    activeTab === tab
                      ? 'bg-[#09090b] text-white'
                      : 'text-[#71717a] hover:bg-[#fafafa] hover:text-[#09090b]'
                  }`}
                  role="tab"
                  id={`json-tab-${tab}`}
                  aria-selected={activeTab === tab}
                  aria-controls={`json-panel-${tab}`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <button onClick={handlePasteFromClipboard} className="inline-flex items-center gap-1.5 rounded-md border border-[#e4e4e7] bg-white px-3 py-1.5 text-sm font-semibold text-[#71717a] hover:bg-white hover:text-[#09090b]">
              <ClipboardDocumentListIcon className="h-4 w-4" />
              Paste
            </button>
            <button onClick={() => handleCopy(jsonInput)} className="inline-flex items-center gap-1.5 rounded-md border border-[#e4e4e7] bg-white px-3 py-1.5 text-sm font-semibold text-[#71717a] hover:bg-white hover:text-[#09090b]">
              <ClipboardIcon className="h-4 w-4" />
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button onClick={handleFormat} className="inline-flex items-center gap-1.5 rounded-md border border-[#e4e4e7] bg-white px-3 py-1.5 text-sm font-semibold text-[#71717a] hover:bg-white hover:text-[#09090b]">
              <DocumentTextIcon className="h-4 w-4" />
              Format
            </button>
            <button onClick={handleRemoveWhiteSpace} className="inline-flex items-center gap-1.5 rounded-md border border-[#e4e4e7] bg-white px-3 py-1.5 text-sm font-semibold text-[#71717a] hover:bg-white hover:text-[#09090b]">
              <ArrowsPointingInIcon className="h-4 w-4" />
              Minify
            </button>
            <button onClick={handleRepair} className="inline-flex items-center gap-1.5 rounded-md border border-[#e4e4e7] bg-white px-3 py-1.5 text-sm font-semibold text-[#71717a] hover:bg-white hover:text-[#09090b]">
              <DocumentTextIcon className="h-4 w-4" />
              Repair
            </button>
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-[#e4e4e7] bg-white px-3 py-1.5 text-sm font-semibold text-[#71717a] hover:bg-white hover:text-[#09090b]">
              <ArrowUpTrayIcon className="h-4 w-4" />
              Load
              <input type="file" ref={fileInputRef} className="hidden" accept=".json,.txt" onChange={handleFileLoad} />
            </label>
            <button title="Clear input" onClick={handleReset} className="inline-flex items-center gap-1.5 rounded-md border border-[#e4e4e7] bg-white px-3 py-1.5 text-sm font-semibold text-[#71717a] hover:bg-white hover:text-[#09090b]">
              <XMarkIcon className="h-4 w-4" />
              Clear
            </button>
          </div>

          <div className="flex gap-2">
            <input
              ref={urlInputRef}
              type="url"
              placeholder="Load from URL"
              className="h-9 min-w-0 flex-1 rounded-md border border-[#e4e4e7] bg-white px-3 text-sm text-[#09090b] outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/15 lg:w-72"
            />
            <button onClick={handleLoadUrl} disabled={loadingUrl} className="inline-flex items-center gap-1.5 rounded-md border border-[#e4e4e7] bg-white px-3 py-1.5 text-sm font-semibold text-[#71717a] hover:bg-white hover:text-[#09090b] disabled:opacity-60">
              <LinkIcon className="h-4 w-4" />
              {loadingUrl ? 'Loading' : 'Load'}
            </button>
          </div>
        </div>

        {activeTab === 'text' && (
          <textarea
            data-testid="monaco-editor"
            id="json-panel-text"
            role="tabpanel"
            aria-labelledby="json-tab-text"
            aria-label="JSON text editor"
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className="h-[640px] w-full resize-y border-0 bg-white p-4 font-mono text-sm leading-6 text-[#09090b] outline-none focus:ring-2 focus:ring-[#2563eb]/15"
            placeholder="Paste JSON..."
            spellCheck={false}
            style={{ tabSize: 2 }}
          />
        )}

        {/* Rendered for any parsed value: falsy-but-valid JSON (0, false, null, "")
            must still show the tree; invalid JSON falls through to the error box. */}
        {activeTab === 'tree' && (
          <div id="json-panel-tree" role="tabpanel" aria-labelledby="json-tab-tree">
            <div className="grid gap-2 border-b border-[#e4e4e7] bg-white px-4 py-3 lg:grid-cols-[1fr_auto]">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search keys and values"
                  className="h-9 w-full rounded-md border border-[#e4e4e7] bg-white pl-9 pr-9 text-sm outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/15"
                />
                <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#71717a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded text-[#71717a] hover:bg-[#fafafa]" title="Clear search">
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {searchTerm && (
                  <span className="font-mono text-xs text-[#71717a]">
                    {countSearchResults(parsedJson, searchTerm)} matches
                  </span>
                )}
                <button onClick={toggleExpandCollapse} className="inline-flex items-center gap-1.5 rounded-md border border-[#e4e4e7] bg-white px-3 py-1.5 text-sm font-semibold text-[#71717a] hover:bg-[#fafafa] hover:text-[#09090b]">
                  {expandAll ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
                  {expandAll ? 'Collapse' : 'Expand'}
                </button>
              </div>
            </div>

            <div className="grid min-h-[640px] bg-white lg:grid-cols-[minmax(0,1fr)_320px]">
              <div
                ref={treeContainerRef}
                className="overflow-auto border-b border-[#e4e4e7] p-4 lg:border-b-0 lg:border-r json-tree-container"
                onPaste={handlePasteInTree}
                tabIndex={0}
              >
              {error ? (
                <div className="p-3 bg-red-50 border border-red-200 rounded">
                  <p className="font-semibold text-sm text-red-700 mb-1">Error</p>
                  <p className="text-xs text-red-600 font-mono">{error}</p>
                </div>
              ) : (
                <JSONTreeNode
                  data={filteredJson(parsedJson, searchTerm) ?? {}}
                  searchTerm={searchTerm}
                  expandAll={expandAll}
                  onSelect={(path, node, keys) => {
                    setSelectedPath(path);
                    setSelectedKeys(keys);
                    setSelectedNode(node);
                  }}
                />
              )}
            </div>

            {/* Right Panel - Minimalistic Details (Always Visible) */}
            <div className="bg-[#fafafa] overflow-auto">
              {/* Simple Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-3 z-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700">Details</h3>
                  {selectedNode !== null && (
                    <button
                      onClick={() => {
                        setSelectedNode(null);
                        setSelectedPath('');
                        setSelectedKeys([]);
                      }}
                      className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
                      title="Clear"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="p-3 space-y-3">
                {selectedNode !== null ? (
                  <>
                    {/* Path */}
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Path</label>
                      <div className="p-2 bg-white border border-gray-200 rounded font-mono text-xs text-gray-700 break-all">
                        {selectedPath || 'root'}
                      </div>
                    </div>

                    {/* Type */}
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Type</label>
                      <div className="flex gap-2 items-center">
                        <span className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-medium text-gray-700">
                          {Array.isArray(selectedNode) 
                            ? 'Array' 
                            : typeof selectedNode === 'object' && selectedNode !== null
                            ? 'Object'
                            : typeof selectedNode === 'string'
                            ? 'String'
                            : typeof selectedNode === 'number'
                            ? 'Number'
                            : typeof selectedNode === 'boolean'
                            ? 'Boolean'
                            : 'Null'}
                        </span>
                        
                        {(typeof selectedNode === 'object' && selectedNode !== null) && (
                          <span className="text-xs text-gray-500">
                            {Object.keys(selectedNode).length} {Array.isArray(selectedNode) ? 'items' : 'props'}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Properties */}
                    {(typeof selectedNode === 'object' && selectedNode !== null) && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">
                          Properties
                        </label>
                        <div className="bg-white border border-gray-200 rounded overflow-hidden">
                          <div className="max-h-80 overflow-y-auto">
                            <table className="w-full text-xs">
                              <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
                                <tr>
                                  <th className="text-left p-2 font-medium text-gray-600">Key</th>
                                  <th className="text-left p-2 font-medium text-gray-600">Value</th>
                                </tr>
                              </thead>
                              <tbody>
                                {extractImmediateProperties(selectedNode).length === 0 ? (
                                  <tr>
                                    <td colSpan={2} className="p-3 text-center text-gray-400 text-xs">
                                      Empty
                                    </td>
                                  </tr>
                                ) : (
                                  extractImmediateProperties(selectedNode).map(([key, value], index) => (
                                    <tr 
                                      key={index} 
                                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                                      onClick={() => handleSelectKeys([...selectedKeys, Array.isArray(selectedNode) ? Number(key) : key])}
                                    >
                                      <td className="p-2 font-medium text-gray-700">{key}</td>
                                      <td className="p-2 text-gray-600 font-mono truncate max-w-[120px]" title={String(value)}>
                                        {typeof value === 'object' && value !== null 
                                          ? Array.isArray(value) 
                                            ? `[${value.length}]`
                                            : `{${Object.keys(value).length}}`
                                          : String(value)}
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Value for Primitives */}
                    {!(typeof selectedNode === 'object' && selectedNode !== null) && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Value</label>
                        <div className="p-2 bg-white border border-gray-200 rounded font-mono text-xs text-gray-700 break-all">
                          {String(selectedNode)}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-sm text-gray-500">Select a node</p>
                    <p className="text-xs text-gray-400 mt-1">to view details</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      </section>

      {error && (
        <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3">
          <p className="text-red-700 font-semibold text-sm">Error</p>
          <p className="text-red-600 text-xs mt-1">{error}</p>
        </div>
      )}

      {/* Statistics Modal */}
      {showStatsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowStatsModal(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                JSON Statistics
              </h3>
              <button
                onClick={() => setShowStatsModal(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* General Stats */}
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                  <span className="text-sm font-medium text-gray-700">Lines</span>
                  <span className="text-lg font-bold text-blue-600">{jsonStats.lines}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded border-l-4 border-green-500">
                  <span className="text-sm font-medium text-gray-700">Characters</span>
                  <span className="text-lg font-bold text-green-600">{jsonStats.chars.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded border-l-4 border-purple-500">
                  <span className="text-sm font-medium text-gray-700">File Size</span>
                  <span className="text-lg font-bold text-purple-600">{jsonStats.size}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                  <span className="text-sm font-medium text-gray-700">Status</span>
                  <span className={`text-sm font-bold ${isValid ? 'text-green-600' : 'text-red-600'}`}>
                    {isValid ? '✓ Valid JSON' : '✗ Invalid JSON'}
                  </span>
                </div>
              </div>

              {/* Object Stats */}
              {isValid && parsedJson !== null && typeof parsedJson === 'object' && (
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Structure Analysis</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-50 rounded text-center">
                      <div className="text-2xl font-bold text-gray-700">
                        {Object.keys(parsedJson).length}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Root Keys</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded text-center">
                      <div className="text-2xl font-bold text-gray-700">
                        {countTotalKeys(parsedJson)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Total Keys</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-2 p-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowStatsModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
