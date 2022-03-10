import { chain } from './chain';
// ======== EXAMPLES ==========

function id<T>(val: T) : T {
  return val;
}

chain((i: string) => 3);
chain((i: string) => 3, id);
// @ts-expect-error 
chain((i: string) => 3, (i: string) => i);
chain((i: string) => 3, (i: number) => i, (i: number) => i, (i: number) => i);
// @ts-expect-error 
chain((i: string) => 3, (i: number) => i, (i: number) => i, (i: number) => i, (i: string) => i, (i:string) => i);
// @ts-expect-error 
chain(3);
// @ts-expect-error 
chain((i: string, j: number) => i);
// @ts-expect-error 
chain();

const x = chain((i: string) => 3, (i: number) => i);
const y: number = x("foo");
// @ts-expect-error 
const y2: string = x("foo");
// @ts-expect-error 
x(3);

