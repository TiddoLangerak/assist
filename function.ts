import { FunctionChain, ChainResult, chain } from './function/chain';

export type Fn<In, Out> = (input: In) => Out;

export { FunctionChain, ChainResult, chain };
