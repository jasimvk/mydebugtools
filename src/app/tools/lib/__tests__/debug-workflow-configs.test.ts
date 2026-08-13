import { analyzeDebugWorkflow, debugWorkflowConfigs } from '../debug-workflow-configs';

describe('debug workflow configs', () => {
  it('defines every remaining roadmap route once', () => {
    const slugs = debugWorkflowConfigs.map((config) => config.slug);

    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs).toEqual(expect.arrayContaining([
      'saml-oidc-debugger',
      'certificate-viewer',
      'android-logcat',
      'react-native-debug',
      'mobile-network-debug',
      'api-auth-config',
      'oauth-token-inspector',
      'websocket-debug',
      'redirect-inspector',
      'cookie-security',
      'csp-parser',
      'secret-scanner',
      'schema-validator',
      'sql-explain',
      'sql-flow',
      'flamegraph-viewer',
      'perfetto-summary',
      'heap-visualizer',
      'node-performance',
      'python-profiler',
      'java-thread-dump',
      'jvm-gc-log',
      'native-debug-session',
      'binary-inspector',
    ]));
  });

  it('detects auth flow failures in SAML and OIDC text', () => {
    const config = debugWorkflowConfigs.find((item) => item.slug === 'saml-oidc-debugger');
    expect(config).toBeDefined();

    const result = analyzeDebugWorkflow(config!, 'redirect_uri_mismatch invalid_grant SAMLResponse RelayState nonce state');

    expect(result.detectedSignals.map((signal) => signal.label)).toEqual(expect.arrayContaining([
      'Redirect URI mismatch',
      'OIDC grant or token exchange failure',
      'SAML payload detected',
    ]));
    expect(result.priority).toBe('P0');
  });

  it('detects Android fatal exceptions and ANR clues', () => {
    const config = debugWorkflowConfigs.find((item) => item.slug === 'android-logcat');
    expect(config).toBeDefined();

    const result = analyzeDebugWorkflow(config!, 'FATAL EXCEPTION: main\nANR in com.example\nCaused by: java.lang.NullPointerException');

    expect(result.detectedSignals.map((signal) => signal.label)).toEqual(expect.arrayContaining([
      'Fatal exception',
      'ANR detected',
      'Java/Kotlin exception cause',
    ]));
    expect(result.highlightedLines).toHaveLength(3);
  });

  it('flags likely secrets with a high severity score', () => {
    const config = debugWorkflowConfigs.find((item) => item.slug === 'secret-scanner');
    expect(config).toBeDefined();

    const result = analyzeDebugWorkflow(config!, 'AWS_SECRET_ACCESS_KEY=abcd1234\nsk-live-1234567890abcdef');

    expect(result.detectedSignals.length).toBeGreaterThanOrEqual(2);
    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.severity).toBe('High');
  });
});
