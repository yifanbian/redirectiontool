export async function handle(
  request: Request,
  database: KVNamespace,
): Promise<Response> {
  if (request.method !== 'GET') {
    return new Response(null, { status: 405 });
  }

  await database.put('test', 'test');

  console.log(await database.list());
  const path = new URL(request.url).pathname;
  const redirectionLocation = await database.get(path);
  if (redirectionLocation == null) {
    return new Response(null, {
      status: 404,
    });
  } else {
    return new Response(null, {
      status: 302,
      headers: {
        Location: redirectionLocation,
      },
    });
  }
}
