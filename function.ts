import { FunctionChain, ChainResult, chain } from './function/chain';
import { Awaitable } from './promise';

export type Fn<In, Out> = (input: In) => Out;
export function pipe<I, F extends readonly any[]>(input: I, ...funcs: FunctionChain<I, F>): ReturnType<ChainResult<I, F>> {
  // Need explicit cast to prevent it from being turned into an unknown
  return chain(...funcs as any)(input) as ReturnType<ChainResult<I, F>>;
}

export type Predicate<T> = (input: T) => boolean;
export type DeferredPredicate<T> = (input: T) => Awaitable<boolean>;

export { FunctionChain, ChainResult, chain };
