/** Pure helpers for the SQLite query workbench, split out so they can be unit tested. */

/** Largest upload we will hand to sql.js — the whole file is copied into the WASM heap. */
export const MAX_DB_FILE_BYTES = 100 * 1024 * 1024;

/**
 * Numeric coercion that refuses the values `Number()` silently turns into 0
 * (null, undefined, booleans, empty/whitespace strings, empty arrays).
 */
export function numericValue(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

/** A column counts as numeric only if every non-NULL value parses and at least one exists. */
export function isNumericColumn(values: unknown[]): boolean {
  let sawNumber = false;
  for (const value of values) {
    if (value === null || value === undefined) continue;
    if (numericValue(value) === null) return false;
    sawNumber = true;
  }
  return sawNumber;
}

export function findNumericColumnIndex(columnCount: number, rows: unknown[][]): number {
  for (let index = 0; index < columnCount; index += 1) {
    if (isNumericColumn(rows.map((row) => row[index]))) return index;
  }
  return -1;
}

/** Tolerates any stored shape: only a JSON array of strings is usable history. */
export function parseHistory(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

/** Returns an error message when the picked file cannot be loaded, or null when it is worth trying. */
export function validateDatabaseFile(file: { name: string; size: number }): string | null {
  if (file.size === 0) return `${file.name} is empty.`;
  if (file.size > MAX_DB_FILE_BYTES) {
    return `${file.name} is ${(file.size / (1024 * 1024)).toFixed(1)} MB. The in-browser engine caps databases at ${MAX_DB_FILE_BYTES / (1024 * 1024)} MB.`;
  }
  return null;
}

export function formatRowsAffected(rowsAffected: number): string {
  return `Statement executed. ${rowsAffected.toLocaleString()} ${rowsAffected === 1 ? "row" : "rows"} affected.`;
}
