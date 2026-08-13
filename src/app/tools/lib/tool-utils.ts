export interface RegexGroupSet {
  /** 1-based index of the match these captures came from. */
  matchIndex: number;
  values: string[];
}

export interface RegexResults {
  match: boolean;
  matches: string[];
  groups: RegexGroupSet[];
  /** Hit the match cap; results are partial. */
  truncated: boolean;
  /** Hit the time budget; results are partial. */
  timedOut: boolean;
}

export interface DiffChange {
  type: 'added' | 'removed' | 'modified';
  path: string;
  oldSize?: number;
  newSize?: number;
  diff?: number;
}

export interface DiffData {
  changes: DiffChange[];
  totalAdded: number;
  totalRemoved: number;
  totalModified: number;
}

export function decodeJwtSegment(segment: string): unknown {
  const normalized = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
  const binary = globalThis.atob
    ? globalThis.atob(padded)
    : Buffer.from(padded, 'base64').toString('binary');
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  const decoded = typeof TextDecoder !== 'undefined'
    ? new TextDecoder().decode(bytes)
    : decodeURIComponent(binary.split('').map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`).join(''));

  return JSON.parse(decoded);
}

export const REGEX_MATCH_LIMIT = 1000;
export const REGEX_TIME_LIMIT_MS = 1000;

export function buildRegexFlags(selectedFlags: string[]): string {
  const flags = Array.from(new Set(selectedFlags)).join('');
  return flags.includes('g') ? flags : `${flags}g`;
}

export function runRegexTest(pattern: string, testString: string, selectedFlags: string[]): RegexResults {
  const regex = new RegExp(pattern, buildRegexFlags(selectedFlags));
  const matches: string[] = [];
  const groups: RegexGroupSet[] = [];
  const startedAt = Date.now();
  let truncated = false;
  let timedOut = false;
  let result: RegExpExecArray | null;

  while ((result = regex.exec(testString)) !== null) {
    matches.push(result[0]);

    // Only report captures for patterns that actually have capture groups.
    if (result.length > 1) {
      groups.push({
        matchIndex: matches.length,
        values: result.slice(1).map((value) => value ?? ''),
      });
    }

    if (result[0] === '') {
      regex.lastIndex += 1;
    }

    if (matches.length >= REGEX_MATCH_LIMIT) {
      truncated = true;
      break;
    }

    // Catastrophic patterns burn time per step; bail out so the tab stays responsive.
    // (A single exec call still cannot be interrupted once it has started.)
    if (Date.now() - startedAt > REGEX_TIME_LIMIT_MS) {
      timedOut = true;
      break;
    }
  }

  return { match: matches.length > 0, matches, groups, truncated, timedOut };
}

export function parseSizeToBytes(rawSize: string, rawUnit = ''): number {
  const size = Number.parseFloat(rawSize);
  if (!Number.isFinite(size)) return 0;

  const unit = rawUnit.trim().toLowerCase();
  if (unit === 'gb' || unit === 'gib') return size * 1024 * 1024 * 1024;
  if (unit === 'mb' || unit === 'mib') return size * 1024 * 1024;
  if (unit === 'kb' || unit === 'kib') return size * 1024;
  if (unit === 'b' || unit === 'bytes') return size;

  return size;
}

function parseBuildData(build: string): Map<string, number> {
  const files = new Map<string, number>();

  build.split('\n').forEach((line) => {
    const match = line.trim().match(/^(.+?)\s+(\d+(?:\.\d+)?)\s*(b|bytes|kb|kib|mb|mib|gb|gib)?(?:\s|$)/i);
    if (match) {
      const [, path, size, unit = ''] = match;
      files.set(path, parseSizeToBytes(size, unit));
    }
  });

  return files;
}

export function buildDiffFromText(oldBuild: string, newBuild: string): DiffData {
  const oldFiles = parseBuildData(oldBuild);
  const newFiles = parseBuildData(newBuild);
  const changes: DiffChange[] = [];
  let totalAdded = 0;
  let totalRemoved = 0;
  let totalModified = 0;

  newFiles.forEach((newSize, path) => {
    const oldSize = oldFiles.get(path);
    if (oldSize === undefined) {
      changes.push({ type: 'added', path, newSize });
      totalAdded += newSize;
    } else if (oldSize !== newSize) {
      changes.push({
        type: 'modified',
        path,
        oldSize,
        newSize,
        diff: newSize - oldSize,
      });
      totalModified += Math.abs(newSize - oldSize);
    }
  });

  oldFiles.forEach((oldSize, path) => {
    if (!newFiles.has(path)) {
      changes.push({ type: 'removed', path, oldSize });
      totalRemoved += oldSize;
    }
  });

  return {
    changes: changes.sort((a, b) => {
      const typeOrder = { added: 0, modified: 1, removed: 2 };
      const typeDiff = typeOrder[a.type] - typeOrder[b.type];
      if (typeDiff !== 0) return typeDiff;

      const aSize = Math.abs(a.diff || a.newSize || a.oldSize || 0);
      const bSize = Math.abs(b.diff || b.newSize || b.oldSize || 0);
      return bSize - aSize;
    }),
    totalAdded,
    totalRemoved,
    totalModified,
  };
}
