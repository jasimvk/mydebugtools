import type { ComponentType } from 'react';
import {
  BeakerIcon,
  BoltIcon,
  ChartBarIcon,
  CodeBracketSquareIcon,
  CommandLineIcon,
  DocumentMagnifyingGlassIcon,
  DocumentTextIcon,
  KeyIcon,
  LockClosedIcon,
  ServerStackIcon,
  ShieldCheckIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';

export type DebugWorkflowPriority = 'P0' | 'P1' | 'P2';
export type DebugWorkflowPillar =
  | 'Logs & Errors'
  | 'API / Network'
  | 'Auth / Security'
  | 'Mobile Debugging'
  | 'DevOps / Observability'
  | 'Performance';

export type DebugSignal = {
  id: string;
  label: string;
  pattern: RegExp;
  detail: string;
  fix: string;
  weight?: number;
};

export type DebugWorkflowConfig = {
  slug: string;
  title: string;
  shortTitle: string;
  route: string;
  priority: DebugWorkflowPriority;
  pillar: DebugWorkflowPillar;
  description: string;
  placeholder: string;
  sampleInput: string;
  signals: DebugSignal[];
  checklist: string[];
  exportTitle: string;
  icon: ComponentType<{ className?: string }>;
};

export type DebugWorkflowResult = {
  detectedSignals: Array<Omit<DebugSignal, 'pattern'>>;
  highlightedLines: Array<{
    lineNumber: number;
    text: string;
    signals: string[];
  }>;
  checklist: string[];
  score: number;
  severity: 'Low' | 'Medium' | 'High';
  priority: DebugWorkflowPriority;
  summary: string;
  report: string;
};

const fallbackChecklist = [
  'Capture the raw failing input before cleaning it up.',
  'Confirm the first timestamp, failing component, request ID, or host involved.',
  'Compare the failed path with a known-good path.',
  'Write down the smallest reproducible command or request.',
];

function signal(
  id: string,
  label: string,
  pattern: RegExp,
  detail: string,
  fix: string,
  weight = 20,
): DebugSignal {
  return { id, label, pattern, detail, fix, weight };
}

export function analyzeDebugWorkflow(config: DebugWorkflowConfig, input: string): DebugWorkflowResult {
  const detectedSignals = config.signals
    .filter((item) => item.pattern.test(input))
    .map(({ pattern: _pattern, ...item }) => item);
  const lines = input.split(/\r?\n/);
  const highlightedLines = lines.reduce<DebugWorkflowResult['highlightedLines']>((acc, line, index) => {
    const matches = config.signals.filter((item) => item.pattern.test(line)).map((item) => item.label);
    if (matches.length) {
      acc.push({ lineNumber: index + 1, text: line, signals: matches });
    }
    return acc;
  }, []);
  const score = Math.min(100, Math.max(0, detectedSignals.reduce((sum, item) => sum + (item.weight || 20), 0)));
  const severity: DebugWorkflowResult['severity'] = score >= 80 ? 'High' : score >= 35 ? 'Medium' : 'Low';
  const summary = detectedSignals.length
    ? `${detectedSignals.length} signal${detectedSignals.length === 1 ? '' : 's'} detected. Start with ${detectedSignals[0].label.toLowerCase()}.`
    : `No known ${config.shortTitle.toLowerCase()} signature detected yet. Use the checklist to gather stronger evidence.`;
  const checklist = [
    ...detectedSignals.slice(0, 5).map((item) => item.fix),
    ...(config.checklist.length ? config.checklist : fallbackChecklist),
  ].filter((item, index, all) => all.indexOf(item) === index).slice(0, 9);
  const report = [
    `# ${config.exportTitle}`,
    '',
    `Route: ${config.route}`,
    `Priority: ${config.priority}`,
    `Severity: ${severity}`,
    '',
    '## Summary',
    summary,
    '',
    '## Signals',
    ...(detectedSignals.length ? detectedSignals.map((item) => `- ${item.label}: ${item.detail}`) : ['- No known signals detected.']),
    '',
    '## Checklist',
    ...checklist.map((item) => `- ${item}`),
  ].join('\n');

  return {
    detectedSignals,
    highlightedLines: highlightedLines.slice(0, 12),
    checklist,
    score,
    severity,
    priority: config.priority,
    summary,
    report,
  };
}

export const debugWorkflowConfigs: DebugWorkflowConfig[] = [
  {
    slug: 'saml-oidc-debugger',
    title: 'SAML / OIDC Debugger',
    shortTitle: 'Auth Flow',
    route: '/tools/saml-oidc-debugger',
    priority: 'P0',
    pillar: 'Auth / Security',
    description: 'Paste SAML responses, OIDC errors, redirect URLs, discovery JSON, callback logs, or token exchange notes to detect auth-flow breakage.',
    placeholder: 'Paste auth redirect URLs, SAMLResponse logs, OIDC discovery JSON, token errors, callback logs, or identity-provider messages...',
    sampleInput: 'GET /callback?error=invalid_grant&state=abc\nAADSTS50011: redirect_uri_mismatch\nSAMLResponse=... RelayState=abc\nnonce validation failed',
    signals: [
      signal('redirect-uri', 'Redirect URI mismatch', /redirect_uri_mismatch|AADSTS50011|callback url|reply url/i, 'The callback URL sent by the app does not match the identity-provider registration.', 'Compare the exact scheme, host, path, and trailing slash in the app config and identity-provider redirect URI.', 35),
      signal('grant', 'OIDC grant or token exchange failure', /invalid_grant|invalid_client|token endpoint|authorization_code/i, 'The authorization code or client configuration failed during token exchange.', 'Check client ID, secret, PKCE verifier, clock skew, one-time code reuse, and token endpoint URL.', 30),
      signal('saml', 'SAML payload detected', /SAMLResponse|RelayState|NameID|Assertion|AudienceRestriction/i, 'A SAML response or assertion is present and should be decoded before debugging claims.', 'Decode the SAMLResponse, verify audience, recipient, issuer, signature, and NotBefore/NotOnOrAfter timestamps.', 25),
      signal('state', 'State or nonce validation issue', /\bstate\b|nonce|csrf|correlation/i, 'The login flow may be rejecting a replayed, missing, or mismatched state/nonce value.', 'Verify cookie domain, SameSite policy, session storage, and callback host consistency.', 25),
    ],
    checklist: ['Capture the exact authorize URL and callback URL.', 'Decode tokens or SAML assertions locally before sharing.', 'Verify issuer, audience, redirect URI, clock skew, scopes, state, and nonce.'],
    exportTitle: 'SAML / OIDC Debug Report',
    icon: KeyIcon,
  },
  {
    slug: 'certificate-viewer',
    title: 'Certificate Chain Viewer',
    shortTitle: 'Certificate',
    route: '/tools/certificate-viewer',
    priority: 'P0',
    pillar: 'Auth / Security',
    description: 'Paste PEM certificates, openssl output, TLS errors, or chain notes to spot expiry, SAN, issuer, and trust-chain problems.',
    placeholder: 'Paste PEM certificate blocks, openssl s_client output, browser TLS errors, issuer/SAN notes, or chain validation output...',
    sampleInput: '-----BEGIN CERTIFICATE-----\nMIID...\n-----END CERTIFICATE-----\nverify error:num=20:unable to get local issuer certificate\nnotAfter=May 01 00:00:00 2026 GMT',
    signals: [
      signal('pem', 'PEM certificate block', /BEGIN CERTIFICATE|END CERTIFICATE/i, 'A PEM certificate was detected for chain inspection.', 'Count the leaf, intermediate, and root certificates and confirm the served order.', 20),
      signal('issuer', 'Issuer or chain validation failure', /unable to get local issuer|self[- ]signed|certificate verify failed|unknown ca/i, 'The client cannot build a trusted chain to a root CA.', 'Serve the full intermediate chain and verify the CA bundle used by the failing client.', 35),
      signal('expiry', 'Expiry evidence', /notAfter|expired|certificate has expired|validity/i, 'The certificate may be expired or close to expiry.', 'Check notBefore/notAfter, automation renewal status, and load balancer certificate attachment.', 30),
      signal('san', 'SAN or hostname mismatch', /subject alternative name|hostname mismatch|ERR_CERT_COMMON_NAME_INVALID|common name/i, 'The requested hostname may not be covered by certificate SANs.', 'Verify every hostname and wildcard pattern needed by clients is present in SANs.', 30),
    ],
    checklist: ['Inspect leaf and intermediate order.', 'Compare requested hostname against SANs.', 'Check expiry, issuer, key usage, and trust-store differences.'],
    exportTitle: 'Certificate Chain Debug Report',
    icon: ShieldCheckIcon,
  },
  {
    slug: 'android-logcat',
    title: 'Android Logcat Analyzer',
    shortTitle: 'Logcat',
    route: '/tools/android-logcat',
    priority: 'P0',
    pillar: 'Mobile Debugging',
    description: 'Paste Android Logcat output to identify fatal exceptions, ANRs, native crashes, process restarts, and device clues.',
    placeholder: 'Paste adb logcat output, fatal exception blocks, ANR snippets, tombstone notes, package names, process IDs, or device logs...',
    sampleInput: 'E AndroidRuntime: FATAL EXCEPTION: main\nProcess: com.example.app, PID: 1234\njava.lang.NullPointerException\nCaused by: java.lang.IllegalStateException\nANR in com.example.app',
    signals: [
      signal('fatal', 'Fatal exception', /FATAL EXCEPTION|AndroidRuntime/i, 'The app crashed on a Java/Kotlin thread.', 'Start at the first app-owned frame below the exception message and inspect lifecycle/state assumptions.', 35),
      signal('anr', 'ANR detected', /\bANR\b|Input dispatching timed out|Application Not Responding/i, 'The app blocked the main thread or failed to respond in time.', 'Check main-thread work, locks, slow I/O, startup paths, and strict-mode violations.', 35),
      signal('cause', 'Java/Kotlin exception cause', /Caused by:|NullPointerException|IllegalStateException|SecurityException/i, 'The stack includes a specific exception cause.', 'Group by exception type and first app frame before looking at framework frames.', 30),
      signal('native', 'Native crash clue', /signal \d+|tombstone|libc|SIGSEGV|backtrace:/i, 'The crash may be native, JNI, or system-library related.', 'Collect tombstone, ABI, device model, build fingerprint, and symbol files.', 30),
    ],
    checklist: ['Capture full exception block and process/package line.', 'Record device, Android version, ABI, app version, and build type.', 'Separate app frames from framework frames.'],
    exportTitle: 'Android Logcat Debug Report',
    icon: BoltIcon,
  },
  {
    slug: 'react-native-debug',
    title: 'React Native Debug Pack',
    shortTitle: 'React Native',
    route: '/tools/react-native-debug',
    priority: 'P1',
    pillar: 'Mobile Debugging',
    description: 'Analyze Metro logs, Hermes errors, bridge warnings, startup markers, and React Native stack traces.',
    placeholder: 'Paste Metro logs, Hermes stack traces, RedBox messages, startup timing, bridge warnings, or native-module errors...',
    sampleInput: 'Metro waiting on exp://\nHermesInternal: TypeError undefined is not an object\nRCTFatalException\n[Performance] JS bundle: 1800ms',
    signals: [
      signal('hermes', 'Hermes JavaScript error', /Hermes|TypeError|ReferenceError|undefined is not an object/i, 'A JS runtime failure appears in the React Native app.', 'Inspect the component stack, props, and API shape near the first app frame.', 30),
      signal('metro', 'Metro bundler clue', /Metro|Unable to resolve module|transform error|watchman/i, 'Metro or module resolution may be failing.', 'Clear Metro cache only after checking import paths, package exports, and watchman state.', 25),
      signal('native-module', 'Native module issue', /NativeModule|TurboModule|RCTFatal|UIManager|requireNativeComponent/i, 'A native dependency may be missing, mislinked, or incompatible.', 'Check pods/Gradle install, new architecture support, and platform-specific module registration.', 30),
      signal('startup', 'Startup performance marker', /\[Performance\]|startup|bundle.*ms|TTI/i, 'Startup timing data is present.', 'Compare JS bundle, native init, network boot, and first-render timings.', 20),
    ],
    checklist: ['Separate Metro, JS runtime, and native logs.', 'Confirm Hermes/new architecture settings.', 'Reproduce on one simulator and one physical device when possible.'],
    exportTitle: 'React Native Debug Report',
    icon: BoltIcon,
  },
  {
    slug: 'mobile-network-debug',
    title: 'Mobile Network Debug Checklist',
    shortTitle: 'Mobile Network',
    route: '/tools/mobile-network-debug',
    priority: 'P1',
    pillar: 'Mobile Debugging',
    description: 'Turn device proxy, Chucker, OkHttp, Charles, Proxyman, and API failure notes into a repeatable mobile network debugging plan.',
    placeholder: 'Paste mobile API failures, proxy setup notes, Chucker/OkHttp logs, SSL pinning errors, emulator/device network symptoms...',
    sampleInput: 'OkHttp 401 /v1/profile\njavax.net.ssl.SSLHandshakeException\nCLEARTEXT communication not permitted\nCharles proxy no traffic on Android emulator',
    signals: [
      signal('tls', 'TLS or certificate failure', /SSLHandshakeException|certificate|trust anchor|pinning|CERT/i, 'The mobile client is rejecting TLS or proxy certificates.', 'Install the proxy CA, check network security config, and account for certificate pinning.', 35),
      signal('cleartext', 'Cleartext traffic blocked', /CLEARTEXT|http:\/\/|cleartext/i, 'Android is blocking non-HTTPS traffic.', 'Use HTTPS or explicitly allow debug-only cleartext domains in network security config.', 25),
      signal('auth', 'Mobile API auth failure', /\b401\b|\b403\b|Unauthorized|Forbidden|token/i, 'The mobile request is failing auth.', 'Compare mobile headers, token audience, refresh timing, and environment base URL with a working client.', 25),
      signal('proxy', 'Proxy capture issue', /Charles|Proxyman|HTTP Toolkit|mitmproxy|Chucker|proxy/i, 'Network capture tooling is part of the investigation.', 'Verify device proxy, emulator host mapping, VPN, trust store, and app debug build settings.', 20),
    ],
    checklist: ['Confirm device/emulator, OS version, app build, base URL, and proxy state.', 'Capture request headers without secrets.', 'Compare with cURL or API Workbench.'],
    exportTitle: 'Mobile Network Debug Report',
    icon: BeakerIcon,
  },
  {
    slug: 'api-auth-config',
    title: 'API Auth Config Tester',
    shortTitle: 'API Auth',
    route: '/tools/api-auth-config',
    priority: 'P1',
    pillar: 'Auth / Security',
    description: 'Inspect API auth headers, signing inputs, scopes, environments, and credential wiring for common config mistakes.',
    placeholder: 'Paste request headers, auth config, signing notes, OAuth scopes, API gateway errors, or environment-variable snippets...',
    sampleInput: 'Authorization: Bearer eyJ...\n403 Forbidden missing scope payments:write\nX-Signature invalid hmac\nAPI_BASE_URL=https://staging.example.com',
    signals: [
      signal('bearer', 'Bearer token auth', /Authorization:\s*Bearer|access_token|JWT/i, 'Bearer-token auth is involved.', 'Decode claims locally and verify issuer, audience, expiry, scope, and environment.', 20),
      signal('scope', 'Missing scope or permission', /missing scope|insufficient_scope|forbidden|403/i, 'The credential likely lacks the required permission.', 'Compare required endpoint scopes with token claims and service-account role bindings.', 30),
      signal('signature', 'Request signing failure', /signature|hmac|digest|x-signature|timestamp/i, 'Signed request validation may be failing.', 'Rebuild the canonical string, timestamp, nonce, body hash, and secret selection.', 30),
      signal('env', 'Environment mismatch', /staging|production|sandbox|base_url|audience/i, 'Auth config may point at the wrong environment.', 'Check base URL, issuer, audience, JWKS, callback, and secret names for the same environment.', 25),
    ],
    checklist: ['Remove secrets before sharing.', 'Verify auth scheme, issuer, audience, scope, expiry, and environment together.', 'Reproduce with one minimal request.'],
    exportTitle: 'API Auth Debug Report',
    icon: KeyIcon,
  },
  {
    slug: 'oauth-token-inspector',
    title: 'OAuth Token Inspector',
    shortTitle: 'OAuth Token',
    route: '/tools/oauth-token-inspector',
    priority: 'P1',
    pillar: 'Auth / Security',
    description: 'Inspect OAuth token clues, claims, scopes, expiry, refresh failures, issuer mismatch, and audience problems.',
    placeholder: 'Paste decoded token claims, OAuth error JSON, refresh errors, scopes, audiences, issuer URLs, or API 401/403 output...',
    sampleInput: '{"error":"invalid_token","error_description":"audience mismatch"}\nexp: 1710000000\nscope: read:users\nrefresh_token invalid_grant',
    signals: [
      signal('invalid-token', 'Invalid token', /invalid_token|token expired|expired token|jwt expired/i, 'The access token is expired, malformed, revoked, or rejected.', 'Check exp/nbf, clock skew, revocation, token type, and whether the API expects access tokens only.', 35),
      signal('audience', 'Audience mismatch', /audience|aud\b|azp|client_id/i, 'The token audience may not match the API.', 'Compare token aud with the API resource identifier and environment.', 30),
      signal('scope', 'Scope issue', /scope|insufficient_scope|permission/i, 'The token may not include required scopes.', 'Request the minimal required scopes and confirm they appear in the issued token.', 25),
      signal('refresh', 'Refresh token failure', /refresh_token|invalid_grant|offline_access/i, 'The refresh flow is failing or not allowed.', 'Check refresh-token rotation, consent, client type, redirect URI, and token reuse.', 25),
    ],
    checklist: ['Decode claims locally.', 'Validate issuer, audience, expiry, scopes, and token type.', 'Keep full tokens out of reports and screenshots.'],
    exportTitle: 'OAuth Token Debug Report',
    icon: KeyIcon,
  },
  {
    slug: 'websocket-debug',
    title: 'WebSocket Debugger',
    shortTitle: 'WebSocket',
    route: '/tools/websocket-debug',
    priority: 'P1',
    pillar: 'API / Network',
    description: 'Analyze WebSocket handshakes, close codes, auth headers, reconnect loops, ping/pong timing, and message samples.',
    placeholder: 'Paste WebSocket URL, handshake headers, close codes, reconnect logs, ping/pong notes, server messages, or browser console output...',
    sampleInput: 'WebSocket connection failed: 403\nSec-WebSocket-Protocol: bearer\nclose code 1006 abnormal closure\nreconnect attempt 12',
    signals: [
      signal('handshake', 'Handshake failure', /WebSocket.*failed|Upgrade|Sec-WebSocket|handshake|\b403\b|\b401\b/i, 'The HTTP upgrade request is failing before the socket opens.', 'Inspect upgrade headers, auth, origin, proxy/load balancer support, and selected subprotocol.', 35),
      signal('close-code', 'Close code detected', /close code|1006|1008|1011|abnormal closure/i, 'The socket closes with a meaningful code or abnormal closure.', 'Map the close code to server logs and confirm whether the close was server, client, or proxy initiated.', 30),
      signal('reconnect', 'Reconnect loop', /reconnect|retry|backoff|attempt/i, 'The client is repeatedly reconnecting.', 'Add jitter, cap retries, and inspect why the first stable connection is lost.', 20),
      signal('heartbeat', 'Heartbeat issue', /ping|pong|heartbeat|keepalive|idle timeout/i, 'Ping/pong or idle timeout behavior may be involved.', 'Compare heartbeat interval with proxy, gateway, and server idle timeouts.', 20),
    ],
    checklist: ['Capture the initial HTTP upgrade response.', 'Record close code, reason, and exact timing.', 'Check proxy and load balancer WebSocket support.'],
    exportTitle: 'WebSocket Debug Report',
    icon: BeakerIcon,
  },
  {
    slug: 'redirect-inspector',
    title: 'Redirect Inspector',
    shortTitle: 'Redirect',
    route: '/tools/redirect-inspector',
    priority: 'P1',
    pillar: 'API / Network',
    description: 'Inspect redirect chains, status codes, canonical loops, HTTPS upgrades, auth callbacks, and cache-control mistakes.',
    placeholder: 'Paste curl -I -L output, redirect chain logs, browser network rows, canonical URL notes, auth callback loops, or Location headers...',
    sampleInput: 'HTTP/1.1 301 Moved Permanently\nLocation: http://example.com/login\nHTTP/1.1 302 Found\nLocation: https://example.com/login?next=/login\nredirect loop detected',
    signals: [
      signal('loop', 'Redirect loop', /redirect loop|too many redirects|ERR_TOO_MANY_REDIRECTS|next=.*login/i, 'The same route or auth callback may be redirecting repeatedly.', 'Compare each Location value and break the loop at the first repeated destination.', 35),
      signal('scheme', 'HTTP/HTTPS scheme issue', /Location:\s*http:|https redirect|x-forwarded-proto/i, 'Scheme handling or proxy headers may be wrong.', 'Check forwarded headers, canonical host config, and HTTPS enforcement at each layer.', 25),
      signal('status', 'Redirect status code', /\b30[1278]\b|Moved Permanently|Found|Temporary Redirect|Permanent Redirect/i, 'Redirect status codes are present.', 'Use 307/308 when method preservation matters and avoid accidental permanent caching.', 20),
      signal('cache', 'Redirect caching risk', /cache-control|permanent|301|308/i, 'A redirect may be cached by browser or CDN.', 'Purge CDN/browser state and use temporary status while debugging.', 20),
    ],
    checklist: ['List every Location in order.', 'Mark the first repeated URL.', 'Check host, scheme, path, query, and auth state at every hop.'],
    exportTitle: 'Redirect Debug Report',
    icon: BeakerIcon,
  },
  {
    slug: 'cookie-security',
    title: 'Cookie Security Inspector',
    shortTitle: 'Cookie Security',
    route: '/tools/cookie-security',
    priority: 'P1',
    pillar: 'Auth / Security',
    description: 'Inspect Set-Cookie headers for SameSite, Secure, HttpOnly, domain/path scope, expiry, and auth-session risks.',
    placeholder: 'Paste Set-Cookie headers, login response headers, session symptoms, iframe issues, cross-site request notes, or browser cookie rows...',
    sampleInput: 'Set-Cookie: session=abc; Path=/; SameSite=None\nSet-Cookie: csrf=def; Domain=.example.com\nChrome blocked third-party cookie',
    signals: [
      signal('httponly', 'HttpOnly missing', /Set-Cookie:(?!.*HttpOnly).*/i, 'A cookie may be readable from JavaScript.', 'Add HttpOnly to session cookies unless client-side access is required.', 25),
      signal('secure', 'Secure missing or SameSite=None risk', /SameSite=None(?!.*Secure)|Set-Cookie:(?!.*Secure).*/i, 'Cross-site cookies need Secure and session cookies should be HTTPS-only.', 'Add Secure and verify HTTPS is used in every environment that sets the cookie.', 30),
      signal('domain', 'Broad cookie domain', /Domain=\./i, 'The cookie applies to all subdomains.', 'Narrow Domain and Path unless cross-subdomain auth is required.', 20),
      signal('third-party', 'Third-party cookie issue', /third-party|blocked cookie|iframe|SameSite/i, 'Browser cookie policy may block auth in cross-site contexts.', 'Use SameSite=None; Secure where appropriate and consider token handoff alternatives.', 25),
    ],
    checklist: ['Classify each cookie as session, CSRF, preference, or analytics.', 'Verify Secure, HttpOnly, SameSite, Domain, Path, and expiry.', 'Test in the browser where the failure occurs.'],
    exportTitle: 'Cookie Security Debug Report',
    icon: LockClosedIcon,
  },
  {
    slug: 'csp-parser',
    title: 'CSP Parser',
    shortTitle: 'CSP',
    route: '/tools/csp-parser',
    priority: 'P1',
    pillar: 'Auth / Security',
    description: 'Parse Content Security Policy headers, blocked-resource reports, unsafe directives, and hardening recommendations.',
    placeholder: 'Paste Content-Security-Policy headers, CSP violation reports, browser console blocked-resource errors, or Report-To payloads...',
    sampleInput: "Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; report-uri /csp\nRefused to load script because it violates the following Content Security Policy directive",
    signals: [
      signal('unsafe-inline', 'Unsafe inline directive', /unsafe-inline|unsafe-eval/i, 'The policy allows inline script or eval-like execution.', 'Replace unsafe directives with nonces, hashes, strict-dynamic, or bundled scripts.', 30),
      signal('blocked', 'Blocked resource violation', /Refused to load|violates.*Content Security Policy|blocked-uri/i, 'A resource is being blocked by CSP.', 'Identify the blocked-uri and directive, then decide whether to allow, nonce, hash, or remove the resource.', 30),
      signal('reporting', 'CSP reporting configured', /report-uri|report-to|csp-report/i, 'CSP reports are available for feedback.', 'Aggregate reports by directive and blocked host before relaxing policy.', 15),
      signal('wildcard', 'Wildcard source risk', /\*|https:\s|data:/i, 'A broad source expression may weaken CSP.', 'Replace wildcards and broad schemes with explicit hosts and narrow directives.', 25),
    ],
    checklist: ['Split policy by directive.', 'Map every violation to directive and blocked URI.', 'Prefer report-only rollout before enforcement changes.'],
    exportTitle: 'CSP Debug Report',
    icon: ShieldCheckIcon,
  },
  {
    slug: 'secret-scanner',
    title: 'Secret Scanner',
    shortTitle: 'Secret Scanner',
    route: '/tools/secret-scanner',
    priority: 'P1',
    pillar: 'Auth / Security',
    description: 'Scan pasted logs, env snippets, configs, and stack traces for likely tokens, keys, credentials, and redaction gaps.',
    placeholder: 'Paste logs, .env snippets, CI output, config files, stack traces, or support reports to identify likely secrets before sharing...',
    sampleInput: 'AWS_SECRET_ACCESS_KEY=abcd1234\nDATABASE_URL=postgres://user:pass@example/db\nsk-live-1234567890abcdef',
    signals: [
      signal('aws', 'AWS secret-like key', /AWS_SECRET_ACCESS_KEY|AKIA[0-9A-Z]{12,}|aws_access_key_id/i, 'AWS credential material may be present.', 'Rotate the key if it left a trusted boundary and replace it with a redacted placeholder.', 40),
      signal('openai', 'API key-like token', /sk-(?:live|test|proj)?[-_a-zA-Z0-9]{10,}|OPENAI_API_KEY|api[_-]?key/i, 'An API key or provider token may be present.', 'Revoke or rotate exposed keys and scrub logs, screenshots, and fixtures.', 40),
      signal('database', 'Database URL with credentials', /postgres:\/\/|mysql:\/\/|mongodb(\+srv)?:\/\/|DATABASE_URL=.*:/i, 'A connection string may include username, password, host, and database.', 'Rotate passwords and redact username, password, host, and database name before sharing.', 35),
      signal('private-key', 'Private key block', /BEGIN (RSA |EC |OPENSSH |)?PRIVATE KEY/i, 'A private key block is present.', 'Treat this as compromised if shared externally and generate a new keypair.', 45),
    ],
    checklist: ['Do not paste production secrets into issues or screenshots.', 'Rotate any token that left a trusted boundary.', 'Replace values with stable placeholders that preserve format only.'],
    exportTitle: 'Secret Scan Report',
    icon: LockClosedIcon,
  },
  {
    slug: 'schema-validator',
    title: 'Schema Validator',
    shortTitle: 'Schema',
    route: '/tools/schema-validator',
    priority: 'P1',
    pillar: 'API / Network',
    description: 'Validate JSON payloads and schema notes for type mismatches, missing required fields, enum errors, and API-contract drift.',
    placeholder: 'Paste JSON payloads, validation errors, JSON Schema snippets, Zod errors, OpenAPI response notes, or contract-test output...',
    sampleInput: 'ValidationError: required property userId missing\nexpected string, received number\nadditionalProperties not allowed\noneOf failed',
    signals: [
      signal('required', 'Missing required field', /required|missing|required property/i, 'A required field is absent.', 'Compare the failing payload with schema required fields and generate a minimal valid fixture.', 30),
      signal('type', 'Type mismatch', /expected .* received|type mismatch|must be .* got/i, 'A value type does not match the contract.', 'Inspect serialization, nullability, number/string coercion, and API version.', 30),
      signal('enum', 'Enum or union failure', /enum|oneOf|anyOf|union|invalid value/i, 'The value is outside the allowed set.', 'Check client/server version drift and update enum mapping.', 25),
      signal('extra', 'Unexpected property', /additionalProperties|unknown key|unrecognized/i, 'The payload contains fields the schema rejects.', 'Remove unknown fields or update the schema if the API contract changed intentionally.', 20),
    ],
    checklist: ['Keep one failing payload and one passing payload.', 'Confirm schema version and endpoint version.', 'Turn the failure into a contract test.'],
    exportTitle: 'Schema Validation Debug Report',
    icon: DocumentMagnifyingGlassIcon,
  },
  {
    slug: 'sql-explain',
    title: 'SQL Explain',
    shortTitle: 'SQL Explain',
    route: '/tools/sql-explain',
    priority: 'P1',
    pillar: 'DevOps / Observability',
    description: 'Explain query plans, indexes, joins, scans, sort steps, and likely SQL performance bottlenecks from pasted EXPLAIN output.',
    placeholder: 'Paste EXPLAIN / EXPLAIN ANALYZE output, slow-query logs, query plans, index notes, locks, or database timing evidence...',
    sampleInput: 'Seq Scan on users cost=0.00..431.00 rows=21000\nNested Loop\nSort Method: external merge Disk: 2048kB\nExecution Time: 5321.44 ms',
    signals: [
      signal('seq-scan', 'Sequential scan', /Seq Scan|Table Scan|full scan/i, 'The database scans many rows instead of using a selective index.', 'Check WHERE predicates, cardinality, statistics, and candidate indexes.', 30),
      signal('nested', 'Nested loop risk', /Nested Loop/i, 'Nested loops can explode with large row counts.', 'Compare estimated vs actual rows and consider indexes or join strategy changes.', 20),
      signal('sort', 'Disk sort or expensive sort', /Sort Method:.*Disk|filesort|external merge/i, 'Sorting spilled to disk or required expensive work.', 'Add indexes for sort keys or increase memory only after confirming query shape.', 25),
      signal('slow', 'Slow execution time', /Execution Time:\s*(?:[1-9]\d{3,}|[5-9]\d{2})|duration:/i, 'Execution time is high enough to investigate.', 'Collect plan with buffers/analyze and compare with normal runtime.', 25),
    ],
    checklist: ['Capture the exact SQL and plan with actual rows.', 'Compare estimated vs actual rows.', 'Check indexes, statistics, sort, join order, and locks.'],
    exportTitle: 'SQL Explain Debug Report',
    icon: ServerStackIcon,
  },
  {
    slug: 'sql-flow',
    title: 'SQL Flow',
    shortTitle: 'SQL Flow',
    route: '/tools/sql-flow',
    priority: 'P1',
    pillar: 'DevOps / Observability',
    description: 'Turn SQL statements and logs into execution flow, dependency, lock, transaction, and migration-risk notes.',
    placeholder: 'Paste SQL migrations, query logs, transaction traces, lock waits, deadlock output, or multi-step data-flow snippets...',
    sampleInput: 'BEGIN;\nUPDATE orders SET status = paid WHERE id=1;\nSELECT * FROM payments;\nERROR: deadlock detected\nROLLBACK;',
    signals: [
      signal('transaction', 'Transaction flow', /\bBEGIN\b|\bCOMMIT\b|\bROLLBACK\b|transaction/i, 'The SQL flow includes transaction boundaries.', 'Map every read/write inside the transaction and verify rollback behavior.', 20),
      signal('write', 'Write operation', /\bUPDATE\b|\bINSERT\b|\bDELETE\b|\bALTER\b|\bDROP\b/i, 'The flow changes data or schema.', 'Check affected rows, constraints, triggers, migrations, and backup/rollback plan.', 25),
      signal('deadlock', 'Deadlock or lock wait', /deadlock|lock wait|blocked|blocking/i, 'Lock contention is part of the failure.', 'Identify lock order, long transactions, and competing statements.', 35),
      signal('select', 'Read dependency', /\bSELECT\b|\bJOIN\b|\bWHERE\b/i, 'The flow includes reads that may drive writes or locks.', 'Check read predicates, isolation level, and stale assumptions.', 15),
    ],
    checklist: ['Order statements by time.', 'Mark reads, writes, locks, and transaction boundaries.', 'Design a rollback and verification query.'],
    exportTitle: 'SQL Flow Debug Report',
    icon: ServerStackIcon,
  },
  {
    slug: 'flamegraph-viewer',
    title: 'Flamegraph Viewer',
    shortTitle: 'Flamegraph',
    route: '/tools/flamegraph-viewer',
    priority: 'P2',
    pillar: 'Performance',
    description: 'Analyze folded stacks, profiler summaries, hot paths, samples, and function-level performance evidence.',
    placeholder: 'Paste folded stacks, profiler output, stack samples, CPU hotspot summaries, function names with counts, or flamegraph text exports...',
    sampleInput: 'main;render;serialize 1200\nmain;render;formatDate 600\nmain;db;query 300',
    signals: [
      signal('folded', 'Folded stack format', /^[^;\n]+;[^;\n]+.*\s+\d+/m, 'Folded stack samples are present.', 'Sort by sample count and focus on the hottest repeated stack first.', 30),
      signal('hot', 'Hot path clue', /hot|cpu|samples|self time|total time/i, 'Profiler output references CPU hot paths.', 'Separate self time from total time before optimizing.', 20),
      signal('render', 'Rendering work', /render|reconcile|paint|layout|commit/i, 'UI rendering may be a performance driver.', 'Check unnecessary renders, memoization boundaries, layout thrashing, and large lists.', 25),
      signal('io', 'I/O or database work', /db|query|fetch|readFile|network/i, 'I/O appears in the sampled path.', 'Confirm whether wall time is CPU, I/O wait, or lock contention.', 20),
    ],
    checklist: ['Identify hottest stack by count.', 'Separate CPU from I/O wait.', 'Confirm impact with before/after measurement.'],
    exportTitle: 'Flamegraph Debug Report',
    icon: ChartBarIcon,
  },
  {
    slug: 'perfetto-summary',
    title: 'Perfetto Summary',
    shortTitle: 'Perfetto',
    route: '/tools/perfetto-summary',
    priority: 'P2',
    pillar: 'Performance',
    description: 'Summarize Perfetto trace notes, thread activity, frame delays, binder calls, slices, and slow sections.',
    placeholder: 'Paste Perfetto exported text, trace processor summaries, slice rows, frame timing, binder calls, scheduler notes, or Android performance evidence...',
    sampleInput: 'slice_name Choreographer#doFrame dur=42ms\nbinder transaction latency 120ms\nmain thread runnable blocked\njank frame',
    signals: [
      signal('jank', 'Jank or slow frame', /jank|doFrame|frame.*(?:[3-9]\d|[1-9]\d{2})ms/i, 'Frame timing suggests visible UI jank.', 'Find the main-thread slice overlapping the slow frame and remove blocking work.', 35),
      signal('binder', 'Binder latency', /binder|transaction latency/i, 'Android binder IPC appears in the trace.', 'Check service calls, thread pool saturation, and sync IPC on main thread.', 25),
      signal('thread', 'Thread scheduling clue', /main thread|runnable|blocked|sched|thread/i, 'Thread state evidence is present.', 'Compare runnable vs running time and identify the thread holding resources.', 20),
      signal('slice', 'Trace slices detected', /slice|dur=|ts=|track/i, 'Perfetto slice data is present.', 'Group slices by thread and duration before choosing an optimization target.', 15),
    ],
    checklist: ['Find the slowest visible frame or slice.', 'Map it to thread state.', 'Separate app work, framework work, IPC, and scheduling delay.'],
    exportTitle: 'Perfetto Debug Report',
    icon: ChartBarIcon,
  },
  {
    slug: 'heap-visualizer',
    title: 'Heap / Memory Event Visualizer',
    shortTitle: 'Heap',
    route: '/tools/heap-visualizer',
    priority: 'P2',
    pillar: 'Performance',
    description: 'Analyze allocation/free logs, heap growth, leak symptoms, GC pressure, OOM clues, and suspicious object lifecycle patterns.',
    placeholder: 'Paste heap snapshots, allocation logs, memory timeline notes, OOM output, GC snippets, retained-object summaries, or leak detector findings...',
    sampleInput: 'OutOfMemoryError Java heap space\nheap used 128MB -> 512MB\nretained objects: UserSession x12000\nGC overhead limit exceeded',
    signals: [
      signal('oom', 'Out-of-memory failure', /OutOfMemory|OOM|heap space|memory pressure/i, 'The process ran out of memory or hit memory pressure.', 'Capture heap snapshot near failure and identify dominant retained types.', 35),
      signal('growth', 'Heap growth pattern', /heap used|retained|leak|growing|allocation/i, 'Memory appears to grow or retain unexpectedly.', 'Compare snapshots before/after the workflow and inspect retaining paths.', 30),
      signal('gc', 'GC pressure', /GC overhead|garbage collection|pause|young gen|old gen/i, 'Garbage collection is part of the symptom.', 'Separate allocation rate from retained memory and check pause distribution.', 25),
      signal('count', 'High object count', /x\d{3,}|count|instances/i, 'Object counts or retained instances are available.', 'Sort by retained size and instance count, then inspect ownership.', 20),
    ],
    checklist: ['Capture baseline and post-action snapshots.', 'Sort by retained size, not just shallow size.', 'Identify the retaining path and lifecycle owner.'],
    exportTitle: 'Heap Debug Report',
    icon: ChartBarIcon,
  },
  {
    slug: 'node-performance',
    title: 'Node Performance Analyzer',
    shortTitle: 'Node Performance',
    route: '/tools/node-performance',
    priority: 'P2',
    pillar: 'Performance',
    description: 'Analyze Node.js event-loop lag, CPU profiles, heap pressure, async bottlenecks, and server timing evidence.',
    placeholder: 'Paste Node profiler output, event-loop delay logs, heap usage, async hooks notes, slow endpoint timings, or server performance evidence...',
    sampleInput: 'event loop delay p99=420ms\nheapUsed=900MB\nCPU profile hot function serializeResponse\nGET /api/report 504 timeout',
    signals: [
      signal('event-loop', 'Event-loop lag', /event loop|ELU|delay|blocked/i, 'The Node event loop may be blocked.', 'Find synchronous CPU work, large JSON serialization, crypto, compression, or blocking filesystem calls.', 35),
      signal('heap', 'Heap pressure', /heapUsed|memory|rss|old space|Allocation failed/i, 'Node memory pressure is present.', 'Capture heap snapshots and check caches, queues, and retained request data.', 30),
      signal('cpu', 'CPU hotspot', /CPU profile|hot function|self time|ticks/i, 'CPU profiling data is available.', 'Sort by self time and verify optimization with another profile.', 25),
      signal('timeout', 'Endpoint timeout', /\b504\b|timeout|deadline|slow request/i, 'A request exceeded its time budget.', 'Trace downstream calls, queueing, and serialization for the endpoint.', 25),
    ],
    checklist: ['Measure event-loop delay and CPU separately.', 'Check heap and queue depth over time.', 'Reproduce with production-like payload size.'],
    exportTitle: 'Node Performance Debug Report',
    icon: ChartBarIcon,
  },
  {
    slug: 'python-profiler',
    title: 'Python Profiler',
    shortTitle: 'Python Profiler',
    route: '/tools/python-profiler',
    priority: 'P2',
    pillar: 'Performance',
    description: 'Summarize Python profiler output, hot frames, blocking calls, asyncio stalls, import cost, and CPython stack snapshots.',
    placeholder: 'Paste cProfile output, py-spy samples, traceback timing, asyncio warnings, import-time logs, or Python performance notes...',
    sampleInput: 'ncalls  tottime  percall  cumtime  function\n1000  12.4  0.012  13.0  app.py:42(render)\nasyncio slow callback took 0.8 seconds',
    signals: [
      signal('profile', 'Profiler table', /ncalls|tottime|cumtime|py-spy|cProfile/i, 'Python profiler output is present.', 'Sort by cumulative time for callers and total time for hot leaf functions.', 30),
      signal('async', 'Asyncio stall', /asyncio|slow callback|event loop|await/i, 'Async runtime behavior may be involved.', 'Check blocking calls inside async handlers and thread/process offloading.', 25),
      signal('io', 'Python I/O clue', /requests\.|urllib|open\(|read\(|database|sql/i, 'I/O calls appear in the hot path.', 'Separate CPU time from waiting on network, disk, or database.', 20),
      signal('import', 'Import/startup cost', /import time|site-packages|module import/i, 'Import overhead may affect startup or cold paths.', 'Delay heavy imports or measure with import-time profiling.', 15),
    ],
    checklist: ['Sort profiler output by cumulative and self time.', 'Separate CPU-bound work from I/O wait.', 'Create a small benchmark before changing code.'],
    exportTitle: 'Python Profiler Debug Report',
    icon: ChartBarIcon,
  },
  {
    slug: 'java-thread-dump',
    title: 'Java Thread Dump',
    shortTitle: 'Thread Dump',
    route: '/tools/java-thread-dump',
    priority: 'P2',
    pillar: 'DevOps / Observability',
    description: 'Parse Java thread dumps for blocked threads, deadlock clues, hot stacks, thread states, and JVM investigation notes.',
    placeholder: 'Paste jstack output, thread dumps, deadlock reports, BLOCKED/RUNNABLE threads, executor pool notes, or JVM stack snippets...',
    sampleInput: '"http-nio-8080-exec-1" #42 RUNNABLE\n   java.lang.Thread.State: BLOCKED\nFound one Java-level deadlock\nat com.example.Service.call(Service.java:12)',
    signals: [
      signal('deadlock', 'Java deadlock', /deadlock|Found one Java-level deadlock/i, 'A deadlock is explicitly reported.', 'Identify all monitors and code paths in the cycle, then enforce consistent lock order.', 40),
      signal('blocked', 'Blocked threads', /BLOCKED|waiting to lock|parking to wait/i, 'Threads are waiting on locks or monitors.', 'Group blocked threads by lock owner and stack frame.', 30),
      signal('runnable', 'Runnable hot stack', /RUNNABLE|cpu|exec/i, 'Runnable threads may indicate CPU or active request work.', 'Sample multiple dumps to find repeated hot stacks.', 20),
      signal('pool', 'Thread pool clue', /ForkJoinPool|executor|http-nio|pool-/i, 'Thread pool names are visible.', 'Check saturation, queue depth, rejected tasks, and blocking calls inside pool threads.', 20),
    ],
    checklist: ['Take at least three dumps several seconds apart.', 'Group threads by state and top frame.', 'Find lock owners before changing timeouts.'],
    exportTitle: 'Java Thread Dump Debug Report',
    icon: ServerStackIcon,
  },
  {
    slug: 'jvm-gc-log',
    title: 'JVM GC Log',
    shortTitle: 'JVM GC',
    route: '/tools/jvm-gc-log',
    priority: 'P2',
    pillar: 'DevOps / Observability',
    description: 'Analyze JVM GC logs for pause spikes, allocation pressure, heap tuning clues, promotion failures, and memory regressions.',
    placeholder: 'Paste JVM GC logs, pause summaries, heap-before/after lines, promotion failures, allocation stalls, or memory-regression notes...',
    sampleInput: '[2.345s][info][gc] GC(12) Pause Young 512M->128M(1024M) 250.123ms\nFull GC Allocation Failure\nPromotion failed',
    signals: [
      signal('pause', 'Long GC pause', /Pause .* (?:[2-9]\d{2,}|\d+\.\d{3,})ms|Full GC/i, 'GC pauses are long enough to affect latency.', 'Compare pause type, heap before/after, allocation rate, and SLA budget.', 35),
      signal('allocation', 'Allocation failure', /Allocation Failure|promotion failed|to-space exhausted/i, 'The JVM struggled to allocate or promote objects.', 'Check allocation rate, old-gen pressure, survivor sizing, and object lifetime.', 30),
      signal('heap', 'Heap before/after data', /\d+[KMG]->\d+[KMG]\(\d+[KMG]\)/i, 'Heap occupancy data is present.', 'Track whether used heap returns to baseline after GC.', 20),
      signal('collector', 'Collector details', /G1|ZGC|Shenandoah|Parallel|CMS/i, 'Collector type appears in the log.', 'Tune based on collector-specific goals instead of generic flags.', 15),
    ],
    checklist: ['Plot pause time and heap after GC over time.', 'Separate young, mixed, and full collections.', 'Correlate with traffic and deploy events.'],
    exportTitle: 'JVM GC Debug Report',
    icon: ServerStackIcon,
  },
  {
    slug: 'native-debug-session',
    title: 'Native Debug Session',
    shortTitle: 'Native Debug',
    route: '/tools/native-debug-session',
    priority: 'P2',
    pillar: 'Logs & Errors',
    description: 'Parse GDB or LLDB transcripts into breakpoints, signals, frames, variables, commands, and next native-debugging actions.',
    placeholder: 'Paste GDB/LLDB transcripts, crash signals, backtraces, register notes, breakpoint output, or native debugger command history...',
    sampleInput: '(gdb) bt\n#0  0x00007fff in memcpy\nProgram received signal SIGSEGV, Segmentation fault.\n(lldb) frame variable userPtr = 0x0',
    signals: [
      signal('signal', 'Crash signal', /SIGSEGV|SIGABRT|EXC_BAD_ACCESS|signal/i, 'A native crash signal is present.', 'Identify the crashing thread, invalid address, and owning allocation.', 35),
      signal('backtrace', 'Backtrace frames', /\(gdb\) bt|\(lldb\) bt|#\d+\s+0x/i, 'Debugger backtrace output is present.', 'Find the first app frame below system/library frames.', 25),
      signal('breakpoint', 'Breakpoint context', /breakpoint|watchpoint|stopped/i, 'The session includes breakpoint stops.', 'Record condition, hit count, and variable values at each stop.', 20),
      signal('null', 'Null or invalid pointer', /0x0|nullptr|invalid address|bad access/i, 'A pointer or memory access issue is likely.', 'Inspect object lifetime, ownership, and thread handoff around the pointer.', 30),
    ],
    checklist: ['Keep the full crashing thread backtrace.', 'Resolve symbols before drawing conclusions.', 'Record compiler flags and binary build ID.'],
    exportTitle: 'Native Debug Session Report',
    icon: CommandLineIcon,
  },
  {
    slug: 'binary-inspector',
    title: 'Binary Inspector',
    shortTitle: 'Binary',
    route: '/tools/binary-inspector',
    priority: 'P2',
    pillar: 'Logs & Errors',
    description: 'Inspect pasted hex or Base64 bytes, magic numbers, endian clues, file signatures, encoding mistakes, and binary payload notes.',
    placeholder: 'Paste hex dumps, Base64 blobs, file signatures, binary parser errors, endian notes, magic bytes, or protocol payload samples...',
    sampleInput: '89504E470D0A1A0A\nPK\\x03\\x04\n7b226572726f72223a747275657d\ninvalid magic number',
    signals: [
      signal('png', 'PNG magic bytes', /89504E470D0A1A0A|PNG/i, 'PNG file signature is present.', 'Check whether the parser expects image bytes, metadata, or a different transport encoding.', 20),
      signal('zip', 'ZIP magic bytes', /504B0304|PK\\x03\\x04|PK/i, 'ZIP-like archive signature is present.', 'Confirm whether this is a ZIP/JAR/APK/DOCX-style container.', 20),
      signal('json', 'Encoded JSON clue', /7b22|eyJ|application\/json/i, 'The binary payload may contain JSON or Base64-encoded JSON.', 'Decode safely and validate character encoding before parsing.', 20),
      signal('magic', 'Invalid magic number', /invalid magic|magic number|unexpected header|endianness|little endian|big endian/i, 'The file or protocol header does not match expectations.', 'Compare the first bytes with the expected format and confirm endian assumptions.', 30),
    ],
    checklist: ['Identify the first 8-16 bytes.', 'Check expected file/protocol signature.', 'Confirm Base64, hex, UTF-8, and endian assumptions.'],
    exportTitle: 'Binary Inspection Report',
    icon: CodeBracketSquareIcon,
  },
];

export function getDebugWorkflowConfig(slug: string) {
  return debugWorkflowConfigs.find((config) => config.slug === slug);
}
