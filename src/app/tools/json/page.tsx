import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'JSON Tools – Format, Validate, Beautify | MyDebugTools',
  description: 'Free JSON tools to format, validate, and beautify JSON with syntax highlighting and tree view.',
  path: '/tools/json',
  keywords: ['json formatter','json beautifier','json validator','format json','pretty json'],
})
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
import { type EditorProps } from '@monaco-editor/react';
import PageWrapper from '@/components/PageWrapper';

// Move these imports to be dynamically loaded
const loadDependencies = async () => {
  const [
    { default: Ajv },
    { default: yaml },
    { stringify },
    { default: jsonpath },
    { Validator }
  ] = await Promise.all([
    import('ajv'),
    import('js-yaml'),
    import('csv-stringify/sync'),
    import('jsonpath'),
    import('jsonschema')
  ]);
  return { Ajv, yaml, stringify, jsonpath, Validator };
};

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

function JSONFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('format');
  const [schema, setSchema] = useState('');
  const [validationResult, setValidationResult] = useState<{ valid: boolean; errors: string[] }>({ valid: true, errors: [] });
  const [jsonPath, setJsonPath] = useState('');
  const [jsonPathResult, setJsonPathResult] = useState<any>(null);
  const [transformOperation, setTransformOperation] = useState<TransformOperation>({ type: 'sort' });
  const [compareInput, setCompareInput] = useState('');
  const [compareResult, setCompareResult] = useState<CompareResult | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOptions, setSearchOptions] = useState<SearchOptions>({
    caseSensitive: false,
    wholeWord: false,
    regex: false,
    searchInKeys: true,
    searchInValues: true,
    advanced: false
  });
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [exportFormat, setExportFormat] = useState<ExportFormat>(null);

  function handleFormat() {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, 2));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
      setOutput('');
    }
  }

  async function handleValidate() {
    try {
      const data = JSON.parse(input);
      const schemaObj = JSON.parse(schema);
      const { Ajv } = await loadDependencies();
      const ajv = new Ajv();
      const validate = ajv.compile(schemaObj);
      const valid = validate(data);
      
      setValidationResult({
        valid,
        errors: valid ? [] : (validate.errors || []).map(err => `${err.instancePath} ${err.message}`)
      });
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON or Schema');
      setValidationResult({ valid: false, errors: [] });
    }
  }

  async function handleJsonPath() {
    try {
      const data = JSON.parse(input);
      const { jsonpath } = await loadDependencies();
      const result = jsonpath.query(data, jsonPath);
      setJsonPathResult(result);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSONPath expression');
      setJsonPathResult(null);
    }
  }

  async function handleTransform() {
    try {
      const data = JSON.parse(input);
      const { jsonpath } = await loadDependencies();
      let result = data;

      switch (transformOperation.type) {
        case 'sort':
          if (Array.isArray(data)) {
            result = [...data].sort((a, b) => {
              if (transformOperation.field) {
                return a[transformOperation.field] > b[transformOperation.field] ? 1 : -1;
              }
              return a > b ? 1 : -1;
            });
            if (transformOperation.order === 'desc') {
              result.reverse();
            }
          }
          break;
        case 'filter':
          if (Array.isArray(data)) {
            result = data.filter(item => {
              if (!transformOperation.field || !transformOperation.value) return true;
              const value = item[transformOperation.field];
              switch (transformOperation.operator) {
                case 'equals': return value === transformOperation.value;
                case 'contains': return String(value).includes(String(transformOperation.value));
                case 'greaterThan': return value > transformOperation.value;
                case 'lessThan': return value < transformOperation.value;
                case 'regex': return new RegExp(transformOperation.value).test(String(value));
                default: return true;
              }
            });
          }
          break;
        case 'map':
          if (Array.isArray(data)) {
            result = data.map(item => {
              if (!transformOperation.field || !transformOperation.operation) return item;
              const value = item[transformOperation.field];
              switch (transformOperation.operation) {
                case 'uppercase': return { ...item, [transformOperation.field]: String(value).toUpperCase() };
                case 'lowercase': return { ...item, [transformOperation.field]: String(value).toLowerCase() };
                case 'trim': return { ...item, [transformOperation.field]: String(value).trim() };
                case 'parseInt': return { ...item, [transformOperation.field]: parseInt(String(value)) };
                case 'parseFloat': return { ...item, [transformOperation.field]: parseFloat(String(value)) };
                case 'toDate': return { ...item, [transformOperation.field]: new Date(value).toISOString() };
                default: return item;
              }
            });
          }
          break;
      }

      setOutput(JSON.stringify(result, null, 2));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Transform operation failed');
      setOutput('');
    }
  }

  function handleCompare() {
    try {
      const data1 = JSON.parse(input);
      const data2 = JSON.parse(compareInput);
      
      const result: CompareResult = {
        added: [],
        removed: [],
        modified: []
      };

      function compareObjects(obj1: any, obj2: any, path: string = '') {
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);

        keys1.forEach(key => {
          const currentPath = path ? `${path}.${key}` : key;
          if (!(key in obj2)) {
            result.removed.push(obj1[key]);
          } else if (typeof obj1[key] === 'object' && obj1[key] !== null &&
                     typeof obj2[key] === 'object' && obj2[key] !== null) {
            compareObjects(obj1[key], obj2[key], currentPath);
          } else if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
            result.modified.push({
              path: currentPath,
              oldValue: obj1[key],
              newValue: obj2[key]
            });
          }
        });

        keys2.forEach(key => {
          if (!(key in obj1)) {
            result.added.push(obj2[key]);
          }
        });
      }

      compareObjects(data1, data2);
      setCompareResult(result);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Comparison failed');
      setCompareResult(null);
    }
  }

  async function handleSearch() {
    try {
      const data = JSON.parse(input);
      const { jsonpath } = await loadDependencies();
      const results: SearchResult[] = [];
      
      function searchInObject(obj: any, path: string = '') {
        if (typeof obj !== 'object' || obj === null) return;

        Object.entries(obj).forEach(([key, value]) => {
          const currentPath = path ? `${path}.${key}` : key;
          
          if (searchOptions.searchInKeys) {
            const keyMatch = searchOptions.regex
              ? new RegExp(searchQuery, searchOptions.caseSensitive ? '' : 'i').test(key)
              : searchOptions.wholeWord
                ? key === searchQuery
                : key.toLowerCase().includes(searchQuery.toLowerCase());
            
            if (keyMatch) {
              results.push({ path: currentPath, value: key, type: 'key' });
            }
          }

          if (searchOptions.searchInValues) {
            const valueStr = String(value);
            const valueMatch = searchOptions.regex
              ? new RegExp(searchQuery, searchOptions.caseSensitive ? '' : 'i').test(valueStr)
              : searchOptions.wholeWord
                ? valueStr === searchQuery
                : valueStr.toLowerCase().includes(searchQuery.toLowerCase());
            
            if (valueMatch) {
              results.push({ path: currentPath, value, type: 'value' });
            }
          }

          if (typeof value === 'object' && value !== null) {
            searchInObject(value, currentPath);
          }
        });
      }

      searchInObject(data);
      setSearchResults(results);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Search failed');
      setSearchResults([]);
    }
  }

  async function handleExport() {
    try {
      const data = JSON.parse(input);
      const { stringify } = await loadDependencies();
      let result = '';

      switch (exportFormat) {
        case 'yaml':
          const { yaml } = await loadDependencies();
          result = yaml.dump(data);
          break;
        case 'xml':
          const { jsonpath } = await loadDependencies();
          result = convertToXML(data);
          break;
        case 'csv':
          result = convertToCSV(data);
          break;
        default:
          result = JSON.stringify(data, null, 2);
      }

      setOutput(result);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Export failed');
      setOutput('');
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">JSON Tools</h1>
      
      {/* Main container with improved layout */}
      <div className="w-full max-w-7xl bg-white rounded-lg shadow-md overflow-hidden">
        {/* Tabs with improved styling */}
        <div className="flex flex-wrap border-b border-gray-200">
          <button 
            onClick={() => setActiveTab('format')} 
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'format' 
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            title="Format JSON"
            aria-label="Format JSON tab"
          >
            <div className="flex items-center">
              <CodeBracketIcon className="h-5 w-5 mr-2" />
              Format
            </div>
          </button>
          <button 
            onClick={() => setActiveTab('validate')} 
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'validate' 
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            title="Validate JSON"
            aria-label="Validate JSON tab"
          >
            <div className="flex items-center">
              <DocumentCheckIcon className="h-5 w-5 mr-2" />
              Validate
            </div>
          </button>
          <button 
            onClick={() => setActiveTab('transform')} 
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'transform' 
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            title="Transform JSON"
            aria-label="Transform JSON tab"
          >
            <div className="flex items-center">
              <ArrowsUpDownIcon className="h-5 w-5 mr-2" />
              Transform
            </div>
          </button>
          <button 
            onClick={() => setActiveTab('compare')} 
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'compare' 
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            title="Compare JSON"
            aria-label="Compare JSON tab"
          >
            <div className="flex items-center">
              <ArrowsRightLeftIcon className="h-5 w-5 mr-2" />
              Compare
            </div>
          </button>
          <button 
            onClick={() => setActiveTab('search')} 
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'search' 
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            title="Search in JSON"
            aria-label="Search JSON tab"
          >
            <div className="flex items-center">
              <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
              Search
            </div>
          </button>
        </div>
        
        {/* Content area */}
        <div className="p-4">
          {/* Input section with improved styling */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="text-lg font-medium text-gray-700">Input JSON</label>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setInput(JSON.stringify(sampleJSON, null, 2))}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded flex items-center"
                  title="Load sample JSON"
                  aria-label="Load sample JSON"
                >
                  <LightBulbIcon className="h-4 w-4 mr-1" />
                  Sample
                </button>
                <button 
                  onClick={() => setInput('')}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded flex items-center"
                  title="Clear input"
                  aria-label="Clear input"
                >
                  <TrashIcon className="h-4 w-4 mr-1" />
                  Clear
                </button>
              </div>
            </div>
            <div className="relative">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                className="w-full h-64 font-mono text-sm border rounded p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Paste your JSON here..."
              />
              {input && (
                <button 
                  onClick={() => {
                    try {
                      const parsed = JSON.parse(input);
                      setInput(JSON.stringify(parsed, null, 2));
                      setError(null);
                    } catch (e) {
                      setError(e instanceof Error ? e.message : 'Invalid JSON');
                    }
                  }}
                  className="absolute top-2 right-2 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded"
                  title="Format JSON"
                  aria-label="Format JSON"
                >
                  Format
                </button>
              )}
            </div>
          </div>
          
          {/* Output section based on active tab */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Format tab */}
            {activeTab === 'format' && (
              <div className="md:col-span-2">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-lg font-medium text-gray-700">Formatted Output</label>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleFormat}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center"
                    >
                      <ArrowPathIcon className="h-4 w-4 mr-1" />
                      Format
                    </button>
                    {output && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(output);
                          // Show notification
                        }}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm flex items-center"
                        title="Copy to clipboard"
                      >
                        <ClipboardIcon className="h-4 w-4 mr-1" />
                        Copy
                      </button>
                    )}
                  </div>
                </div>
                <div className="relative">
                  <textarea
                    value={output}
                    readOnly
                    className="w-full h-64 font-mono text-sm border rounded p-3 bg-gray-50"
                  />
                  {!output && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      <p>Formatted JSON will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Validate tab */}
            {activeTab === 'validate' && (
              <div className="md:col-span-2">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-lg font-medium text-gray-700">Validation</label>
                  <button
                    onClick={handleValidate}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center"
                  >
                    <DocumentCheckIcon className="h-4 w-4 mr-1" />
                    Validate
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">JSON Schema</label>
                    <textarea
                      value={schema}
                      onChange={e => setSchema(e.target.value)}
                      className="w-full h-64 font-mono text-sm border rounded p-3"
                      placeholder="Paste your JSON Schema here..."
                    />
                  </div>
                  <div>
                    <div className="h-64 border rounded p-4 bg-gray-50 overflow-auto">
                      {validationResult.valid !== undefined ? (
                        <div>
                          <div className={`text-lg font-medium mb-4 ${validationResult.valid ? 'text-green-500' : 'text-red-500'}`}>
                            {validationResult.valid ? 'Valid JSON' : 'Invalid JSON'}
                          </div>
                          {!validationResult.valid && validationResult.errors.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Validation Errors:</h4>
                              <ul className="space-y-1">
                                {validationResult.errors.map((error, index) => (
                                  <li key={index} className="text-sm text-red-500">{error}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          <p>Validation results will appear here</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Transform tab */}
            {activeTab === 'transform' && (
              <div className="md:col-span-2">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-lg font-medium text-gray-700">Transform</label>
                  <button
                    onClick={handleTransform}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center"
                  >
                    <ArrowsUpDownIcon className="h-4 w-4 mr-1" />
                    Transform
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="bg-white border rounded p-4">
                      <label className="block mb-2 text-sm font-medium text-gray-700">Transform Operation</label>
                      <select
                        value={transformOperation.type}
                        onChange={e => setTransformOperation({ ...transformOperation, type: e.target.value as TransformOperation['type'] })}
                        className="w-full p-2 border rounded mb-4"
                      >
                        <option value="sort">Sort</option>
                        <option value="filter">Filter</option>
                        <option value="map">Map</option>
                      </select>
                      
                      {transformOperation.type === 'sort' && (
                        <div className="space-y-3">
                          <input
                            type="text"
                            placeholder="Field to sort by (optional)"
                            value={transformOperation.field || ''}
                            onChange={e => setTransformOperation({ ...transformOperation, field: e.target.value })}
                            className="w-full p-2 border rounded"
                          />
                          <select
                            value={transformOperation.order || 'asc'}
                            onChange={e => setTransformOperation({ ...transformOperation, order: e.target.value as 'asc' | 'desc' })}
                            className="w-full p-2 border rounded"
                          >
                            <option value="asc">Ascending</option>
                            <option value="desc">Descending</option>
                          </select>
                        </div>
                      )}
                      
                      {transformOperation.type === 'filter' && (
                        <div className="space-y-3">
                          <input
                            type="text"
                            placeholder="Field to filter by"
                            value={transformOperation.field || ''}
                            onChange={e => setTransformOperation({ ...transformOperation, field: e.target.value })}
                            className="w-full p-2 border rounded"
                          />
                          <select
                            value={transformOperation.operator || 'equals'}
                            onChange={e => setTransformOperation({ ...transformOperation, operator: e.target.value as TransformOperation['operator'] })}
                            className="w-full p-2 border rounded"
                          >
                            <option value="equals">Equals</option>
                            <option value="contains">Contains</option>
                            <option value="greaterThan">Greater Than</option>
                            <option value="lessThan">Less Than</option>
                            <option value="regex">Regex</option>
                          </select>
                          <input
                            type="text"
                            placeholder="Value to compare against"
                            value={transformOperation.value || ''}
                            onChange={e => setTransformOperation({ ...transformOperation, value: e.target.value })}
                            className="w-full p-2 border rounded"
                          />
                        </div>
                      )}
                      
                      {transformOperation.type === 'map' && (
                        <div className="space-y-3">
                          <input
                            type="text"
                            placeholder="Field to transform"
                            value={transformOperation.field || ''}
                            onChange={e => setTransformOperation({ ...transformOperation, field: e.target.value })}
                            className="w-full p-2 border rounded"
                          />
                          <select
                            value={transformOperation.operation || 'uppercase'}
                            onChange={e => setTransformOperation({ ...transformOperation, operation: e.target.value as TransformOperation['operation'] })}
                            className="w-full p-2 border rounded"
                          >
                            <option value="uppercase">Uppercase</option>
                            <option value="lowercase">Lowercase</option>
                            <option value="trim">Trim</option>
                            <option value="parseInt">Parse Integer</option>
                            <option value="parseFloat">Parse Float</option>
                            <option value="toDate">To Date</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">Transformed Output</label>
                    <div className="relative">
                      <textarea
                        value={output}
                        readOnly
                        className="w-full h-64 font-mono text-sm border rounded p-3 bg-gray-50"
                      />
                      {!output && (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                          <p>Transformed JSON will appear here</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Compare tab */}
            {activeTab === 'compare' && (
              <div className="md:col-span-2">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-lg font-medium text-gray-700">Compare</label>
                  <button
                    onClick={handleCompare}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center"
                  >
                    <ArrowsRightLeftIcon className="h-4 w-4 mr-1" />
                    Compare
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">Compare With</label>
                    <textarea
                      value={compareInput}
                      onChange={e => setCompareInput(e.target.value)}
                      className="w-full h-64 font-mono text-sm border rounded p-3"
                      placeholder="Paste JSON to compare with..."
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">Comparison Results</label>
                    <div className="h-64 border rounded p-4 bg-gray-50 overflow-auto">
                      {compareResult ? (
                        <div>
                          {compareResult.added.length > 0 && (
                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-green-500 mb-1">Added:</h4>
                              <pre className="text-xs bg-white p-2 rounded border border-green-100 overflow-auto max-h-32">{JSON.stringify(compareResult.added, null, 2)}</pre>
                            </div>
                          )}
                          {compareResult.removed.length > 0 && (
                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-red-500 mb-1">Removed:</h4>
                              <pre className="text-xs bg-white p-2 rounded border border-red-100 overflow-auto max-h-32">{JSON.stringify(compareResult.removed, null, 2)}</pre>
                            </div>
                          )}
                          {compareResult.modified.length > 0 && (
                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-yellow-500 mb-1">Modified:</h4>
                              <pre className="text-xs bg-white p-2 rounded border border-yellow-100 overflow-auto max-h-32">{JSON.stringify(compareResult.modified, null, 2)}</pre>
                            </div>
                          )}
                          {compareResult.added.length === 0 && compareResult.removed.length === 0 && compareResult.modified.length === 0 && (
                            <div className="text-green-500 text-center py-4">
                              <CheckCircleIcon className="h-8 w-8 mx-auto mb-2" />
                              <p>No differences found</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          <p>Comparison results will appear here</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Search tab */}
            {activeTab === 'search' && (
              <div className="md:col-span-2">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-lg font-medium text-gray-700">Search</label>
                  <button
                    onClick={handleSearch}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center"
                  >
                    <MagnifyingGlassIcon className="h-4 w-4 mr-1" />
                    Search
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="bg-white border rounded p-4">
                      <label className="block mb-2 text-sm font-medium text-gray-700">Search Query</label>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full p-2 border rounded mb-4"
                        placeholder="Enter search query..."
                      />
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={searchOptions.caseSensitive}
                            onChange={e => setSearchOptions({ ...searchOptions, caseSensitive: e.target.checked })}
                            className="mr-2"
                          />
                          <span className="text-sm">Case Sensitive</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={searchOptions.wholeWord}
                            onChange={e => setSearchOptions({ ...searchOptions, wholeWord: e.target.checked })}
                            className="mr-2"
                          />
                          <span className="text-sm">Whole Word</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={searchOptions.regex}
                            onChange={e => setSearchOptions({ ...searchOptions, regex: e.target.checked })}
                            className="mr-2"
                          />
                          <span className="text-sm">Regex</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={searchOptions.searchInKeys}
                            onChange={e => setSearchOptions({ ...searchOptions, searchInKeys: e.target.checked })}
                            className="mr-2"
                          />
                          <span className="text-sm">Search in Keys</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={searchOptions.searchInValues}
                            onChange={e => setSearchOptions({ ...searchOptions, searchInValues: e.target.checked })}
                            className="mr-2"
                          />
                          <span className="text-sm">Search in Values</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">Search Results</label>
                    <div className="h-64 border rounded p-4 bg-gray-50 overflow-auto">
                      {searchResults.length > 0 ? (
                        <div className="space-y-2">
                          {searchResults.map((result, index) => (
                            <div key={index} className="p-2 bg-white rounded border">
                              <div className="text-xs font-medium text-gray-700">Path: {result.path}</div>
                              <div className="text-xs text-gray-500">Type: {result.type}</div>
                              <div className="text-xs mt-1 overflow-auto">
                                <pre className="bg-gray-50 p-1 rounded">{JSON.stringify(result.value)}</pre>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          <p>Search results will appear here</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Export section */}
          <div className="mt-6 border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <label className="text-sm font-medium text-gray-700 mr-2">Export Format:</label>
                <select
                  value={exportFormat || ''}
                  onChange={e => setExportFormat(e.target.value as ExportFormat)}
                  className="p-2 border rounded text-sm"
                >
                  <option value="">JSON</option>
                  <option value="yaml">YAML</option>
                  <option value="xml">XML</option>
                  <option value="csv">CSV</option>
                </select>
              </div>
              <button
                onClick={handleExport}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm flex items-center"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
          <div className="flex items-center">
            <ExclamationCircleIcon className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Wrap the component with PageWrapper
export default function Page() {
  return (
    <PageWrapper>
      <JSONFormatter />
    </PageWrapper>
  );
} 