/* istanbul ignore file */
import { Worker } from './handler';

addEventListener('fetch', (event: Event) => {
  const worker = new Worker();
  const fetchEvent = event as FetchEvent;
  fetchEvent.respondWith(worker.handle(fetchEvent.request));
});
