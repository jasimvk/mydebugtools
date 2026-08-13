type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
type ContentType = 'application/json' | 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain' | 'application/xml' | 'text/xml';
type AuthType = 'none' | 'basic' | 'bearer' | 'apiKey';

interface Header {
  key: string;
  value: string;
  enabled: boolean;
}

interface AuthConfig {
  type: AuthType;
  username?: string;
  password?: string;
  token?: string;
  apiKey?: string;
  apiKeyLocation?: 'header' | 'query';
  apiKeyName?: string;
}

export interface ImportedRequest {
  name: string;
  method: HttpMethod;
  url: string;
  headers: Header[];
  body: string;
  contentType: ContentType;
  authConfig: AuthConfig;
  preRequestScript?: string;
  testScript?: string;
  description: string;
}

export interface ImportedCollection {
  name: string;
  description: string;
  color?: string;
  variables?: { key: string; value: string }[];
  requests: ImportedRequest[];
}

const METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
const CONTENT_TYPES: ContentType[] = [
  'application/json',
  'application/x-www-form-urlencoded',
  'multipart/form-data',
  'text/plain',
  'application/xml',
  'text/xml',
];

function isObject(value: unknown): value is Record<string, any> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function fallbackNameFromFile(fileName?: string) {
  const cleanName = fileName?.replace(/\.[^.]+$/, '').trim();
  return cleanName || 'Imported Collection';
}

function normalizeMethod(method: unknown): HttpMethod {
  const upper = String(method || 'GET').toUpperCase();
  return METHODS.includes(upper as HttpMethod) ? upper as HttpMethod : 'GET';
}

function normalizeContentType(value: unknown): ContentType {
  const contentType = String(value || '').split(';')[0].trim().toLowerCase();
  return CONTENT_TYPES.includes(contentType as ContentType) ? contentType as ContentType : 'application/json';
}

function methodSupportsBody(method: HttpMethod) {
  return !['GET', 'HEAD'].includes(method);
}

function normalizeHeaders(headers: unknown): Header[] {
  if (!Array.isArray(headers)) return [];

  return headers
    .filter((header) => isObject(header) && typeof header.key === 'string' && header.key.trim())
    .map((header) => ({
      key: header.key.trim(),
      value: String(header.value ?? ''),
      enabled: header.enabled !== false && header.disabled !== true,
    }));
}

function normalizeVariables(variables: unknown): { key: string; value: string }[] {
  if (!Array.isArray(variables)) return [];

  return variables
    .filter((variable) => isObject(variable) && typeof variable.key === 'string' && variable.key.trim())
    .map((variable) => ({
      key: variable.key.trim(),
      value: String(variable.value ?? variable.initial ?? ''),
    }));
}

function contentTypeFromHeaders(headers: Header[], fallback?: unknown): ContentType {
  const header = headers.find((item) => item.enabled && item.key.toLowerCase() === 'content-type');
  return normalizeContentType(header?.value || fallback);
}

function normalizeAuthConfig(value: unknown): AuthConfig {
  if (!isObject(value)) return { type: 'none' };

  const type = value.type as AuthType;
  if (type === 'basic') {
    return {
      type,
      username: String(value.username ?? ''),
      password: String(value.password ?? ''),
    };
  }

  if (type === 'bearer') {
    return {
      type,
      token: String(value.token ?? ''),
    };
  }

  if (type === 'apiKey') {
    return {
      type,
      apiKey: String(value.apiKey ?? ''),
      apiKeyLocation: value.apiKeyLocation === 'query' ? 'query' : 'header',
      apiKeyName: String(value.apiKeyName ?? ''),
    };
  }

  return { type: 'none' };
}

function normalizeNativeRequest(request: unknown, index: number): ImportedRequest | null {
  if (!isObject(request)) return null;

  const headers = normalizeHeaders(request.headers);
  const url = String(request.url ?? '').trim();

  if (!url) return null;

  return {
    name: String(request.name || `Request ${index + 1}`),
    method: normalizeMethod(request.method),
    url,
    headers,
    body: String(request.body ?? ''),
    contentType: contentTypeFromHeaders(headers, request.contentType),
    authConfig: normalizeAuthConfig(request.authConfig),
    preRequestScript: String(request.preRequestScript ?? ''),
    testScript: String(request.testScript ?? ''),
    description: String(request.description ?? ''),
  };
}

function postmanDescription(value: unknown): string {
  if (typeof value === 'string') return value;
  if (isObject(value) && typeof value.content === 'string') return value.content;
  return '';
}

