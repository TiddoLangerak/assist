export type Awaitable<T> = T | PromiseLike<T>;
export type AwaitableIterable<T> = AsyncIterable<T> | Iterable<Awaitable<T>>;
