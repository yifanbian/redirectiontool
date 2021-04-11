export class Worker {
  public async handle(request: Request): Promise<Response> {
    if (request.method !== 'GET') {
      return new Response(null, { status: 405 });
    }

    const path = new URL(request.url).pathname;
    const redirectionLocation = await redirectiontool.get(path);
    if (redirectionLocation == null) {
      return new Response(null, {
        status: 404
      });
    } else {
      return new Response(null, {
        status: 302,
        headers: {
          "Location": redirectionLocation
        }
      });
    }
  }
}
