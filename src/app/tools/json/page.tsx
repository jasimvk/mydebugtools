'use client';

export const dynamic = "force-dynamic";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import nextDynamic from 'next/dynamic';
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
  ExclamationCircleIcon,
  ArrowDownIcon,
  ListBulletIcon,
  FolderIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import Ajv from 'ajv';
import yaml from 'js-yaml';
import { stringify } from 'csv-stringify/sync';
import jsonpath from 'jsonpath';
import { Validator } from 'jsonschema';
import { useDebounce } from 'use-debounce';
import { type EditorProps } from '@monaco-editor/react';

interface SimpleEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  height?: string;
}

// Simple textarea component for server-side rendering
const SimpleEditor: React.FC<SimpleEditorProps> = ({ value, onChange, readOnly = false, height = '500px' }) => (
  <textarea
    value={value}
    onChange={(e) => onChange(e.target.value)}
    readOnly={readOnly}
    className="w-full font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-4"
    style={{ height }}
  />
);

// Client-side only Monaco editor component with proper loading state
const MonacoEditorWrapper = nextDynamic(
  () => import('@monaco-editor/react').then((mod) => {
    const Editor = mod.default;
    return function MonacoEditorComponent(props: EditorProps) {
      return <Editor {...props} />;
    };
  }),
  {
    ssr: false,
    loading: () => <SimpleEditor value="" onChange={() => {}} />,
  }
);

// Use file-saver and jsonrepair only in client code
function saveFile(data: string, filename: string) {
  if (typeof window !== 'undefined') {
    import('file-saver').then(({ saveAs }) => {
      const blob = new Blob([data], { type: 'application/json' });
      saveAs(blob, filename);
    });
  }
}

async function repairJson(jsonString: string) {
  if (typeof window !== 'undefined') {
    const { jsonrepair } = await import('jsonrepair');
    return jsonrepair(jsonString);
  }
  return jsonString;
}

type ViewMode = 'formatted' | 'minified' | 'compare';

type TabType = 'format' | 'validate' | 'transform' | 'compare' | 'search';

type TransformOperation = {
  type: 'sort' | 'filter' | 'map' | 'group' | 'flatten' | 'merge';
  field?: string;
  value?: any;
  operator?: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'regex';
  order?: 'asc' | 'desc';
  operation?: 'uppercase' | 'lowercase' | 'trim' | 'parseInt' | 'parseFloat' | 'toDate';
  groupBy?: string;
  mergeKey?: string;
};

type ExportFormat = 'json' | 'xml' | 'csv' | 'yaml' | null;

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

type SearchResult = {
  path: string;
  value: any;
  type: 'key' | 'value';
};

type DiffStats = {
  added: number;
  removed: number;
  modified: number;
  unchanged: number;
};

type SearchOptions = {
  caseSensitive: boolean;
  wholeWord: boolean;
  regex: boolean;
  searchInKeys: boolean;
  searchInValues: boolean;
  advanced: boolean;
};

type ValidationRule = {
  path: string;
  type: 'required' | 'type' | 'format' | 'pattern' | 'custom';
  value?: string;
  message: string;
};

type ViewType = 'text' | 'tree' | 'compare';

type CompareMode = 'diff' | 'side-by-side';

interface CompareResult {
  added: any[];
  removed: any[];
  modified: {
    path: string;
    oldValue: any;
    newValue: any;
  }[];
}

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

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

interface CompareOptionsModalProps {
  options: CompareOptions;
  onChange: (options: CompareOptions) => void;
  onClose: () => void;
}

