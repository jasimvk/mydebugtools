'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { JSONTree } from 'react-json-tree';
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

type JsonValue = any;

// Theme for JSONTree - Modern, consistent style
const jsonTreeTheme = {
  scheme: 'mydebugtools',
  author: 'custom',
  base00: '#ffffff',      // Background - Pure white
  base01: '#f8f9fa',      // Lighter Background
  base02: '#fff3e0',      // Selection Background - Light orange
  base03: '#6c757d',      // Comments, Invisibles - Gray
  base04: '#495057',      // Dark Foreground
  base05: '#212529',      // Default Foreground - Dark gray for values
  base06: '#343a40',      // Light Foreground
  base07: '#212529',      // Light Background
  base08: '#FF6C37',      // Variables, XML Tags - Orange (brand color)
  base09: '#0066cc',      // Integers, Boolean, Constants - Blue
  base0A: '#FF6C37',      // Classes, Markup Bold - Orange for keys
  base0B: '#28a745',      // Strings, Markup Code - Green
  base0C: '#17a2b8',      // Support, Regular Expressions - Cyan
  base0D: '#FF6C37',      // Functions, Methods - Orange for keys
  base0E: '#6f42c1',      // Keywords, Storage - Purple
  base0F: '#dc3545',      // Deprecated - Red
};

