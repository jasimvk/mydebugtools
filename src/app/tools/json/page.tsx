'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { ClipboardIcon, ArrowDownTrayIcon, FolderOpenIcon, LinkIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import AceEditor from 'react-ace';

import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/theme-tomorrow';

const ReactJson = dynamic(() => import('react-json-view'), { ssr: false });

type JsonValue = any;

export default function JSONTools() {
  const [jsonInput, setJsonInput] = useState<string>('{\n  "name": "MyDebugTools",\n  "message": "Paste your JSON here or click Sample"\n}');
  const [parsedJson, setParsedJson] = useState<JsonValue>({});
  const [treeCollapsed, setTreeCollapsed] = useState<number | boolean>(2);
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'tree' | 'text'>('tree');
  const [isPretty, setIsPretty] = useState(true);
  const [loadingUrl, setLoadingUrl] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  // Parse JSON input text to object
  const parseJsonInput = useCallback(() => {
    try {
      const parsed = JSON.parse(jsonInput);
      setParsedJson(parsed);
      setError('');
      setTreeCollapsed(2);
    } catch (e) {
      setError('Invalid JSON: ' + (e as Error).message);
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
    if (treeCollapsed === false || treeCollapsed === 0) {
      setTreeCollapsed(2);
    } else {
      setTreeCollapsed(false);
    }
  };

  // Handle edits in tree view
  const handleTreeEdit = (edit: any) => {
    if (!edit.updated_src) return;
    updateJsonInputFromParsed(edit.updated_src);
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

  // Filter JSON for search term (keys or string values)
  const filteredJson = (obj: any, term: string): any => {
    if (!term) return obj;
    const termLower = term.toLowerCase();

    const filterRecursive = (value: any): any => {
      if (typeof value === 'string' && value.toLowerCase().includes(termLower)) return value;
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
          filteredObj[key] = value[key];
        } else if (filteredValue !== null) {
          filteredObj[key] = filteredValue;
        }
      }
      return Object.keys(filteredObj).length > 0 ? filteredObj : null;
    };

    return filterRecursive(obj);
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

  // Handle paste in text editor wrapper
  const handlePasteInText = async (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text');
    if (text) {
      setJsonInput(text);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-center md:text-left">JSON Viewer & Editor</h1>
      
      {/* Help Banner */}
 

      {/* Sticky Toolbar */}
      <div className="sticky top-0 z-10 bg-gray-50 pb-2 mb-4 shadow-sm flex flex-col md:flex-row md:items-center md:space-x-4 gap-2">
        <button onClick={parseJsonInput} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition" title="Parse JSON and update tree" aria-label="Parse JSON">Parse</button>
        <button onClick={toggleExpandCollapse} className="flex items-center gap-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-semibold transition" title={treeCollapsed === false || treeCollapsed === 0 ? 'Collapse All' : 'Expand All'} aria-label="Expand or Collapse All">{treeCollapsed === false || treeCollapsed === 0 ? (<><span>Collapse All</span> <ChevronUpIcon className="w-4 h-4" /></>) : (<><span>Expand All</span> <ChevronDownIcon className="w-4 h-4" /></>)}</button>
        <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded font-semibold transition" title="Load JSON from file" aria-label="Load JSON from File"><FolderOpenIcon className="w-5 h-5" />Load File</button>
        <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".json,.txt" onChange={handleFileLoad} aria-hidden="true" tabIndex={-1} />
        <button onClick={handleSample} className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded font-semibold transition" title="Load sample JSON" aria-label="Load sample JSON">Sample</button>
        <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded font-semibold transition" title="Reset all" aria-label="Reset">Reset</button>
        <div className="flex items-center gap-2 flex-grow max-w-xs">
          <input ref={urlInputRef} type="url" placeholder="Load JSON from URL" className="flex-grow px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Load JSON from URL" onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleLoadUrl(); } }} disabled={loadingUrl} />
          <button onClick={handleLoadUrl} className="flex items-center gap-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded font-semibold transition" disabled={loadingUrl} aria-label="Load JSON from URL button" title="Load JSON from URL"><LinkIcon className="w-5 h-5" />{loadingUrl ? 'Loading...' : 'Load'}</button>
        </div>
        <button onClick={() => handleCopy(jsonInput)} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-semibold transition" title="Copy JSON to clipboard" aria-label="Copy JSON to Clipboard"><ClipboardIcon className="w-5 h-5" />{copied ? 'Copied' : 'Copy'}</button>
        <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold transition" title="Download JSON" aria-label="Download JSON"><ArrowDownTrayIcon className="w-5 h-5" />Download</button>
        <button onClick={togglePretty} className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded font-semibold transition whitespace-nowrap" title="Toggle pretty/minify" aria-label="Toggle Pretty or Minify JSON">{isPretty ? 'Minify' : 'Pretty'}</button>
      </div>

      {/* Search */}
      <div className="mb-4 max-w-md">
        <input
          type="search"
          placeholder="Search keys and values..."
          className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          aria-label="Search JSON keys and values"
        />
      </div>

      {/* Tabs */}
      <div className="mb-4 border-b border-gray-300 flex space-x-2">
        <button
          onClick={() => setActiveTab('tree')}
          className={`py-2 px-4 font-semibold rounded-t-lg transition ${
            activeTab === 'tree'
              ? 'bg-white border border-b-0 border-gray-300'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
          aria-selected={activeTab === 'tree'}
          role="tab"
          id="tab-tree"
          aria-controls="tabpanel-tree"
        >
          🌲 Tree View
        </button>
        <button
          onClick={() => setActiveTab('text')}
          className={`py-2 px-4 font-semibold rounded-t-lg transition ${
            activeTab === 'text'
              ? 'bg-white border border-b-0 border-gray-300'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
          aria-selected={activeTab === 'text'}
          role="tab"
          id="tab-text"
          aria-controls="tabpanel-text"
        >
          📝 Text Editor
        </button>
      </div>

      {/* Single Content Area */}
      <div className="flex flex-col flex-grow min-h-[600px]">
        <div className="flex flex-col flex-grow border border-gray-300 rounded-lg overflow-hidden bg-white shadow">
          {activeTab === 'text' ? (
            <div 
              className="flex flex-col flex-grow"
              onPaste={handlePasteInText}
            >
              <AceEditor
                mode="json"
                theme="tomorrow"
                name="json-text-editor"
                value={jsonInput}
                onChange={value => setJsonInput(value)}
                width="100%"
                height="100%"
                fontSize={14}
                showPrintMargin={false}
                showGutter={true}
                highlightActiveLine={true}
                setOptions={{
                  showLineNumbers: true,
                  tabSize: 2,
                  useWorker: false,
                  wrap: true,
                  enableBasicAutocompletion: false,
                  enableLiveAutocompletion: false,
                  enableSnippets: false,
                }}
                editorProps={{ $blockScrolling: true }}
                aria-label="JSON text editor"
                commands={[
                  {
                    name: 'paste',
                    bindKey: { win: 'Ctrl-V', mac: 'Cmd-V' },
                    exec: (editor: any) => {
                      // Ace will handle paste natively
                    }
                  }
                ]}
              />
            </div>
          ) : (
            <div 
              className="flex flex-col flex-grow overflow-auto p-4"
              onPaste={handlePasteInTree}
              tabIndex={0}
            >
              {error ? (
                <div className="text-red-500 font-semibold whitespace-pre-wrap p-4 bg-red-50 rounded border border-red-200">
                  <p className="font-bold mb-2">❌ JSON Parse Error:</p>
                  <p className="text-sm">{error}</p>
                  <p className="text-xs mt-2 text-gray-600">💡 Try switching to Text tab to fix the JSON syntax</p>
                </div>
              ) : (
                <ReactJson
                  src={filteredJson(parsedJson, searchTerm) || {}}
                  theme="rjv-default"
                  collapsed={treeCollapsed}
                  enableClipboard={true}
                  onEdit={handleTreeEdit}
                  onAdd={handleTreeEdit}
                  onDelete={handleTreeEdit}
                  style={{ fontSize: '1.1em', fontFamily: 'monospace', overflowWrap: 'break-word', lineHeight: '1.6' }}
                  name={null}
                  quotesOnKeys={false}
                  collapseStringsAfterLength={50}
                  displayObjectSize={true}
                  displayDataTypes={false}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}