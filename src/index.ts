import { handle } from './handler';

export interface Env {
  redirectiontool: KVNamespace;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    return await handle(request, env.redirectiontool);
  },
};
