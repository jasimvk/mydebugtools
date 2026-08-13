import {
  createToolHistoryEntry,
  filterToolHistoryForPath,
  mergeToolHistory,
  sanitizeToolHistoryPayload,
} from '@/lib/tool-history';

describe('tool history helpers', () => {
  it('normalizes a tools route into a privacy-safe history entry', () => {
    expect(createToolHistoryEntry('/tools/json/')).toMatchObject({
      toolSlug: 'json',
      toolName: 'JSON Tools',
      toolPath: '/tools/json',
      eventType: 'visit',
    });
  });

  it('rejects non-tool paths and payload-like metadata', () => {
    expect(createToolHistoryEntry('/account')).toBeNull();

    const sanitized = sanitizeToolHistoryPayload({
      toolPath: '/tools/jwt',
      toolName: 'JWT Decoder',
      metadata: {
        source: 'route',
        token: 'secret.jwt.value',
        body: '{"password":"secret"}',
      },
    });

    expect(sanitized.metadata).toEqual({ source: 'route' });
  });

  it('deduplicates consecutive local entries and caps history length', () => {
    const first = createToolHistoryEntry('/tools/json');
    const second = createToolHistoryEntry('/tools/json');
    const third = createToolHistoryEntry('/tools/base64');

    expect(first).not.toBeNull();
    expect(second).not.toBeNull();
    expect(third).not.toBeNull();

    const merged = mergeToolHistory([first!, third!], second!, 2);

    expect(merged).toHaveLength(2);
    expect(merged[0].toolPath).toBe('/tools/json');
    expect(merged[1].toolPath).toBe('/tools/base64');
  });

  it('filters history to the current tool only', () => {
    const jsonEntry = createToolHistoryEntry('/tools/json');
    const jwtEntry = createToolHistoryEntry('/tools/jwt');
    const nestedJsonEntry = sanitizeToolHistoryPayload({
      toolPath: '/tools/json?sample=true',
      createdAt: '2026-05-20T05:00:00.000Z',
    });

    expect(jsonEntry).not.toBeNull();
    expect(jwtEntry).not.toBeNull();

    const filtered = filterToolHistoryForPath(
      [jwtEntry!, jsonEntry!, nestedJsonEntry],
      '/tools/json',
    );

    expect(filtered).toHaveLength(2);
    expect(filtered.every((entry) => entry.toolSlug === 'json')).toBe(true);
  });
});
