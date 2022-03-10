import { map, collect } from './awaitableIterable';
import { AwaitableIterable, Awaitable } from './promise';
import { expect } from './test';
import { chain } from './function';

async function test() {
  const double = chain(map((x: number) => x*2), collect);
  const deferredDouble = chain(map((x: number) => Promise.resolve(x*2)), collect);

  const syncDoubles = await double([2,3])
  expect(syncDoubles[0] === 4 && syncDoubles[1] === 6);
  
  const deferredDoubles = await deferredDouble([2, 3]);
  expect(deferredDoubles[0] === 4 && deferredDoubles[1] === 6);

  const promiseDoubles = await double(Promise.resolve([2,3]));
  expect(promiseDoubles[0] === 4 && promiseDoubles[1] === 6);

  const innerPromiseDoubles = await double([Promise.resolve(2), Promise.resolve(3)]);
  expect(innerPromiseDoubles[0] === 4 && innerPromiseDoubles[1] === 6);

  const generatorDoubles = await double((function* gen() {
    yield 2; yield 3;
  })());
  expect(generatorDoubles[0] === 4 && generatorDoubles[1] === 6);

  const asyncGeneratorDoubles = await double((async function* gen() {
    yield await 2; yield await 3;
  })());
  expect(asyncGeneratorDoubles[0] === 4 && asyncGeneratorDoubles[1] === 6);
}


test();


