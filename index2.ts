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
// For naming, what I need to think about is this:
// - Every "thing" has multiple representations:
//  - A function that actually performs the operation
//  - An object that represents the (part of) operation, which can be folded into the function
//
//
//
// Do I need both?
// Rename files recursively. Remove prefix matching /\d+\./.
// When reading this word for word:
// Rename -> operation = rename
// files -> selectorFunc = listFiles
// recursively -> selector = listFiles(., true)
// Remove


/*
match(`rename ${fileTarget}. ${renameOp}`, ({ fileTarget, renameOp } : { fileTarget: FileSystemSelector, renameOp : MapFn<Path, Path> } ) => {

});
*/


interface Template<SubParsers extends Parser<unknown>[]> {
  readonly literals: TemplateStringsArray;
  readonly subParsers: SubParsers;
}

type ParseResult<T> = { isMatch: false } | { isMatch: true, result: T };
  
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

//TODO: would be nice if we could somehow make typescript resolve the type aliasses for ParseResultTypes<ARGS>, but not sure how
function match<SubParsers extends Parser<any>[], Result>(template: Template<SubParsers>, builder: (...args: ParseResultTypes<SubParsers>) => Result): Parser<Result> {
  // Map doesn't preserve tuples, and I don't see a way to create a map that can. So we'll need to cast to any
  return input => ({
    isMatch: true,
    result: builder(...template.subParsers.map(subParser => subParser("TODO")) as any)
  });
}
function parser<T>(i: T): Parser<T> {
  return (_) => ({ isMatch: true, result: i });
}
match($`foo ${parser(3)} bar ${parser('baz')}`, (x: number, y: string) => "foo");
match($`foo ${parser(3)} bar ${parser('baz')}`, (x: number, y: number) => "foo");







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

