'use client';

import { useState, useEffect } from 'react';
import { 
  ArrowPathIcon, 
  DocumentDuplicateIcon, 
  ArrowDownTrayIcon, 
  CheckIcon, 
  ViewColumnsIcon, 
  CodeBracketIcon, 
  TableCellsIcon,
  MagnifyingGlassIcon,
  ShareIcon,
  ArrowsRightLeftIcon,
  CommandLineIcon,
  DocumentCheckIcon,
  LightBulbIcon,
  MinusIcon,
  AdjustmentsHorizontalIcon,
  EyeIcon,
  EyeSlashIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  WrenchIcon,
  CloudArrowUpIcon,
  CloudArrowDownIcon,
  QuestionMarkCircleIcon,
  ClipboardIcon,
  TrashIcon,
  SunIcon,
  MoonIcon,
  DocumentTextIcon,
  DocumentIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import Editor from '@monaco-editor/react';
import TreeView from './components/TreeView';
import { jsonrepair } from 'jsonrepair';
import Ajv from 'ajv';
import yaml from 'js-yaml';
import { Parser } from 'xml2js';
import { saveAs } from 'file-saver';
import { stringify } from 'csv-stringify/sync';

type ViewMode = 'formatted' | 'minified' | 'compare';

type TransformOperation = {
  type: 'sort' | 'filter' | 'map' | 'group' | 'aggregate';
  field?: string;
  criteria?: string;
  order?: 'asc' | 'desc';
  expression?: string;
};

type ExportFormat = 'json' | 'csv' | 'yaml' | 'xml';

type RepairOptions = {
  fixQuotes: boolean;
  addMissingBraces: boolean;
  removeTrailingCommas: boolean;
  fixMalformedArrays: boolean;
};

type CompareOptions = {
  ignoreArrayOrder: boolean;
  ignoreObjectOrder: boolean;
  ignoreWhitespace: boolean;
  showUnchanged: boolean;
};

type DiffType = 'added' | 'removed' | 'modified' | 'unchanged';
type DiffResult = {
  type: DiffType;
  path: string;
  oldValue?: any;
  newValue?: any;
};

const sampleJSON = {
  "store": {
    "name": "My Awesome Store",
    "location": {
      "city": "San Francisco",
      "country": "USA",
      "coordinates": {
        "lat": 37.7749,
        "lng": -122.4194
      }
    },
    "departments": [
      {
        "id": 1,
        "name": "Electronics",
        "products": [
          {
            "id": "e1",
            "name": "Smartphone",
            "price": 699.99,
            "inStock": true,
            "specs": {
              "brand": "TechCo",
              "model": "X2000",
              "storage": "128GB"
            }
          },
          {
            "id": "e2",
            "name": "Laptop",
            "price": 1299.99,
            "inStock": false,
            "specs": {
              "brand": "TechCo",
              "model": "ProBook",
              "storage": "512GB"
            }
          }
        ]
      },
      {
        "id": 2,
        "name": "Books",
        "products": [
          {
            "id": "b1",
            "name": "JavaScript Guide",
            "price": 39.99,
            "inStock": true,
            "author": "John Doe"
          }
        ]
      }
    ],
    "metadata": {
      "lastUpdated": "2024-03-15T10:30:00Z",
      "version": "2.1.0",
      "tags": ["retail", "electronics", "books"]
    }
  }
};

// Add type declarations for File System Access API
declare global {
  interface Window {
    showSaveFilePicker(options: {
      types: Array<{
        description: string;
        accept: Record<string, string[]>;
      }>;
    }): Promise<FileSystemFileHandle>;
  }
}

export default function JSONFormatter() {
  const [input, setInput] = useState('');
  const [compareInput, setCompareInput] = useState('');
  const [output, setOutput] = useState('');
  const [compareOutput, setCompareOutput] = useState('');
  const [error, setError] = useState('');
  const [compareError, setCompareError] = useState('');
  const [indentSize, setIndentSize] = useState(2);
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<'beautify' | 'minify'>('beautify');
  const [viewMode, setViewMode] = useState<ViewMode>('formatted');
  const [parsedData, setParsedData] = useState<any>(null);
  const [compareParsedData, setCompareParsedData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ path: string; value: any }[]>([]);
  const [shareUrl, setShareUrl] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showJsonPathModal, setShowJsonPathModal] = useState(false);
  const [jsonPathQuery, setJsonPathQuery] = useState('');
  const [jsonPathResult, setJsonPathResult] = useState<any>(null);
  const [schema, setSchema] = useState('');
  const [schemaValidation, setSchemaValidation] = useState<{ valid: boolean; errors?: any[] }>({ valid: true });
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [diffResults, setDiffResults] = useState<DiffResult[]>([]);
  const [diffStats, setDiffStats] = useState<{ added: number; removed: number; modified: number; unchanged: number }>({
    added: 0,
    removed: 0,
    modified: 0,
    unchanged: 0
  });
  const [compareOptions, setCompareOptions] = useState<CompareOptions>({
    ignoreArrayOrder: true,
    ignoreObjectOrder: true,
    ignoreWhitespace: true,
    showUnchanged: false
  });
  const [showCompareOptions, setShowCompareOptions] = useState(false);

  // New state variables for additional features
  const [transformOperations, setTransformOperations] = useState<TransformOperation[]>([]);
  const [showTransformModal, setShowTransformModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('json');
  const [showExportModal, setShowExportModal] = useState(false);
  const [repairOptions, setRepairOptions] = useState<RepairOptions>({
    fixQuotes: true,
    addMissingBraces: true,
    removeTrailingCommas: true,
    fixMalformedArrays: true
  });
  const [showRepairModal, setShowRepairModal] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  let [fileHandle, setFileHandle] = useState<FileSystemFileHandle | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [documentStats, setDocumentStats] = useState<{
    size: number;
    nodes: number;
    depth: number;
  }>({ size: 0, nodes: 0, depth: 0 });
  const [loadProgress, setLoadProgress] = useState(0);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Add new state variables
  const [showToolbar, setShowToolbar] = useState(true);
  const [showStatusBar, setShowStatusBar] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [searchOptions, setSearchOptions] = useState({
    caseSensitive: false,
    wholeWord: false,
    regex: false,
    searchInKeys: true,
    searchInValues: true
  });

  const formatJSON = () => {
    try {
      let jsonToFormat = input;
      
      // Try to repair JSON if it's invalid
      try {
        JSON.parse(input);
      } catch {
        jsonToFormat = jsonrepair(input);
      }

      const parsedJSON = JSON.parse(jsonToFormat);
      setParsedData(parsedJSON);
      
      if (mode === 'beautify') {
        setOutput(JSON.stringify(parsedJSON, null, indentSize));
      } else {
        setOutput(JSON.stringify(parsedJSON));
      }
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON');
      setOutput('');
      setParsedData(null);
    }

    // If in compare mode, format and compare the JSONs
    if (viewMode === 'compare' && compareInput) {
      try {
        let compareJsonToFormat = compareInput;
        try {
          JSON.parse(compareInput);
        } catch {
          compareJsonToFormat = jsonrepair(compareInput);
        }

        const parsedCompareJSON = JSON.parse(compareJsonToFormat);
        setCompareParsedData(parsedCompareJSON);
        
        if (mode === 'beautify') {
          setCompareOutput(JSON.stringify(parsedCompareJSON, null, indentSize));
        } else {
          setCompareOutput(JSON.stringify(parsedCompareJSON));
        }
        setCompareError('');

        // Generate diff results
        if (parsedData && parsedCompareJSON) {
          const diffs = compareJSON(parsedData, parsedCompareJSON);
          setDiffResults(diffs);
          
          // Calculate diff stats
          const stats = diffs.reduce((acc, curr) => {
            acc[curr.type]++;
            return acc;
          }, { added: 0, removed: 0, modified: 0, unchanged: 0 });
          setDiffStats(stats);
        }
      } catch (err) {
        setCompareError(err instanceof Error ? err.message : 'Invalid JSON');
        setCompareOutput('');
        setCompareParsedData(null);
      }
    }
  };

  const searchJSON = (obj: any, query: string, path = ''): { path: string; value: any }[] => {
    let results: { path: string; value: any }[] = [];
    
    if (typeof obj === 'object' && obj !== null) {
      Object.entries(obj).forEach(([key, value]) => {
        const currentPath = path ? `${path}.${key}` : key;
        
        if (JSON.stringify(value).toLowerCase().includes(query.toLowerCase())) {
          results.push({ path: currentPath, value });
        }
        
        if (typeof value === 'object' && value !== null) {
          results = [...results, ...searchJSON(value, query, currentPath)];
        }
      });
    }
    
    return results;
  };

  const handleSearch = () => {
    if (!parsedData || !searchQuery) {
      setSearchResults([]);
      return;
    }
    
    const results = searchJSON(parsedData, searchQuery);
    setSearchResults(results);
  };

  const generateShareUrl = () => {
    try {
      const shareData = {
        input,
        mode,
        indentSize,
        viewMode
      };
      const encoded = btoa(JSON.stringify(shareData));
      const url = `${window.location.origin}${window.location.pathname}?share=${encoded}`;
      setShareUrl(url);
      setShowShareModal(true);
    } catch (err) {
      console.error('Failed to generate share URL:', err);
    }
  };

  const handleJsonPathQuery = () => {
    try {
      if (!parsedData || !jsonPathQuery) return;

      // Simple JSON Path implementation (this is a basic version, you might want to use a library like jsonpath-plus)
      const parts = jsonPathQuery.split('.');
      let result = parsedData;
      
      for (const part of parts) {
        const arrayMatch = part.match(/(\w+)\[(\d+)\]/);
        if (arrayMatch) {
          const [_, prop, index] = arrayMatch;
          result = result[prop]?.[parseInt(index)];
        } else {
          result = result[part];
        }
        
        if (result === undefined) break;
      }

      setJsonPathResult(result);
    } catch (err) {
      console.error('JSON Path query error:', err);
    }
  };

  const validateSchema = () => {
    try {
      if (!schema || !parsedData) {
        setSchemaValidation({ valid: true });
        return;
      }

      const ajv = new Ajv();
      const validate = ajv.compile(JSON.parse(schema));
      const valid = validate(parsedData);

      setSchemaValidation({
        valid: !!valid,
        errors: validate.errors || undefined
      });
    } catch (err) {
      console.error('Schema validation error:', err);
      setSchemaValidation({
        valid: false,
        errors: [{ message: 'Invalid JSON Schema' }]
      });
    }
  };

  const loadSampleJson = () => {
    setInput(JSON.stringify(sampleJSON, null, 2));
  };

  useEffect(() => {
    // Load shared data from URL if present
    const urlParams = new URLSearchParams(window.location.search);
    const sharedData = urlParams.get('share');
    
    if (sharedData) {
      try {
        const decoded = JSON.parse(atob(sharedData));
        setInput(decoded.input);
        setMode(decoded.mode);
        setIndentSize(decoded.indentSize);
        setViewMode(decoded.viewMode);
      } catch (err) {
        console.error('Failed to load shared data:', err);
      }
    }
  }, []);

  useEffect(() => {
    // Add keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'b':
            e.preventDefault();
            formatJSON();
            break;
          case 'f':
            e.preventDefault();
            document.querySelector<HTMLInputElement>('input[placeholder="Search in JSON..."]')?.focus();
            break;
          case '/':
            e.preventDefault();
            setShowHelpModal(true);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setInput(text);
      };
      reader.readAsText(file);
    }
  };

  const compareJSON = (obj1: any, obj2: any, path = '', options = compareOptions): DiffResult[] => {
    const results: DiffResult[] = [];
    
    // Handle null/undefined cases
    if (obj1 === obj2) return [{ type: 'unchanged', path, oldValue: obj1, newValue: obj2 }];
    if (!obj1 || !obj2) {
      return [{ 
        type: !obj1 ? 'added' : 'removed',
        path,
        oldValue: obj1,
        newValue: obj2
      }];
    }

    // Compare arrays with options
    if (Array.isArray(obj1) && Array.isArray(obj2)) {
      if (options.ignoreArrayOrder) {
        const sorted1 = [...obj1].sort();
        const sorted2 = [...obj2].sort();
        if (JSON.stringify(sorted1) === JSON.stringify(sorted2)) {
          return options.showUnchanged ? [{ type: 'unchanged', path, oldValue: obj1, newValue: obj2 }] : [];
        }
      }

      // Compare arrays element by element
      const maxLength = Math.max(obj1.length, obj2.length);
      for (let i = 0; i < maxLength; i++) {
        const currentPath = `${path}[${i}]`;
        if (i >= obj1.length) {
          results.push({ type: 'added', path: currentPath, newValue: obj2[i] });
        } else if (i >= obj2.length) {
          results.push({ type: 'removed', path: currentPath, oldValue: obj1[i] });
        } else {
          results.push(...compareJSON(obj1[i], obj2[i], currentPath, options));
        }
      }
      return results;
    }

    // Compare objects
    if (typeof obj1 === 'object' && typeof obj2 === 'object') {
      const keys1 = Object.keys(obj1);
      const keys2 = Object.keys(obj2);

      if (options.ignoreObjectOrder) {
        keys1.sort();
        keys2.sort();
      }

      // Check for removed keys
      for (const key of keys1) {
        const currentPath = path ? `${path}.${key}` : key;
        if (!keys2.includes(key)) {
          results.push({ type: 'removed', path: currentPath, oldValue: obj1[key] });
          continue;
        }
        
        results.push(...compareJSON(obj1[key], obj2[key], currentPath, options));
      }

      // Check for added keys
      for (const key of keys2) {
        const currentPath = path ? `${path}.${key}` : key;
        if (!keys1.includes(key)) {
          results.push({ type: 'added', path: currentPath, newValue: obj2[key] });
        }
      }

      return results;
    }

    // Compare primitive values
    if (options.ignoreWhitespace && typeof obj1 === 'string' && typeof obj2 === 'string') {
      if (obj1.trim() === obj2.trim()) {
        return options.showUnchanged ? [{ type: 'unchanged', path, oldValue: obj1, newValue: obj2 }] : [];
      }
    }

    return obj1 === obj2
      ? (options.showUnchanged ? [{ type: 'unchanged', path, oldValue: obj1, newValue: obj2 }] : [])
      : [{ type: 'modified', path, oldValue: obj1, newValue: obj2 }];
  };

  const DiffView = ({ diffs }: { diffs: DiffResult[] }) => {
    const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

    const toggleCollapse = (path: string) => {
      const newCollapsed = new Set(collapsed);
      if (collapsed.has(path)) {
        newCollapsed.delete(path);
      } else {
        newCollapsed.add(path);
      }
      setCollapsed(newCollapsed);
    };

    const filteredDiffs = compareOptions.showUnchanged
      ? diffs
      : diffs.filter(d => d.type !== 'unchanged');

    return (
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex space-x-4 text-sm">
            <div className="flex items-center">
              <MinusIcon className="h-4 w-4 text-red-500 mr-1" />
              <span>Removed: {diffStats.removed}</span>
            </div>
            <div className="flex items-center">
              <ArrowPathIcon className="h-4 w-4 text-yellow-500 mr-1" />
              <span>Modified: {diffStats.modified}</span>
            </div>
          </div>
          <button
            onClick={() => setShowCompareOptions(true)}
            className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-500"
          >
            <AdjustmentsHorizontalIcon className="h-4 w-4" />
            <span>Options</span>
          </button>
        </div>
        <div className="space-y-1">
          {filteredDiffs.map((diff, index) => {
            const isCollapsible = 
              typeof diff.oldValue === 'object' || 
              typeof diff.newValue === 'object';
            const isCollapsed = collapsed.has(diff.path);

            return (
              <div
                key={index}
                className={`p-2 rounded text-sm font-mono ${
                  diff.type === 'added'
                    ? 'bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800'
                    : diff.type === 'removed'
                    ? 'bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800'
                    : diff.type === 'modified'
                    ? 'bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800'
                    : 'bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-gray-700 dark:text-gray-300">
                    {diff.path}
                  </div>
                  {isCollapsible && (
                    <button
                      onClick={() => toggleCollapse(diff.path)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {isCollapsed ? (
                        <EyeIcon className="h-4 w-4" />
                      ) : (
                        <EyeSlashIcon className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </div>
                {!isCollapsed && (
                  <>
                    {diff.type === 'modified' ? (
                      <>
                        <div className="text-red-600 dark:text-red-400 mt-1">
                          - {JSON.stringify(diff.oldValue, null, 2)}
                        </div>
                        <div className="text-green-600 dark:text-green-400 mt-1">
                          + {JSON.stringify(diff.newValue, null, 2)}
                        </div>
                      </>
                    ) : diff.type === 'added' ? (
                      <div className="text-green-600 dark:text-green-400 mt-1">
                        + {JSON.stringify(diff.newValue, null, 2)}
                      </div>
                    ) : diff.type === 'removed' ? (
                      <div className="text-red-600 dark:text-red-400 mt-1">
                        - {JSON.stringify(diff.oldValue, null, 2)}
                      </div>
                    ) : (
                      <div className="text-gray-600 dark:text-gray-400 mt-1">
                        {JSON.stringify(diff.oldValue, null, 2)}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const CompareOptionsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Compare Options</h3>
        <div className="space-y-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={compareOptions.ignoreArrayOrder}
              onChange={(e) => setCompareOptions({
                ...compareOptions,
                ignoreArrayOrder: e.target.checked
              })}
              className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Ignore array order
            </span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={compareOptions.ignoreObjectOrder}
              onChange={(e) => setCompareOptions({
                ...compareOptions,
                ignoreObjectOrder: e.target.checked
              })}
              className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Ignore object key order
            </span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={compareOptions.ignoreWhitespace}
              onChange={(e) => setCompareOptions({
                ...compareOptions,
                ignoreWhitespace: e.target.checked
              })}
              className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Ignore whitespace in strings
            </span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={compareOptions.showUnchanged}
              onChange={(e) => setCompareOptions({
                ...compareOptions,
                showUnchanged: e.target.checked
              })}
              className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Show unchanged values
            </span>
          </label>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setShowCompareOptions(false)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );

  // Transform functions
  const transformJSON = (data: any, operations: TransformOperation[]): any => {
    let result = JSON.parse(JSON.stringify(data));
    
    for (const op of operations) {
      switch (op.type) {
        case 'sort':
          if (Array.isArray(result) && op.field) {
            result.sort((a, b) => {
              const aVal = op.field ? a[op.field] : a;
              const bVal = op.field ? b[op.field] : b;
              return op.order === 'desc' ? 
                (bVal > aVal ? 1 : -1) : 
                (aVal > bVal ? 1 : -1);
            });
          }
          break;
        case 'filter':
          if (Array.isArray(result) && op.criteria) {
            result = result.filter(item => {
              try {
                return new Function('item', `return ${op.criteria}`)(item);
              } catch {
                return true;
              }
            });
          }
          break;
        case 'map':
          if (Array.isArray(result) && op.expression) {
            result = result.map(item => {
              try {
                return new Function('item', `return ${op.expression}`)(item);
              } catch {
                return item;
              }
            });
          }
          break;
        case 'group':
          if (Array.isArray(result) && op.field) {
            result = result.reduce((acc, item) => {
              const key = op.field ? item[op.field] : item;
              if (!acc[key]) acc[key] = [];
              acc[key].push(item);
              return acc;
            }, {});
          }
          break;
        case 'aggregate':
          if (Array.isArray(result) && op.field && op.expression) {
            result = result.reduce((acc, item) => {
              try {
                return new Function('acc', 'item', `return ${op.expression}`)(acc, item);
              } catch {
                return acc;
              }
            }, 0);
          }
          break;
      }
    }
    
    return result;
  };

  // Repair functions
  const repairJSON = (input: string, options: RepairOptions): string => {
    let result = input;

    try {
      if (options.fixQuotes) {
        result = result.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":');
      }

      if (options.removeTrailingCommas) {
        result = result.replace(/,(\s*[}\]])/g, '$1');
      }

      if (options.addMissingBraces) {
        const stack: string[] = [];
        let fixed = '';
        for (let i = 0; i < result.length; i++) {
          const char = result[i];
          if (char === '{' || char === '[') {
            stack.push(char === '{' ? '}' : ']');
            fixed += char;
          } else if (char === '}' || char === ']') {
            if (stack.length === 0) continue;
            const expected = stack.pop();
            fixed += expected;
          } else {
            fixed += char;
          }
        }
        while (stack.length > 0) {
          fixed += stack.pop();
        }
        result = fixed;
      }

      if (options.fixMalformedArrays) {
        result = result.replace(/\[[\s\n]*,/g, '[');
        result = result.replace(/,[\s\n]*\]/g, ']');
        result = result.replace(/,[\s\n]*,/g, ',');
      }

      // Final validation
      JSON.parse(result);
      return result;
    } catch {
      // If repair fails, use jsonrepair as fallback
      return jsonrepair(input);
    }
  };

  // Export functions
  const exportJSON = async (data: any, format: ExportFormat) => {
    try {
      let content: string;
      let filename: string;
      let mimeType: string;

      switch (format) {
        case 'json':
          content = JSON.stringify(data, null, 2);
          filename = 'data.json';
          mimeType = 'application/json';
          break;
        case 'csv':
          if (!Array.isArray(data)) {
            throw new Error('Data must be an array to export as CSV');
          }
          content = stringify(data, {
            header: true,
            cast: {
              object: (value) => JSON.stringify(value),
              date: (value) => value.toISOString()
            }
          });
          filename = 'data.csv';
          mimeType = 'text/csv';
          break;
        case 'yaml':
          content = yaml.dump(data);
          filename = 'data.yaml';
          mimeType = 'application/yaml';
          break;
        case 'xml':
          const parser = new Parser();
          content = await new Promise((resolve) => {
            parser.parseString(data, (err: any, result: any) => {
              resolve(result ? JSON.stringify(result) : '');
            });
          });
          filename = 'data.xml';
          mimeType = 'application/xml';
          break;
        default:
          throw new Error('Unsupported export format');
      }

      const blob = new Blob([content], { type: mimeType });
      saveAs(blob, filename);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    }
  };

  // Large document handling
  const handleLargeDocument = async (file: File) => {
    setShowLoadingModal(true);
    setLoadProgress(0);

    try {
      const chunkSize = 1024 * 1024; // 1MB chunks
      const fileSize = file.size;
      let loadedSize = 0;
      let jsonContent = '';

      const reader = new FileReader();

      while (loadedSize < fileSize) {
        const blob = file.slice(loadedSize, loadedSize + chunkSize);
        const chunk = await new Promise<string>((resolve, reject) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsText(blob);
        });

        jsonContent += chunk;
        loadedSize += chunkSize;
        setLoadProgress((loadedSize / fileSize) * 100);

        // Try to parse incrementally if possible
        try {
          JSON.parse(jsonContent);
        } catch {
          // Continue loading if not valid JSON yet
        }
      }

      setInput(jsonContent);
      const parsed = JSON.parse(jsonContent);
      setParsedData(parsed);
      
      // Calculate document statistics
      const stats = {
        size: fileSize,
        nodes: countNodes(parsed),
        depth: getDepth(parsed)
      };
      setDocumentStats(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load large document');
    } finally {
      setShowLoadingModal(false);
    }
  };

  // Helper functions for document statistics
  const countNodes = (obj: any): number => {
    let count = 1;
    if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        count += countNodes(obj[key]);
      }
    }
    return count;
  };

  const getDepth = (obj: any): number => {
    if (typeof obj !== 'object' || obj === null) return 0;
    let maxDepth = 0;
    for (const key in obj) {
      maxDepth = Math.max(maxDepth, getDepth(obj[key]));
    }
    return maxDepth + 1;
  };

  // Offline support
  useEffect(() => {
    const checkOfflineStatus = () => {
      setIsOfflineMode(!navigator.onLine);
    };

    window.addEventListener('online', checkOfflineStatus);
    window.addEventListener('offline', checkOfflineStatus);
    checkOfflineStatus();

    return () => {
      window.removeEventListener('online', checkOfflineStatus);
      window.removeEventListener('offline', checkOfflineStatus);
    };
  }, []);

  // File system access
  const saveToFile = async () => {
    try {
      if (!fileHandle) {
        // If no file handle exists, create a new one
        const handle = await window.showSaveFilePicker({
          types: [{
            description: 'JSON File',
            accept: {
              'application/json': ['.json']
            }
          }]
        });
        setFileHandle(handle);
        fileHandle = handle;
      }

      if (!fileHandle) {
        throw new Error('No file handle available');
      }

      const writable = await fileHandle.createWritable();
      await writable.write(output);
      await writable.close();
      setUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving file:', error);
      // Fallback to download
      const blob = new Blob([output], { type: 'application/json' });
      saveAs(blob, 'formatted.json');
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInput(text);
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
    setParsedData(null);
    setSearchResults([]);
  };

  const handleInputChange = (value: string | undefined) => {
    setInput(value || '');
    setError('');
  };

  const handleCompareInputChange = (value: string | undefined) => {
    setCompareInput(value || '');
  };

  const handleCompareOutputChange = (value: string | undefined) => {
    setCompareOutput(value || '');
  };

  // Add new functions
  const handleAdvancedSearch = () => {
    if (!parsedData || !searchQuery) {
      setSearchResults([]);
      return;
    }

    let results: { path: string; value: any }[] = [];
    const searchRegex = searchOptions.regex 
      ? new RegExp(searchQuery, searchOptions.caseSensitive ? '' : 'i')
      : new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), searchOptions.caseSensitive ? '' : 'i');

    const searchInObject = (obj: any, path = '') => {
      if (typeof obj === 'object' && obj !== null) {
        Object.entries(obj).forEach(([key, value]) => {
          const currentPath = path ? `${path}.${key}` : key;
          
          if (searchOptions.searchInKeys && searchRegex.test(key)) {
            results.push({ path: currentPath, value });
          }
          
          if (searchOptions.searchInValues) {
            if (typeof value === 'string' && searchRegex.test(value)) {
              results.push({ path: currentPath, value });
            } else if (typeof value === 'object' && value !== null) {
              searchInObject(value, currentPath);
            }
          }
        });
      }
    };

    searchInObject(parsedData);
    setSearchResults(results);
    setStatusMessage(`Found ${results.length} matches`);
  };

  const handleToggleToolbar = () => {
    setShowToolbar(!showToolbar);
  };

  const handleToggleStatusBar = () => {
    setShowStatusBar(!showStatusBar);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* Header Section */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">JSON Formatter</h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Format, validate, and transform your JSON data
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={loadSampleJson}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <LightBulbIcon className="h-5 w-5 mr-2" />
                  Load Sample
                </button>
                <button
                  onClick={() => setShowHelpModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <QuestionMarkCircleIcon className="h-5 w-5 mr-2" />
                  Help
                </button>
              </div>
            </div>
          </div>

          {/* Toolbar */}
          {showToolbar && (
            <div className="px-6 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleToggleToolbar}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <MinusIcon className="h-5 w-5" />
                  </button>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={formatJSON}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      <ArrowPathIcon className="h-4 w-4 mr-1" />
                      Format
                    </button>
                    <button
                      onClick={handleCopy}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      <ClipboardIcon className="h-4 w-4 mr-1" />
                      Copy
                    </button>
                    <button
                      onClick={saveToFile}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                      Save
                    </button>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <MagnifyingGlassIcon className="h-4 w-4 mr-1" />
                    Advanced Search
                  </button>
                  <button
                    onClick={handleToggleStatusBar}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <MinusIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="p-6">
            {/* Input Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Input JSON
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePaste}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-xs font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <ClipboardIcon className="h-4 w-4 mr-1" />
                    Paste
                  </button>
                  <button
                    onClick={handleClear}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-xs font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <TrashIcon className="h-4 w-4 mr-1" />
                    Clear
                  </button>
                </div>
              </div>
              <div className="relative">
                <Editor
                  height="300px"
                  defaultLanguage="json"
                  value={input}
                  onChange={handleInputChange}
                  theme={isDarkMode ? 'vs-dark' : 'light'}
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
                    formatOnPaste: true,
                    formatOnType: true,
                  }}
                />
                {error && (
                  <div className="absolute bottom-0 left-0 right-0 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800 p-2">
                    <div className="flex items-center text-red-700 dark:text-red-300 text-sm">
                      <ExclamationCircleIcon className="h-5 w-5 mr-2" />
                      {error}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Advanced Search Panel */}
            {showAdvancedSearch && (
              <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={searchOptions.caseSensitive}
                      onChange={(e) => setSearchOptions({
                        ...searchOptions,
                        caseSensitive: e.target.checked
                      })}
                      className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                    />
                    <label className="text-sm text-gray-700 dark:text-gray-300">
                      Case Sensitive
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={searchOptions.wholeWord}
                      onChange={(e) => setSearchOptions({
                        ...searchOptions,
                        wholeWord: e.target.checked
                      })}
                      className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                    />
                    <label className="text-sm text-gray-700 dark:text-gray-300">
                      Whole Word
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={searchOptions.regex}
                      onChange={(e) => setSearchOptions({
                        ...searchOptions,
                        regex: e.target.checked
                      })}
                      className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                    />
                    <label className="text-sm text-gray-700 dark:text-gray-300">
                      Regular Expression
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={searchOptions.searchInKeys}
                      onChange={(e) => setSearchOptions({
                        ...searchOptions,
                        searchInKeys: e.target.checked
                      })}
                      className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                    />
                    <label className="text-sm text-gray-700 dark:text-gray-300">
                      Search in Keys
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={searchOptions.searchInValues}
                      onChange={(e) => setSearchOptions({
                        ...searchOptions,
                        searchInValues: e.target.checked
                      })}
                      className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                    />
                    <label className="text-sm text-gray-700 dark:text-gray-300">
                      Search in Values
                    </label>
                  </div>
                  <div className="flex items-center justify-end">
                    <button
                      onClick={handleAdvancedSearch}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      Search
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Controls Section */}
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* View Mode */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    View Mode
                  </label>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setViewMode('formatted')}
                      className={`flex-1 inline-flex items-center justify-center px-3 py-2 border text-sm font-medium rounded-md ${
                        viewMode === 'formatted'
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <DocumentTextIcon className="h-4 w-4 mr-1" />
                      Formatted
                    </button>
                    <button
                      onClick={() => setViewMode('minified')}
                      className={`flex-1 inline-flex items-center justify-center px-3 py-2 border text-sm font-medium rounded-md ${
                        viewMode === 'minified'
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <DocumentIcon className="h-4 w-4 mr-1" />
                      Minified
                    </button>
                    <button
                      onClick={() => setViewMode('compare')}
                      className={`flex-1 inline-flex items-center justify-center px-3 py-2 border text-sm font-medium rounded-md ${
                        viewMode === 'compare'
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <ArrowsRightLeftIcon className="h-4 w-4 mr-1" />
                      Compare
                    </button>
                  </div>
                </div>

                {/* Format Options */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Format Options
                  </label>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setIndentSize(2)}
                      className={`flex-1 inline-flex items-center justify-center px-3 py-2 border text-sm font-medium rounded-md ${
                        indentSize === 2
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      2 Spaces
                    </button>
                    <button
                      onClick={() => setIndentSize(4)}
                      className={`flex-1 inline-flex items-center justify-center px-3 py-2 border text-sm font-medium rounded-md ${
                        indentSize === 4
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      4 Spaces
                    </button>
                    <button
                      onClick={() => setIndentSize(0)}
                      className={`flex-1 inline-flex items-center justify-center px-3 py-2 border text-sm font-medium rounded-md ${
                        indentSize === 0
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      No Indent
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Actions
                  </label>
                  <div className="flex space-x-2">
                    <button
                      onClick={formatJSON}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <ArrowPathIcon className="h-4 w-4 mr-1" />
                      Format
                    </button>
                    <button
                      onClick={handleCopy}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      <ClipboardIcon className="h-4 w-4 mr-1" />
                      Copy
                    </button>
                    <button
                      onClick={saveToFile}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                      Save
                    </button>
                  </div>
                </div>

                {/* Theme Toggle */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Theme
                  </label>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setIsDarkMode(false)}
                      className={`flex-1 inline-flex items-center justify-center px-3 py-2 border text-sm font-medium rounded-md ${
                        !isDarkMode
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <SunIcon className="h-4 w-4 mr-1" />
                      Light
                    </button>
                    <button
                      onClick={() => setIsDarkMode(true)}
                      className={`flex-1 inline-flex items-center justify-center px-3 py-2 border text-sm font-medium rounded-md ${
                        isDarkMode
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <MoonIcon className="h-4 w-4 mr-1" />
                      Dark
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Output Section */}
            <div className="space-y-4">
              {viewMode === 'compare' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Original JSON
                    </label>
                    <Editor
                      height="300px"
                      defaultLanguage="json"
                      value={compareInput}
                      onChange={handleCompareInputChange}
                      theme={isDarkMode ? 'vs-dark' : 'light'}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: 'on',
                        folding: true,
                        wordWrap: 'on',
                        automaticLayout: true,
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Compare JSON
                    </label>
                    <Editor
                      height="300px"
                      defaultLanguage="json"
                      value={compareOutput}
                      onChange={handleCompareOutputChange}
                      theme={isDarkMode ? 'vs-dark' : 'light'}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: 'on',
                        folding: true,
                        wordWrap: 'on',
                        automaticLayout: true,
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Output
                  </label>
                  <Editor
                    height="300px"
                    defaultLanguage="json"
                    value={output}
                    theme={isDarkMode ? 'vs-dark' : 'light'}
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: 'on',
                      folding: true,
                      wordWrap: 'on',
                      automaticLayout: true,
                    }}
                  />
                </div>
              )}
            </div>

            {/* Search Section */}
            <div className="mt-6">
              <div className="flex items-center space-x-2">
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search in JSON..."
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleSearch}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Search
                </button>
              </div>
              {searchResults.length > 0 && (
                <div className="mt-4">
                  <div className="bg-white dark:bg-gray-700 shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200 dark:divide-gray-600">
                      {searchResults.map((result, index) => (
                        <li key={index} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-600">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {result.path}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {result.value}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status Bar */}
          {showStatusBar && (
            <div className="px-6 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {statusMessage || 'Ready'}
                  </span>
                  {parsedData && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Size: {documentStats.size} bytes | Nodes: {documentStats.nodes} | Depth: {documentStats.depth}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {isOfflineMode ? 'Offline' : 'Online'}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {unsavedChanges ? 'Unsaved changes' : 'All changes saved'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Share JSON</h3>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-200"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  setShowShareModal(false);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
              >
                Copy
              </button>
            </div>
            <button
              onClick={() => setShowShareModal(false)}
              className="mt-4 px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showJsonPathModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">JSON Path Query</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={jsonPathQuery}
                  onChange={(e) => setJsonPathQuery(e.target.value)}
                  placeholder="Enter JSON path (e.g., store.departments[0].name)"
                  className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-200"
                />
                <button
                  onClick={handleJsonPathQuery}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
                >
                  Query
                </button>
              </div>
              {jsonPathResult !== null && (
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <pre className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap">
                    {JSON.stringify(jsonPathResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowJsonPathModal(false)}
              className="mt-4 px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showHelpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Keyboard Shortcuts</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">Format JSON</span>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Ctrl/⌘ + B</kbd>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">Search</span>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Ctrl/⌘ + F</kbd>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">Show Help</span>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Ctrl/⌘ + /</kbd>
              </div>
            </div>
            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Features</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-300">
                <li>JSON formatting with customizable indentation</li>
                <li>JSON Schema validation</li>
                <li>JSON Path queries</li>
                <li>Search within JSON</li>
                <li>Compare two JSON documents</li>
                <li>Tree and table views</li>
                <li>Share formatted JSON via URL</li>
                <li>Dark mode support</li>
              </ul>
            </div>
            <button
              onClick={() => setShowHelpModal(false)}
              className="mt-4 px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showCompareOptions && <CompareOptionsModal />}
    </div>
  );
} 