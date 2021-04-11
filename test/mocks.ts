export function makeMockKV(name: string): { [_: string]: KVNamespace } {
    const data: { [_: string]: unknown } = {};
    const cloudflareWorkerKV: KVNamespace = {
        get<T extends unknown>(key: string, type?: 'text' | 'json' | 'arrayBuffer' | 'stream'):
            Promise<string | T | ArrayBuffer | ReadableStream | null> {
            if (key in data) {
                if (type === 'json') {
                    return Promise.resolve(data[key] as T);
                } else if (type === 'arrayBuffer') {
                    return Promise.resolve(data[key] as ArrayBuffer);
                } else if (type === 'stream') {
                    return Promise.resolve(data[key] as ReadableStream);
                } else {
                    return Promise.resolve(data[key] as string);
                }
            }
            return Promise.resolve(null);
        },
        getWithMetadata<T extends unknown>(key: string, type?: 'text' | 'json' | 'arrayBuffer' | 'stream'):
            Promise<any> {
            return Promise.resolve(undefined);
        },
        put(_key: string, _value: string | ReadableStream | ArrayBuffer | FormData):
            Promise<void> {
            data[_key] = _value;
            return Promise.resolve(undefined);
        },
        delete(_key: string):
            Promise<void> {
            delete data[_key];
            return Promise.resolve(undefined);
        },
        list(options?: { prefix?: string; limit?: number; cursor?: string; }):
            Promise<{
                keys: { name: string; expiration?: number; metadata?: unknown }[];
                list_complete: boolean;
                cursor: string;
            }> {
            return Promise.resolve({
                cursor: '1234567890',
                keys: Object.keys(data).map(x => ({ name: x, expiration: 1234 })),
                list_complete: true,
            });
        },
    };

    const cloudflareWorkerKVEnv = {
        [name]: cloudflareWorkerKV,
    };
    return cloudflareWorkerKVEnv;
}