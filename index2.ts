// ===== 
// Let's work backwards
import { Path, path } from './path';
import { cwd } from 'process';
import { Awaitable, AwaitableIterable } from './promise';
import * as safefs from './safefs';

type StreamingOpResult = never; // TODO
type OperationResult = null | string | StreamingOpResult;
type Operation = () => Awaitable<OperationResult>;

async function execute(op: Operation) {
  const result = await op();
  if (result) {
    console.log(result);
  }
}

type Predicate<T> = (input: T) => boolean;
type MapFn<IN, OUT> = (input: IN) => OUT;

type FileSystemSelector = () => Awaitable<AwaitableIterable<Path>>;
type FileSystemOperation = (selector: FileSystemSelector) => Awaitable<OperationResult>;

function rename(map: MapFn<Path, Path>) : FileSystemOperation {
  return async (selector) => {
    const paths = await selector();

    for await (let oldPath of paths) {
      const newPath = map(oldPath);
      if (newPath !== oldPath) {
        // TODO: parallel and all that shit
        await safefs.rename(oldPath, newPath);
      }
    };
    return "";
  }
}

interface Command {
  execute: Operation;
}

interface FileSystemCommand extends Command {
  readonly operation: FileSystemOperation;
  readonly selector: FileSystemSelector;
}

function fileSystemCommand(operation: FileSystemOperation, selector: FileSystemSelector): FileSystemCommand {
  return {
    operation, selector,
    execute: () => operation(selector)
  };
}


// Parser stuff

interface Template<SubParsers extends Parser<unknown>[]> {
  readonly literals: TemplateStringsArray;
  readonly subParsers: SubParsers;
}

type ParseResult<T> = { isMatch: false } | { isMatch: true, match: string, result: T };
  
type Parser<T> = (input: string) => ParseResult<T>;

function $<SubParsers extends Parser<unknown>[]>(literals: TemplateStringsArray, ...subParsers: SubParsers) : Template<SubParsers> {
  return {
    literals,
    subParsers
  };
}

type ParseResultType<W> = W extends Parser<infer T> ? T : never;
type ParseResultTypes<Tuple extends [...any[]]> = {
  [Index in keyof Tuple]: ParseResultType<Tuple[Index]>;
};

const nomatch : ParseResult<any> = { isMatch: false };

//TODO: would be nice if we could somehow make typescript resolve the type aliasses for ParseResultTypes<ARGS>, but not sure how
function match<SubParsers extends Parser<any>[], Result>(template: Template<SubParsers>, builder: (...args: ParseResultTypes<SubParsers>) => Result): Parser<Result> {
  // Map doesn't preserve tuples, and I don't see a way to create a map that can. So we'll need to cast to any
  return input => {
    // TODO: Refactor this, it's a mess
    let match = "";
    // Can't type this yet
    let subResults : any[] = [];

    // Literals and subparsers alternate, starting and ending both with literals
    for (let i = 0; i < template.subParsers.length; i++) {
      const literal = template.literals[i];
      const parser = template.subParsers[i];

      // 1. Parse literal `i`
      if (!input.startsWith(literal)) {
        return nomatch;
      };

      input = input.substr(literal.length);
      match += literal;

      // 2. Parse subparser `i`
      const parseResult = template.subParsers[i](input);
      if (!parseResult.isMatch) {
        return nomatch;
      }
      match += parseResult.match;
      subResults.push(parseResult.result);
    }

    // 3. parse last literal
    const suffix = template.literals[template.literals.length - 1];

    if (!input.startsWith(suffix)) {
      return nomatch;
    }
    match += suffix;

    const result = builder(...subResults as any);

    return {
      isMatch: true,
      match,
      result
    };
  };
}

/**
 * The major TODO update.
 * What's working: 
 *  - Parsing constants
 *  - Extracting results from a match
 *  - Combining parsers
 * What's not yet working:
 *  - Lookaheads. TBH, I have absolutely no clue how to do these. 
 *
 * Ideas:
 * - Read up on parsers
 * - Allow parsers to be lazy - though this might not necessarilly work in all cases.
 * - Ignore the problem, and require the grammer to accomodate this. E.g. quotes can be used to combat this.
 *
 * Should probably start with ignoring the problem
 */


// ===== TESTS =====

function expect(condition: boolean) {
  if (!condition) {
    throw new Error("Failed expectation");
  }
}
function testParser() {
  const fooParser = match($`foo`, () => null);

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

  const chapterParser= match($`Chapter ${numberParser}`, (chapter) => ({ chapter }));
  console.log("Chapter 14", chapterParser("Chapter 14"));
  const result = chapterParser("Chapter 14");
  expect(result.isMatch && result.result.chapter === 14);

  console.log("Chapter foo", chapterParser("Chapter foo"));
  expect(!chapterParser("Chapter foo").isMatch);
}

testParser();


function parser<T>(i: T): Parser<T> {
  return (_) => ({ isMatch: true, match:"", result: i });
}
match($`foo ${parser(3)} bar ${parser('baz')}`, (x: number, y: string) => "foo");
//match($`foo ${parser(3)} bar ${parser('baz')}`, (x: number, y: number) => "foo");







// ===== TEST =====


async function testRename() {
  const addBakSuffix: MapFn<Path, Path> = input => path(`${input.fullPath}.bak`);
  const inputFiles = safefs.listFiles(path(cwd()), false);
  const fileSelector = async function* mapFiles() {
    const files = await inputFiles;
    for await (let file of files) {
      yield file.path;
    }
  }

  const command = fileSystemCommand(rename(addBakSuffix), fileSelector);
  await execute(command.execute);
}

testRename();

