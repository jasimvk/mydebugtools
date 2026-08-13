export type StackFrame = {
  raw: string;
  functionName: string;
  file: string;
  line?: number;
  column?: number;
  isDependency: boolean;
};

export type LogEntry = {
  timestamp?: string;
  severity: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG' | 'TRACE' | 'UNKNOWN';
  traceId?: string;
  message: string;
  details: string[];
};

type HarLikeEntry = {
  request?: {
    method?: unknown;
    url?: unknown;
  };
  response?: {
    status?: unknown;
    bodySize?: unknown;
    content?: {
      size?: unknown;
    };
  };
  time?: unknown;
  timings?: {
    wait?: unknown;
  };
  _transferSize?: unknown;
};

type HarRequestSummary = {
  method: string;
  url: string;
  status: number;
  time: number;
  wait: number;
  transferSize: number;
  group: string;
};

const severityPattern = /\b(ERROR|ERR|WARN|WARNING|INFO|DEBUG|TRACE|FATAL)\b/i;
// Only a severity at the very start of a line opens a new entry; `Caused by: ... FATAL`
// inside a Java stack trace belongs to the entry above it.
const leadingSeverityPattern = /^\[?(?:ERROR|ERR|WARN|WARNING|INFO|DEBUG|TRACE|FATAL)\b/i;
const errorHeaderPattern = /^[A-Za-z_$][\w.$]*(?:Error|Exception|Failure)\b/;
const tracePattern = /\b(?:trace[_-]?id|request[_-]?id|correlation[_-]?id|rid)[:=]\s*["']?([a-z0-9._:-]+)["']?/i;
const timestampPattern = /^(\[?\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?\]?)/;

function normalizeSeverity(value: string | undefined): LogEntry['severity'] {
  const normalized = value?.toUpperCase();
  if (normalized === 'ERR' || normalized === 'FATAL') return 'ERROR';
  if (normalized === 'WARNING') return 'WARN';
  if (normalized === 'ERROR' || normalized === 'WARN' || normalized === 'INFO' || normalized === 'DEBUG' || normalized === 'TRACE') {
    return normalized;
  }
  return 'UNKNOWN';
}

function parseStackFrame(line: string): StackFrame | null {
  const trimmed = line.trim();
  const jsFrame = trimmed.match(/^at\s+(?:(.*?)\s+\()?(.+?):(\d+):(\d+)\)?$/);
  if (jsFrame) {
    const [, functionName = '<anonymous>', file, lineNumber, columnNumber] = jsFrame;
    return {
      raw: trimmed,
      functionName,
      file,
      line: Number(lineNumber),
      column: Number(columnNumber),
      isDependency: /node_modules|\/vendor\/|webpack|next\/dist/i.test(file),
    };
  }

  const pythonFrame = trimmed.match(/^File\s+"(.+?)",\s+line\s+(\d+),\s+in\s+(.+)$/);
  if (pythonFrame) {
    const [, file, lineNumber, functionName] = pythonFrame;
    return {
      raw: trimmed,
      functionName,
      file,
      line: Number(lineNumber),
      isDependency: /site-packages|dist-packages|\/lib\/python/i.test(file),
    };
  }

  const javaFrame = trimmed.match(/^at\s+(.+)\((.+?):(\d+)\)$/);
  if (javaFrame) {
    const [, functionName, file, lineNumber] = javaFrame;
    return {
      raw: trimmed,
      functionName,
      file,
      line: Number(lineNumber),
      isDependency: /java\.|javax\.|kotlin\.|android\.|org\.springframework/i.test(functionName),
    };
  }

  // Firefox/Safari format: `getUser@https://app/x.js:42:18` (function name is empty for global code).
  const spiderMonkeyFrame = trimmed.match(/^(.*?)@(.+?):(\d+)(?::(\d+))?$/);
  if (spiderMonkeyFrame) {
    const [, functionName, file, lineNumber, columnNumber] = spiderMonkeyFrame;
    return {
      raw: trimmed,
      functionName: functionName || '<anonymous>',
      file,
      line: Number(lineNumber),
      column: columnNumber ? Number(columnNumber) : undefined,
      isDependency: /node_modules|\/vendor\/|webpack|next\/dist/i.test(file),
    };
  }

  return null;
}

function splitErrorBlocks(input: string) {
  const blocks: string[] = [];
  let current: string[] = [];

  const flush = () => {
    const block = current.join('\n').trim();
    if (block) blocks.push(block);
    current = [];
  };

  input.split(/\r?\n/).forEach((line) => {
    if (!line.trim()) {
      flush();
      return;
    }

    // Real logs are contiguous, so an unindented error header also starts a new block.
    if (current.length > 0 && errorHeaderPattern.test(line)) flush();
    current.push(line);
  });

  flush();
  return blocks;
}

export function analyzeStackTrace(input: string) {
  const lines = input.split(/\r?\n/).map((line) => line.trimEnd()).filter(Boolean);
  const firstLine = lines[0] || '';
  // Require an explicit `Type:` separator or a recognizable error suffix, otherwise a trace
  // that starts with a frame reports the frame's identifier as the error type.
  const errorMatch = firstLine.match(/^([A-Za-z_$][\w.$]*):\s*(.*)$/)
    || firstLine.match(/^([A-Za-z_$][\w.$]*(?:Error|Exception|Failure))\b\s*(.*)$/);
  const frames = lines.map(parseStackFrame).filter((frame): frame is StackFrame => Boolean(frame));
  const appFrames = frames.filter((frame) => !frame.isDependency);
  const dependencyFrames = frames.filter((frame) => frame.isDependency);
  const rootFrame = appFrames[0] || frames[0] || null;
  const message = errorMatch?.[2] || firstLine;
  const lowerMessage = message.toLowerCase();
  let likelyCause = 'Start with the first application frame and inspect the values passed into that call.';

  if (/undefined|null|nil|none/.test(lowerMessage)) {
    likelyCause = 'A value is undefined or null before property access or method call. Check guards, API response shape, and optional fields near the first app frame.';
  } else if (/timeout|timed out|deadline/.test(lowerMessage)) {
    likelyCause = 'A downstream operation exceeded its time budget. Check network calls, retries, and slow dependencies around the root frame.';
  } else if (/permission|unauthorized|forbidden|denied/.test(lowerMessage)) {
    likelyCause = 'The failing path likely lacks credentials, permissions, or a required auth scope.';
  } else if (/syntax|parse|json/.test(lowerMessage)) {
    likelyCause = 'Input parsing failed. Inspect the payload before this frame and confirm the expected data format.';
  }

  return {
    errorType: errorMatch?.[1] || 'UnknownError',
    message,
    frames,
    appFrames,
    dependencyFrames,
    rootFrame,
    likelyCause,
  };
}

export function analyzeLogs(input: string) {
  const entries: LogEntry[] = [];

  input.split(/\r?\n/).forEach((line) => {
    if (!line.trim()) return;

    const severity = normalizeSeverity(line.match(severityPattern)?.[1]);
    const startsEntry = Boolean(line.match(timestampPattern) || leadingSeverityPattern.test(line) || line.match(tracePattern));

    if (!startsEntry && entries.length > 0) {
      entries[entries.length - 1].details.push(line);
      return;
    }

    entries.push({
      timestamp: line.match(timestampPattern)?.[1]?.replace(/^\[|\]$/g, ''),
      severity,
      traceId: line.match(tracePattern)?.[1],
      message: line.trim(),
      details: [],
    });
  });

  const severityCounts = entries.reduce<Record<string, number>>((counts, entry) => {
    counts[entry.severity] = (counts[entry.severity] || 0) + 1;
    return counts;
  }, {});

  const traces = Array.from(
    entries.reduce<Map<string, LogEntry[]>>((groups, entry) => {
      if (!entry.traceId) return groups;
      groups.set(entry.traceId, [...(groups.get(entry.traceId) || []), entry]);
      return groups;
    }, new Map()),
  ).map(([id, groupedEntries]) => ({
    id,
    entries: groupedEntries,
    hasError: groupedEntries.some((entry) => entry.severity === 'ERROR'),
  }));

  return {
    entries,
    severityCounts,
    traces,
    // Sort a copy: `traces` is returned above and must keep its original log order.
    topTrace: [...traces].sort((a, b) => b.entries.length - a.entries.length)[0] || null,
  };
}

function statusGroup(status: number) {
  if (status >= 500) return '5xx';
  if (status >= 400) return '4xx';
  if (status >= 300) return '3xx';
  if (status >= 200) return '2xx';
  return 'other';
}

function transferSizeOf(entry: HarLikeEntry) {
  // Chrome writes -1 for cached or compressed entries, which would make the total negative.
  const candidates = [entry?._transferSize, entry?.response?.content?.size, entry?.response?.bodySize];
  for (const candidate of candidates) {
    const value = Number(candidate);
    if (Number.isFinite(value) && value > 0) return value;
  }
  return 0;
}

export function analyzeHar(input: string) {
  const parsed = JSON.parse(input);
  const rawEntries: HarLikeEntry[] = Array.isArray(parsed?.log?.entries)
    ? parsed.log.entries
    : Array.isArray(parsed?.entries)
      ? parsed.entries
      : [];
  const requests: HarRequestSummary[] = rawEntries.map((entry) => {
    const status = Number(entry?.response?.status || 0);
    return {
      method: String(entry?.request?.method || 'GET'),
      url: String(entry?.request?.url || ''),
      status,
      time: Number(entry?.time || 0),
      wait: Number(entry?.timings?.wait || 0),
      transferSize: transferSizeOf(entry),
      group: statusGroup(status),
    };
  });

  const statusGroups = requests.reduce<Record<string, number>>((groups, request) => {
    groups[request.group] = (groups[request.group] || 0) + 1;
    return groups;
  }, {});

  return {
    totalRequests: requests.length,
    totalTransferSize: requests.reduce((sum, request) => sum + request.transferSize, 0),
    redirects: requests.filter((request) => request.status >= 300 && request.status < 400).length,
    failures: requests.filter((request) => request.status >= 400).length,
    statusGroups,
    slowest: [...requests].sort((a, b) => b.time - a.time).slice(0, 5),
    requests,
  };
}

export function analyzeErrors(input: string) {
  const issues = splitErrorBlocks(input).reduce<Array<{
    fingerprint: string;
    title: string;
    count: number;
    firstSeen: string;
    sample: ReturnType<typeof analyzeStackTrace>;
  }>>((acc, block) => {
    const sample = analyzeStackTrace(block);
    const root = sample.rootFrame;
    // The line number is part of the identity: digits in the message are normalised away,
    // so without it two distinct failures in the same function collapse into one issue.
    const fingerprint = [sample.errorType, sample.message.replace(/\d+/g, '#'), root?.functionName, root?.file, root?.line].filter(Boolean).join('|');
    const existing = acc.find((issue) => issue.fingerprint === fingerprint);

    if (existing) {
      existing.count += 1;
      return acc;
    }

    acc.push({
      fingerprint,
      title: `${sample.errorType}: ${sample.message || 'Unknown error'}`,
      count: 1,
      firstSeen: block,
      sample,
    });
    return acc;
  }, []);

  issues.sort((a, b) => b.count - a.count);

  return {
    issues,
    summary: {
      totalErrors: issues.reduce((sum, issue) => sum + issue.count, 0),
      uniqueIssues: issues.length,
      repeatedIssues: issues.filter((issue) => issue.count > 1).length,
    },
  };
}

function collectOtelSpans(value: any): any[] {
  if (!value || typeof value !== 'object') return [];
  if (Array.isArray(value)) return value.flatMap(collectOtelSpans);
  if (Array.isArray(value.spans)) return value.spans.flatMap(collectOtelSpans);
  if (Array.isArray(value.resourceSpans)) return value.resourceSpans.flatMap(collectOtelSpans);
  if (Array.isArray(value.scopeSpans)) return value.scopeSpans.flatMap(collectOtelSpans);
  if (value.name && (value.spanId || value.span_id)) return [value];
  return Object.values(value).flatMap(collectOtelSpans);
}

function nanoBoundsMs(span: any) {
  const start = Number(span.startTimeUnixNano || span.start_time_unix_nano || 0);
  const end = Number(span.endTimeUnixNano || span.end_time_unix_nano || 0);
  if (!start || !end || end < start) return null;
  return { startMs: start / 1_000_000, endMs: end / 1_000_000 };
}

function nanoDurationMs(span: any) {
  const bounds = nanoBoundsMs(span);
  if (!bounds) return Number(span.durationMs || span.duration_ms || 0);
  return Math.round(bounds.endMs - bounds.startMs);
}

function isErrorStatus(span: any) {
  const raw = span.status?.code ?? span.statusCode;
  // OTLP/JSON exports the enum as a string; the protobuf encoding uses the numeric value.
  if (typeof raw === 'string') {
    const normalized = raw.toUpperCase();
    if (normalized === 'STATUS_CODE_ERROR' || normalized === 'ERROR' || normalized === '2') return true;
  } else if (Number(raw || 0) === 2) {
    return true;
  }

  return /error/i.test(String(span.status?.message || span.status || ''));
}

export function analyzeOtelTrace(input: string) {
  const parsed = JSON.parse(input);
  const spans = collectOtelSpans(parsed).map((span) => {
    const bounds = nanoBoundsMs(span);
    return {
      name: String(span.name || 'unnamed span'),
      traceId: String(span.traceId || span.trace_id || 'unknown'),
      spanId: String(span.spanId || span.span_id || ''),
      parentSpanId: span.parentSpanId || span.parent_span_id ? String(span.parentSpanId || span.parent_span_id) : '',
      durationMs: nanoDurationMs(span),
      startMs: bounds?.startMs ?? null,
      endMs: bounds?.endMs ?? null,
      isError: isErrorStatus(span),
      statusMessage: String(span.status?.message || ''),
    };
  });

  const traces = Array.from(spans.reduce<Map<string, typeof spans>>((groups, span) => {
    groups.set(span.traceId, [...(groups.get(span.traceId) || []), span]);
    return groups;
  }, new Map())).map(([traceId, traceSpans]) => {
    // Wall-clock span of the trace, not the longest single span. Reduce rather than spread:
    // `Math.max(...bigArray)` throws RangeError on large exports.
    const bounds = traceSpans.reduce<{ min: number; max: number } | null>((acc, span) => {
      if (span.startMs === null || span.endMs === null) return acc;
      if (!acc) return { min: span.startMs, max: span.endMs };
      return { min: Math.min(acc.min, span.startMs), max: Math.max(acc.max, span.endMs) };
    }, null);

    return {
      traceId,
      spanCount: traceSpans.length,
      totalDurationMs: bounds
        ? Math.round(bounds.max - bounds.min)
        : traceSpans.reduce((longest, span) => Math.max(longest, span.durationMs), 0),
      errorCount: traceSpans.filter((span) => span.isError).length,
    };
  });

  return {
    totalSpans: spans.length,
    traces,
    errorSpans: spans.filter((span) => span.isError),
    slowest: [...spans].sort((a, b) => b.durationMs - a.durationMs).slice(0, 8),
    rootSpans: spans.filter((span) => !span.parentSpanId),
    spans,
  };
}

function findField(input: string, label: string) {
  // `kubectl describe` indents most fields under their section, so the label is rarely at column 0.
  return input.match(new RegExp(`^[ \\t]*${label}:[ \\t]*(.+)$`, 'im'))?.[1]?.trim();
}

// YAML and `kubectl describe` both nest with variable indent widths, so anchor direct child
// keys to the first indent level found under the parent instead of assuming two spaces.
function directChildKeys(lines: string[], parentIndex: number) {
  if (parentIndex < 0) return [];

  const body: string[] = [];
  for (const line of lines.slice(parentIndex + 1)) {
    if (!line.trim() || /^\s*#/.test(line)) continue;
    if (/^\S/.test(line)) break;
    body.push(line);
  }

  const childIndent = body[0]?.match(/^\s*/)?.[0].length;
  if (childIndent === undefined) return [];

  const keyPattern = new RegExp(`^\\s{${childIndent}}([A-Za-z0-9_.-]+):`);
  return body
    .map((line) => line.match(keyPattern)?.[1])
    .filter((key): key is string => Boolean(key));
}

export function analyzeKubernetesDebug(input: string) {
  const lines = input.split(/\r?\n/);
  const lower = input.toLowerCase();
  const signals: string[] = [];

  if (/crashloopbackoff/.test(lower)) signals.push('CrashLoopBackOff');
  if (/imagepullbackoff|errimagepull/.test(lower)) signals.push('Image pull failure');
  if (/oomkilled|exit code:\s*137|reason:\s*oom/.test(lower)) signals.push('OOMKilled or memory pressure');
  if (/pending|failedscheduling|insufficient/.test(lower)) signals.push('Scheduling or capacity issue');
  if (/readiness probe failed|liveness probe failed|probe/.test(lower)) signals.push('Probe failure');
  if (/backoff/.test(lower) && !signals.includes('CrashLoopBackOff')) signals.push('Backoff');

  const name = findField(input, 'Name') || '<pod>';
  const namespace = findField(input, 'Namespace') || 'default';
  // `kubectl debug --target` takes a container name, so read the keys under `Containers:`
  // rather than `Container ID:`, which holds a runtime URI.
  const container = directChildKeys(lines, lines.findIndex((line) => /^\s*Containers:\s*$/.test(line)))[0]
    || findField(input, 'Container')
    || '<container>';
  const commands = [
    `kubectl describe pod ${name} -n ${namespace}`,
    `kubectl logs ${name} -n ${namespace} --previous`,
    `kubectl logs ${name} -n ${namespace} --all-containers`,
    `kubectl get events -n ${namespace} --sort-by=.lastTimestamp`,
    `kubectl debug ${name} -n ${namespace} -it --image=busybox --target=${container}`,
  ];

  return {
    name,
    namespace,
    signals,
    commands,
    likelyCause: signals[0] || 'No common Kubernetes failure signature detected. Start with describe, logs, and recent events.',
  };
}

// `run:` bodies, including `run: |` block scalars, so shell risks are not reported for the
// word "curl" appearing in a job name or a comment.
function collectRunScripts(lines: string[]) {
  const scripts: string[] = [];
  let blockIndent: number | null = null;

  lines.forEach((line) => {
    const runStart = line.match(/^(\s*)-?\s*run:\s*(.*)$/);
    if (runStart) {
      blockIndent = runStart[1].length;
      scripts.push(runStart[2]);
      return;
    }

    const indent = line.match(/^\s*/)?.[0].length ?? 0;
    if (blockIndent !== null && line.trim() && indent > blockIndent) {
      scripts.push(line.trim());
      return;
    }

    if (line.trim()) blockIndent = null;
  });

  return scripts.join('\n');
}

export function analyzeCiWorkflow(input: string) {
  const lines = input.split(/\r?\n/);
  const jobs = directChildKeys(lines, lines.findIndex((line) => /^jobs:/.test(line)));

  const stepCount = (input.match(/^\s*-\s+(?:name:|run:|uses:)/gm) || []).length;
  const risks: string[] = [];
  const lower = input.toLowerCase();
  if (/\$\{\{\s*secrets\./i.test(input)) risks.push('Workflow references secrets; local runs need a safe .secrets or env substitute.');
  if (/pull_request_target/.test(lower)) risks.push('pull_request_target can expose privileged context to untrusted changes.');
  if (/ubuntu-latest|windows-latest|macos-latest/.test(lower)) risks.push('latest runner labels can drift; pin runner versions for reproducible debugging.');
  if (/curl|wget|bash\s+-c|sh\s+-c/i.test(collectRunScripts(lines))) risks.push('Shell/network steps need extra logging and exit-code checks.');

  const onIndex = lines.findIndex((line) => /^on:/.test(line));
  const inlineTrigger = onIndex >= 0 ? lines[onIndex].replace(/^on:\s*/, '').trim() : '';
  // `on:` is written either inline (`on: [push]`) or as a block with one key per event.
  const triggers = onIndex < 0
    ? []
    : inlineTrigger
      ? [inlineTrigger]
      : directChildKeys(lines, onIndex);

  return {
    jobs,
    stepCount,
    triggers,
    risks,
    commands: [
      'act -l',
      jobs[0] ? `act -j ${jobs[0]} --container-architecture linux/amd64` : 'act --container-architecture linux/amd64',
      'gh workflow run <workflow.yml> --ref <branch>',
    ],
  };
}

const recommendedHeaders = [
  'content-security-policy',
  'strict-transport-security',
  'x-frame-options',
  'x-content-type-options',
  'referrer-policy',
  'permissions-policy',
];

export function analyzeSecurityHeaders(input: string) {
  const headers = input.split(/\r?\n/).reduce<Record<string, string[]>>((acc, line) => {
    const match = line.match(/^([A-Za-z0-9!#$%&'*+.^_`|~-]+):[ \t]*(.+)$/);
    if (!match) return acc;
    // A pasted curl transcript contains URLs, which are token-shaped up to the colon;
    // `https://example.com` is a scheme, not a header named `https`.
    if (match[2].startsWith('//')) return acc;
    const key = match[1].toLowerCase();
    acc[key] = [...(acc[key] || []), match[2].trim()];
    return acc;
  }, {});
  const present = recommendedHeaders.filter((header) => headers[header]?.length);
  const missing = recommendedHeaders.filter((header) => !headers[header]?.length);
  const cookieWarnings = (headers['set-cookie'] || []).flatMap((cookie) => {
    const warnings: string[] = [];
    if (!/;\s*httponly/i.test(cookie)) warnings.push('Cookie missing HttpOnly');
    if (!/;\s*secure/i.test(cookie)) warnings.push('Cookie missing Secure');
    if (!/;\s*samesite=/i.test(cookie)) warnings.push('Cookie missing SameSite');
    return warnings;
  });

  // Score the same deduped warnings the UI shows, and cap the penalty so a handful of
  // insecure cookies cannot zero out an otherwise fully-headered response.
  const uniqueCookieWarnings = Array.from(new Set(cookieWarnings));
  const cookiePenalty = Math.min(uniqueCookieWarnings.length, 3);

  return {
    present,
    missing,
    cookieWarnings: uniqueCookieWarnings,
    score: Math.max(0, Math.round(((present.length * 2 - cookiePenalty) / (recommendedHeaders.length * 2)) * 100)),
    headers,
  };
}
