import { expect } from './test';
import { parse, $, ParseResult, nomatch, parseRe, oneOf } from './parser';

const fooParser = parse($`foo`, () => null);

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

const chapterParser= parse($`Chapter ${numberParser}`, (chapter) => ({ chapter }));
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

const oneOfParser = oneOf(parse($`foo`, () => 3), parse($`bar`, () => 4));
const r1 = oneOfParser("foo");
const r2 = oneOfParser("bar");
const r3 = oneOfParser("something else");
expect(r1.isMatch);
expect(r2.isMatch);
expect(!r3.isMatch);
expect(r1.result === 3);
expect(r2.result === 4);