function postmanUrl(value: unknown): string {
  if (typeof value === 'string') return value;
  if (!isObject(value)) return '';
  if (typeof value.raw === 'string' && value.raw.trim()) return value.raw;

  const protocol = typeof value.protocol === 'string' ? `${value.protocol}://` : '';
  const host = Array.isArray(value.host) ? value.host.join('.') : String(value.host ?? '');
  const path = Array.isArray(value.path) ? `/${value.path.join('/')}` : value.path ? `/${value.path}` : '';
  const query = Array.isArray(value.query)
    ? value.query
        .filter((item) => isObject(item) && item.disabled !== true && typeof item.key === 'string')
        .map((item) => `${encodeURIComponent(item.key)}=${encodeURIComponent(String(item.value ?? ''))}`)
        .join('&')
    : '';

  const builtUrl = `${protocol}${host}${path}`;
  return query ? `${builtUrl}?${query}` : builtUrl;
}

function postmanBody(value: unknown): { body: string; contentType: ContentType } {
  if (!isObject(value)) return { body: '', contentType: 'application/json' };

  if (value.mode === 'raw') {
    return {
      body: String(value.raw ?? ''),
      contentType: normalizeContentType(value.options?.raw?.language === 'json' ? 'application/json' : value.options?.raw?.language),
    };
  }

  if (value.mode === 'urlencoded' && Array.isArray(value.urlencoded)) {
    return {
      body: value.urlencoded
        .filter((item) => isObject(item) && item.disabled !== true && typeof item.key === 'string')
        .map((item) => `${encodeURIComponent(item.key)}=${encodeURIComponent(String(item.value ?? ''))}`)
        .join('&'),
      contentType: 'application/x-www-form-urlencoded',
    };
  }

  if (value.mode === 'formdata' && Array.isArray(value.formdata)) {
    return {
      body: value.formdata
        .filter((item) => isObject(item) && item.disabled !== true && typeof item.key === 'string')
        .map((item) => `${item.key}=${String(item.value ?? '')}`)
        .join('\n'),
      contentType: 'multipart/form-data',
    };
  }

  return { body: '', contentType: 'application/json' };
}

function postmanAuth(value: unknown): AuthConfig {
  if (!isObject(value)) return { type: 'none' };

  if (value.type === 'bearer' && Array.isArray(value.bearer)) {
    const token = value.bearer.find((item: unknown) => isObject(item) && item.key === 'token');
    return { type: 'bearer', token: String(token?.value ?? '') };
  }

  if (value.type === 'basic' && Array.isArray(value.basic)) {
    const username = value.basic.find((item: unknown) => isObject(item) && item.key === 'username');
    const password = value.basic.find((item: unknown) => isObject(item) && item.key === 'password');
    return {
      type: 'basic',
      username: String(username?.value ?? ''),
      password: String(password?.value ?? ''),
    };
  }

  if (value.type === 'apikey' && Array.isArray(value.apikey)) {
    const key = value.apikey.find((item: unknown) => isObject(item) && item.key === 'key');
    const apiValue = value.apikey.find((item: unknown) => isObject(item) && item.key === 'value');
    const inValue = value.apikey.find((item: unknown) => isObject(item) && item.key === 'in');
    return {
      type: 'apiKey',
      apiKeyName: String(key?.value ?? ''),
      apiKey: String(apiValue?.value ?? ''),
      apiKeyLocation: inValue?.value === 'query' ? 'query' : 'header',
    };
  }

  return { type: 'none' };
}

function postmanEventScript(item: Record<string, any>, listen: 'prerequest' | 'test'): string {
  if (!Array.isArray(item.event)) return '';
  const event = item.event.find((candidate: unknown) => (
    isObject(candidate)
    && candidate.listen === listen
    && isObject(candidate.script)
  ));
  if (!isObject(event?.script)) return '';

  const exec = event.script.exec;
  if (Array.isArray(exec)) return exec.map((line) => String(line)).join('\n');
  return typeof exec === 'string' ? exec : '';
}

function normalizePostmanRequest(item: Record<string, any>, index: number): ImportedRequest | null {
  if (!isObject(item.request)) return null;

  const headers = normalizeHeaders(item.request.header);
  const body = postmanBody(item.request.body);
  const url = postmanUrl(item.request.url).trim();

  if (!url) return null;

  return {
    name: String(item.name || `Request ${index + 1}`),
    method: normalizeMethod(item.request.method),
    url,
    headers,
    body: body.body,
    contentType: contentTypeFromHeaders(headers, body.contentType),
    authConfig: postmanAuth(item.request.auth),
    preRequestScript: postmanEventScript(item, 'prerequest'),
    testScript: postmanEventScript(item, 'test'),
    description: postmanDescription(item.request.description ?? item.description),
  };
}

function collectPostmanRequests(items: unknown, output: ImportedRequest[]) {
  if (!Array.isArray(items)) return;

  for (const item of items) {
    if (!isObject(item)) continue;

    if (Array.isArray(item.item)) {
      collectPostmanRequests(item.item, output);
      continue;
    }

    const request = normalizePostmanRequest(item, output.length);
    if (request) output.push(request);
  }
}

