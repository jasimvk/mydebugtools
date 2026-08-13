"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  ArrowDownTrayIcon,
  ArrowsRightLeftIcon,
  CircleStackIcon,
  ClockIcon,
  DocumentArrowUpIcon,
  PlayIcon,
  TableCellsIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
// @ts-expect-error - sql.js ships no bundled types for this entry point
import initSqlJs from "sql.js";
import {
  findNumericColumnIndex,
  formatRowsAffected,
  numericValue,
  parseHistory,
  validateDatabaseFile,
} from "./sqlite-helpers";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

type DbTable = { name: string; columns: string[]; rowCount: number };
type DbComparisonRow = {
  name: string;
  status: "Added" | "Removed" | "Changed" | "Same";
  leftRows: number | null;
  rightRows: number | null;
  rowDelta: number;
  addedColumns: string[];
  removedColumns: string[];
};
type TablePreview = { name: string; columns: string[]; rows: unknown[][] } | null;
type ResultSet = { columns: string[]; values: unknown[][] };
type ActiveTab = "results" | "schema" | "insights" | "compare";

const LOCAL_HISTORY_KEY = "sqlite_query_history";
// Stable identities so the memos below do not rerun while there is no result set.
const NO_COLUMNS: string[] = [];
const NO_ROWS: unknown[][] = [];
const SQL_WASM_PATH = "/vendor/sql.js/";

const SAMPLE_QUERIES = [
  { label: "Tables", query: "SELECT name, type FROM sqlite_master WHERE type IN ('table', 'view') ORDER BY name;" },
  { label: "Users", query: "SELECT id, name, email, plan FROM users ORDER BY id;" },
  { label: "Revenue", query: "SELECT user_id, SUM(amount) AS total_revenue FROM orders GROUP BY user_id ORDER BY total_revenue DESC;" },
  { label: "Recent events", query: "SELECT user_id, event_name, created_at FROM events ORDER BY created_at DESC LIMIT 20;" },
];

const SAMPLE_SQL = `
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  plan TEXT NOT NULL
);

CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE events (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  event_name TEXT NOT NULL,
  created_at TEXT NOT NULL
);

INSERT INTO users VALUES
  (1, 'Aisha Rahman', 'aisha@example.com', 'Pro'),
  (2, 'Noah Smith', 'noah@example.com', 'Free'),
  (3, 'Maya Chen', 'maya@example.com', 'Team'),
  (4, 'Ravi Kumar', 'ravi@example.com', 'Pro');

INSERT INTO orders VALUES
  (101, 1, 49.00, 'paid', '2026-05-10'),
  (102, 1, 19.00, 'paid', '2026-05-12'),
  (103, 3, 199.00, 'paid', '2026-05-13'),
  (104, 4, 49.00, 'failed', '2026-05-14'),
  (105, 4, 49.00, 'paid', '2026-05-15');

INSERT INTO events VALUES
  (1, 1, 'api_test_run', '2026-05-14 09:10:00'),
  (2, 3, 'json_format', '2026-05-14 09:13:00'),
  (3, 4, 'database_query', '2026-05-15 11:42:00'),
  (4, 1, 'html_preview', '2026-05-16 15:22:00'),
  (5, 2, 'jwt_decode', '2026-05-17 08:05:00');
`;

const SAMPLE_COMPARE_SQL = `
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  plan TEXT NOT NULL,
  last_seen TEXT
);

CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  region TEXT
);

CREATE TABLE feature_flags (
  id INTEGER PRIMARY KEY,
  flag_key TEXT NOT NULL,
  enabled INTEGER NOT NULL
);

INSERT INTO users VALUES
  (1, 'Aisha Rahman', 'aisha@example.com', 'Pro', '2026-05-18'),
  (2, 'Noah Smith', 'noah@example.com', 'Free', '2026-05-12'),
  (3, 'Maya Chen', 'maya@example.com', 'Team', '2026-05-17'),
  (4, 'Ravi Kumar', 'ravi@example.com', 'Pro', '2026-05-15'),
  (5, 'Lina Ortiz', 'lina@example.com', 'Free', '2026-05-18');

INSERT INTO orders VALUES
  (101, 1, 49.00, 'paid', '2026-05-10', 'MEA'),
  (102, 1, 19.00, 'paid', '2026-05-12', 'MEA'),
  (103, 3, 199.00, 'paid', '2026-05-13', 'APAC'),
  (104, 4, 49.00, 'paid', '2026-05-14', 'EU'),
  (105, 4, 49.00, 'paid', '2026-05-15', 'EU'),
  (106, 5, 9.00, 'trial', '2026-05-18', 'US');

INSERT INTO feature_flags VALUES
  (1, 'database_compare', 1),
  (2, 'html_header_footer', 1);
`;

