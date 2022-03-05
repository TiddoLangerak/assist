// ===== 
// Let's work backwards
import { Path, path } from './path';
import { cwd } from 'process';
import { Awaitable, AwaitableIterable } from './promise';
import * as safefs from './safefs';

type StreamingOpResult = never; // TODO
type OperationResult = null | string | StreamingOpResult;
type Operation = () => Awaitable<OperationResult>;

function execute(op: Operation) {
  const result = op();
  if (result) {
    console.log(result);
  }
}

type Predicate<T> = (input: T) => boolean;
type MapFn<IN, OUT> = (input: IN) => OUT;

type FilesystemSelector = () => Awaitable<AwaitableIterable<Path>>;
type FilesystemOperation = (selector: FilesystemSelector) => Awaitable<OperationResult>;

function rename(map: MapFn<Path, Path>) : FilesystemOperation {
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


function testRename() {
  const addBakSuffix: MapFn<Path, Path> = input => path(`${input.fullPath}.bak`);
  const inputFiles = safefs.listFiles(path(cwd()), false);
  const fileSelector = async function* mapFiles() {
    const files = await inputFiles;
    for await (let file of files) {
      yield file.path;
    }
  }

  rename(addBakSuffix)(() => ({ [Symbol.asyncIterator]: fileSelector }));
}

testRename();