const CompareOptionsModal: React.FC<CompareOptionsModalProps> = ({ options, onChange, onClose }) => {
  return (
    <Modal isOpen={true} onClose={onClose} title="Compare Options">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={options.ignoreArrayOrder}
            onChange={(e) => onChange({ ...options, ignoreArrayOrder: e.target.checked })}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label className="text-sm text-gray-700">
            Ignore Array Order
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={options.ignoreObjectOrder}
            onChange={(e) => onChange({ ...options, ignoreObjectOrder: e.target.checked })}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label className="text-sm text-gray-700">
            Ignore Object Order
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={options.ignoreWhitespace}
            onChange={(e) => onChange({ ...options, ignoreWhitespace: e.target.checked })}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label className="text-sm text-gray-700">
            Ignore Whitespace
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={options.showUnchanged}
            onChange={(e) => onChange({ ...options, showUnchanged: e.target.checked })}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label className="text-sm text-gray-700">
            Show Unchanged
          </label>
        </div>
      </div>
    </Modal>
  );
};

const validateJSON = (data: any, rules: ValidationRule[]): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  const getValueAtPath = (obj: any, path: string): any => {
    return path.split('.').reduce((acc, part) => acc?.[part], obj);
  };

  rules.forEach(rule => {
    const value = getValueAtPath(data, rule.path);
    
    switch (rule.type) {
      case 'required':
        if (value === undefined || value === null || value === '') {
          errors.push(rule.message);
        }
        break;
      case 'type':
        if (value !== undefined && typeof value !== rule.value) {
          errors.push(rule.message);
        }
        break;
      case 'format':
        if (value !== undefined) {
          switch (rule.value) {
            case 'email':
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                errors.push(rule.message);
              }
              break;
            case 'url':
              try {
                new URL(value);
              } catch {
                errors.push(rule.message);
              }
              break;
            case 'date':
              if (isNaN(Date.parse(value))) {
                errors.push(rule.message);
              }
              break;
          }
        }
        break;
      case 'pattern':
        if (value !== undefined && !new RegExp(rule.value!).test(value)) {
          errors.push(rule.message);
        }
        break;
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
};

const ToolbarButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isActive?: boolean;
  tooltip?: string;
}> = ({ icon, label, onClick, isActive, tooltip }) => (
  <button
    onClick={onClick}
    className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md ${
      isActive
        ? 'bg-indigo-100 text-indigo-700'
        : 'text-gray-700 hover:bg-gray-100'
    }`}
    title={tooltip}
  >
    {icon}
    <span className="ml-1.5">{label}</span>
  </button>
);

const SearchBar: React.FC<{
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: () => void;
  options: SearchOptions;
  onOptionsChange: (options: SearchOptions) => void;
}> = ({ query, onQueryChange, onSearch, options, onOptionsChange }) => (
  <div className="relative">
    <div className="flex items-center space-x-2">
      <div className="relative flex-1">
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search in JSON... (Ctrl/⌘ + F)"
          className="block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:ring-indigo-500 focus:border-indigo-500"
        />
        <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>
      <button
        onClick={onSearch}
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
      >
        Search
      </button>
      <button
        onClick={() => onOptionsChange({ ...options, advanced: !options.advanced })}
        className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
      >
        <AdjustmentsHorizontalIcon className="h-4 w-4 mr-1.5" />
        Options
      </button>
    </div>
    
    {options.advanced && (
      <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.caseSensitive}
                onChange={(e) => onOptionsChange({ ...options, caseSensitive: e.target.checked })}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">Case Sensitive</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.wholeWord}
                onChange={(e) => onOptionsChange({ ...options, wholeWord: e.target.checked })}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">Whole Word</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.regex}
                onChange={(e) => onOptionsChange({ ...options, regex: e.target.checked })}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">Regular Expression</span>
            </label>
          </div>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.searchInKeys}
                onChange={(e) => onOptionsChange({ ...options, searchInKeys: e.target.checked })}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">Search in Keys</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.searchInValues}
                onChange={(e) => onOptionsChange({ ...options, searchInValues: e.target.checked })}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">Search in Values</span>
            </label>
          </div>
        </div>
      </div>
    )}
  </div>
);

const JSONEditor: React.FC<{
  value: string;
  onChange: (value: string) => void;
  onError: (error: string | null) => void;
  readOnly?: boolean;
  height?: string;
}> = ({ value, onChange, onError, readOnly = false, height = '500px' }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const validateJSON = (json: string) => {
    try {
      if (!json.trim()) {
        onError(null);
        return;
      }
      JSON.parse(json);
      onError(null);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Invalid JSON');
    }
  };

  if (!mounted) {
    return <SimpleEditor value={value} onChange={onChange} readOnly={readOnly} height={height} />;
  }

  return (
    <MonacoEditorWrapper
      height={height}
      defaultLanguage="json"
      value={value}
      onChange={(value) => {
        onChange(value || '');
        validateJSON(value || '');
      }}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: 'on',
        readOnly,
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        wordWrap: 'on',
        formatOnPaste: true,
        formatOnType: true,
      }}
    />
  );
};

const StatusBar: React.FC<{
  stats: {
    size: number;
    nodes: number;
    depth: number;
    lines: number;
  };
  error: string | null;
  viewType: ViewType;
  filePath: string | null;
  isModified: boolean;
  schemaValidation: ValidationResult;
  searchStatus: {
    active: boolean;
    query: string;
    matches: number;
  };
  jsonPathStatus: {
    active: boolean;
    query: string;
    hasResult: boolean;
  };
  transformStatus: {
    active: boolean;
    operations: number;
  };
  compareStatus: {
    active: boolean;
    stats: {
      added: number;
      removed: number;
      modified: number;
    };
  };
  exportFormat: ExportFormat;
  encoding: string;
}> = ({ stats, error, viewType, filePath, isModified, schemaValidation, searchStatus, jsonPathStatus, transformStatus, compareStatus, exportFormat, encoding }) => {
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <DocumentTextIcon className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-500">
              Size: {formatSize(stats.size)}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <ViewColumnsIcon className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-500">
              Nodes: {stats.nodes}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <ArrowDownIcon className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-500">
              Depth: {stats.depth}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <ListBulletIcon className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-500">
              Lines: {stats.lines}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <CodeBracketIcon className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-500">
              View: {viewType.charAt(0).toUpperCase() + viewType.slice(1)}
            </span>
          </div>
          {schemaValidation.isValid !== undefined && (
            <div className="flex items-center space-x-2">
              {schemaValidation.isValid ? (
                <CheckCircleIcon className="h-4 w-4 text-green-500" />
              ) : (
                <ExclamationCircleIcon className="h-4 w-4 text-red-500" />
              )}
              <span className={`text-sm ${
                schemaValidation.isValid
                  ? 'text-green-500'
                  : 'text-red-500'
              }`}>
                {schemaValidation.isValid ? 'Valid Schema' : 'Invalid Schema'}
              </span>
              {schemaValidation.message && (
                <span className="text-sm text-gray-500">
                  ({schemaValidation.message})
                </span>
              )}
            </div>
          )}
          {searchStatus.active && (
            <div className="flex items-center space-x-2">
              <MagnifyingGlassIcon className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-blue-500">
                {searchStatus.matches} matches for "{searchStatus.query}"
              </span>
            </div>
          )}
          {jsonPathStatus.active && (
            <div className="flex items-center space-x-2">
              <CommandLineIcon className="h-4 w-4 text-purple-500" />
              <span className="text-sm text-purple-500">
                JSONPath: {jsonPathStatus.query}
                {jsonPathStatus.hasResult && ' (has result)'}
              </span>
            </div>
          )}
          {transformStatus.active && (
            <div className="flex items-center space-x-2">
              <ArrowsUpDownIcon className="h-4 w-4 text-orange-500" />
              <span className="text-sm text-orange-500">
                {transformStatus.operations} transformation{transformStatus.operations !== 1 ? 's' : ''} applied
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {filePath && (
            <div className="flex items-center space-x-2">
              <FolderIcon className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">
                {filePath}
              </span>
              {isModified && (
                <span className="text-sm text-yellow-500">•</span>
              )}
            </div>
          )}
          {error && (
            <div className="flex items-center space-x-2">
              <ExclamationCircleIcon className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-500">{error}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface XMLParserOptions {
  attributeNamePrefix: string;
  textNodeName: string;
  ignoreAttributes: boolean;
  format: boolean;
  indentBy: string;
}

interface XMLParser {
  parse(data: any): string;
}

const convertToXML = (data: any): string => {
  const obj2xml = (obj: any, indent = ''): string => {
    if (typeof obj !== 'object' || obj === null) {
      return String(obj);
    }

    let xml = '';
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        if (Array.isArray(value)) {
          for (const item of value) {
            xml += `${indent}<${key}>${obj2xml(item, indent + '  ')}</${key}>\n`;
          }
        } else if (typeof value === 'object' && value !== null) {
          xml += `${indent}<${key}>\n${obj2xml(value, indent + '  ')}${indent}</${key}>\n`;
        } else {
          xml += `${indent}<${key}>${value}</${key}>\n`;
        }
      }
    }
    return xml;
  };

  return `<?xml version="1.0" encoding="UTF-8"?>\n<root>\n${obj2xml(data, '  ')}</root>`;
};

const convertToCSV = (data: any): string => {
  const flattenObject = (obj: any, prefix = ''): Record<string, string> => {
    const flattened: Record<string, string> = {};

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        const newKey = prefix ? `${prefix}.${key}` : key;

        if (value && typeof value === 'object' && !Array.isArray(value)) {
          Object.assign(flattened, flattenObject(value, newKey));
        } else {
          flattened[newKey] = Array.isArray(value) ? JSON.stringify(value) : String(value);
        }
      }
    }

    return flattened;
  };

  const rows = Array.isArray(data) ? data : [data];
  const headers = new Set<string>();
  const flattenedRows = rows.map(row => {
    const flatRow = flattenObject(row);
    Object.keys(flatRow).forEach(key => headers.add(key));
    return flatRow;
  });

  const headerArray = Array.from(headers);
  const csvRows = [
    headerArray.join(','),
    ...flattenedRows.map(row =>
      headerArray.map(header => JSON.stringify(row[header] || '')).join(',')
    )
  ];

  return csvRows.join('\n');
};

// Helper functions for JSON analysis
const getMaxDepth = (obj: any): number => {
  if (typeof obj !== 'object' || obj === null) return 0;
  return 1 + Math.max(0, ...Object.values(obj).map(getMaxDepth));
};

const countKeys = (obj: any): number => {
  if (typeof obj !== 'object' || obj === null) return 0;
  return Object.keys(obj).length + Object.values(obj).reduce((sum: number, val: any) => sum + countKeys(val), 0);
};

interface ValidationResult {
  isValid: boolean | undefined;
  message: string | null;
}

const CompareEditor: React.FC<{
  leftValue: string;
  rightValue: string;
  onLeftChange: (value: string) => void;
  onRightChange: (value: string) => void;
  readOnly?: boolean;
  height?: string;
}> = ({ leftValue, rightValue, onLeftChange, onRightChange, readOnly = false, height = '500px' }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="grid grid-cols-2 gap-4">
        <SimpleEditor value={leftValue} onChange={onLeftChange} readOnly={readOnly} height={height} />
        <SimpleEditor value={rightValue} onChange={onRightChange} readOnly={readOnly} height={height} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <MonacoEditorWrapper
        height={height}
        defaultLanguage="json"
        value={leftValue}
        onChange={(value: string | undefined) => onLeftChange(value || '')}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
          formatOnPaste: true,
          formatOnType: true,
        }}
      />
      <MonacoEditorWrapper
        height={height}
        defaultLanguage="json"
        value={rightValue}
        onChange={(value: string | undefined) => onRightChange(value || '')}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
          formatOnPaste: true,
          formatOnType: true,
        }}
      />
    </div>
  );
};

export default function JSONFormatter() {
  // TEMPORARY: Comment out all logic to isolate build error
  return (
    <div className="flex items-center justify-center min-h-screen text-2xl text-gray-500">
      JSON Tools temporarily disabled for build troubleshooting.
    </div>
  );
} 