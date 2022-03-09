export type MapFn<In, Out> = (input: In) => Out;


// type PickLastInTuple<T extends any[]> = T extends [...rest: infer U, argn: infer L ] ? L : never;
//

// This works! We can change it to support a compose-like signature
type Tuple<T extends any[]> =
  T extends []
  ? []
  : (
    T extends [head: infer H, ...rest: infer R] 
    ? [H, ...Tuple<R>]
    : never
  );
  //good
  //
type Tuple2<T extends any[]> =
  T extends [infer H]
  ? H
  : (
    T extends [head: infer H, ...rest: infer R]
    ? [H, ...Tuple<R>]
    : never
  );

type ComposeHelper<I, T extends [head: (i: I) => any, ...rest: any[]]> = T;

type Compose1<T extends any[]> =
  T extends [(i: infer I) => infer O]
  ? (i: I) => O
  : (
    T extends [head: (i: infer I) => infer O, ...rest: ComposeHelper<infer O, infer R>]
    ? (i: I) => ReturnType<Compose2<O, R>>
    : never
  );

type Compose2<I, T extends any[]> =
  T extends[(i: I) => infer O]
  ? (i: I) => O
  : (
    T extends [head: (i: I) => infer O, ...rest: ComposeHelper<infer O, infer R>]
    ? (i: I) => ReturnType<Compose2<O, R>>
    : never
  );

const c : Compose1<[(i: string) => number]> = (i: string) => i.length;
const c2: Compose1<[(i: string) => number, (i: number) => [number]]> = (i: string) => [i.length];
const c3: Compose1<[(i: string) => number, (i: string) => [number]]> = (i: string) => [i.length];


const x : Tuple2<[number, string]> = [3, "foo"];
//bad
const y : Tuple2<[number, string]> = [3, "foo", "bar"];
type Test<H, T> = [head:H, ...tail:T[]];
