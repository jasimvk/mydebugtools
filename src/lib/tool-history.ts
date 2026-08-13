import { publicTools } from '@/app/tools/lib/tool-registry';

export const TOOL_HISTORY_LOCAL_KEY = 'debugtools_tool_history';
export const TOOL_HISTORY_MAX_ITEMS = 120;

export type ToolHistoryEventType = 'visit' | 'open' | 'run';

export type ToolHistoryMetadata = Record<string, string | number | boolean | null>;

export type ToolHistoryEntry = {
  id?: string;
  toolSlug: string;
  toolName: string;
  toolPath: string;
  eventType: ToolHistoryEventType;
  metadata: ToolHistoryMetadata;
  createdAt: string;
};

type ToolHistoryInput = {
  toolSlug?: unknown;
  toolName?: unknown;
  toolPath?: unknown;
  eventType?: unknown;
  metadata?: unknown;
  createdAt?: unknown;
};

const allowedMetadataKeys = new Set(['source', 'mode', 'category', 'surface']);
const allowedEventTypes = new Set<ToolHistoryEventType>(['visit', 'open', 'run']);
const toolByPath = new Map(publicTools.map((tool) => [normalizeToolPath(tool.path), tool]));

function coerceString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value.trim() : fallback;
}

function normalizeToolPath(path: string) {
  const cleanPath = path.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';
  return cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
}

function slugFromPath(path: string) {
  const normalizedPath = normalizeToolPath(path);
  if (normalizedPath === '/tools') return 'all';

  const [, root, slug] = normalizedPath.split('/');
  if (root !== 'tools') return '';
  return slug || 'all';
}

export function getToolHistorySlug(pathname: string) {
  return slugFromPath(pathname);
}

function toolNameFromPath(path: string, fallbackName?: string) {
  const normalizedPath = normalizeToolPath(path);
  const matchedTool = toolByPath.get(normalizedPath);
  if (matchedTool) return matchedTool.name;
  if (normalizedPath === '/tools' || normalizedPath === '/tools/all') return 'All Tools';

  const cleanFallback = coerceString(fallbackName);
  if (cleanFallback) return cleanFallback.slice(0, 80);

  const slug = slugFromPath(normalizedPath);
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ') || 'Developer Tool';
}

export function sanitizeToolHistoryMetadata(metadata: unknown): ToolHistoryMetadata {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return {};
  }

  return Object.entries(metadata as Record<string, unknown>).reduce<ToolHistoryMetadata>((safeMetadata, [key, value]) => {
    if (!allowedMetadataKeys.has(key)) return safeMetadata;
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      value === null
    ) {
      safeMetadata[key] = typeof value === 'string' ? value.slice(0, 80) : value;
    }
    return safeMetadata;
  }, {});
}

export function createToolHistoryEntry(pathname: string, eventType: ToolHistoryEventType = 'visit') {
  const toolPath = normalizeToolPath(pathname);
  const slug = slugFromPath(toolPath);

  if (!slug || !toolPath.startsWith('/tools')) {
    return null;
  }

  return {
    toolSlug: slug,
    toolName: toolNameFromPath(toolPath),
    toolPath,
    eventType,
    metadata: { source: 'route' },
    createdAt: new Date().toISOString(),
  } satisfies ToolHistoryEntry;
}

export function sanitizeToolHistoryPayload(input: ToolHistoryInput) {
  const toolPath = normalizeToolPath(coerceString(input.toolPath, '/tools/all'));
  const baseEntry = createToolHistoryEntry(toolPath);

  if (!baseEntry) {
    return createToolHistoryEntry('/tools/all')!;
  }

  const eventType = allowedEventTypes.has(input.eventType as ToolHistoryEventType)
    ? input.eventType as ToolHistoryEventType
    : 'visit';
  const createdAt = coerceString(input.createdAt);
  const createdAtTime = Date.parse(createdAt);

  return {
    ...baseEntry,
    toolSlug: coerceString(input.toolSlug, baseEntry.toolSlug).replace(/[^a-z0-9-]/gi, '').slice(0, 80) || baseEntry.toolSlug,
    toolName: toolNameFromPath(toolPath, coerceString(input.toolName, baseEntry.toolName)),
    eventType,
    metadata: sanitizeToolHistoryMetadata(input.metadata),
    createdAt: Number.isFinite(createdAtTime) ? new Date(createdAtTime).toISOString() : baseEntry.createdAt,
  } satisfies ToolHistoryEntry;
}

export function mergeToolHistory(
  existingHistory: ToolHistoryEntry[],
  nextEntry: ToolHistoryEntry,
  maxItems = TOOL_HISTORY_MAX_ITEMS,
) {
  const withoutDuplicate = existingHistory.filter(
    (entry) => !(entry.toolPath === nextEntry.toolPath && entry.eventType === nextEntry.eventType),
  );

  return [nextEntry, ...withoutDuplicate].slice(0, maxItems);
}

export function filterToolHistoryForPath(history: ToolHistoryEntry[], pathname: string) {
  const targetSlug = slugFromPath(pathname);
  if (!targetSlug) return [];

  return history
    .filter((entry) => entry.toolSlug === targetSlug)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}
