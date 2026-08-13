import {
  REGEX_MATCH_LIMIT,
  REGEX_TIME_LIMIT_MS,
  buildRegexFlags,
  runRegexTest,
  type RegexResults,
} from './tool-utils';

/** How long the worker gets before we give up and terminate it. */
export const REGEX_WORKER_TIMEOUT_MS = 2000;

export interface RegexRunOutcome extends RegexResults {
  /** Set when the pattern itself was rejected by the engine. */
  error?: string;
}

/**
 * The in-loop time budget in `runRegexTest` cannot rescue a catastrophically
 * backtracking pattern: `(a+)+$` against 30 a's never returns from a *single*
 * `exec()` call, so no check between iterations ever runs. A worker is the only
 * way to take the time back — it can be terminated mid-call.
 *
 * Kept as a string and loaded from a Blob so this needs no bundler worker
 * config, and so the matching loop stays next to the code it mirrors.
 */
const WORKER_SOURCE = `
self.onmessage = function (event) {
  var pattern = event.data.pattern;
  var testString = event.data.testString;
  var flags = event.data.flags;
  var matchLimit = event.data.matchLimit;
  var timeLimitMs = event.data.timeLimitMs;

  var regex;
  try {
    regex = new RegExp(pattern, flags);
  } catch (err) {
    self.postMessage({ error: err && err.message ? err.message : 'Invalid regular expression' });
    return;
  }

  var matches = [];
  var groups = [];
  var startedAt = Date.now();
  var truncated = false;
  var timedOut = false;
  var result;

  while ((result = regex.exec(testString)) !== null) {
    matches.push(result[0]);

    if (result.length > 1) {
      var values = [];
      for (var i = 1; i < result.length; i += 1) values.push(result[i] == null ? '' : result[i]);
      groups.push({ matchIndex: matches.length, values: values });
    }

    if (result[0] === '') regex.lastIndex += 1;

    if (matches.length >= matchLimit) { truncated = true; break; }
    if (Date.now() - startedAt > timeLimitMs) { timedOut = true; break; }
  }

  self.postMessage({
    match: matches.length > 0,
    matches: matches,
    groups: groups,
    truncated: truncated,
    timedOut: timedOut,
  });
};
`;

const TIMED_OUT_RESULT: RegexRunOutcome = {
  match: false,
  matches: [],
  groups: [],
  truncated: false,
  timedOut: true,
};

export function runRegexTestSafely(
  pattern: string,
  testString: string,
  selectedFlags: string[],
  timeoutMs: number = REGEX_WORKER_TIMEOUT_MS
): Promise<RegexRunOutcome> {
  // No worker (SSR, jsdom, older browsers): fall back to the direct call. It
  // keeps the match/time caps, just without protection from a single hostile
  // exec — which is the best that can be done on one thread.
  if (typeof Worker === 'undefined' || typeof URL.createObjectURL !== 'function') {
    try {
      return Promise.resolve(runRegexTest(pattern, testString, selectedFlags));
    } catch (err) {
      return Promise.resolve({
        ...TIMED_OUT_RESULT,
        timedOut: false,
        error: err instanceof Error ? err.message : 'Invalid regular expression',
      });
    }
  }

  return new Promise((resolve) => {
    const blobUrl = URL.createObjectURL(new Blob([WORKER_SOURCE], { type: 'application/javascript' }));
    const worker = new Worker(blobUrl);
    let settled = false;

    const finish = (outcome: RegexRunOutcome) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(blobUrl);
      resolve(outcome);
    };

    const timer = window.setTimeout(() => finish(TIMED_OUT_RESULT), timeoutMs);

    worker.onmessage = (event: MessageEvent<RegexRunOutcome>) => finish(event.data);
    worker.onerror = () =>
      finish({ ...TIMED_OUT_RESULT, timedOut: false, error: 'Invalid regular expression' });

    worker.postMessage({
      pattern,
      testString,
      flags: buildRegexFlags(selectedFlags),
      matchLimit: REGEX_MATCH_LIMIT,
      timeLimitMs: REGEX_TIME_LIMIT_MS,
    });
  });
}
