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
    T extends [head: (i: infer I) => infer O, ...rest: ComposeGuard2<infer O, infer R> extends infer R2 ? (R2 extends any[] ? R2 : [never]) : [never]]
    ? T
    : never
  );

type ComposeGuard2<I, T extends any[]> =
  T extends [(i: I) => infer O]
  ? T 
  : (
    T extends [head: (i: I) => infer O, ...rest: ComposeGuard2<infer O, infer R> extends infer R2 ? (R2 extends any[] ? R2 : [never]) : [never]]
    ? T
    : [never]
  );

function cg(i: ComposeGuard<[(i: number) => number]>) {
}
cg([(i: number) => i]);
function cg2(i: ComposeGuard<[(i: number) => number, (i: number) => string]>) {
}
cg2([(i: number) => i, (i: number) => "foo"]);
function cg3(i: ComposeGuard<[(i: number) => number, (i: string) => string]>) {
}
cg3([(i: number) => i, (i: string) => "foo"]);


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

type ComposeFromArgs<T extends any[]> =
  T extends [infer I, infer O]
    ? [(i:I) => O]
    : (
      T extends [h: infer I, m: infer IO, ...rest: infer R]
      ? [(i:I) => IO, ...ComposeFromArgs<[IO, ...R]>]
      : never
    );

type CG<T extends any[]> =
  T extends [(i: infer I) => infer O]
  ? T
  : (
    T extends [h1: (i: infer I) => infer IO, h2: (i: infer IO) => infer O, ...rest: infer R]
    ? (
      [(i: IO) => O, ...R] extends CG<[(i: IO) => O, ...R]>
        ? T
        : [h: (i: IO) => O, h2: (i: O) => any, ...rest: any[]]
    )
    //: [h: (i: I) => IO, h2: (i: IO) => any, ...rest: any[]]
    //: never
    : ( // Error case
       T extends [h: (i: infer I) => infer O, ...rest: infer R]
        ? [h: (i: I) => O, h2: (i: O) => any, ...rest: any[]]
        : never
    )
  )

  // THIS IS THE ONE!!!
  // It rejects the proper thing
function cg4<T extends any[]>(...funcs: CG<T>) {}

cg4((i: string) => 3);
cg4((i: string) => 3, (i: number) => i);
cg4((i: string) => 3, (i: string) => i);


function composeFromArgs<T extends any[]>(...funcs: ComposeFromArgs<T>) {
  return null as any;
}

composeFromArgs<[string, number]>((i: string) => 3);
composeFromArgs<[string, number, number]>((i: string) => 3, (i: number) => i);
composeFromArgs<[string, string, number]>((i: string) => 3, (i: string) => i);


//type Compose3<I, O, T extends [(i: I) => O]> = (i: I) => O;
//type Compose4<I, O1, O2, T extends [head: (i: I) => O1, ...rest: Compose4<

function compose<T extends any[]>(...funcs: ComposeGuard<T>) : Compose1<T> {
  return null as any;
}
function compose2<T extends any[], R extends Compose1<T>>(...funcs: T) : R {
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
