import { expect } from './test';
import { parse, $, ParseResult, nomatch } from './parser';

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
expect(result.isMatch && result.result.chapter === 14);

console.log("Chapter foo", chapterParser("Chapter foo"));
expect(!chapterParser("Chapter foo").isMatch);
