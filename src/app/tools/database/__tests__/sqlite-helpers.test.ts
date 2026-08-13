import {
  MAX_DB_FILE_BYTES,
  findNumericColumnIndex,
  formatRowsAffected,
  isNumericColumn,
  numericValue,
  parseHistory,
  validateDatabaseFile,
} from '../sqlite-helpers';

describe('sqlite helpers', () => {
  describe('numericValue', () => {
    it('accepts finite numbers and numeric strings', () => {
      expect(numericValue(42)).toBe(42);
      expect(numericValue(-1.5)).toBe(-1.5);
      expect(numericValue(' 19.00 ')).toBe(19);
    });

    it('rejects the values Number() coerces to zero', () => {
      expect(numericValue(null)).toBeNull();
      expect(numericValue(undefined)).toBeNull();
      expect(numericValue('')).toBeNull();
      expect(numericValue('   ')).toBeNull();
      expect(numericValue(true)).toBeNull();
      expect(numericValue([])).toBeNull();
    });

    it('rejects text and non-finite numbers', () => {
      expect(numericValue('aisha@example.com')).toBeNull();
      expect(numericValue(Number.NaN)).toBeNull();
      expect(numericValue(Number.POSITIVE_INFINITY)).toBeNull();
    });
  });

  describe('isNumericColumn', () => {
    it('treats a text column containing NULLs as non-numeric', () => {
      expect(isNumericColumn(['a@example.com', null, 'b@example.com'])).toBe(false);
    });

    it('accepts a numeric column with NULL gaps', () => {
      expect(isNumericColumn([49, null, 199])).toBe(true);
    });

    it('rejects an all-NULL column', () => {
      expect(isNumericColumn([null, null])).toBe(false);
    });
  });

  describe('findNumericColumnIndex', () => {
    it('skips text columns that only look numeric because of NULLs', () => {
      const rows = [
        ['Aisha', null, 49],
        ['Noah', 'noah@example.com', 19],
      ];
      expect(findNumericColumnIndex(3, rows)).toBe(2);
    });

    it('returns -1 when nothing is numeric', () => {
      expect(findNumericColumnIndex(2, [['a', 'b']])).toBe(-1);
    });
  });

  describe('parseHistory', () => {
    it('reads a stored array of queries', () => {
      expect(parseHistory('["SELECT 1;","SELECT 2;"]')).toEqual(['SELECT 1;', 'SELECT 2;']);
    });

    it('discards non-array and malformed payloads', () => {
      expect(parseHistory('{"a":1}')).toEqual([]);
      expect(parseHistory('"SELECT 1;"')).toEqual([]);
      expect(parseHistory('42')).toEqual([]);
      expect(parseHistory('not json')).toEqual([]);
      expect(parseHistory(null)).toEqual([]);
    });

    it('drops non-string entries inside an array', () => {
      expect(parseHistory('["SELECT 1;", 5, null]')).toEqual(['SELECT 1;']);
    });
  });

  describe('validateDatabaseFile', () => {
    it('passes a normal database file', () => {
      expect(validateDatabaseFile({ name: 'app.db', size: 1024 })).toBeNull();
    });

    it('rejects empty and oversized files', () => {
      expect(validateDatabaseFile({ name: 'app.db', size: 0 })).toContain('empty');
      expect(validateDatabaseFile({ name: 'app.db', size: MAX_DB_FILE_BYTES + 1 })).toContain('caps databases');
    });
  });

  describe('formatRowsAffected', () => {
    it('pluralises', () => {
      expect(formatRowsAffected(1)).toBe('Statement executed. 1 row affected.');
      expect(formatRowsAffected(0)).toBe('Statement executed. 0 rows affected.');
      expect(formatRowsAffected(2)).toBe('Statement executed. 2 rows affected.');
    });
  });
});
