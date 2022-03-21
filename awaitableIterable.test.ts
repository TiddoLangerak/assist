import { AwaitableIterable, map, collect, filter } from './awaitableIterable';
import { Awaitable } from './promise';
import { expect } from './test';
import { chain, Fn } from './function';

async function testFunction<I, O>(func: Fn<AwaitableIterable<I>, AwaitableIterable<O>>, inputs: I[], checkResult: (o: O[]) => void) {
  // TODO: chain apparently still fails on generics... :(
  const collected: Fn<AwaitableIterable<I>, Promise<O[]>> = chain(func, collect);
  // plain array
  checkResult(await collected(inputs));
  // Promise premutations
  checkResult(await collected(Promise.resolve(inputs)));
  checkResult(await collected(inputs.map(i => Promise.resolve(i))));
  checkResult(await collected(Promise.resolve(inputs.map(i => Promise.resolve(i)))));
  // Generators
  checkResult(await collected((function* gen() {
    for (let el of inputs) {
      yield el;
    }
  })()));
  checkResult(await collected((async function* gen() {
    for (let el of inputs) {
      yield el;
    }
  })()));
  checkResult(await collected((async function* gen() {
    for (let el of inputs) {
      yield await Promise.resolve(el);
    }
  })()));
}

async function testMap() {
  const double : Fn<AwaitableIterable<number>, Promise<number[]>> = chain(map((x: number) => x*2), collect);
  const deferredDouble : Fn<AwaitableIterable<number>, Promise<number[]>> = chain(map((x: number) => Promise.resolve(x*2)), collect);

  testFunction(double, [1,2,3], (output) => {
    expect(output.length === 3);
    expect(output[0] === 2);
    expect(output[1] === 4);
    expect(output[2] === 6);
  });
  testFunction(deferredDouble, [1,2,3], (output) => {
    expect(output.length === 3);
    expect(output[0] === 2);
    expect(output[1] === 4);
    expect(output[2] === 6);
  });
}

async function testFilter() {
  const evens : Fn<AwaitableIterable<number>, Promise<number[]>> = chain(filter((x : number) => x % 2 === 0), collect);
  const deferredEvens : Fn<AwaitableIterable<number>, Promise<number[]>> = chain(filter((x: number) => Promise.resolve(x % 2 === 0)), collect);

  const syncEvens = await evens([1,2,3,4]);
  expect(syncEvens.length === 2);
  expect(syncEvens[0] === 2 && syncEvens[1] === 4);

  const asyncEvens = await deferredEvens([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3), Promise.resolve(4)]);
  expect(asyncEvens.length === 2);
  expect(asyncEvens[0] === 2 && asyncEvens[1] === 4);

  const asyncGeneratorEvens = await evens((async function* gen() {
    yield await 1; yield await 2; yield await 3; yield await 4;
  })());

  expect(asyncGeneratorEvens.length === 2);
  expect(asyncGeneratorEvens[0] === 2 && asyncGeneratorEvens[1] === 4);
}




testMap();
testFilter();


