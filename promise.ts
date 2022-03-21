export type Awaitable<T> = T | PromiseLike<T>;
export type PromisedIterable<T> = Promise<AsyncIterable<T> | Iterable<Awaitable<T>>>;
