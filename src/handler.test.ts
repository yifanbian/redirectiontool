import { KVNamespace } from "@miniflare/kv";
import { MemoryStorage } from "@miniflare/storage-memory";
import { describe, expect, it, beforeAll } from 'vitest';
import { handle } from './handler';

describe('handler returns response with request method', () => {
  const routes: [string, string | null][] = [
    ['/', 'https://www.google.com/'],
    ['/msft', 'https://www.microsoft.com/'],
    ['/test', null],
  ];
  const ns = new KVNamespace(new MemoryStorage());

  beforeAll(async () => {
    await Promise.all(routes.map(async ([source, target]) => {
      if (target) {
        await ns.put(source, target);
      }
    }));
  });

  const otherMethods = [
    'HEAD',
    'POST',
    'PUT',
    'DELETE',
    'OPTIONS',
    'PATCH',
  ];
  routes.forEach(([route, expectedResult]) => {
    it(`GET ${route}`, async () => {
      const result = await handle(new Request(`https://localhost${route}`, { method: 'GET' }), ns);
      if (expectedResult !== null) {
        expect(result.status).to.eq(302);
        expect(result.headers.get('location')).to.equal(expectedResult);
      } else {
        expect(result.status).to.eq(404);
      }
    });

    otherMethods.forEach((method) => {
      it(`${method} ${route}`, async () => {
        const result = await handle(new Request(`https://localhost${route}`, { method }), ns);
        expect(result.status).to.eq(405);
      });
    });
  });
});