function firstDefined<T>(values: T[]): T | undefined {
  return values.find((value) => value !== undefined && value !== null && value !== '');
}

function openApiBaseUrl(raw: Record<string, any>): string {
  if (Array.isArray(raw.servers)) {
    const server = raw.servers.find((item: unknown) => isObject(item) && typeof item.url === 'string' && item.url.trim());
    if (server) return String(server.url).trim();
  }

  if (typeof raw.host === 'string' && raw.host.trim()) {
    const scheme = Array.isArray(raw.schemes) && raw.schemes[0] ? raw.schemes[0] : 'https';
    const basePath = typeof raw.basePath === 'string' ? raw.basePath : '';
    return `${scheme}://${raw.host}${basePath}`;
  }

  return '';
}

function joinUrl(baseUrl: string, path: string): string {
  const normalizedPath = path.replace(/{([^}]+)}/g, '{{$1}}');
  if (!baseUrl) return normalizedPath;
  return `${baseUrl.replace(/\/$/, '')}/${normalizedPath.replace(/^\//, '')}`;
}

function openApiQueryString(parameters: unknown): string {
  if (!Array.isArray(parameters)) return '';

  return parameters
    .filter((parameter) => isObject(parameter) && parameter.in === 'query' && typeof parameter.name === 'string')
    .map((parameter) => {
      const value = String(firstDefined([parameter.example, parameter.default, `{{${parameter.name}}}`]));
      // Percent-encoding a {{placeholder}} stops the workbench from substituting it later.
      const encodedValue = /^{{\s*[^{}\s]+\s*}}$/.test(value) ? value : encodeURIComponent(value);
      return `${encodeURIComponent(parameter.name)}=${encodedValue}`;
    })
    .join('&');
}

function openApiBody(operation: Record<string, any>): { body: string; contentType: ContentType } {
  const requestBody = operation.requestBody;
  const content = isObject(requestBody) && isObject(requestBody.content) ? requestBody.content : null;
  if (!content) return { body: '', contentType: 'application/json' };

  const contentTypeKey = Object.keys(content).find((key) => key.includes('json'))
    || Object.keys(content).find((key) => key.includes('xml'))
    || Object.keys(content)[0];
  const media = contentTypeKey && isObject(content[contentTypeKey]) ? content[contentTypeKey] : null;
  if (!media) return { body: '', contentType: normalizeContentType(contentTypeKey) };

  const namedExample = isObject(media.examples)
    ? Object.values(media.examples).find((item) => isObject(item) && 'value' in item)
    : undefined;
  const example = firstDefined([
    media.example,
    isObject(namedExample) ? namedExample.value : undefined,
  ]);

  if (example === undefined) {
    return { body: '', contentType: normalizeContentType(contentTypeKey) };
  }

  return {
    body: typeof example === 'string' ? example : JSON.stringify(example, null, 2),
    contentType: normalizeContentType(contentTypeKey),
  };
}

function normalizeOpenApiRequest(
  path: string,
  method: string,
  operation: Record<string, any>,
  pathItem: Record<string, any>,
  baseUrl: string,
  index: number
): ImportedRequest | null {
  const normalizedMethod = normalizeMethod(method);
  const body = openApiBody(operation);
  const headers: Header[] = [];
  if (body.body && methodSupportsBody(normalizedMethod)) {
    headers.push({ key: 'Content-Type', value: body.contentType, enabled: true });
  }

  const combinedParameters = [
    ...(Array.isArray(pathItem.parameters) ? pathItem.parameters : []),
    ...(Array.isArray(operation.parameters) ? operation.parameters : []),
  ];
  const query = openApiQueryString(combinedParameters);
  const url = `${joinUrl(baseUrl, path)}${query ? `?${query}` : ''}`;

  if (!url.trim()) return null;

  return {
    name: String(operation.summary || operation.operationId || `${normalizedMethod} ${path}` || `Request ${index + 1}`),
    method: normalizedMethod,
    url,
    headers,
    body: methodSupportsBody(normalizedMethod) ? body.body : '',
    contentType: body.contentType,
    authConfig: { type: 'none' },
    preRequestScript: '',
    testScript: '',
    description: String(operation.description ?? ''),
  };
}

function collectOpenApiRequests(raw: Record<string, any>): ImportedRequest[] {
  const output: ImportedRequest[] = [];
  const paths = isObject(raw.paths) ? raw.paths : {};
  const baseUrl = openApiBaseUrl(raw);

  Object.entries(paths).forEach(([path, pathItem]) => {
    if (!isObject(pathItem)) return;

    METHODS.forEach((method) => {
      const operation = pathItem[method.toLowerCase()];
      if (!isObject(operation)) return;

      const request = normalizeOpenApiRequest(path, method, operation, pathItem, baseUrl, output.length);
      if (request) output.push(request);
    });
  });

  return output;
}

