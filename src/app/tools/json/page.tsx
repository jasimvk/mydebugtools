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
import { jsonrepair } from 'jsonrepair';
import Ajv from 'ajv';
import yaml from 'js-yaml';
import { saveAs } from 'file-saver';
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
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [indentSize, setIndentSize] = useState(2);
  const [copied, setCopied] = useState(false);
  const [viewType, setViewType] = useState<ViewType>('text');
  const [parsedData, setParsedData] = useState<any>(null);
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [documentStats, setDocumentStats] = useState({
    size: 0,
    nodes: 0,
    depth: 0,
    lines: 0
  });
  const [jsonPathQuery, setJsonPathQuery] = useState('');
  const [jsonPathResult, setJsonPathResult] = useState<any>(null);
  const [schema, setSchema] = useState('');
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: undefined,
    message: null
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchOptions, setSearchOptions] = useState<SearchOptions>({
    caseSensitive: false,
    wholeWord: false,
    regex: false,
    searchInKeys: true,
    searchInValues: true,
    advanced: false
  });
  const [transformOperations, setTransformOperations] = useState<TransformOperation[]>([]);
  const [compareMode, setCompareMode] = useState<CompareMode>('diff');
  const [compareInput, setCompareInput] = useState('');
  const [compareResult, setCompareResult] = useState<CompareResult | null>(null);
  const [activeTab, setActiveTab] = useState<'format' | 'validate' | 'transform' | 'compare'>('format');
  const [showHelp, setShowHelp] = useState(false);
  const [showExamples, setShowExamples] = useState(false);

  // Add editor mounted state
  const [isEditorMounted, setIsEditorMounted] = useState(false);

  const [debouncedInput] = useDebounce(input, 500);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setIsEditorMounted(true);
  }, []);

  // Auto-format JSON when input changes
  useEffect(() => {
    if (debouncedInput) {
      try {
        const formatted = JSON.stringify(JSON.parse(debouncedInput), null, 2);
        setOutput(formatted);
      } catch (e) {
        // Ignore formatting errors
      }
    }
  }, [debouncedInput]);

  const stats = useMemo(() => {
    if (!debouncedInput.trim()) return null;
    try {
      const parsed = JSON.parse(debouncedInput);
      return {
        size: new Blob([debouncedInput]).size,
        lines: debouncedInput.split('\n').length,
        depth: getMaxDepth(parsed),
        keys: countKeys(parsed)
      };
    } catch (e) {
      return null;
    }
  }, [debouncedInput]);

  // Optimize schema validation
  const handleSchemaValidation = useCallback(async () => {
    if (!debouncedInput.trim()) return;
    setIsProcessing(true);
    try {
      const json = JSON.parse(debouncedInput);
      const validator = new Validator();
      const result = validator.validate(json, JSON.parse(schema));
      setValidationResult({
        isValid: result.valid,
        message: result.valid ? 'JSON matches schema' : result.errors.map(err => err.message).join('\n')
      });
    } catch (err: unknown) {
      setValidationResult({
        isValid: false,
        message: err instanceof Error ? err.message : 'Invalid schema'
      });
    } finally {
      setIsProcessing(false);
    }
  }, [debouncedInput, schema]);

  // Optimize JSONPath querying
  const handleQueryExecution = useCallback(async () => {
    if (!debouncedInput.trim() || !searchQuery.trim()) return;
    setIsProcessing(true);
    try {
      const json = JSON.parse(debouncedInput);
      const result = await jsonpath.query(json, searchQuery);
      setSearchResults(result.map((value: any, index: number) => ({
        path: `$[${index}]`,
        value,
        type: 'value'
      })));
    } catch (e) {
      setSearchResults([]);
    } finally {
      setIsProcessing(false);
    }
  }, [debouncedInput, searchQuery]);

  // Auto-format JSON when input changes
  const handleInputChange = (value: string | undefined) => {
    setInput(value || '');
    try {
      if (value && value.trim()) {
        const parsed = JSON.parse(value);
        setParsedData(parsed);
        
        let result = parsed;
        if (transformOperations.length > 0) {
          result = applyTransformations(parsed, transformOperations);
        }
        
        setOutput(JSON.stringify(result, null, 2));
        setError(null);
      } else {
        setOutput('');
        setParsedData(null);
        setError(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
      setOutput('');
      setParsedData(null);
    }
  };

  const formatJSON = () => {
    try {
      const parsed = JSON.parse(input);
      setParsedData(parsed);
      
      let result = parsed;
      if (transformOperations.length > 0) {
        result = applyTransformations(parsed, transformOperations);
      }
      
      setOutput(JSON.stringify(result, null, indentSize));
      setError(null);
      setUnsavedChanges(true);
      calculateStats(input, parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON');
      setOutput('');
      setParsedData(null);
    }
  };

  const calculateStats = (json: string, parsed: any) => {
    const stats = {
      size: new Blob([json]).size,
      nodes: 0,
      depth: 0,
      lines: json.split('\n').length
    };

    const countNodes = (obj: any, depth = 0) => {
      if (!obj || typeof obj !== 'object') return;
      stats.nodes++;
      stats.depth = Math.max(stats.depth, depth);
      Object.values(obj).forEach(value => countNodes(value, depth + 1));
    };

    countNodes(parsed);
    setDocumentStats(stats);
  };

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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setInput(content);
      setCurrentFilePath(file.name);
      setUnsavedChanges(false);
      formatJSON();
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError(null);
    setCurrentFilePath(null);
    setUnsavedChanges(false);
    setDocumentStats({ size: 0, nodes: 0, depth: 0, lines: 0 });
  };

  const handleJsonPathQuery = () => {
    try {
      if (!parsedData || !jsonPathQuery) return;
      const result = jsonpath.query(parsedData, jsonPathQuery);
      setJsonPathResult(result);
      setOutput(JSON.stringify(result, null, indentSize));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSONPath query');
    }
  };

  const validateSchema = () => {
    try {
      const parsedSchema = JSON.parse(schema);
      const validator = new Validator();
      const result = validator.validate(parsedData, parsedSchema);
      
      if (result.valid) {
        setValidationResult({
          isValid: true,
          message: 'JSON matches schema'
        });
      } else {
        setValidationResult({
          isValid: false,
          message: result.errors.map(err => err.message).join('\n')
        });
      }
    } catch (err) {
      setValidationResult({
        isValid: false,
        message: err instanceof Error ? err.message : 'Invalid schema'
      });
    }
  };

  const performSearch = () => {
    try {
      if (!parsedData || !searchQuery) {
        setSearchResults([]);
        return;
      }

      const results: SearchResult[] = [];
      const searchInObject = (obj: any, path: string = '') => {
        if (typeof obj !== 'object' || obj === null) {
          const value = String(obj);
          if (matchesSearch(value)) {
            results.push({
            path,
              value: obj,
              type: 'value'
          });
        }
        return;
      }

        Object.entries(obj).forEach(([key, value]) => {
          const currentPath = path ? `${path}.${key}` : key;
          
          if (searchOptions.searchInKeys && matchesSearch(key)) {
            results.push({
              path: currentPath,
              value: key,
              type: 'key'
            });
          }

          if (typeof value === 'object' && value !== null) {
            searchInObject(value, currentPath);
          } else if (searchOptions.searchInValues && matchesSearch(String(value))) {
            results.push({
              path: currentPath,
              value: value,
              type: 'value'
          });
        }
      });
      };

      searchInObject(parsedData);
      setSearchResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    }
  };

  const matchesSearch = (text: string): boolean => {
    if (!searchQuery) return false;
    
    if (searchOptions.regex) {
      try {
        const regex = new RegExp(searchQuery, searchOptions.caseSensitive ? '' : 'i');
        return regex.test(text);
      } catch {
        return false;
      }
    }

    const searchText = searchOptions.caseSensitive ? searchQuery : searchQuery.toLowerCase();
    const targetText = searchOptions.caseSensitive ? text : text.toLowerCase();

    if (searchOptions.wholeWord) {
      const words = targetText.split(/\s+/);
      return words.includes(searchText);
    }

    return targetText.includes(searchText);
  };

  const applyTransformations = (data: any, operations: TransformOperation[]): any => {
    let result = JSON.parse(JSON.stringify(data));

    operations.forEach(op => {
      switch (op.type) {
        case 'sort':
          if (Array.isArray(result) && op.field) {
            result.sort((a: any, b: any) => {
              const aVal = a[op.field!];
              const bVal = b[op.field!];
              return op.order === 'asc' 
                ? aVal > bVal ? 1 : -1 
                : aVal < bVal ? 1 : -1;
            });
          }
          break;

        case 'filter':
          if (Array.isArray(result) && op.field && op.operator && op.value !== undefined) {
            result = result.filter((item: any) => {
              const value = item[op.field!];
              switch (op.operator) {
                case 'equals':
                  return value === op.value;
                case 'contains':
                  return String(value).includes(String(op.value));
                case 'greaterThan':
                  return value > op.value;
                case 'lessThan':
                  return value < op.value;
                case 'regex':
                  return new RegExp(op.value).test(String(value));
                default:
                  return true;
              }
            });
          }
          break;

        case 'map':
          if (Array.isArray(result) && op.field && op.operation) {
            result = result.map((item: any) => {
              const newItem = { ...item };
              const value = newItem[op.field!];
              
              switch (op.operation) {
                case 'uppercase':
                  newItem[op.field!] = String(value).toUpperCase();
                  break;
                case 'lowercase':
                  newItem[op.field!] = String(value).toLowerCase();
                  break;
                case 'trim':
                  newItem[op.field!] = String(value).trim();
                  break;
                case 'parseInt':
                  newItem[op.field!] = parseInt(String(value), 10);
                  break;
                case 'parseFloat':
                  newItem[op.field!] = parseFloat(String(value));
                  break;
                case 'toDate':
                  newItem[op.field!] = new Date(value).toISOString();
                  break;
              }
              return newItem;
            });
          }
          break;

        case 'group':
          if (Array.isArray(result) && op.groupBy) {
            result = result.reduce((acc: any, item: any) => {
              const key = item[op.groupBy!];
              if (!acc[key]) {
                acc[key] = [];
              }
              acc[key].push(item);
              return acc;
            }, {});
          }
          break;

        case 'flatten':
          if (Array.isArray(result)) {
            result = result.flat();
          }
          break;

        case 'merge':
          if (Array.isArray(result) && op.mergeKey) {
            result = result.reduce((acc: any, item: any) => {
              const key = item[op.mergeKey!];
              if (!acc[key]) {
                acc[key] = item;
              } else {
                acc[key] = { ...acc[key], ...item };
              }
              return acc;
            }, {});
          }
          break;
      }
    });

    return result;
  };

  const compareJSON = () => {
    try {
      const json1 = JSON.parse(input);
      const json2 = JSON.parse(compareInput);
      
      const result: CompareResult = {
        added: [],
        removed: [],
        modified: []
      };

      const compareObjects = (obj1: any, obj2: any, path: string = '') => {
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);

        // Find added keys
        keys2.forEach(key => {
          if (!keys1.includes(key)) {
            result.added.push({
              path: path ? `${path}.${key}` : key,
              value: obj2[key]
            });
          }
        });

        // Find removed keys
        keys1.forEach(key => {
          if (!keys2.includes(key)) {
            result.removed.push({
              path: path ? `${path}.${key}` : key,
              value: obj1[key]
            });
          }
        });

        // Compare common keys
        keys1.forEach(key => {
          if (keys2.includes(key)) {
            const newPath = path ? `${path}.${key}` : key;
            if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
              compareObjects(obj1[key], obj2[key], newPath);
            } else if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
              result.modified.push({
                path: newPath,
                oldValue: obj1[key],
                newValue: obj2[key]
              });
            }
          }
        });
      };

      compareObjects(json1, json2);
      setCompareResult(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON for comparison');
      setCompareResult(null);
    }
  };

  const renderTreeView = (data: any, path: string = '') => {
    if (typeof data !== 'object' || data === null) {
      return (
        <div className="flex items-center">
          <span className="text-gray-500">{path}:</span>
          <span className="ml-2">{JSON.stringify(data)}</span>
        </div>
      );
      }

      return (
      <div className="pl-4">
        {Object.entries(data).map(([key, value]) => {
          const newPath = path ? `${path}.${key}` : key;
          return (
            <div key={newPath} className="py-1">
              <div className="flex items-center">
                <span className="text-gray-500">{key}:</span>
                {typeof value === 'object' && value !== null ? (
                  <span className="ml-2 text-gray-400">
                    {Array.isArray(value) ? `[${value.length} items]` : '{...}'}
                  </span>
                ) : (
                  <span className="ml-2">{JSON.stringify(value)}</span>
                )}
            </div>
              {typeof value === 'object' && value !== null && renderTreeView(value, newPath)}
            </div>
          );
        })}
        </div>
      );
    };

    return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">JSON Formatter</h1>
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
          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer"
          >
            <CloudArrowUpIcon className="h-4 w-4 mr-2" />
            Upload JSON
          </label>
        </div>
      </div>

      {showHelp && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="text-lg font-medium text-blue-900 mb-2">Quick Help</h3>
          <ul className="list-disc pl-6 space-y-2 text-blue-800">
            <li>Paste your JSON or upload a file to get started</li>
            <li>Use the Format button to validate and format your JSON</li>
            <li>Try different views (Text, Tree, Compare) for better visualization</li>
            <li>Use JSONPath queries to extract specific data</li>
            <li>Validate your JSON against a schema</li>
            <li>Transform your data with various operations</li>
          </ul>
        </div>
      )}

      {showExamples && (
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h3 className="text-lg font-medium text-yellow-900 mb-2">Example JSON</h3>
          <div className="space-y-2">
            <button
              onClick={() => setInput(JSON.stringify(sampleJSON, null, 2))}
              className="text-sm text-yellow-800 hover:text-yellow-900"
            >
              Load Sample JSON
            </button>
            <div className="text-sm text-yellow-800">
              <p>Try these JSONPath queries:</p>
              <ul className="list-disc pl-6 mt-1">
                <li><code>{"$.store.book[*].author"}</code> - Get all authors</li>
                <li><code>{"$.store.book[?(@.price < 10)]"}</code> - Find cheap books</li>
                <li><code>{"$..price"}</code> - Get all prices</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center space-x-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('format')}
          className={`px-4 py-2 border-b-2 ${
            activeTab === 'format'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Format
        </button>
        <button
          onClick={() => setActiveTab('validate')}
          className={`px-4 py-2 border-b-2 ${
            activeTab === 'validate'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Validate
        </button>
        <button
          onClick={() => setActiveTab('transform')}
          className={`px-4 py-2 border-b-2 ${
            activeTab === 'transform'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Transform
        </button>
        <button
          onClick={() => setActiveTab('compare')}
          className={`px-4 py-2 border-b-2 ${
            activeTab === 'compare'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Compare
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Input</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={formatJSON}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                title="Format and validate JSON"
              >
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                Format
              </button>
              <button
                onClick={handleClear}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                title="Clear input"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
          {isEditorMounted && (
            <MonacoEditorWrapper
              height="400px"
              defaultLanguage="json"
              value={input}
              onChange={handleInputChange}
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
                formatOnPaste: true,
                formatOnType: true
              }}
            />
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Output</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopy}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                title="Copy to clipboard"
              >
                {copied ? (
                  <>
                    <CheckIcon className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
                    Copy
                  </>
                )}
              </button>
              <button
                onClick={handleDownload}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                title="Download JSON file"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Download
              </button>
            </div>
          </div>
          {isEditorMounted && (
            <MonacoEditorWrapper
              height="400px"
              defaultLanguage="json"
              value={output}
              onChange={(value) => setOutput(value || '')}
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
      </div>

      {activeTab === 'validate' && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Schema Validation</h3>
          <div className="space-y-2">
            <MonacoEditorWrapper
              height="200px"
              defaultLanguage="json"
              value={schema}
              onChange={(value) => setSchema(value || '')}
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
                tabSize: 2
              }}
            />
            <button
              onClick={validateSchema}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              Validate
            </button>
          </div>
        </div>
      )}

      {activeTab === 'transform' && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Transformations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Operation</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                onChange={(e) => {
                  const newOp: TransformOperation = {
                    type: e.target.value as any,
                    field: '',
                    value: ''
                  };
                  setTransformOperations([...transformOperations, newOp]);
                }}
              >
                <option value="">Select operation</option>
                <option value="sort">Sort</option>
                <option value="filter">Filter</option>
                <option value="map">Map</option>
                <option value="group">Group</option>
                <option value="flatten">Flatten</option>
                <option value="merge">Merge</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Field</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter field name"
                onChange={(e) => {
                  const lastOp = transformOperations[transformOperations.length - 1];
                  if (lastOp) {
                    lastOp.field = e.target.value;
                    setTransformOperations([...transformOperations]);
                  }
                }}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => {
                const result = applyTransformations(parsedData, transformOperations);
                setOutput(JSON.stringify(result, null, indentSize));
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              Apply Transformations
            </button>
          </div>
        </div>
      )}

      {activeTab === 'compare' && (
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setCompareMode('diff')}
              className={`px-4 py-2 rounded-md ${
                compareMode === 'diff' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Diff View
            </button>
            <button
              onClick={() => setCompareMode('side-by-side')}
              className={`px-4 py-2 rounded-md ${
                compareMode === 'side-by-side' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Side by Side
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Original JSON</h3>
              <MonacoEditorWrapper
                height="300px"
                defaultLanguage="json"
                value={input}
                onChange={(value) => setInput(value || '')}
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
                  tabSize: 2
                }}
              />
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Compare With</h3>
              <MonacoEditorWrapper
                height="300px"
                defaultLanguage="json"
                value={compareInput}
                onChange={(value) => setCompareInput(value || '')}
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
                  tabSize: 2
                }}
              />
            </div>
          </div>

          <button
            onClick={compareJSON}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Compare JSON
          </button>

          {compareResult && (
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium mb-4">Comparison Results</h3>
              
              {compareResult.added.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-green-600 font-medium mb-2">Added:</h4>
                  <ul className="list-disc pl-6">
                    {compareResult.added.map((item, index) => (
                      <li key={index} className="text-green-600">
                        {item.path}: {JSON.stringify(item.value)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {compareResult.removed.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-red-600 font-medium mb-2">Removed:</h4>
                  <ul className="list-disc pl-6">
                    {compareResult.removed.map((item, index) => (
                      <li key={index} className="text-red-600">
                        {item.path}: {JSON.stringify(item.value)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {compareResult.modified.length > 0 && (
                <div>
                  <h4 className="text-yellow-600 font-medium mb-2">Modified:</h4>
                  <ul className="list-disc pl-6">
                    {compareResult.modified.map((item, index) => (
                      <li key={index} className="text-yellow-600">
                        {item.path}:
                        <div className="pl-4">
                          <div>Old: {JSON.stringify(item.oldValue)}</div>
                          <div>New: {JSON.stringify(item.newValue)}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <StatusBar
        stats={documentStats}
        error={error}
        viewType={viewType}
        filePath={currentFilePath}
        isModified={unsavedChanges}
        schemaValidation={validationResult}
        searchStatus={{
          active: searchResults.length > 0,
          query: searchQuery,
          matches: searchResults.length
        }}
        jsonPathStatus={{
          active: jsonPathQuery !== '',
          query: jsonPathQuery,
          hasResult: jsonPathResult !== null
        }}
        transformStatus={{
          active: transformOperations.length > 0,
          operations: transformOperations.length
        }}
        compareStatus={{
          active: compareResult !== null,
          stats: {
            added: compareResult?.added.length || 0,
            removed: compareResult?.removed.length || 0,
            modified: compareResult?.modified.length || 0
          }
        }}
        exportFormat={null}
        encoding="UTF-8"
      />
    </div>
  );
} 