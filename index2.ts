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

function hi(strings:TemplateStringsArray, name:string) {     // hi is tag function
  return 4;
}
const x : string = hi`foo ${"bar"}`;


interface Matcher<ARGS extends any[]> {
  args: ARGS;
}

function t<ARGS extends any[]>(strings: TemplateStringsArray, ...args: ARGS) : Matcher<ARGS> {
  return {
    args
  };
}

function m<ARGS extends any[], RESULT>(matcher: Matcher<ARGS>, parser: (...args: ARGS) => RESULT): RESULT {
  return parser(matcher.args);
}

//correct
m(t`foo ${3} bar ${'baz'}`, (x: number, y: string) => "foo");
//incorrect
m(t`foo ${'wut'} bar ${'baz'}`, (x: number, y: string) => "foo");
// TODO: m shouldn't take any as parameters, but should have a structure that allows both matching and extracting the result




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

