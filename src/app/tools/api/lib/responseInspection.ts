export interface ResponseSearchSection {
  id: string;
  label: string;
  text: string;
}

export interface ResponseSearchMatch {
  sectionId: string;
  sectionLabel: string;
  lineNumber: number;
  columnNumber: number;
  preview: string;
  start: number;
  end: number;
}

export interface ResponseBodyDescription {
  kind: string;
  detail: string;
}

export function searchResponseSections(
  sections: ResponseSearchSection[],
  query: string,
  limit = 50
): ResponseSearchMatch[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];

  const matches: ResponseSearchMatch[] = [];

  for (const section of sections) {
    const lines = section.text.split(/\r?\n/);

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
      const line = lines[lineIndex];
      const lowerLine = line.toLowerCase();
      let fromIndex = 0;

      while (matches.length < limit) {
        const index = lowerLine.indexOf(needle, fromIndex);
        if (index === -1) break;

        matches.push({
          sectionId: section.id,
          sectionLabel: section.label,
          lineNumber: lineIndex + 1,
          columnNumber: index + 1,
          preview: line.length > 180 ? `${line.slice(0, 177)}...` : line,
          start: index,
          end: index + needle.length,
        });

        fromIndex = index + Math.max(needle.length, 1);
      }

      if (matches.length >= limit) return matches;
    }
  }

  return matches;
}

export function describeResponseBody(data: unknown): ResponseBodyDescription {
  if (Array.isArray(data)) {
    return {
      kind: 'JSON array',
      detail: `${data.length} item${data.length === 1 ? '' : 's'}`,
    };
  }

  if (data && typeof data === 'object') {
    const count = Object.keys(data).length;
    return {
      kind: 'JSON object',
      detail: `${count} key${count === 1 ? '' : 's'}`,
    };
  }

  if (typeof data === 'string') {
    return {
      kind: 'Text',
      detail: `${data.length} character${data.length === 1 ? '' : 's'}`,
    };
  }

  if (data === null) {
    return {
      kind: 'Empty',
      detail: 'No response body',
    };
  }

  return {
    kind: typeof data,
    detail: String(data),
  };
}

export function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
