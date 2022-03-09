export type MapFn<In, Out> = (input: In) => Out;

// TODO: maybe unwrap MapFn again for better errors?
type ValidateComposeHead2<I, O1, O2, REST extends any[]> = [
  h1: MapFn<I, O1>,
  h2: MapFn<O1, O2>
  ...rest: REST
];

type ValidateComposeTail<T extends any[], I, O1, O2, REST extends any[]> = (
        [
          h: MapFn<O1, O2>,
          ...rest: REST
        ] extends ComposeArgs<[MapFn<O1, O2>, ...REST]> 
          // If it is, all good!
          ? T 
          // If recursive fails, then we propagate the "Error" type further (see below)
          // TODO: this currently duplicates the ComposeArgs clause, we can maybe DRY this up
          : [
            h: MapFn<I, O1>,
            ...rest: ComposeArgs<[MapFn<O1, O2>, ...REST]>
          ]
);

type ComposeError<T extends any[]> =( // Error case
         // If the first 2 don't match, then we construct a type that will fail on the second parameter (i.e. a type that forces a match), and any[] for the remainder
         // We have some extra conditional here to capture the parameters again (given that the previous conditional was NOT a match)
        T extends [
          h: MapFn<infer I, infer O1>,
          ...rest: infer R
        ]
          ? [
            h: MapFn<I, O1>,
            h2: MapFn<O1, any>,
            ...rest: any[]
          ]
          : [
            h: MapFn<any, any>,
            ...rest: any[]
          ]
    )

    /**
     * Compose guard. When valid, output is same as input. When not valid, output matches input up to error
     */
type ComposeArgs<T extends any[]> =
  T extends [MapFn<infer I, infer O>] // Base case: single function.
  ? T
  : (
    // Recursive case: test if the first 2 functions are valid
    T extends ValidateComposeHead2<infer I, infer O1, infer O2, infer REST>
      ? ValidateComposeTail<T, I, O1, O2, REST>
      : ComposeError<T>
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
compose();