const quoteIdentifier = (identifier: string) => `"${identifier.replace(/"/g, '""')}"`;

function saveHistory(history: string[]) {
  try {
    localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(history));
  } catch {
    // Private mode or a full quota must not take the query down with it.
  }
}

function loadHistory(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return parseHistory(localStorage.getItem(LOCAL_HISTORY_KEY));
  } catch {
    return [];
  }
}

function arrayToCSV(columns: string[], rows: unknown[][]): string {
  const escape = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  return [columns.map(escape).join(","), ...rows.map((row) => row.map(escape).join(","))].join("\n");
}

function rowsToObjects(columns: string[], rows: unknown[][]) {
  return rows.map((row) =>
    Object.fromEntries(columns.map((column, index) => [column, row[index] ?? null])),
  );
}

function downloadTextFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  // Firefox ignores clicks on detached links and cancels downloads whose blob URL
  // is revoked in the same tick.
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function cellText(value: unknown) {
  if (value === null || value === undefined) return "NULL";
  if (value instanceof Uint8Array) return `BLOB ${value.byteLength} bytes`;
  return String(value);
}

function readDatabaseStructure(database: any): DbTable[] {
  const tables = database.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;")[0]?.values.map((value: any) => value[0]) || [];
  return tables.map((table: string) => {
    const quotedTable = quoteIdentifier(table);
    const tableColumns = database.exec(`PRAGMA table_info(${quotedTable});`)[0]?.values.map((column: any) => column[1]) || [];
    const rowCount = database.exec(`SELECT COUNT(*) FROM ${quotedTable};`)[0]?.values[0][0] || 0;
    return { name: table, columns: tableColumns, rowCount };
  });
}

function compareStructures(primary: DbTable[], secondary: DbTable[]): DbComparisonRow[] {
  const secondaryByName = new Map(secondary.map((table) => [table.name, table]));
  const primaryByName = new Map(primary.map((table) => [table.name, table]));
  const names = Array.from(new Set([...primary.map((table) => table.name), ...secondary.map((table) => table.name)])).sort();

  return names.map((name) => {
    const left = primaryByName.get(name);
    const right = secondaryByName.get(name);
    const leftColumns = new Set(left?.columns || []);
    const rightColumns = new Set(right?.columns || []);
    const addedColumns = [...rightColumns].filter((column) => !leftColumns.has(column));
    const removedColumns = [...leftColumns].filter((column) => !rightColumns.has(column));
    const rowDelta = (right?.rowCount || 0) - (left?.rowCount || 0);
    const status: DbComparisonRow["status"] = !left ? "Added" : !right ? "Removed" : addedColumns.length || removedColumns.length || rowDelta !== 0 ? "Changed" : "Same";

    return { name, status, leftRows: left?.rowCount ?? null, rightRows: right?.rowCount ?? null, rowDelta, addedColumns, removedColumns };
  });
}

