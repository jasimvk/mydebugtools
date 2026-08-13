const originalApiKey = process.env.OPENAI_API_KEY;

(global as any).Response = class {
  status: number;
  private body: string;

  constructor(body: string, init?: { status?: number }) {
    this.body = body;
    this.status = init?.status || 200;
  }

  async json() {
    return JSON.parse(this.body);
  }
};

// Deliberately `require`, not `import`: the route must be loaded *after* the
// Response stub above is installed, and an import declaration would hoist.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { POST } = require('./route') as typeof import('./route');

describe('/api/ai-debug', () => {
  afterEach(() => {
    process.env.OPENAI_API_KEY = originalApiKey;
  });

  it('returns a clear disabled response when no OpenAI key is available', async () => {
    delete process.env.OPENAI_API_KEY;

    const response = await POST({
      json: async () => ({
        mode: 'explain-error',
        input: 'TypeError: fetch failed',
      }),
    } as Request);

    const body = await response.json();

    expect(response.status).toBe(501);
    expect(body).toEqual({
      error: 'AI Debug Assistant is not configured',
      message: 'Enter an OpenAI API key for this request or set OPENAI_API_KEY on the server.',
      disabled: true,
    });
  });

  it('uses a request-provided OpenAI key without requiring server env', async () => {
    delete process.env.OPENAI_API_KEY;
    const originalFetch = (global as any).fetch;
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        output_text: JSON.stringify({
          summary: 'Network failure.',
          likelyCause: 'The request could not complete.',
          steps: ['Check the URL.'],
          snippet: '',
          cautions: [],
        }),
      }),
    } as any);
    (global as any).fetch = fetchMock;

    try {
      const response = await POST({
        json: async () => ({
          mode: 'explain-error',
          input: 'TypeError: fetch failed',
          apiKey: 'sk-test-user-key',
        }),
      } as Request);

      expect(response.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.openai.com/v1/responses',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer sk-test-user-key',
          }),
        }),
      );
    } finally {
      (global as any).fetch = originalFetch;
    }
  });
});
