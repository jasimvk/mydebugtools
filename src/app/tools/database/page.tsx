'use client';
import React, { useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
// @ts-ignore
import initSqlJs from 'sql.js';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const SAMPLE_QUERIES = [
  { label: 'Show all users', query: 'SELECT * FROM users;' },
  { label: 'Count users', query: 'SELECT COUNT(*) as user_count FROM users;' },
  { label: 'Show user names', query: 'SELECT name FROM users;' },
];

const LOCAL_HISTORY_KEY = 'sqlite_query_history';

function saveHistory(history: string[]) {
  localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(history));
}
function loadHistory(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(LOCAL_HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
}

function arrayToCSV(columns: string[], rows: any[][]): string {
  const escape = (v: any) => `"${String(v).replace(/"/g, '""')}"`;
  return [columns.join(','), ...rows.map(row => row.map(escape).join(','))].join('\n');
}

const DatabaseQueryTool = () => {
  const [db, setDb] = useState<any>(null);
  const [query, setQuery] = useState('SELECT name FROM sqlite_master WHERE type=\'table\';');
  const [results, setResults] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'results' | 'visualize'>('results');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dbStructure, setDbStructure] = useState<any[]>([]);
  const [tablePreview, setTablePreview] = useState<{ name: string, columns: string[], rows: any[][] } | null>(null);
  const [structureSearch, setStructureSearch] = useState('');
  const [dbLoaded, setDbLoaded] = useState(false);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  // Fetch DB structure when db changes
  useEffect(() => {
    if (!db) {
      setDbStructure([]);
      setTablePreview(null);
      return;
    }
    try {
      const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table';")[0]?.values.map((v: any) => v[0]) || [];
      const structure = tables.map((table: string) => {
        const columns = db.exec(`PRAGMA table_info(${table});`)[0]?.values.map((col: any) => col[1]) || [];
        const rowCount = db.exec(`SELECT COUNT(*) FROM ${table};`)[0]?.values[0][0] || 0;
        return { name: table, columns, rowCount };
      });
      setDbStructure(structure);
    } catch {
      setDbStructure([]);
    }
  }, [db]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const buffer = await file.arrayBuffer();
      const SQL = await initSqlJs({ locateFile: (file: string) => `https://sql.js.org/dist/${file}` });
      const dbInstance = new SQL.Database(new Uint8Array(buffer));
      setDb(dbInstance);
      setError(null);
      setDbLoaded(true);
    } catch (err: any) {
      setError('Failed to load database: This file is not a valid SQLite database. Please upload a valid .sqlite/.db file.');
      setDbLoaded(false);
    }
  };

  const handleQuery = () => {
    if (!db) {
      setError('No database loaded.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      try {
        const res = db.exec(query);
        if (res.length > 0) {
          setColumns(res[0].columns);
          setResults(res[0].values);
        } else {
          setColumns([]);
          setResults([]);
        }
        setError(null);
        // Save to history if not duplicate
        setHistory(prev => {
          if (query.trim() && !prev.includes(query.trim())) {
            const updated = [query.trim(), ...prev].slice(0, 20);
            saveHistory(updated);
            return updated;
          }
          return prev;
        });
      } catch (err: any) {
        setError('Query error: ' + err.message);
      } finally {
        setLoading(false);
      }
    }, 100);
  };

  const handleHistoryRun = (q: string) => {
    setQuery(q);
    setTimeout(handleQuery, 0);
  };
  const handleHistoryDelete = (q: string) => {
    setHistory(prev => {
      const updated = prev.filter(item => item !== q);
      saveHistory(updated);
      return updated;
    });
  };

  const handleDownloadCSV = () => {
    if (!columns.length || !results.length) return;
    const csv = arrayToCSV(columns, results);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'query_results.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleTablePreview = (table: string) => {
    if (!db) return;
    try {
      const res = db.exec(`SELECT * FROM ${table} LIMIT 10;`);
      if (res.length > 0) {
        setTablePreview({ name: table, columns: res[0].columns, rows: res[0].values });
      } else {
        setTablePreview({ name: table, columns: [], rows: [] });
      }
    } catch {
      setTablePreview({ name: table, columns: [], rows: [] });
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 flex gap-6">
      {/* Query History Sidebar */}
      <aside className="w-64 bg-gray-100 rounded-lg p-4 shadow-md h-fit">
        <h2 className="font-bold mb-2">Query History</h2>
        <ul className="space-y-2">
          {history.length === 0 && <li className="text-gray-400 text-sm">No history yet.</li>}
          {history.map((q, i) => (
            <li key={i} className="flex items-center gap-2">
              <button className="text-blue-600 underline text-left flex-1" onClick={() => handleHistoryRun(q)}>{q.slice(0, 40)}{q.length > 40 ? '...' : ''}</button>
              <button className="text-red-500 text-xs" onClick={() => handleHistoryDelete(q)}>✕</button>
            </li>
          ))}
        </ul>
      </aside>
      <div className="flex-1">
        <h1 className="text-3xl font-bold mb-4">SQLite Database Query Tool</h1>
        <div className="mb-4 flex items-center gap-2">
          <input
            type="file"
            accept=".sqlite,.db"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="mb-2"
          />
        </div>
        {/* Sample Queries */}
        <div className="mb-2 flex gap-2 flex-wrap">
          {SAMPLE_QUERIES.map(sq => (
            <button key={sq.label} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs" onClick={() => setQuery(sq.query)}>{sq.label}</button>
          ))}
        </div>
        {/* DB Structure Summary */}
        {db && dbStructure.length > 0 && (
          <div className="mb-4 p-4 bg-gray-50 rounded border border-gray-200">
            <h2 className="font-semibold mb-2">Database Structure</h2>
            <input
              type="text"
              placeholder="Search tables or columns..."
              className="mb-2 p-1 border rounded w-full text-sm"
              value={structureSearch}
              onChange={e => setStructureSearch(e.target.value)}
            />
            <ul className="space-y-1">
              {dbStructure
                .filter(table =>
                  table.name.toLowerCase().includes(structureSearch.toLowerCase()) ||
                  table.columns.some((col: string) => col.toLowerCase().includes(structureSearch.toLowerCase()))
                )
                .map(table => (
                  <li key={table.name}>
                    <div className="flex items-center gap-2">
                      <button className="text-blue-700 underline font-medium" onClick={() => handleTablePreview(table.name)}>
                        {table.name}
                      </button>
                      <span className="ml-2 text-xs text-gray-500">({table.rowCount} rows)</span>
                      <button
                        className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded hover:bg-blue-200"
                        onClick={() => setQuery(`SELECT * FROM ${table.name};`)}
                      >
                        Generate SELECT
                      </button>
                      <button
                        className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded hover:bg-green-200"
                        onClick={() => setQuery(`SELECT COUNT(*) FROM ${table.name};`)}
                      >
                        Generate COUNT
                      </button>
                    </div>
                    <div className="ml-4 text-xs text-gray-700">Columns: {table.columns.join(', ')}</div>
                  </li>
                ))}
            </ul>
          </div>
        )}
        {/* Table Preview */}
        {tablePreview && (
          <div className="mb-4 p-4 bg-blue-50 rounded border border-blue-200">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">Preview: {tablePreview.name}</span>
              <button className="text-xs text-blue-700 underline" onClick={() => setTablePreview(null)}>Close</button>
            </div>
            {tablePreview.columns.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full border">
                  <thead>
                    <tr>
                      {tablePreview.columns.map(col => (
                        <th key={col} className="border px-2 py-1 bg-gray-100">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tablePreview.rows.map((row, i) => (
                      <tr key={i}>
                        {row.map((cell: any, j: number) => (
                          <td key={j} className="border px-2 py-1">{String(cell)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-gray-500">No data to preview.</div>
            )}
          </div>
        )}
        {/* Monaco Editor for SQL */}
        <div className="mb-2">
          <MonacoEditor
            height="120px"
            defaultLanguage="sql"
            value={query}
            onChange={v => setQuery(v || '')}
            options={{ fontSize: 14, minimap: { enabled: false } }}
          />
        </div>
        <div className="flex gap-2 mb-4">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            onClick={handleQuery}
            disabled={!db || loading}
          >
            {loading ? 'Running...' : 'Run Query'}
          </button>
          <button
            className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
            onClick={handleDownloadCSV}
            disabled={!columns.length || !results.length}
          >
            Download CSV
          </button>
        </div>
        {error && <div className="text-red-600 mb-4">{error}</div>}
        {/* Tabs for Results/Visualization */}
        <div className="mb-2 flex gap-2">
          <button className={`px-3 py-1 rounded ${activeTab === 'results' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`} onClick={() => setActiveTab('results')}>Results</button>
          <button className={`px-3 py-1 rounded ${activeTab === 'visualize' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`} onClick={() => setActiveTab('visualize')} disabled={!columns.length || !results.length}>Visualize</button>
        </div>
        {activeTab === 'results' && columns.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full border mt-4">
              <thead>
                <tr>
                  {columns.map(col => (
                    <th key={col} className="border px-2 py-1 bg-gray-100">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell: any, j: number) => (
                      <td key={j} className="border px-2 py-1">{String(cell)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {/* Visualization Tab (to be implemented next) */}
        {activeTab === 'visualize' && (
          <div className="mt-4">[Visualization coming soon]</div>
        )}
        {!db && <div className="text-gray-500 mt-4">Upload a SQLite database file to get started.</div>}
        {/* Help/Info Section */}
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
          <h2 className="font-semibold mb-1">How to use this tool</h2>
          <ul className="list-disc ml-6 text-sm text-blue-900">
            <li>Upload a SQLite database file to get started.</li>
            <li>After loading, the database structure will appear below, showing tables, columns, and row counts.</li>
            <li>Click a table name to preview its data, or use the quick query buttons.</li>
            <li>Write and run SQL queries in the editor, and download results as CSV.</li>
          </ul>
        </div>
        {/* Success/Warning Banners */}
        {dbLoaded && (
          <div className="mb-2 p-2 bg-green-100 border border-green-300 text-green-800 rounded flex items-center gap-2">
            <span>Database loaded!</span>
          </div>
        )}
        {dbLoaded && dbStructure.length === 0 && (
          <div className="mb-2 p-2 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded">
            No tables found in this database. Please try loading a different file.
          </div>
        )}
      </div>
    </div>
  );
};

export default DatabaseQueryTool; 