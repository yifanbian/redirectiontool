import { describe, expect, it, beforeAll } from 'vitest';

import { Miniflare } from "miniflare";

const kvNamespaceName = 'redirectiontool'; // must be aligned with kv namespace binding in wrangler.toml
const mf = new Miniflare({
  modules: true,
  scriptPath: 'dist/node.js',
  kvNamespaces: [kvNamespaceName],
});

describe('handler returns response with request method', () => {
  const routes: [string, string | null][] = [
    ['/', 'https://www.google.com/'],
    ['/msft', 'https://www.microsoft.com/'],
    ['/test', null],
  ];

  beforeAll(async () => {
    const ns = await mf.getKVNamespace(kvNamespaceName);
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
      const result = await mf.dispatchFetch('https://localhost' + route, {
        method: 'GET',
        redirect: 'manual',
      });
      if (expectedResult !== null) {
        expect(result.status).to.eq(302);
        expect(result.headers.get('location')).to.equal(expectedResult);
      } else {
        expect(result.status).to.eq(404);
      }
    });

    otherMethods.forEach((method) => {
      it(`${method} ${route}`, async () => {
        const result = await mf.dispatchFetch('https://localhost' + route, {
          method,
          redirect: 'manual',
        });
        expect(result.status).to.eq(405);
      });
    });
  });
});