export default function DatabaseQueryTool() {
  const [db, setDb] = useState<any>(null);
  const [dbName, setDbName] = useState("No database loaded");
  const [query, setQuery] = useState(SAMPLE_QUERIES[0].query);
  const [resultSets, setResultSets] = useState<ResultSet[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("results");
  const [dbStructure, setDbStructure] = useState<DbTable[]>([]);
  const [compareDbName, setCompareDbName] = useState("No comparison database");
  const [compareStructure, setCompareStructure] = useState<DbTable[]>([]);
  const [tablePreview, setTablePreview] = useState<TablePreview>(null);
  const [structureSearch, setStructureSearch] = useState("");
  const [lastRunMs, setLastRunMs] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const compareFileInputRef = useRef<HTMLInputElement>(null);
  const dbRef = useRef<any>(null);

  // Exports, metrics and insights still work off the first result set.
  const columns = resultSets[0]?.columns ?? NO_COLUMNS;
  const results = resultSets[0]?.values ?? NO_ROWS;

  const filteredStructure = useMemo(
    () =>
      dbStructure.filter((table) => {
        const search = structureSearch.toLowerCase();
        return table.name.toLowerCase().includes(search) || table.columns.some((column) => column.toLowerCase().includes(search));
      }),
    [dbStructure, structureSearch],
  );

  const totalRows = useMemo(() => dbStructure.reduce((sum, table) => sum + table.rowCount, 0), [dbStructure]);
  const compareRows = useMemo(() => compareStructures(dbStructure, compareStructure), [compareStructure, dbStructure]);
  const compareChangedCount = useMemo(() => compareRows.filter((row) => row.status !== "Same").length, [compareRows]);

  const insightRows = useMemo(() => {
    const numericColumnIndex = findNumericColumnIndex(columns.length, results);
    if (numericColumnIndex >= 0) {
      const labelIndex = columns.findIndex((_, index) => index !== numericColumnIndex);
      const rows = results
        .slice(0, 12)
        .map((row, index) => ({
          label: cellText(row[labelIndex >= 0 ? labelIndex : 0] ?? `Row ${index + 1}`),
          value: numericValue(row[numericColumnIndex]) ?? 0,
        }));
      const max = Math.max(...rows.map((row) => Math.abs(row.value)), 1);
      return rows.map((row) => ({ ...row, width: `${Math.max(4, (Math.abs(row.value) / max) * 100)}%` }));
    }

    const max = Math.max(...dbStructure.map((table) => table.rowCount), 1);
    return dbStructure
      .slice(0, 12)
      .map((table) => ({ label: table.name, value: table.rowCount, width: `${Math.max(4, (table.rowCount / max) * 100)}%` }));
  }, [columns, dbStructure, results]);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const refreshStructure = useCallback((database: any) => {
    if (!database) {
      setDbStructure([]);
      return;
    }

    try {
      setDbStructure(readDatabaseStructure(database));
    } catch (err: any) {
      setDbStructure([]);
      setError(`Failed to read database structure: ${err?.message || "unknown error"}`);
    }
  }, []);

  useEffect(() => {
    dbRef.current = db;
    if (!db) {
      setDbStructure([]);
      setTablePreview(null);
      return;
    }

    refreshStructure(db);
  }, [db, refreshStructure]);

  // Free the WASM heap when the user navigates away from the tool.
  useEffect(() => () => dbRef.current?.close?.(), []);

  const setDatabase = (database: any, name: string) => {
    setDb((previous: any) => {
      if (previous && previous !== database) previous.close?.();
      return database;
    });
    setDbName(name);
    setError(null);
    setResultSets([]);
    setStatusMessage(null);
    setTablePreview(null);
    setLastRunMs(null);
    setActiveTab("schema");
  };

  const handleSampleDatabase = async () => {
    try {
      const SQL = await initSqlJs({ locateFile: (file: string) => `${SQL_WASM_PATH}${file}` });
      const database = new SQL.Database();
      database.run(SAMPLE_SQL);
      setDatabase(database, "sample-debugtools.sqlite");
      setQuery(SAMPLE_QUERIES[1].query);
    } catch (err: any) {
      setError(`Failed to create sample database: ${err.message}`);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const sizeError = validateDatabaseFile(file);
    if (sizeError) {
      setError(sizeError);
      event.target.value = "";
      return;
    }

    let database: any = null;
    try {
      const buffer = await file.arrayBuffer();
      const SQL = await initSqlJs({ locateFile: (item: string) => `${SQL_WASM_PATH}${item}` });
      database = new SQL.Database(new Uint8Array(buffer));
      // sql.js accepts any byte array and only fails on first use, so probe here
      // rather than letting a non-SQLite file look like an empty database.
      database.exec("SELECT count(*) FROM sqlite_master;");
      setDatabase(database, file.name);
    } catch (err: any) {
      database?.close?.();
      setError(`Failed to load ${file.name}: ${err?.message || "not a valid SQLite database"}.`);
      setDb((previous: any) => {
        previous?.close?.();
        return null;
      });
      setDbName("No database loaded");
    } finally {
      event.target.value = "";
    }
  };

  const handleCompareFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const sizeError = validateDatabaseFile(file);
    if (sizeError) {
      setError(sizeError);
      event.target.value = "";
      return;
    }

    let database: any = null;
    try {
      const buffer = await file.arrayBuffer();
      const SQL = await initSqlJs({ locateFile: (item: string) => `${SQL_WASM_PATH}${item}` });
      database = new SQL.Database(new Uint8Array(buffer));
      setCompareStructure(readDatabaseStructure(database));
      setCompareDbName(file.name);
      setActiveTab("compare");
      setError(null);
    } catch (err: any) {
      setError(`Failed to load comparison database ${file.name}: ${err?.message || "not a valid SQLite database"}.`);
      setCompareStructure([]);
      setCompareDbName("No comparison database");
    } finally {
      // Only the structure snapshot is kept, so the database itself can go now.
      database?.close?.();
      event.target.value = "";
    }
  };

  const handleSampleCompareDatabase = async () => {
    let database: any = null;
    try {
      const SQL = await initSqlJs({ locateFile: (file: string) => `${SQL_WASM_PATH}${file}` });
      database = new SQL.Database();
      database.run(SAMPLE_COMPARE_SQL);
      setCompareStructure(readDatabaseStructure(database));
      setCompareDbName("sample-debugtools-v2.sqlite");
      setActiveTab("compare");
      setError(null);
    } catch (err: any) {
      setError(`Failed to create comparison sample: ${err.message}`);
    } finally {
      database?.close?.();
    }
  };

  const runQuery = async (sql = query) => {
    if (!db) {
      setError("Load a SQLite database first, or use the sample database.");
      return;
    }

    const trimmed = sql.trim();
    if (!trimmed) return;

    setLoading(true);
    // sql.js blocks the main thread, so hand the browser a frame to paint the busy
    // state before the query starts. (A worker would be the real fix.)
    await new Promise((resolve) => {
      if (typeof requestAnimationFrame === "function") requestAnimationFrame(() => setTimeout(resolve, 0));
      else setTimeout(resolve, 0);
    });
    const startedAt = performance.now();

    try {
      const response: ResultSet[] = db.exec(trimmed);
      setResultSets(response);
      // Non-SELECT statements return no result set; report what they changed instead.
      setStatusMessage(response.length === 0 ? formatRowsAffected(db.getRowsModified()) : null);
      setLastRunMs(Math.max(1, Math.round(performance.now() - startedAt)));
      setError(null);
      setActiveTab("results");
      refreshStructure(db);
      setHistory((previous) => {
        const updated = [trimmed, ...previous.filter((item) => item !== trimmed)].slice(0, 12);
        saveHistory(updated);
        return updated;
      });
    } catch (err: any) {
      setError(err.message || "Query failed.");
      setStatusMessage(null);
      // A failed statement can still be a partially applied script.
      refreshStructure(db);
    } finally {
      setLoading(false);
    }
  };

  const previewTable = (table: string) => {
    if (!db) return;
    try {
      const response = db.exec(`SELECT * FROM ${quoteIdentifier(table)} LIMIT 25;`);
      setTablePreview({
        name: table,
        columns: response[0]?.columns || [],
        rows: response[0]?.values || [],
      });
      setActiveTab("schema");
    } catch (err: any) {
      setTablePreview(null);
      setError(`Failed to preview ${table}: ${err?.message || "unknown error"}`);
      setActiveTab("schema");
    }
  };

  const handleExportResults = (format: "csv" | "json") => {
    if (!columns.length) return;
    if (format === "csv") {
      downloadTextFile("debugtools-query-results.csv", arrayToCSV(columns, results), "text/csv");
      return;
    }

    downloadTextFile(
      "debugtools-query-results.json",
      JSON.stringify(
        {
          database: dbName,
          query,
          rowCount: results.length,
          columns,
          rows: rowsToObjects(columns, results),
        },
        null,
        2,
      ),
      "application/json",
    );
  };

  const handleExportComparison = (format: "csv" | "json") => {
    if (!compareStructure.length) return;
    if (format === "csv") {
      downloadTextFile(
        "debugtools-db-comparison.csv",
        arrayToCSV(
          ["table", "status", "primary_rows", "compare_rows", "row_delta", "added_columns", "removed_columns"],
          compareRows.map((row) => [
            row.name,
            row.status,
            row.leftRows ?? "",
            row.rightRows ?? "",
            row.rowDelta,
            row.addedColumns.join("; "),
            row.removedColumns.join("; "),
          ]),
        ),
        "text/csv",
      );
      return;
    }

    downloadTextFile(
      "debugtools-db-comparison.json",
      JSON.stringify(
        {
          primaryDatabase: dbName,
          compareDatabase: compareDbName,
          changedCount: compareChangedCount,
          tables: compareRows,
        },
        null,
        2,
      ),
      "application/json",
    );
  };

  const deleteHistoryItem = (sql: string) => {
    setHistory((previous) => {
      const updated = previous.filter((item) => item !== sql);
      saveHistory(updated);
      return updated;
    });
  };

  return (
    <main className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 p-3 text-[#09090b] lg:p-4">
      <header className="border-b border-[#e4e4e7] bg-[#fafafa] py-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-[#71717a]">tools / database</p>
            <h1 className="mt-1 text-2xl font-semibold">SQLite Query Workbench</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex h-9 items-center gap-2 rounded-md border border-[#e4e4e7] bg-white px-3 text-sm font-semibold hover:bg-[#fafafa]">
              <DocumentArrowUpIcon className="h-4 w-4" />
              Upload DB
            </button>
            <button type="button" onClick={handleSampleDatabase} className="inline-flex h-9 items-center gap-2 rounded-md border border-[#e4e4e7] bg-white px-3 text-sm font-semibold hover:bg-[#fafafa]">
              <CircleStackIcon className="h-4 w-4" />
              Sample
            </button>
            <button type="button" onClick={() => compareFileInputRef.current?.click()} className="inline-flex h-9 items-center gap-2 rounded-md border border-[#e4e4e7] bg-white px-3 text-sm font-semibold hover:bg-[#fafafa]">
              <ArrowsRightLeftIcon className="h-4 w-4" />
              Compare DB
            </button>
            <button type="button" onClick={() => void runQuery()} disabled={!db || loading} className="inline-flex h-9 items-center gap-2 rounded-md bg-[#09090b] px-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
              <PlayIcon className="h-4 w-4" />
              {loading ? "Running" : "Run"}
            </button>
            <button type="button" onClick={() => handleExportResults("csv")} disabled={!columns.length} className="inline-flex h-9 items-center gap-2 rounded-md border border-[#e4e4e7] bg-white px-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50">
              <ArrowDownTrayIcon className="h-4 w-4" />
              CSV
            </button>
            <button type="button" onClick={() => handleExportResults("json")} disabled={!columns.length} className="inline-flex h-9 items-center gap-2 rounded-md border border-[#e4e4e7] bg-white px-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50">
              <ArrowDownTrayIcon className="h-4 w-4" />
              JSON
            </button>
            <input ref={fileInputRef} type="file" accept=".sqlite,.sqlite3,.db,.db3,.sdb,.s3db,.sqlitedb,application/vnd.sqlite3,application/x-sqlite3,application/octet-stream" onChange={handleFileUpload} className="hidden" />
            <input ref={compareFileInputRef} type="file" accept=".sqlite,.sqlite3,.db,.db3,.sdb,.s3db,.sqlitedb,application/vnd.sqlite3,application/x-sqlite3,application/octet-stream" onChange={handleCompareFileUpload} className="hidden" />
          </div>
        </div>
      </header>

      <section className="grid min-h-0 gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="flex min-w-0 flex-col gap-3">
          <section className="rounded-md border border-[#e4e4e7] bg-white">
            <div className="border-b border-[#e4e4e7] px-3 py-2">
              <p className="text-sm font-semibold">Database</p>
              <p className="mt-1 truncate font-mono text-xs text-[#71717a]">{dbName}</p>
              <p className="mt-1 truncate font-mono text-xs text-[#71717a]">Compare: {compareDbName}</p>
            </div>
            <div className="grid grid-cols-3 divide-x divide-[#e4e4e7] text-center">
              <Metric label="Tables" value={dbStructure.length} />
              <Metric label="Rows" value={totalRows} />
              <Metric label="Diffs" value={compareChangedCount} />
            </div>
          </section>

          <section className="rounded-md border border-[#e4e4e7] bg-white">
            <div className="flex items-center justify-between border-b border-[#e4e4e7] px-3 py-2">
              <p className="text-sm font-semibold">Schema</p>
              <TableCellsIcon className="h-4 w-4 text-[#71717a]" />
            </div>
            <div className="p-3">
              <input
                value={structureSearch}
                onChange={(event) => setStructureSearch(event.target.value)}
                aria-label="Search tables or columns"
                placeholder="Search tables or columns"
                className="mb-3 h-9 w-full rounded-md border border-[#e4e4e7] bg-white px-3 font-mono text-sm outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/15"
              />
              <div className="max-h-[420px] space-y-2 overflow-auto pr-1">
                {!db && <p className="text-sm text-[#71717a]">Upload a database or load the sample.</p>}
                {db && filteredStructure.length === 0 && <p className="text-sm text-[#71717a]">No matching tables.</p>}
                {filteredStructure.map((table) => (
                  <article key={table.name} className="rounded-md border border-[#e4e4e7] p-2">
                    <div className="flex items-center justify-between gap-2">
                      <button type="button" onClick={() => previewTable(table.name)} className="truncate font-mono text-sm font-semibold text-[#2563eb]">
                        {table.name}
                      </button>
                      <span className="shrink-0 rounded-full bg-[#fafafa] px-2 py-0.5 font-mono text-[11px] text-[#71717a]">{table.rowCount}</span>
                    </div>
                    <p className="mt-1 line-clamp-2 break-words font-mono text-xs text-[#71717a]">{table.columns.join(", ") || "No columns"}</p>
                    <div className="mt-2 flex gap-1">
                      <button type="button" onClick={() => setQuery(`SELECT * FROM ${quoteIdentifier(table.name)} LIMIT 100;`)} className="rounded border border-[#e4e4e7] px-2 py-1 text-xs font-semibold hover:bg-[#fafafa]">
                        Select
                      </button>
                      <button type="button" onClick={() => setQuery(`SELECT COUNT(*) AS row_count FROM ${quoteIdentifier(table.name)};`)} className="rounded border border-[#e4e4e7] px-2 py-1 text-xs font-semibold hover:bg-[#fafafa]">
                        Count
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-md border border-[#e4e4e7] bg-white">
            <div className="flex items-center justify-between border-b border-[#e4e4e7] px-3 py-2">
              <p className="text-sm font-semibold">History</p>
              <button type="button" onClick={() => { setHistory([]); saveHistory([]); }} className="text-[#71717a] hover:text-[#cf222e]">
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-52 space-y-2 overflow-auto p-3">
              {history.length === 0 && <p className="text-sm text-[#71717a]">Queries appear here after running.</p>}
              {history.map((sql) => (
                <div key={sql} className="group flex items-start gap-2 rounded-md border border-[#e4e4e7] p-2">
                  <button type="button" onClick={() => { setQuery(sql); void runQuery(sql); }} className="line-clamp-2 flex-1 text-left font-mono text-xs text-[#2563eb]">
                    {sql}
                  </button>
                  <button type="button" onClick={() => deleteHistoryItem(sql)} className="text-[#8c959f] opacity-0 group-hover:opacity-100">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </aside>

        <section className="min-w-0 rounded-md border border-[#e4e4e7] bg-white">
          <div className="border-b border-[#e4e4e7] p-3">
            <div className="mb-2 flex flex-wrap gap-2">
              {SAMPLE_QUERIES.map((sample) => (
                <button key={sample.label} type="button" onClick={() => setQuery(sample.query)} className="rounded-md border border-[#e4e4e7] bg-white px-3 py-1.5 text-xs font-semibold hover:bg-[#fafafa]">
                  {sample.label}
                </button>
              ))}
            </div>
            <div className="relative z-0 overflow-hidden rounded-md border border-[#e4e4e7]">
              <MonacoEditor
                height="190px"
                defaultLanguage="sql"
                value={query}
                onChange={(value) => setQuery(value || "")}
                theme="vs-dark"
                options={{ fontSize: 14, minimap: { enabled: false }, wordWrap: "on", scrollBeyondLastLine: false, padding: { top: 12 } }}
              />
            </div>
          </div>

          <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 border-b border-[#e4e4e7] bg-white px-3 py-2">
            <div className="flex gap-1" role="tablist" aria-label="Database workbench views">
              {(["results", "schema", "insights", "compare"] as ActiveTab[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  id={`db-tab-${tab}`}
                  aria-selected={activeTab === tab}
                  aria-controls={`db-panel-${tab}`}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-md px-3 py-1.5 text-sm font-semibold capitalize ${activeTab === tab ? "bg-[#09090b] text-white" : "text-[#71717a] hover:bg-[#fafafa]"}`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 font-mono text-xs text-[#71717a]">
              {lastRunMs !== null && (
                <span className="inline-flex items-center gap-1">
                  <ClockIcon className="h-4 w-4" />
                  {lastRunMs}ms
                </span>
              )}
              <span>{columns.length ? `${results.length} rows / ${columns.length} cols` : "No result set"}</span>
              {resultSets.length > 1 && <span>{resultSets.length} result sets</span>}
            </div>
          </div>

          {error && <div className="border-b border-[#ffebe9] bg-[#fff8f7] px-3 py-2 text-sm font-medium text-[#cf222e]">{error}</div>}

          <div className="relative z-20 min-h-[420px] bg-white p-3">
            {activeTab === "results" && (
              <div className="space-y-3" role="tabpanel" id="db-panel-results" aria-labelledby="db-tab-results">
                {statusMessage && (
                  <p className="rounded-md border border-[#e4e4e7] bg-[#fafafa] p-3 font-mono text-sm text-[#71717a]">{statusMessage}</p>
                )}
                {resultSets.length === 0 && !statusMessage && (
                  <ResultTable columns={[]} rows={[]} emptyText={db ? "Run a query to view results." : "Upload a SQLite database or load the sample."} />
                )}
                {resultSets.map((resultSet, index) => (
                  <section key={index} className="space-y-2">
                    {resultSets.length > 1 && (
                      <p className="font-mono text-xs font-semibold uppercase tracking-[0.08em] text-[#71717a]">
                        Result set {index + 1} of {resultSets.length} · {resultSet.values.length} rows
                      </p>
                    )}
                    <ResultTable columns={resultSet.columns} rows={resultSet.values} emptyText="No rows returned." />
                  </section>
                ))}
              </div>
            )}

            {activeTab === "schema" && (
              <div className="space-y-3" role="tabpanel" id="db-panel-schema" aria-labelledby="db-tab-schema">
                {tablePreview ? (
                  <section className="rounded-md border border-[#e4e4e7]">
                    <div className="flex items-center justify-between border-b border-[#e4e4e7] px-3 py-2">
                      <p className="font-mono text-sm font-semibold">Preview: {tablePreview.name}</p>
                      <button type="button" onClick={() => setTablePreview(null)} className="text-sm font-semibold text-[#2563eb]">Close</button>
                    </div>
                    <div className="p-3">
                      <ResultTable columns={tablePreview.columns} rows={tablePreview.rows} emptyText="No rows in this table." compact />
                    </div>
                  </section>
                ) : (
                  <p className="rounded-md border border-dashed border-[#e4e4e7] p-6 text-sm text-[#71717a]">Select a table in the schema panel to preview up to 25 rows.</p>
                )}
              </div>
            )}

            {activeTab === "insights" && (
              <div className="space-y-2" role="tabpanel" id="db-panel-insights" aria-labelledby="db-tab-insights">
                {insightRows.length === 0 && <p className="rounded-md border border-dashed border-[#e4e4e7] p-6 text-sm text-[#71717a]">Run a numeric query or load a database to see quick bars.</p>}
                {insightRows.map((row) => (
                  <div key={row.label} className="grid gap-2 rounded-md border border-[#e4e4e7] p-3 sm:grid-cols-[220px_minmax(0,1fr)_80px] sm:items-center">
                    <span className="truncate font-mono text-sm font-semibold">{row.label}</span>
                    <div className="h-3 rounded-full bg-[#fafafa]">
                      <div className="h-3 rounded-full bg-[#2563eb]" style={{ width: row.width }} />
                    </div>
                    <span className="font-mono text-sm text-[#71717a]">{row.value}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "compare" && (
              <div className="space-y-3" role="tabpanel" id="db-panel-compare" aria-labelledby="db-tab-compare">
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[#e4e4e7] bg-[#fafafa] p-3">
                  <div>
                    <p className="text-sm font-semibold">Compare schema and row counts</p>
                    <p className="mt-1 font-mono text-xs text-[#71717a]">{dbName} vs {compareDbName}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={handleSampleCompareDatabase} disabled={!db} className="rounded-md border border-[#e4e4e7] bg-white px-3 py-1.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50">
                      Use sample v2
                    </button>
                    <button type="button" onClick={() => handleExportComparison("csv")} disabled={!compareStructure.length} className="rounded-md border border-[#e4e4e7] bg-white px-3 py-1.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50">
                      CSV
                    </button>
                    <button type="button" onClick={() => handleExportComparison("json")} disabled={!compareStructure.length} className="rounded-md border border-[#e4e4e7] bg-white px-3 py-1.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50">
                      JSON
                    </button>
                    <button type="button" onClick={() => compareFileInputRef.current?.click()} disabled={!db} className="rounded-md bg-[#09090b] px-3 py-1.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
                      Upload compare DB
                    </button>
                  </div>
                </div>

                {!db && <p className="rounded-md border border-dashed border-[#e4e4e7] p-6 text-sm text-[#71717a]">Load a primary SQLite database first.</p>}
                {db && compareStructure.length === 0 && <p className="rounded-md border border-dashed border-[#e4e4e7] p-6 text-sm text-[#71717a]">Load a comparison database or use the sample v2 database.</p>}
                {db && compareStructure.length > 0 && (
                  <div className="overflow-auto rounded-md border border-[#e4e4e7]">
                    <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
                      <thead className="sticky top-0 bg-[#fafafa]">
                        <tr>
                          {["Table", "Status", "Primary rows", "Compare rows", "Delta", "Column changes"].map((column) => (
                            <th key={column} className="border-b border-[#e4e4e7] px-3 py-2 font-mono text-xs font-semibold uppercase tracking-[0.08em] text-[#71717a]">{column}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {compareRows.map((row) => (
                          <tr key={row.name} className="odd:bg-white even:bg-[#fbfcfd]">
                            <td className="border-b border-[#e4e4e7] px-3 py-2 font-mono text-xs font-semibold">{row.name}</td>
                            <td className="border-b border-[#e4e4e7] px-3 py-2">
                              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                row.status === "Same" ? "bg-[#dafbe1] text-[#1a7f37]" :
                                row.status === "Added" ? "bg-[#ddf4ff] text-[#2563eb]" :
                                row.status === "Removed" ? "bg-[#ffebe9] text-[#cf222e]" :
                                "bg-[#fff8c5] text-[#7d4e00]"
                              }`}>
                                {row.status}
                              </span>
                            </td>
                            <td className="border-b border-[#e4e4e7] px-3 py-2 font-mono text-xs">{row.leftRows ?? "-"}</td>
                            <td className="border-b border-[#e4e4e7] px-3 py-2 font-mono text-xs">{row.rightRows ?? "-"}</td>
                            <td className="border-b border-[#e4e4e7] px-3 py-2 font-mono text-xs">{row.rowDelta > 0 ? `+${row.rowDelta}` : row.rowDelta}</td>
                            <td className="max-w-[460px] border-b border-[#e4e4e7] px-3 py-2 font-mono text-xs text-[#71717a]">
                              {row.addedColumns.length === 0 && row.removedColumns.length === 0 ? "No column changes" : (
                                <span className="space-y-1">
                                  {row.addedColumns.length > 0 && <span className="block text-[#2563eb]">+ {row.addedColumns.join(", ")}</span>}
                                  {row.removedColumns.length > 0 && <span className="block text-[#cf222e]">- {row.removedColumns.join(", ")}</span>}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-3">
      <p className="font-mono text-lg font-semibold">{value.toLocaleString()}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#71717a]">{label}</p>
    </div>
  );
}

function ResultTable({ columns, rows, emptyText, compact = false }: { columns: string[]; rows: unknown[][]; emptyText: string; compact?: boolean }) {
  if (!columns.length) {
    return <p className="rounded-md border border-dashed border-[#e4e4e7] p-6 text-sm text-[#71717a]">{emptyText}</p>;
  }

  return (
    <div className="overflow-auto rounded-md border border-[#e4e4e7]">
      <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
        <thead className="sticky top-0 bg-[#fafafa]">
          <tr>
            {columns.map((column) => (
              <th key={column} className="border-b border-[#e4e4e7] px-3 py-2 font-mono text-xs font-semibold uppercase tracking-[0.08em] text-[#71717a]">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="odd:bg-white even:bg-[#fbfcfd]">
              {row.map((cell, cellIndex) => (
                <td key={`${rowIndex}-${cellIndex}`} className={`max-w-[360px] border-b border-[#e4e4e7] px-3 ${compact ? "py-1.5" : "py-2"} font-mono text-xs`}>
                  <span className={cell === null || cell === undefined ? "rounded bg-[#fafafa] px-1.5 py-0.5 text-[#71717a]" : "break-words text-[#09090b]"}>
                    {cellText(cell)}
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
