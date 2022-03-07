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


interface Matcher<ARGS extends any[]> {
  readonly args: ARGS;
}

function t<ARGS extends any[]>(strings: TemplateStringsArray, ...args: ARGS) : Matcher<ARGS> {
  return {
    args
  };
}

interface Wrapper<T> {
  readonly val: T
}
type Unwrap<W> = W extends Wrapper<infer T> ? T : never;
type UnwrapTuple<Tuple extends [...any[]]> = {
  [Index in keyof Tuple]: Unwrap<Tuple[Index]>;
};

//TODO: would be nice if we could somehow make typescript resolve the type aliasses for UnwrapTuple<ARGS>, but not sure how
function m3<ARGS extends Wrapper<any>[], RESULT>(matcher: Matcher<ARGS>, parser: (...args: UnwrapTuple<ARGS>) => RESULT): RESULT {
  // Map doesn't preserve tuples, and I don't see a way to create a map that can. So we'll need to cast to any
  return parser(...matcher.args.map(a => a.val) as any);
}
function wrapper<T>(i: T): Wrapper<T> {
  return { val : i };
}
m3(t`foo ${wrapper(3)} bar ${wrapper('baz')}`, (x: number, y: string) => "foo");
m3(t`foo ${wrapper(3)} bar ${wrapper('baz')}`, (x: number, y: number) => "foo");







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

