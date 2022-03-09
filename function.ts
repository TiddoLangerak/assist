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

class INVALID<T> {};
type INVALID_COMPOSE<T> = (i: INVALID<T>) => INVALID<T>;

type ComposeGuard<T extends any[]> =
  T extends [(i: infer I) => infer O]
  ? T
  : (
    T extends [head: (i: infer I) => infer O, ...rest: ComposeGuard2<infer O, infer R>]
    ? T
    : never
  );

type ComposeGuard2<I, T extends any[]> =
  T extends[(i: I) => infer O]
  ? (i: I) => O
  : (
    T extends [head: (i: I) => infer O, ...rest: ComposeGuard2<infer O, infer R>]
    ? T
    : [never]
  );


type Compose1<T extends any[]> =
  T extends [(i: infer I) => infer O]
  ? (i: I) => O
  : (
    T extends [head: (i: infer I) => infer O, ...rest: infer R]
    ? (i: I) => ReturnType<Compose2<O, R>>
    : INVALID_COMPOSE<T>
  );

type Compose2<I, T extends any[]> =
  T extends[(i: I) => infer O]
  ? (i: I) => O
  : (
    T extends [head: (i: I) => infer O, ...rest: infer R]
    ? (i: I) => ReturnType<Compose2<O, R>>
    : INVALID_COMPOSE<T>
  );

//type Compose3<I, O, T extends [(i: I) => O]> = (i: I) => O;
//type Compose4<I, O1, O2, T extends [head: (i: I) => O1, ...rest: Compose4<

function compose<T extends any[]>(...funcs: ComposeGuard<T>) : Compose1<T> {
  return null as any;
}

const cc = compose((i: string) => i.length);
const r: number = cc("foo");
const cc2 = compose((i: string) => i.length, (n: number) => [n]);
const r2: number[] = cc2("fo");
const ic = compose((i: string) => i.length, (i: string) => i.length);
const r3 : string = ic("foo");

type Simple<I> = I extends number ? I : never;
const s : Simple<number> = 3;
const s2: Simple<string> = 3;

const c : Compose1<[(i: string) => number]> = (i: string) => i.length;
const c2: Compose1<[(i: string) => number, (i: number) => [number]]> = (i: string) => [i.length];
const c3: Compose1<[(i: string) => number, (i: string) => [number]]> = (i: string) => [i.length];


const x : Tuple2<[number, string]> = [3, "foo"];
//bad
const y : Tuple2<[number, string]> = [3, "foo", "bar"];
type Test<H, T> = [head:H, ...tail:T[]];
