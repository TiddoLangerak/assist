import { AwaitableIterable, Awaitable } from './promise';
import { Fn } from './function';

export const map = <I, O>(fn: Fn<I, Awaitable<O>>) => async function*(input: AwaitableIterable<I>) : AwaitableIterable<O> {
  const vals = await input;
  for await(let i of vals) {
    yield await fn(i);
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
