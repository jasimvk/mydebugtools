import {
  applyPreRequestDirectives,
  parseSetCookieHeader,
  runPostmanStyleTests,
} from '../postmanScripts';

describe('postmanScripts', () => {
  it('applies safe pre-request header and variable directives', () => {
    const result = applyPreRequestDirectives(`
      // Values are applied before fetch()
      set header X-Debug: true
      set header Accept: application/json
      set variable token = abc123
      unset header X-Remove-Me
    `, {
      'X-Remove-Me': '1',
    });

    expect(result.headers).toEqual({
      'X-Debug': 'true',
      Accept: 'application/json',
    });
    expect(result.variables).toEqual([{ key: 'token', value: 'abc123' }]);
    expect(result.applied).toEqual([
      'Set header X-Debug',
      'Set header Accept',
      'Set variable token',
      'Unset header X-Remove-Me',
    ]);
    expect(result.warnings).toEqual([]);
  });

  it('runs status, header, body, JSON, and duration checks', () => {
    const results = runPostmanStyleTests(`
      status is 200
      status in 200..299
      header content-type contains json
      body contains "Ada"
      json user.id equals 42
      response time below 500
    `, {
      status: 200,
      headers: { 'content-type': 'application/json; charset=utf-8' },
      bodyText: JSON.stringify({ user: { id: 42, name: 'Ada Lovelace' } }),
      durationMs: 128,
    });

    expect(results).toHaveLength(6);
    expect(results.every((result) => result.passed)).toBe(true);
  });

  it('marks failed and unsupported checks clearly', () => {
    const results = runPostmanStyleTests(`
      status is 201
      body contains "missing"
      pm.test("custom js", () => {})
    `, {
      status: 200,
      headers: {},
      bodyText: '{"ok":true}',
      durationMs: 10,
    });

    expect(results).toEqual([
      expect.objectContaining({ name: 'status is 201', passed: false, message: 'Expected 201, received 200.' }),
      expect.objectContaining({ name: 'body contains "missing"', passed: false }),
      expect.objectContaining({ name: 'pm.test("custom js", () => {})', passed: false, message: expect.stringContaining('Unsupported') }),
    ]);
  });

  it('parses Set-Cookie response headers for inspection', () => {
    const cookies = parseSetCookieHeader('session=abc; Path=/; HttpOnly, theme=dark; Max-Age=3600; SameSite=Lax');

    expect(cookies).toEqual([
      { name: 'session', value: 'abc', attributes: ['Path=/', 'HttpOnly'] },
      { name: 'theme', value: 'dark', attributes: ['Max-Age=3600', 'SameSite=Lax'] },
    ]);
  });
});
