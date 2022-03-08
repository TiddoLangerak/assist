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

