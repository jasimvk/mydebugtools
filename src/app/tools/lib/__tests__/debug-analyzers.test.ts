import {
  analyzeErrors,
  analyzeHar,
  analyzeCiWorkflow,
  analyzeKubernetesDebug,
  analyzeLogs,
  analyzeOtelTrace,
  analyzeSecurityHeaders,
  analyzeStackTrace,
} from '../debug-analyzers';

describe('debug analyzers', () => {
  it('extracts app frames and likely cause from a JavaScript stack trace', () => {
    const result = analyzeStackTrace(`TypeError: Cannot read properties of undefined (reading 'id')
    at getUser (/app/src/users.ts:42:18)
    at async GET (/app/src/api/users/route.ts:12:5)
    at node_modules/next/dist/server.js:10:1`);

    expect(result.errorType).toBe('TypeError');
    expect(result.message).toContain('Cannot read properties');
    expect(result.frames[0].file).toBe('/app/src/users.ts');
    expect(result.appFrames).toHaveLength(2);
    expect(result.likelyCause).toContain('undefined');
  });

  it('groups multiline logs by trace id and severity', () => {
    const result = analyzeLogs(`[2026-05-17T07:00:00Z] INFO trace_id=abc start
[2026-05-17T07:00:01Z] ERROR trace_id=abc failed request
    at handler (/app/index.js:10:2)
[2026-05-17T07:00:02Z] WARN trace_id=xyz retry`);

    expect(result.entries).toHaveLength(3);
    expect(result.severityCounts.ERROR).toBe(1);
    expect(result.traces.find((trace) => trace.id === 'abc')?.entries).toHaveLength(2);
    expect(result.entries[1].details.join('\n')).toContain('handler');
  });

  it('summarizes HAR requests with redirects, failures, and slow calls', () => {
    const result = analyzeHar(JSON.stringify({
      log: {
        entries: [
          { request: { method: 'GET', url: 'https://api.test/users' }, response: { status: 302 }, time: 80, timings: { wait: 60 }, _transferSize: 300 },
          { request: { method: 'GET', url: 'https://api.test/users' }, response: { status: 500 }, time: 1200, timings: { wait: 1100 }, _transferSize: 1200 },
        ],
      },
    }));

    expect(result.totalRequests).toBe(2);
    expect(result.statusGroups['5xx']).toBe(1);
    expect(result.redirects).toBe(1);
    expect(result.slowest[0].url).toBe('https://api.test/users');
  });

  it('fingerprints repeated errors for triage', () => {
    const result = analyzeErrors(`TypeError: Cannot read properties of undefined
    at getUser (/app/src/users.ts:42:18)

TypeError: Cannot read properties of undefined
    at getUser (/app/src/users.ts:42:18)

TimeoutError: Request timed out
    at fetchUser (/app/src/api.ts:8:2)`);

    expect(result.issues).toHaveLength(2);
    expect(result.issues[0].count).toBe(2);
    expect(result.summary.totalErrors).toBe(3);
  });

  it('summarizes OpenTelemetry spans and slow/error spans', () => {
    const result = analyzeOtelTrace(JSON.stringify({
      resourceSpans: [{
        scopeSpans: [{
          spans: [
            { name: 'GET /checkout', traceId: 't1', spanId: 's1', startTimeUnixNano: '1000000000', endTimeUnixNano: '1600000000', status: { code: 1 } },
            { name: 'POST payment', traceId: 't1', spanId: 's2', parentSpanId: 's1', startTimeUnixNano: '1100000000', endTimeUnixNano: '1500000000', status: { code: 2, message: 'card declined' } },
          ],
        }],
      }],
    }));

    expect(result.totalSpans).toBe(2);
    expect(result.errorSpans).toHaveLength(1);
    expect(result.slowest[0].name).toBe('GET /checkout');
    expect(result.traces[0].spanCount).toBe(2);
  });

  it('detects Kubernetes crash-loop symptoms and recommends commands', () => {
    const result = analyzeKubernetesDebug(`Name: api-7d9
Namespace: prod
State: Waiting
Reason: CrashLoopBackOff
Last State: Terminated
Exit Code: 137
Warning BackOff restarting failed container`);

    expect(result.namespace).toBe('prod');
    expect(result.signals).toContain('CrashLoopBackOff');
    expect(result.signals).toContain('OOMKilled or memory pressure');
    expect(result.commands.some((command) => command.includes('kubectl logs'))).toBe(true);
  });

  it('finds GitHub Actions workflow risks and job structure', () => {
    const result = analyzeCiWorkflow(`name: ci
on: [pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm test
      - run: curl \${{ secrets.DEPLOY_TOKEN }}`);

    expect(result.jobs).toContain('test');
    expect(result.stepCount).toBe(3);
    expect(result.risks.some((risk) => risk.includes('secrets'))).toBe(true);
    expect(result.commands.some((command) => command.includes('act'))).toBe(true);
  });

  it('scores security headers and reports missing protections', () => {
    const result = analyzeSecurityHeaders(`HTTP/2 200
content-security-policy: default-src 'self'
x-frame-options: DENY
set-cookie: session=abc; Path=/`);

    expect(result.present).toContain('content-security-policy');
    expect(result.missing).toContain('strict-transport-security');
    expect(result.cookieWarnings).toContain('Cookie missing HttpOnly');
    expect(result.score).toBeLessThan(100);
  });
});
