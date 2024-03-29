import { expect } from './test';
import { $, ParseResult, nomatch, parseRe, oneOf, mapResult, Parser } from './parser';

const fooParser = $`foo`(() => null);

console.log("foo", fooParser("foo"));
expect(fooParser("foo").isMatch);

console.log("bar", fooParser("foo"));
expect(!fooParser("bar").isMatch);

console.log("foobar", fooParser("foobar"));
expect(fooParser("foobar").isMatch);

const numberParser = (input: string) : ParseResult<number> => {
  const match = input.match(/^\d+/);
  return match
    ? {
      isMatch: true,
      match: match[0],
      result: Number(match[0])
    }
      : nomatch;
}

const chapterParser= $`Chapter ${numberParser}`((chapter) => ({ chapter }));
console.log("Chapter 14", chapterParser("Chapter 14"));
const result = chapterParser("Chapter 14");
expect(result.isMatch);
expect(result.result.chapter === 14);

console.log("Chapter foo", chapterParser("Chapter foo"));
expect(!chapterParser("Chapter foo").isMatch);

const reChapterParser = parseRe(/Chapter (\d+)/, (match) => Number(match[1]));
const reResult = reChapterParser("Chapter 15");
console.log("Chapter 15", reResult);
expect(reResult.isMatch);
expect(reResult.result === 15);

const oneOfParser = oneOf($`foo`(() => 3), $`bar`(() => 4));
const r1 = oneOfParser("foo");
const r2 = oneOfParser("bar");
const r3 = oneOfParser("something else");
expect(r1.isMatch);
expect(r2.isMatch);
expect(!r3.isMatch);
expect(r1.result === 3);
expect(r2.result === 4);

const p1 : Parser<string> = (i: string) => ({ isMatch: true, result: i, match: i });
const mapped : Parser<number> = mapResult(p1, s => s.length);
const mappedResult = mapped("foo");
expect(mappedResult.isMatch);
expect(mappedResult.result === 3);
expect(mappedResult.match === "foo");
