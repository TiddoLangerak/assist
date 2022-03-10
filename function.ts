import { FunctionChain, ChainResult, chain } from './function/chain';

export type Fn<In, Out> = (input: In) => Out;
export function pipe<I, F>(input: I, ...funcs: FunctionChain<F>): ChainResult<F> {
  return chain(funcs)(input);
}

export { FunctionChain, ChainResult, chain };
