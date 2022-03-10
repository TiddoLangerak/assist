export type Awaitable<T> = T | PromiseLike<T>;
export type AwaitableIterable<T> = Awaitable<AsyncIterable<T> | Iterable<Awaitable<T>>>;
export type PromisedIterable<T> = Promise<AsyncIterable<T> | Iterable<Awaitable<T>>>;
