export type MapFn<In, Out> = (input: In) => Out;


    /**
     * Compose guard. When valid, output is same as input. When not valid, output matches input up to error
     */
type ComposeArgs<T extends any[]> =
  T extends [(i: infer I) => infer O] // Base case: single function.
  ? T
  : (
    // Recursive case: test if the first 2 functions are valid
    T extends [h1: (i: infer I) => infer IO, h2: (i: infer IO) => infer O, ...rest: infer R]
    ? (
      // If the first 2 are valid, then we recursively test if the second onwards is valid
      [(i: IO) => O, ...R] extends ComposeArgs<[(i: IO) => O, ...R]> 
        // If it is, all good!
        ? T 
        // If recursive fails, then we propagate the "Error" type further (see below)
        // TODO: this currently duplicates the ComposeArgs clause, we can maybe DRY this up
        : [h: (i: I) => IO, ...rest: ComposeArgs<[(i: IO) => O, ...R]>]
    )
      : ( // Error case
         // If the first 2 don't match, then we construct a type that will fail on the second parameter (i.e. a type that forces a match), and any[] for the remainder
         // We have some extra conditional here to capture the parameters again (given that the previous conditional was NOT a match)
       T extends [h: (i: infer I) => infer O, ...rest: infer R]
        ? [h: (i: I) => O, h2: (i: O) => any, ...rest: any[]]
        : [h: (i: any) => any, ...rest: any[]]
    )
  )

  // THIS IS THE ONE!!!
  // It rejects the proper thing
function compose<T extends any[]>(...funcs: ComposeArgs<T>) {}

compose((i: string) => 3);
compose((i: string) => 3, (i: number) => i);
compose((i: string) => 3, (i: string) => i);
compose((i: string) => 3, (i: number) => i, (i: number) => i, (i: number) => i);
compose((i: string) => 3, (i: number) => i, (i: number) => i, (i: number) => i, (i: string) => i, (i:string) => i);
compose(3);
compose((i: string, j: number) => i);