function insomniaBody(value: unknown): { body: string; contentType: ContentType } {
  if (!isObject(value)) return { body: '', contentType: 'application/json' };

  const mimeType = normalizeContentType(value.mimeType);
  if (typeof value.text === 'string') return { body: value.text, contentType: mimeType };
  if (Array.isArray(value.params)) {
    return {
      body: value.params
        .filter((item) => isObject(item) && item.disabled !== true && typeof item.name === 'string')
        .map((item) => `${encodeURIComponent(item.name)}=${encodeURIComponent(String(item.value ?? ''))}`)
        .join('&'),
      contentType: 'application/x-www-form-urlencoded',
    };
  }

  return { body: '', contentType: mimeType };
}

function normalizeInsomniaRequest(resource: Record<string, any>, index: number): ImportedRequest | null {
  const url = String(resource.url ?? '').trim();
  if (!url) return null;

  const headers = normalizeHeaders(
    Array.isArray(resource.headers)
      ? resource.headers.map((header) => ({
          key: header.name ?? header.key,
          value: header.value,
          enabled: header.disabled !== true,
        }))
      : []
  );
  const body = insomniaBody(resource.body);

  return {
    name: String(resource.name || `Request ${index + 1}`),
    method: normalizeMethod(resource.method),
    url,
    headers,
    body: body.body,
    contentType: contentTypeFromHeaders(headers, body.contentType),
    authConfig: { type: 'none' },
    preRequestScript: '',
    testScript: '',
    description: String(resource.description ?? ''),
  };
}

function collectInsomniaRequests(resources: unknown): ImportedRequest[] {
  if (!Array.isArray(resources)) return [];

  return resources
    .filter((resource) => isObject(resource) && resource._type === 'request')
    .map((resource, index) => normalizeInsomniaRequest(resource, index))
    .filter((request): request is ImportedRequest => request !== null);
}

function collectInsomniaVariables(resources: unknown): { key: string; value: string }[] {
  if (!Array.isArray(resources)) return [];

  return resources.flatMap((resource) => {
    if (!isObject(resource) || resource._type !== 'environment' || !isObject(resource.data)) return [];
    return Object.entries(resource.data).map(([key, value]) => ({
      key,
      value: typeof value === 'string' ? value : JSON.stringify(value),
    }));
  });
}

export function parseImportedCollection(raw: unknown, fileName?: string): ImportedCollection {
  if (!isObject(raw)) {
    throw new Error('Collection import must be a JSON object.');
  }

  const fallbackName = fallbackNameFromFile(fileName);

  if (typeof raw.openapi === 'string' || typeof raw.swagger === 'string') {
    const requests = collectOpenApiRequests(raw);

    return {
      name: String(raw.info?.title || raw.info?.name || fallbackName),
      description: String(raw.info?.description ?? ''),
      color: typeof raw.color === 'string' ? raw.color : undefined,
      variables: normalizeVariables(raw.variables),
      requests,
    };
  }

  if (Array.isArray(raw.resources) && raw.__export_format) {
    const workspace = raw.resources.find((resource: unknown) => isObject(resource) && resource._type === 'workspace');
    return {
      name: String(workspace?.name || raw.name || fallbackName),
      description: String(workspace?.description ?? raw.description ?? ''),
      color: typeof raw.color === 'string' ? raw.color : undefined,
      variables: collectInsomniaVariables(raw.resources),
      requests: collectInsomniaRequests(raw.resources),
    };
  }

  if (isObject(raw.info) || Array.isArray(raw.item)) {
    const requests: ImportedRequest[] = [];
    collectPostmanRequests(raw.item, requests);

    return {
      name: String(raw.info?.name || raw.name || fallbackName),
      description: postmanDescription(raw.info?.description || raw.description),
      color: typeof raw.color === 'string' ? raw.color : undefined,
      variables: normalizeVariables(raw.variable),
      requests,
    };
  }

  if (typeof raw.name === 'string' || Array.isArray(raw.requests)) {
    const requests = Array.isArray(raw.requests)
      ? raw.requests
          .map((request, index) => normalizeNativeRequest(request, index))
          .filter((request): request is ImportedRequest => request !== null)
      : [];

    return {
      name: raw.name?.trim() || fallbackName,
      description: String(raw.description ?? ''),
      color: typeof raw.color === 'string' ? raw.color : undefined,
      variables: normalizeVariables(raw.variables),
      requests,
    };
  }

  throw new Error('Unsupported collection format. Import a debugtools, Postman, Insomnia, or OpenAPI JSON file.');
}
