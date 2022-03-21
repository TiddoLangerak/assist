import { Awaitable } from './promise';
import { Fn, DeferredPredicate } from './function';
export type AwaitableIterable<T> = Awaitable<AsyncIterable<T> | Iterable<Awaitable<T>>>;

export const map = <I, O>(fn: Fn<I, Awaitable<O>>) => async function*(input: AwaitableIterable<I>) : AwaitableIterable<O> {
  const vals = await input;
  for await(let i of vals) {
    yield await fn(i);
  }
}

// TS bug: it seems that when using AwaitableIterable<I> both as input and output, that TS expects both to be exactly the same.
// However, this isn't necessarily the case. Input is any AwaitableIterable<I>, but output is specifically an AsyncIterable
// To work around this we have the input and output as separate type parameters, which makes typescript do the right thing
export const filter = <I, O extends I>(filterFunc: DeferredPredicate<I>) => async function*(input: AwaitableIterable<I>): AwaitableIterable<O> {
  const vals = await input;
  for await(let el of vals) {
    if (await filterFunc(el)) {
      yield el;
    }
  }
}

export const collect = async function<I>(input: AwaitableIterable<I>) : Promise<I[]> {
  const vals = await input;
  let res = [];
  for await(let el of vals) {
    res.push(el);
  }
  return res;
}
