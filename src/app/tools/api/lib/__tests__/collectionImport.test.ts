import { parseImportedCollection } from '../collectionImport';

describe('parseImportedCollection', () => {
  it('imports native debugtools collections with a stable name fallback', () => {
    const collection = parseImportedCollection({
      description: 'Exported without a name by mistake',
      requests: [
        {
          name: 'Health',
          method: 'GET',
          url: 'https://api.example.com/health',
          headers: [{ key: 'Accept', value: 'application/json', enabled: true }],
        },
      ],
    }, 'debug-tools.json');

    expect(collection.name).toBe('debug-tools');
    expect(collection.requests).toHaveLength(1);
    expect(collection.requests[0]).toMatchObject({
      name: 'Health',
      method: 'GET',
      url: 'https://api.example.com/health',
      contentType: 'application/json',
    });
  });

  it('imports nested Postman collection requests', () => {
    const collection = parseImportedCollection({
      info: {
        name: 'Shop API',
        description: { content: 'Checkout endpoints' },
      },
      variable: [
        { key: 'mrktplaceapiurl', value: 'https://api.example.com' },
      ],
      item: [
        {
          name: 'Auth',
          item: [
            {
              name: 'Login',
              request: {
                method: 'POST',
                header: [{ key: 'Content-Type', value: 'application/json' }],
                url: { raw: 'https://api.example.com/login' },
                body: {
                  mode: 'raw',
                  raw: '{"email":"user@example.com"}',
                  options: { raw: { language: 'json' } },
                },
                auth: {
                  type: 'bearer',
                  bearer: [{ key: 'token', value: '{{token}}' }],
                },
              },
              event: [
                { listen: 'prerequest', script: { exec: ['set header X-Debug: true'] } },
                { listen: 'test', script: { exec: ['status is 200', 'header content-type contains json'] } },
              ],
            },
          ],
        },
        {
          name: 'Products',
          request: {
            method: 'GET',
            url: {
              protocol: 'https',
              host: ['api', 'example', 'com'],
              path: ['products'],
              query: [{ key: 'limit', value: '10' }],
            },
          },
        },
      ],
    });

    expect(collection.name).toBe('Shop API');
    expect(collection.description).toBe('Checkout endpoints');
    expect(collection.variables).toEqual([
      { key: 'mrktplaceapiurl', value: 'https://api.example.com' },
    ]);
    expect(collection.requests).toHaveLength(2);
    expect(collection.requests[0]).toMatchObject({
      name: 'Login',
      method: 'POST',
      url: 'https://api.example.com/login',
      body: '{"email":"user@example.com"}',
      contentType: 'application/json',
      authConfig: { type: 'bearer', token: '{{token}}' },
      preRequestScript: 'set header X-Debug: true',
      testScript: 'status is 200\nheader content-type contains json',
    });
    expect(collection.requests[1]).toMatchObject({
      name: 'Products',
      method: 'GET',
      url: 'https://api.example.com/products?limit=10',
    });
  });

  it('imports OpenAPI collections instead of creating undefined empty collections', () => {
    const collection = parseImportedCollection({
      openapi: '3.1.0',
      info: { title: 'Public Store', description: 'Storefront API' },
      servers: [{ url: 'https://api.example.com/v1' }],
      paths: {
        '/products/{id}': {
          get: {
            summary: 'Get product',
            parameters: [{ name: 'include', in: 'query', example: 'variants' }],
          },
          post: {
            operationId: 'createProduct',
            requestBody: {
              content: {
                'application/json': {
                  example: { name: 'Desk', price: 120 },
                },
              },
            },
          },
        },
      },
    });

    expect(collection.name).toBe('Public Store');
    expect(collection.description).toBe('Storefront API');
    expect(collection.requests).toHaveLength(2);
    expect(collection.requests[0]).toMatchObject({
      name: 'Get product',
      method: 'GET',
      url: 'https://api.example.com/v1/products/{{id}}?include=variants',
      body: '',
    });
    expect(collection.requests[1]).toMatchObject({
      name: 'createProduct',
      method: 'POST',
      url: 'https://api.example.com/v1/products/{{id}}',
      contentType: 'application/json',
      body: '{\n  "name": "Desk",\n  "price": 120\n}',
    });
  });

  it('leaves OpenAPI query placeholders substitutable instead of percent-encoding them', () => {
    const collection = parseImportedCollection({
      openapi: '3.1.0',
      info: { title: 'Search API' },
      servers: [{ url: 'https://api.example.com' }],
      paths: {
        '/search': {
          get: {
            summary: 'Search',
            parameters: [
              { name: 'id', in: 'query' },
              { name: 'q', in: 'query', example: 'blue shoes' },
            ],
          },
        },
      },
    });

    expect(collection.requests[0].url).toBe('https://api.example.com/search?id={{id}}&q=blue%20shoes');
    expect(collection.requests[0].url).not.toContain('%7B%7B');
  });

  it('imports Insomnia request exports', () => {
    const collection = parseImportedCollection({
      __export_format: 4,
      resources: [
        { _type: 'workspace', name: 'Insomnia Shop', description: 'Local workspace' },
        { _type: 'environment', name: 'Base Environment', data: { base_url: 'https://api.example.com' } },
        {
          _type: 'request',
          name: 'Create order',
          method: 'POST',
          url: 'https://api.example.com/orders',
          headers: [{ name: 'X-Shop', value: '{{shop}}' }],
          body: { mimeType: 'application/json', text: '{"sku":"abc"}' },
        },
      ],
    });

    expect(collection.name).toBe('Insomnia Shop');
    expect(collection.description).toBe('Local workspace');
    expect(collection.variables).toEqual([
      { key: 'base_url', value: 'https://api.example.com' },
    ]);
    expect(collection.requests).toHaveLength(1);
    expect(collection.requests[0]).toMatchObject({
      name: 'Create order',
      method: 'POST',
      url: 'https://api.example.com/orders',
      headers: [{ key: 'X-Shop', value: '{{shop}}', enabled: true }],
      body: '{"sku":"abc"}',
      contentType: 'application/json',
    });
  });

  it('rejects unsupported JSON instead of creating an undefined empty collection', () => {
    expect(() => parseImportedCollection({ paths: {}, notACollection: true }))
      .toThrow('Unsupported collection format');
  });
});
