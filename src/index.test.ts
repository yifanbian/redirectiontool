import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { KVNamespace } from "@miniflare/kv";
import { FileStorage } from "@miniflare/storage-file";
import { unstable_dev } from 'wrangler';
import type { UnstableDevWorker } from 'wrangler';
import { describe, expect, it, beforeAll, afterAll } from 'vitest';

describe('handler returns response with request method', () => {
  const kvNamespaceName = 'redirectiontool'; // must be aligned with kv namespace binding in wrangler.toml
  let tempDir: string;
  let worker: UnstableDevWorker;
  const routes: [string, string | null][] = [
    ['/', 'https://www.google.com/'],
    ['/msft', 'https://www.microsoft.com/'],
    ['/test', null],
  ];

  beforeAll(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cfw-'));
    console.log(tempDir);

    const ns = new KVNamespace(new FileStorage(path.join(tempDir, 'kv', kvNamespaceName)));
    await Promise.all(routes.map(async ([source, target]) => {
      if (target) {
        await ns.put(source, target);
      }
    }));

    worker = await unstable_dev('src/index.ts', {
      experimental: { disableExperimentalWarning: true },
      local: true,
      persist: true,
      persistTo: tempDir,
    });
  });

  afterAll(async () => {
    await worker.stop();
    await fs.rm(tempDir, { recursive: true, force: true });
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
      const result = await worker.fetch(route, {
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
        const result = await worker.fetch(route, {
          method,
          redirect: 'manual',
        });
        expect(result.status).to.eq(405);
      });
    });
  });
});
