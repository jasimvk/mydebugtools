export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function generateUuidBatch(count: number): string[] {
  const safeCount = Math.max(1, Math.min(Number.isFinite(count) ? Math.floor(count) : 1, 100));
  return Array.from({ length: safeCount }, generateUuid);
}

function generateUuid(): string {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  const bytes = new Uint8Array(16);
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }

  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytesToHex(bytes);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

// Anything below this is read as seconds. Digit count was the old heuristic
// (`length <= 10`), which misread the 11-digit seconds value 99999999999 as
// milliseconds and returned 1973 instead of 5138.
const MAX_UNIX_SECONDS = 1e11;

export function formatTimestamp(value: string) {
  const trimmed = value.trim();
  const numeric = Number(trimmed);
  const date = /^\d+$/.test(trimmed)
    ? new Date(numeric < MAX_UNIX_SECONDS ? numeric * 1000 : numeric)
    : new Date(trimmed);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return {
    unixSeconds: Math.floor(date.getTime() / 1000),
    unixMilliseconds: date.getTime(),
    iso: date.toISOString(),
    utc: date.toUTCString(),
    local: date.toLocaleString(),
  };
}
