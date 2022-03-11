import { FunctionChain, ChainResult, chain } from './function/chain';
import { ExpectType } from './test';

export type Fn<In, Out> = (input: In) => Out;
export function pipe<I, F extends readonly any[]>(input: I, ...funcs: FunctionChain<F>): ReturnType<ChainResult<F>> {
  const c : ChainResult<F> = chain(...funcs);
  return c(input);
  //return c(input);
}

export { FunctionChain, ChainResult, chain };
