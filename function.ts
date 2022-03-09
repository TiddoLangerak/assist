export type MapFn<In, Out> = (input: In) => Out;

// A tuple with a valid compose head, i.e. where the output of the first function is accepted as input of the second function
type ComposeTuple2<I, O1, O2, REST extends any[]> = [
  h1: (i: I) => O1,
  h2: (i: O1) => O2,
  ...rest: REST
];

type ComposeTuple1<I, O, REST extends any[]> = [
  h: (i: I) => O,
  ...rest: REST
];

// TODO: this currently triggers infinite recursion...
type ValidateComposeTail<T extends any[], I, O1, O2, REST extends any[]> = (
  ComposeTuple1<O1, O2, REST> extends ValidComposeArgs<ComposeTuple1<O1, O2, REST>> 
    // If it is, all good!
    ? T 
    // If recursive fails, then we propagate the "Error" type further (see below)
    // TODO: this currently duplicates the ValidComposeArgs clause, we can maybe DRY this up
    : [
      h: MapFn<I, O1>,
      ...rest: ValidComposeArgs<[MapFn<O1, O2>, ...REST]>
    ]
);

// Error case
// This should be given a compose tuple where the error is in the first 2 arguments.
// If the first argument is invalid (i.e. not a unary function), then this
// will return a tuple with a unary function as head.
// If the first argument is valid, then we assume the second is invalid, and will
// return a tuple with valid first 2 arguments.
// E.g.:
// ComposeError<[3]> = [any => any];
// ComposeError<[I => O1, I2 => O2]> = [I => O1, O1 => any];
type ComposeError<T extends any[]> =( 
  T extends ComposeTuple1<infer I, infer O1, infer R>
    ? ComposeTuple2<I, O1, any, any[]> 
    : ComposeTuple1<any, any, any[]>
)

    /**
     * Compose guard. When valid, output is same as input. When not valid, output matches input up to error
     */
type ValidComposeArgs<T extends any[]> =
  T extends [MapFn<infer I, infer O>] // Base case: single function.
  ? T
  : (
    // Recursive case: test if the first 2 functions are valid
    T extends ComposeTuple2<infer I, infer O1, infer O2, infer REST>
      ? (
        ComposeTuple1<O1, O2, REST> extends ValidComposeArgs<ComposeTuple1<O1, O2, REST>> 
        // If it is, all good!
          ? T 
        // If recursive fails, then we propagate the "Error" type further (see below)
        // TODO: this currently duplicates the ValidComposeArgs clause, we can maybe DRY this up
          : [
            h: MapFn<I, O1>,
            ...rest: ValidComposeArgs<[MapFn<O1, O2>, ...REST]>
          ]
      )
      : ComposeError<T>
    )

  // THIS IS THE ONE!!!
  // It rejects the proper thing
function compose<T extends any[]>(...funcs: ValidComposeArgs<T>) {}

compose((i: string) => 3);
compose((i: string) => 3, (i: number) => i);
compose((i: string) => 3, (i: string) => i);
compose((i: string) => 3, (i: number) => i, (i: number) => i, (i: number) => i);
compose((i: string) => 3, (i: number) => i, (i: number) => i, (i: number) => i, (i: string) => i, (i:string) => i);
compose(3);
compose((i: string, j: number) => i);
compose();


