import makeServiceWorkerEnv from 'service-worker-mock';
import { makeMockKV } from './mocks';
import { expect } from 'chai';
import { Worker } from '../src/handler';

describe('handler returns response with request method', () => {
  beforeAll(() => {
    Object.assign(global, makeServiceWorkerEnv());
    Object.assign(global, makeMockKV('redirectiontool'));
    redirectiontool.put('/', 'https://www.google.com/');
  });

  const routes: [string, string | null][] = [
    ['/', 'https://www.google.com/'],
    ['/test', null],
  ];
  const otherMethods = ['HEAD', 'POST', 'PUT', 'DELETE', 'CONNECT', 'OPTIONS', 'TRACE', 'PATCH'];
  routes.forEach(([route, expectedResult]) => {
    it(`GET ${route}`, async () => {
      const worker = new Worker();
      const result = await worker.handle(new Request(route, { method: 'GET' }));
      if (expectedResult !== null) {
        expect(result.status).to.eq(302);
        expect(result.headers.get('location')).to.equal(expectedResult);
      } else {
        expect(result.status).to.eq(404);
      }
    });

    otherMethods.forEach(method => {
      it(`${method} ${route}`, async () => {
        const worker = new Worker();
        const result = await worker.handle(new Request(route, { method }));
        expect(result.status).to.eq(405);
      });
    });
  });
});
