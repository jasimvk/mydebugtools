export interface PreRequestDirectiveResult {
  headers: Record<string, string>;
  variables: { key: string; value: string }[];
  applied: string[];
  warnings: string[];
}

export interface PostmanTestContext {
  status: number;
  headers: Record<string, string>;
  bodyText: string;
  durationMs?: number;
}

export interface PostmanTestResult {
  name: string;
  passed: boolean;
  message?: string;
}

export interface ParsedCookie {
  name: string;
  value: string;
  attributes: string[];
}

const usefulLines = (script: string) =>
  script
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('//') && !line.startsWith('#'));

const unquote = (value: string) => {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"'))
    || (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
};

const findHeaderKey = (headers: Record<string, string>, wantedKey: string) =>
  Object.keys(headers).find((key) => key.toLowerCase() === wantedKey.toLowerCase());

export function applyPreRequestDirectives(
  script: string,
  initialHeaders: Record<string, string>
): PreRequestDirectiveResult {
  const headers = { ...initialHeaders };
  const variables: { key: string; value: string }[] = [];
  const applied: string[] = [];
  const warnings: string[] = [];

  usefulLines(script).forEach((line) => {
    const setHeaderMatch = line.match(/^set\s+header\s+([^:]+):\s*(.*)$/i);
    if (setHeaderMatch) {
      const key = setHeaderMatch[1].trim();
      const value = unquote(setHeaderMatch[2]);
      if (!key) {
        warnings.push(`Invalid header directive: ${line}`);
        return;
      }

      const existingKey = findHeaderKey(headers, key);
      if (existingKey && existingKey !== key) {
        delete headers[existingKey];
      }
      headers[key] = value;
      applied.push(`Set header ${key}`);
      return;
    }

    const unsetHeaderMatch = line.match(/^unset\s+header\s+(.+)$/i);
    if (unsetHeaderMatch) {
      const key = unsetHeaderMatch[1].trim();
      const existingKey = findHeaderKey(headers, key);
      if (existingKey) {
        delete headers[existingKey];
      }
      applied.push(`Unset header ${key}`);
      return;
    }

    const setVariableMatch = line.match(/^set\s+variable\s+([A-Za-z0-9_.-]+)\s*=\s*(.*)$/i);
    if (setVariableMatch) {
      const key = setVariableMatch[1].trim();
      const value = unquote(setVariableMatch[2]);
      variables.push({ key, value });
      applied.push(`Set variable ${key}`);
      return;
    }

    warnings.push(`Unsupported directive: ${line}`);
  });

  return { headers, variables, applied, warnings };
}

const normalizedHeaders = (headers: Record<string, string>) =>
  Object.fromEntries(Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value]));

const parseExpectedValue = (value: string) => {
  const clean = unquote(value);
  if (clean === 'true') return true;
  if (clean === 'false') return false;
  if (clean === 'null') return null;
  if (/^-?\d+(\.\d+)?$/.test(clean)) return Number(clean);
  return clean;
};

const getJsonPathValue = (bodyText: string, path: string) => {
  const data = JSON.parse(bodyText);
  const normalizedPath = path.replace(/^\$\./, '').replace(/^\$/, '');
  if (!normalizedPath) return data;

  return normalizedPath
    .split('.')
    .reduce<any>((current, part) => current?.[part], data);
};

const pass = (name: string): PostmanTestResult => ({ name, passed: true });
const fail = (name: string, message: string): PostmanTestResult => ({ name, passed: false, message });

export function runPostmanStyleTests(script: string, context: PostmanTestContext): PostmanTestResult[] {
  const headers = normalizedHeaders(context.headers);

  return usefulLines(script).map((line) => {
    const statusIsMatch = line.match(/^status\s+(?:is|equals)\s+(\d{3})$/i);
    if (statusIsMatch) {
      const expected = Number(statusIsMatch[1]);
      return context.status === expected
        ? pass(line)
        : fail(line, `Expected ${expected}, received ${context.status}.`);
    }

    const statusRangeMatch = line.match(/^status\s+in\s+(\d{3})\.\.(\d{3})$/i);
    if (statusRangeMatch) {
      const min = Number(statusRangeMatch[1]);
      const max = Number(statusRangeMatch[2]);
      return context.status >= min && context.status <= max
        ? pass(line)
        : fail(line, `Expected ${min}..${max}, received ${context.status}.`);
    }

    const headerContainsMatch = line.match(/^header\s+(.+?)\s+contains\s+(.+)$/i);
    if (headerContainsMatch) {
      const key = headerContainsMatch[1].trim().toLowerCase();
      const expected = unquote(headerContainsMatch[2]).toLowerCase();
      const actual = headers[key] || '';
      return actual.toLowerCase().includes(expected)
        ? pass(line)
        : fail(line, `Header ${key} did not contain ${expected}.`);
    }

    const headerIsMatch = line.match(/^header\s+(.+?)\s+(?:is|equals)\s+(.+)$/i);
    if (headerIsMatch) {
      const key = headerIsMatch[1].trim().toLowerCase();
      const expected = unquote(headerIsMatch[2]);
      const actual = headers[key] || '';
      return actual === expected
        ? pass(line)
        : fail(line, `Expected header ${key} to equal ${expected || '(empty)'}.`);
    }

    const bodyContainsMatch = line.match(/^body\s+contains\s+(.+)$/i);
    if (bodyContainsMatch) {
      const expected = unquote(bodyContainsMatch[1]);
      return context.bodyText.includes(expected)
        ? pass(line)
        : fail(line, `Response body did not contain ${expected}.`);
    }

    const jsonEqualsMatch = line.match(/^json\s+(.+?)\s+(?:is|equals)\s+(.+)$/i);
    if (jsonEqualsMatch) {
      const path = jsonEqualsMatch[1].trim();
      const expected = parseExpectedValue(jsonEqualsMatch[2]);
      try {
        const actual = getJsonPathValue(context.bodyText, path);
        return Object.is(actual, expected)
          ? pass(line)
          : fail(line, `Expected ${path} to equal ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}.`);
      } catch {
        return fail(line, 'Response body is not valid JSON.');
      }
    }

    const durationBelowMatch = line.match(/^response\s+time\s+below\s+(\d+)$/i);
    if (durationBelowMatch) {
      const expected = Number(durationBelowMatch[1]);
      const duration = context.durationMs ?? 0;
      return duration < expected
        ? pass(line)
        : fail(line, `Expected response time below ${expected}ms, received ${duration}ms.`);
    }

    return fail(line, 'Unsupported test. Use status/body/header/json/response time checks.');
  });
}

export function parseSetCookieHeader(value?: string): ParsedCookie[] {
  if (!value) return [];

  return value
    .split(/,(?=\s*[^;,=\s]+=)/)
    .map((cookie) => cookie.trim())
    .filter(Boolean)
    .map((cookie) => {
      const [pair = '', ...attributes] = cookie.split(';').map((part) => part.trim()).filter(Boolean);
      const separator = pair.indexOf('=');
      if (separator === -1) {
        return { name: pair, value: '', attributes };
      }

      return {
        name: pair.slice(0, separator),
        value: pair.slice(separator + 1),
        attributes,
      };
    });
}
