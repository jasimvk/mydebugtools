import {
  bytesToHex,
  formatTimestamp,
  generateUuidBatch,
} from '../simple-tools';

describe('simple tool helpers', () => {
  it('formats bytes as lowercase hex', () => {
    expect(bytesToHex(new Uint8Array([0, 15, 16, 255]))).toBe('000f10ff');
  });

  it('generates the requested number of UUIDs', () => {
    const ids = generateUuidBatch(3);

    expect(ids).toHaveLength(3);
    ids.forEach((id) => {
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });
  });

  it('clamps UUID batch generation to the public UI limit', () => {
    expect(generateUuidBatch(0)).toHaveLength(1);
    expect(generateUuidBatch(101)).toHaveLength(100);
  });

  it('formats unix seconds and milliseconds consistently', () => {
    expect(formatTimestamp('1704067200')?.iso).toBe('2024-01-01T00:00:00.000Z');
    expect(formatTimestamp('1704067200000')?.unixSeconds).toBe(1704067200);
  });

  it('reads seconds by magnitude, not digit count', () => {
    // The old `length <= 10` heuristic read this 11-digit seconds value as
    // milliseconds and returned 1973 instead of the year 5138.
    expect(formatTimestamp('99999999999')?.iso.startsWith('5138')).toBe(true);
  });

  it('rejects unparseable input', () => {
    expect(formatTimestamp('not a date')).toBeNull();
    expect(formatTimestamp('')).toBeNull();
  });
});
