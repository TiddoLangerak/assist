import { Tail, Head } from '../tuple';

export function chain<T extends readonly any[]>(...funcs: FunctionChain<T>) : ChainResult<T> {
  return funcs
    .reduce(
      (f1, f2) => (i: unknown) => f2(f1(i)),
      <T>(i: T) => i
    );
}

/**
 * Validates a function chain. For valid function chains, this type resolves to whatever function chain was given. For invalid function chains, it resolves to an "intended" function chain, i.e. one that matches up to the first error.
 */
export type FunctionChain<T extends readonly any[]> =
  T extends [(i: infer I) => infer O] // Base case: single function, always valid
    ? T
    : (
      // Recursive case: test if the first 2 functions are valid
      T extends [(i1: infer I) => infer O1, (i2: infer O1) => infer O2, ...(infer REST)]
        // And then recurse
        ? [Head<T>, ...FunctionChain<Tail<T>>]
        : ChainError<T>
      )

// This should be given a chain tuple where the error is in the first 2 arguments.
// If the first argument is invalid (i.e. not a unary function), then this
// will return a tuple with a unary function as head.
// If the first argument is valid, then we assume the second is invalid, and will
// return a tuple with valid first 2 arguments.
// E.g.:
// ChainError<[3]> = [any => any];
// ChainError<[I => O1, I2 => O2]> = [I => O1, O1 => any];
type ChainError<T extends readonly any[]> = 
  // We check if at least the first value is valid, such that we can use it in our error type
  T extends [(i1: infer I) => infer O1, ...(infer REST)]
    // If it is, then we can assume the error is in the second function, and we'll return an intented type with correct signature for 2nd function.
    ? [(i1: I) => O1, (i2: O1) => any, ...any[]]
    // If the first value isn't valid, then we return an intended type with a valid first func
    : [(i1: any) => any, ...any[]]

export type ChainResult<F extends readonly any[]> =
  F extends [(i: infer I) => any, ...any[], (i_: any) => infer O]
    ? (i: I) => O
    : never;

