import {
  describeResponseBody,
  formatBytes,
  searchResponseSections,
} from '../responseInspection';

describe('responseInspection', () => {
  it('finds response search matches across sections with line previews', () => {
    const matches = searchResponseSections([
      { id: 'body', label: 'Body', text: '{\n  "title": "debug response"\n}' },
      { id: 'headers', label: 'Headers', text: 'content-type: application/json\nx-debug: true' },
    ], 'debug');

    expect(matches).toEqual([
      expect.objectContaining({
        sectionId: 'body',
        sectionLabel: 'Body',
        lineNumber: 2,
        columnNumber: 13,
        preview: '  "title": "debug response"',
      }),
      expect.objectContaining({
        sectionId: 'headers',
        sectionLabel: 'Headers',
        lineNumber: 2,
        columnNumber: 3,
        preview: 'x-debug: true',
      }),
    ]);
  });

  it('ignores tiny empty queries and caps noisy matches', () => {
    expect(searchResponseSections([{ id: 'body', label: 'Body', text: 'debug' }], '  ')).toEqual([]);

    const matches = searchResponseSections([
      { id: 'body', label: 'Body', text: Array.from({ length: 90 }, () => 'debug').join('\n') },
    ], 'debug', 12);

    expect(matches).toHaveLength(12);
  });

  it('describes common response body shapes', () => {
    expect(describeResponseBody({ ok: true })).toEqual({
      kind: 'JSON object',
      detail: '1 key',
    });
    expect(describeResponseBody([{ id: 1 }, { id: 2 }])).toEqual({
      kind: 'JSON array',
      detail: '2 items',
    });
    expect(describeResponseBody('hello')).toEqual({
      kind: 'Text',
      detail: '5 characters',
    });
  });

  it('formats byte counts for response details', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(2048)).toBe('2.00 KB');
    expect(formatBytes(5 * 1024 * 1024)).toBe('5.00 MB');
  });
});