export default function JSONTools() {
  const [jsonInput, setJsonInput] = useState<string>(`{
  "name": "MyDebugTools",
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
  const [treeCollapsed, setTreeCollapsed] = useState<number | boolean>(2);
  const [expandAll, setExpandAll] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'tree' | 'text'>('tree');
  const [isPretty, setIsPretty] = useState(true);
  const [loadingUrl, setLoadingUrl] = useState(false);
  const [selectedPath, setSelectedPath] = useState<string>('');
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [jsonStats, setJsonStats] = useState({ lines: 0, chars: 0, size: '0 B' });
  const [isValid, setIsValid] = useState(true);
  const [showStatsModal, setShowStatsModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);
  const treeContainerRef = useRef<HTMLDivElement>(null);

  // Parse JSON input text to object
  const parseJsonInput = useCallback(() => {
    try {
      const parsed = JSON.parse(jsonInput);
      setParsedJson(parsed);
      setError('');
      setIsValid(true);
      setTreeCollapsed(2);
      
      // Update stats
      const lines = jsonInput.split('\n').length;
      const chars = jsonInput.length;
      const size = new Blob([jsonInput]).size;
      const sizeStr = size < 1024 ? `${size} B` : 
                     size < 1024 * 1024 ? `${(size / 1024).toFixed(2)} KB` :
                     `${(size / (1024 * 1024)).toFixed(2)} MB`;
      setJsonStats({ lines, chars, size: sizeStr });
    } catch (e) {
      setError('Invalid JSON: ' + (e as Error).message);
      setIsValid(false);
    }
  }, [jsonInput]);

  // Update jsonInput text when parsedJson changes (for tree edits)
  const updateJsonInputFromParsed = useCallback(
    (json: JsonValue) => {
      try {
        const text = isPretty ? JSON.stringify(json, null, 2) : JSON.stringify(json);
        setJsonInput(text);
        setParsedJson(json);
        setError('');
      } catch (e) {
        setError('Error updating JSON text: ' + (e as Error).message);
      }
    },
    [isPretty]
  );

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
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Download JSON file
  const handleDownload = () => {
    try {
      const blob = new Blob([jsonInput], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'json-data.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // ignore
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
      setTimeout(() => parseJsonInput(), 0);
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
      setTimeout(() => parseJsonInput(), 0);
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
    // Force re-render by toggling the state
    if (expandAll) {
      setTreeCollapsed(1); // Collapse to level 1
    } else {
      setTreeCollapsed(false); // Expand all levels
    }
  };

  // Handle edits in tree view
  const handleTreeEdit = (edit: any) => {
    if (!edit.updated_src) return;
    updateJsonInputFromParsed(edit.updated_src);
    // Update the right panel by updating parsed JSON
    setParsedJson(edit.updated_src);
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

  // Paste from clipboard
  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setJsonInput(text);
      setActiveTab('text');
      setTimeout(() => {
        parseJsonInput();
        // Auto-format on paste if JSON is valid
        try {
          const obj = JSON.parse(text);
          setJsonInput(JSON.stringify(obj, null, 2));
          setIsPretty(true);
        } catch {
          // If invalid, just show the pasted text
        }
      }, 0);
    } catch (e) {
      setError('Failed to paste from clipboard. Please paste manually.');
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + F for format
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        handleFormat();
      }
      // Ctrl/Cmd + M for minify
      if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
        e.preventDefault();
        handleRemoveWhiteSpace();
      }
      // Ctrl/Cmd + V when not in textarea
      if ((e.ctrlKey || e.metaKey) && e.key === 'v' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        handlePasteFromClipboard();
      }
      // Ctrl/Cmd + C for copy
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && document.activeElement?.tagName !== 'TEXTAREA') {
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

  // Count expandable nodes (objects and arrays)
  const countExpandableNodes = (obj: any): number => {
    if (!obj || typeof obj !== 'object') return 0;
    let count = 0;

    const countRecursive = (value: any): void => {
      if (typeof value !== 'object' || value === null) return;
      
      count++; // This node itself is expandable
      
      if (Array.isArray(value)) {
        value.forEach(countRecursive);
      } else {
        Object.values(value).forEach(countRecursive);
      }
    };

    countRecursive(obj);
    return count;
  };

  // Highlight matching keys and values in react-json-view by overriding style
  // react-json-view does not support custom highlight natively, so we rely on filteredJson to reduce displayed nodes.

  // Sample JSON for demo
  const handleSample = () => {
    const sample = {
      name: "MyDebugTools JSON Example",
      version: "2.0.0",
      features: { formatting: true, validation: true, minification: true },
      users: [
        { id: 1, name: "John Developer", role: "Frontend Developer", active: true, skills: ["React", "TypeScript", "JSON"] },
        { id: 2, name: "Sarah Designer", role: "UI/UX Designer", active: true, skills: ["Figma", "CSS", "Design Systems"] }
      ],
      metadata: { created: "2024-01-01T00:00:00Z", lastModified: new Date().toISOString(), environment: "production" }
    };
    setJsonInput(JSON.stringify(sample, null, 2));
    setActiveTab('text');
    setTimeout(() => parseJsonInput(), 0);
  };

  // Reset all
  const handleReset = () => {
    setJsonInput('{}');
    setParsedJson({});
    setError('');
    setSearchTerm('');
    setActiveTab('tree');
    setTreeCollapsed(2);
  };

  // Handle paste in tree view area
  const handlePasteInTree = async (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text');
    if (text) {
      setJsonInput(text);
      setTimeout(() => {
        parseJsonInput();
      }, 0);
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

  // Extract keys and values for side panel
  const extractKeysAndValues = (obj: any, prefix = '', showOnlyImmediate = false): Array<{ path: string; value: any; type: string }> => {
    const result: Array<{ path: string; value: any; type: string }> = [];
    
    if (obj === null || obj === undefined) {
      result.push({ path: prefix || '(null)', value: obj, type: 'null' });
      return result;
    }

    const type = Array.isArray(obj) ? 'array' : typeof obj;

    // If we only want immediate children and this is an object/array
    if (showOnlyImmediate && (type === 'object' || type === 'array')) {
      if (type === 'array') {
        obj.forEach((item: any, index: number) => {
          if (item === null || item === undefined) {
            result.push({ 
              path: `[${index}]`, 
              value: item, 
              type: 'null' 
            });
          } else {
            const itemType = Array.isArray(item) ? 'array' : typeof item;
            const displayValue = itemType === 'object' && item !== null ? `Object(${Object.keys(item).length})` :
                                itemType === 'array' ? `Array(${item.length})` : item;
            result.push({ 
              path: `[${index}]`, 
              value: displayValue, 
              type: itemType 
            });
          }
        });
      } else {
        Object.keys(obj).forEach(key => {
          const value = obj[key];
          if (value === null || value === undefined) {
            result.push({ 
              path: key, 
              value: value, 
              type: 'null' 
            });
          } else {
            const itemType = Array.isArray(value) ? 'array' : typeof value;
            const displayValue = itemType === 'object' && value !== null ? `Object(${Object.keys(value).length})` :
                                itemType === 'array' ? `Array(${value.length})` : value;
            result.push({ 
              path: key, 
              value: displayValue, 
              type: itemType 
            });
          }
        });
      }
      return result;
    }

    // Original recursive behavior for full tree
    const traverse = (current: any, currentPath: string) => {
      if (current === null || current === undefined) {
        result.push({ path: currentPath, value: current, type: 'null' });
        return;
      }

      const type = Array.isArray(current) ? 'array' : typeof current;

      if (type === 'object' || type === 'array') {
        if (type === 'array') {
          result.push({ path: currentPath, value: `Array(${current.length})`, type: 'array' });
          current.forEach((item: any, index: number) => {
            traverse(item, `${currentPath}[${index}]`);
          });
        } else {
          const keys = Object.keys(current);
          result.push({ path: currentPath, value: `Object(${keys.length})`, type: 'object' });
          keys.forEach(key => {
            traverse(current[key], currentPath ? `${currentPath}.${key}` : key);
          });
        }
      } else {
        result.push({ path: currentPath, value: current, type });
      }
    };

    traverse(obj, prefix);
    return result;
  };

  // Handle clicking on a key-value item to navigate and show in right panel
  const handleSelectPath = (path: string) => {
    if (!path || path === '(root)') {
      setSelectedNode(null);
      setSelectedPath('');
      setSearchTerm('');
      return;
    }

    // Navigate to the node using the path
    let node = parsedJson;
    const pathParts = path.split(/\.|\[|\]/).filter(p => p !== '');
    
    for (const part of pathParts) {
      if (node && typeof node === 'object') {
        node = node[part];
      } else {
        break;
      }
    }
    
    // Ensure path ends with a dot
    const finalPath = path.endsWith('.') ? path : `${path}.`;
    
    setSelectedNode(node);
    setSelectedPath(finalPath);
    setSearchTerm('');
    
    if (activeTab !== 'tree') {
      setActiveTab('tree');
    }
  };

  // Handle selecting a node in the tree view
  const handleTreeSelect = (select: any) => {
    if (!select) {
      // No selection, show root
      setSelectedNode(null);
      setSelectedPath('');
      return;
    }

    // Build the full path and navigate to the node
    let fullPath = '';
    let node = parsedJson;
    
    // First navigate through namespace (parent path)
    if (select.namespace && select.namespace.length > 0) {
      for (let i = 0; i < select.namespace.length; i++) {
        const key = select.namespace[i];
        if (node && typeof node === 'object') {
          node = node[key];
          // Build path
          if (!isNaN(Number(key))) {
            fullPath += `[${key}]`;
          } else {
            // Add dot before property name if needed
            if (fullPath && !fullPath.endsWith('.')) {
              fullPath += '.';
            }
            fullPath += key;
          }
        }
      }
    }
    
    // Then add the selected name itself
    if (select.name !== null && select.name !== undefined) {
      // Build final path
      if (!isNaN(Number(select.name))) {
        fullPath += `[${select.name}]`;
      } else {
        // Add dot before property name if needed
        if (fullPath && !fullPath.endsWith('.')) {
          fullPath += '.';
        }
        fullPath += select.name;
      }
      
      // Navigate to the actual node
      if (node && typeof node === 'object') {
        node = node[select.name];
      }
    }

    // Set the selected node and path
    setSelectedNode(node);
    setSelectedPath(fullPath || 'root');
  };

  // Note: Custom click handler removed - using react-json-view's onSelect instead

  return (
    <div className="bg-[#fafafa] text-gray-900 flex flex-col">
      <style dangerouslySetInnerHTML={{__html: `
        /* Target and hide the red arrow by color */
        ul[role="tree"] span[style*="color:#dc3545"],
        ul[role="tree"] span[style*="color: #dc3545"],
        ul[role="tree"] span[style*="color:rgb(220, 53, 69)"],
        ul[role="tree"] span[style*="color: rgb(220, 53, 69)"] {
          visibility: hidden !important;
          width: 0 !important;
          height: 0 !important;
          font-size: 0 !important;
          position: absolute !important;
        }
        
        /* Hide first span in label */
        ul[role="tree"] li > label > span:first-child {
          color: transparent !important;
          font-size: 0 !important;
          width: 16px !important;
          height: 16px !important;
          overflow: hidden !important;
          position: relative !important;
        }
        
        /* Add our custom +/- */
        ul[role="tree"] li > label > span:first-child::after {
          content: '+';
          position: absolute;
          top: 0;
          left: 0;
          font-size: 14px;
          color: #666;
          font-weight: bold;
          width: 16px;
          height: 16px;
          text-align: center;
          line-height: 16px;
          display: block;
        }
        
        ul[role="tree"] li[aria-expanded="true"] > label > span:first-child::after {
          content: '−';
        }
        
        ul[role="tree"] li[aria-expanded="false"] > label > span:first-child::after {
          content: '+';
        }
      `}} />
      <h1 className="text-2xl font-semibold mb-6 text-gray-800 px-6 pt-6">JSON Viewer</h1>
      
      

      {/* Tabs - Postman Style */}
      <div className="mb-0 border-b border-gray-300 bg-white">
        <div className="flex">
          <button
            onClick={() => setActiveTab('text')}
            className={`px-6 py-3 font-medium transition-all relative ${
              activeTab === 'text'
                ? 'text-orange-600 bg-white border-b-2 border-orange-600'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
            role="tab"
          >
            Text
          </button>
          <button
            onClick={() => setActiveTab('tree')}
            className={`px-6 py-3 font-medium transition-all relative ${
              activeTab === 'tree'
                ? 'text-orange-600 bg-white border-b-2 border-orange-600'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
            role="tab"
          >
            Tree
          </button>
        </div>
      </div>

      {/* Content Area - Postman Style */}
      {activeTab === 'text' && (
        <div className="space-y-0">
          {/* Toolbar - Postman Style */}
          <div className="bg-[#f7f7f7] border border-gray-300 border-b-0 px-3 py-2 flex flex-wrap gap-1">
            <div className="flex gap-1">
              <button 
                onClick={handlePasteFromClipboard} 
                className="px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-300 rounded transition-colors flex items-center gap-1.5"
                title="Paste from clipboard"
              >
                <ClipboardDocumentListIcon className="h-4 w-4" />
                Paste
              </button>
              <button 
                onClick={() => handleCopy(jsonInput)} 
                className="px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-300 rounded transition-colors flex items-center gap-1.5"
                title="Copy to clipboard"
              >
                <ClipboardIcon className="h-4 w-4" />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            
            <div className="border-l border-gray-400 mx-2"></div>
            
            <div className="flex gap-1">
              <button 
                onClick={handleFormat} 
                className="px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-300 rounded transition-colors flex items-center gap-1.5"
                title="Format JSON"
              >
                <DocumentTextIcon className="h-4 w-4" />
                Format
              </button>
              <button 
                onClick={handleRemoveWhiteSpace} 
                className="px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-300 rounded transition-colors flex items-center gap-1.5"
                title="Minify JSON"
              >
                <ArrowsPointingInIcon className="h-4 w-4" />
                Minify
              </button>
            </div>
            
            <div className="border-l border-gray-400 mx-2"></div>
            
            <div className="flex gap-1">
              <button 
                onClick={handleReset} 
                className="px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-300 rounded transition-colors flex items-center gap-1.5"
                title="Clear all"
              >
                <XMarkIcon className="h-4 w-4" />
                Clear
              </button>
              <label className="px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-300 rounded transition-colors flex items-center gap-1.5 cursor-pointer" title="Load JSON file">
                <ArrowUpTrayIcon className="h-4 w-4" />
                Load
                <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".json,.txt" onChange={handleFileLoad} />
              </label>
            </div>
          </div>

          {/* Text Editor */}
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className="w-full h-[600px] p-4 border border-gray-300 rounded-b-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-900"
            placeholder="Paste your JSON here..."
            spellCheck={false}
            style={{ 
              lineHeight: '1.5',
              tabSize: 2
            }}
          />
        </div>
      )}

      {/* Tree View - Postman Style */}
      {activeTab === 'tree' && parsedJson && (
        <div className="space-y-0">
          {/* Search and Controls Bar */}
          <div className="flex flex-col gap-2 p-3 bg-white border-x border-t border-gray-300">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search keys and values (strings, numbers, booleans, null)..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                />
                {/* Search Icon */}
                <svg 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {/* Clear Search Button */}
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    title="Clear search"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              {/* Expand/Collapse All Buttons */}
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    setExpandAll(true);
                    setTreeCollapsed(false);
                  }}
                  className="px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded transition-colors flex items-center gap-1"
                  title="Expand All"
                >
                  <span className="text-sm">+</span>
                  Expand All
                </button>
                <button
                  onClick={() => {
                    setExpandAll(false);
                    setTreeCollapsed(1);
                  }}
                  className="px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded transition-colors flex items-center gap-1"
                  title="Collapse All"
                >
                  <span className="text-sm">−</span>
                  Collapse All
                </button>
              </div>
            </div>
            
            {/* Search Results Count */}
            {searchTerm && (
              <div className="text-xs text-gray-600 flex items-center gap-2 px-2">
                <span className="inline-flex items-center gap-1">
                  <svg className="h-3 w-3 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <strong>{countSearchResults(parsedJson, searchTerm)}</strong> match{countSearchResults(parsedJson, searchTerm) !== 1 ? 'es' : ''} found
                </span>
              </div>
            )}
          </div>

          {/* Two-panel layout: Tree view and Property Details */}
          <div className="flex gap-0 border border-gray-300 rounded bg-white overflow-hidden">
            {/* Left Panel - Tree View with collapsible sidebar */}
            <div className="flex flex-1 overflow-hidden">
              {/* Main Tree View */}
              <div 
                ref={treeContainerRef}
                className="flex-1 p-4 overflow-auto max-h-[600px]"
                onPaste={handlePasteInTree}
                tabIndex={0}
              >
                {error ? (
                  <div className="text-red-700 font-semibold whitespace-pre-wrap p-3 bg-red-50 rounded border-l-4 border-red-500">
                    <p className="font-bold mb-2">Error</p>
                    <p className="text-xs">{error}</p>
                    <p className="text-xs mt-2 text-gray-600">Try switching to Text tab to fix the JSON syntax</p>
                  </div>
                ) : (
                <>
                  <JSONTree 
                    key={`json-tree-${expandAll}-${treeCollapsed}`}
                    data={filteredJson(parsedJson, searchTerm) || {}} 
                    theme={{
                      ...jsonTreeTheme,
                      tree: {
                        border: 0,
                        padding: '8px',
                        marginTop: 0,
                        marginBottom: 0,
                        marginLeft: 0,
                        marginRight: 0,
                        listStyle: 'none',
                        MozUserSelect: 'text',
                        WebkitUserSelect: 'text',
                        backgroundColor: jsonTreeTheme.base00,
                        fontFamily: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
                        fontSize: '13px',
                        lineHeight: '1.6',
                      },
                      arrowSign: { 
                        color: '#6c757d',
                        fontSize: '12px',
                        marginRight: '6px',
                      },
                      arrowSignCollapsed: { 
                        color: '#6c757d',
                        fontSize: '12px',
                        marginRight: '6px',
                      },
                      nestedNodeLabel: ({ style }, keyPath, nodeType, expanded) => ({
                        style: {
                          ...style,
                          fontWeight: 500,
                          color: '#FF6C37',
                        }
                      }),
                      nestedNodeItemString: ({ style }, keyPath, nodeType, expanded) => ({
                        style: {
                          ...style,
                          color: '#6c757d',
                          fontSize: '12px',
                          marginLeft: '6px',
                        }
                      }),
                      value: ({ style }, nodeType, keyPath) => {
                        const baseStyle = {
                          ...style,
                          paddingLeft: '4px',
                          paddingRight: '4px',
                        };
                        
                        // Style based on value type
                        if (nodeType === 'String') {
                          return {
                            style: {
                              ...baseStyle,
                              color: '#28a745',
                            }
                          };
                        }
                        if (nodeType === 'Number') {
                          return {
                            style: {
                              ...baseStyle,
                              color: '#0066cc',
                              fontWeight: 500,
                            }
                          };
                        }
                        if (nodeType === 'Boolean') {
                          return {
                            style: {
                              ...baseStyle,
                              color: '#6f42c1',
                              fontWeight: 600,
                            }
                          };
                        }
                        if (nodeType === 'Null') {
                          return {
                            style: {
                              ...baseStyle,
                              color: '#dc3545',
                              fontStyle: 'italic',
                            }
                          };
                        }
                        return { style: baseStyle };
                      },
                      label: ({ style }, nodeType, expanded) => ({
                        style: {
                          ...style,
                          color: '#FF6C37',
                          fontWeight: 500,
                        }
                      }),
                    }}
                    invertTheme={false}
                    hideRoot={false}
                    shouldExpandNodeInitially={(keyPath, data, level) => {
                      // When searching, expand all nodes to show results
                      if (searchTerm) {
                        return true;
                      }
                      // When expandAll is true, expand everything
                      if (expandAll || treeCollapsed === false) {
                        return true;
                      }
                      // Otherwise, expand only to specified level
                      if (typeof treeCollapsed === 'number') {
                        return level < treeCollapsed;
                      }
                      return false;
                    }}
                    getItemString={(type, data, itemType, itemString) => {
                      if (type === 'Object') {
                        const keys = Object.keys(data as object);
                        return <span style={{ color: '#6c757d', fontSize: '12px', fontWeight: 400 }}>{`{...} ${keys.length} ${keys.length === 1 ? 'key' : 'keys'}`}</span>;
                      }
                      if (type === 'Array') {
                        const length = (data as any[]).length;
                        return <span style={{ color: '#6c757d', fontSize: '12px', fontWeight: 400 }}>{`[...] ${length} ${length === 1 ? 'item' : 'items'}`}</span>;
                      }
                      return <span>{itemString}</span>;
                    }}
                    labelRenderer={(keyPath, nodeType, expanded, expandable) => {
                      const key = keyPath[0];
                      return (
                        <strong 
                          style={{ cursor: 'pointer', color: '#1e88e5' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            
                            console.log('Clicked key:', key);
                            console.log('Full keyPath:', keyPath);
                            
                            // keyPath is in reverse order: [currentKey, parentKey, grandparentKey, ..., 'root']
                            // Remove 'root' if it exists and reverse to get correct order
                            const cleanPath = keyPath.filter(k => k !== 'root');
                            const pathParts = [...cleanPath].reverse();
                            
                            console.log('Path parts (after clean & reverse):', pathParts);
                            
                            let fullPath = '';
                            let node = parsedJson;
                            
                            // Navigate to the node
                            for (let i = 0; i < pathParts.length; i++) {
                              const part = pathParts[i];
                              
                              if (node && typeof node === 'object' && part in node) {
                                node = node[part];
                                
                                // Build path string with dots between segments
                                if (typeof part === 'number' || !isNaN(Number(part))) {
                                  fullPath += `[${part}]`;
                                } else {
                                  // Add dot before property name if needed
                                  if (fullPath && !fullPath.endsWith('.')) {
                                    fullPath += '.';
                                  }
                                  fullPath += part;
                                }
                              }
                            }
                            
                            setSelectedNode(node);
                            setSelectedPath(fullPath || 'root');
                            console.log('Final path:', fullPath);
                            console.log('Final node:', node);
                          }}
                        >
                          {key}
                        </strong>
                      );
                    }}
                    valueRenderer={(raw, value) => {
                      return <span>{JSON.stringify(value)}</span>;
                    }}
                  />
                </>
              )}
              </div>

              {/* Icon-only Sidebar - Collapsed */}
              <div className="w-14 bg-[#f7f7f7] border-l border-gray-300 flex flex-col items-center py-4 gap-3">
                {/* Details Panel Toggle */}
              

                {/* Download Icon */}
                <button
                  onClick={handleDownload}
                  className="p-2.5 hover:bg-gray-300 rounded-lg transition-colors group relative"
                  title="Download JSON"
                >
                  <ArrowDownTrayIcon className="w-5 h-5 text-gray-600" />
                  <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    Download JSON
                  </span>
                </button>

                {/* Copy Icon */}
                <button
                  onClick={() => {
                    handleCopy(JSON.stringify(parsedJson, null, 2));
                    // Show brief confirmation
                  }}
                  className="p-2.5 hover:bg-gray-300 rounded-lg transition-colors group relative"
                  title="Copy JSON"
                >
                  <ClipboardIcon className={`w-5 h-5 ${copied ? 'text-green-600' : 'text-gray-600'}`} />
                  <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    {copied ? 'Copied!' : 'Copy JSON'}
                  </span>
                </button>

                <div className="flex-1"></div>

                {/* Validation Status Indicator */}
                <div className="flex flex-col items-center gap-1">
                  {isValid ? (
                    <div className="w-3 h-3 bg-green-500 rounded-full" title="Valid JSON"></div>
                  ) : (
                    <div className="w-3 h-3 bg-red-500 rounded-full" title="Invalid JSON"></div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Panel - Property Details - Postman Style (Expandable) */}
            {selectedNode !== null && (
              <div className="w-80 p-4 bg-[#fafafa] border-l border-gray-300 overflow-auto max-h-[600px]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Details</h3>
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="p-1 hover:bg-gray-300 rounded transition-colors"
                    title="Close"
                  >
                    <XMarkIcon className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="text-xs">
                    <span className="font-semibold text-gray-600 uppercase tracking-wide block mb-2">Path</span>
                    <div className="p-2 bg-white border border-gray-300 rounded font-mono text-xs break-all text-gray-800">
                      {selectedPath || 'root.'}
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-300 pt-3">
                    <div className="font-semibold text-gray-600 mb-2 text-xs uppercase tracking-wide">Properties</div>
                    <div className="bg-white border border-gray-300 rounded overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-[#f7f7f7] border-b border-gray-300">
                          <tr>
                            <th className="text-left p-2 font-semibold text-gray-700">Key</th>
                            <th className="text-left p-2 font-semibold text-gray-700">Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {extractImmediateProperties(selectedNode).map(([key, value], index) => (
                            <tr 
                              key={index} 
                              className="border-b border-gray-200 hover:bg-orange-50 cursor-pointer transition-colors"
                              onClick={() => {
                                // Remove trailing dot from selectedPath before building new path
                                const basePath = selectedPath.endsWith('.') ? selectedPath.slice(0, -1) : selectedPath;
                                const newPath = basePath 
                                  ? `${basePath}.${key}` 
                                  : key;
                                handleSelectPath(newPath);
                              }}
                            >
                              <td className="p-2 font-medium text-gray-800">{key}</td>
                              <td className="p-2 text-gray-600 font-mono truncate max-w-[150px]" title={String(value)}>
                                {typeof value === 'object' && value !== null 
                                  ? Array.isArray(value) 
                                    ? `Array(${value.length})` 
                                    : `Object(${Object.keys(value).length})`
                                  : String(value)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Display - Postman Style */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 border-l-4 border-red-500 rounded">
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
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded border-l-4 border-orange-500">
                  <span className="text-sm font-medium text-gray-700">Status</span>
                  <span className={`text-sm font-bold ${isValid ? 'text-green-600' : 'text-red-600'}`}>
                    {isValid ? '✓ Valid JSON' : '✗ Invalid JSON'}
                  </span>
                </div>
              </div>

              {/* Object Stats */}
              {isValid && parsedJson && (
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
                        {JSON.stringify(parsedJson).split(':').length - 1}
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