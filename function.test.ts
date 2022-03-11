import { expect } from './test';
import { pipe } from './function';

const n: number = pipe("str", (i: string) => i.length, (i: number) => i * 2);
expect(n === 6)

// @ts-expect-error
const n2: string = pipe("str", (i: string) => i.length, (i: number) => i * 2);

// @ts-expect-error
pipe(3, (i: string) => i.length, (i: number) => i * 2);
// @ts-expect-error
pipe("str", (i: string) => i.length, (i: string) => i.length);
