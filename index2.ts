// ===== 
// Let's work backwards
import { Path, path } from './path';
import { rename as fsRename } from './safefs';

type StreamingOpResult = never; // TODO
type OperationResult = null | string | StreamingOpResult;
type Operation = () => OperationResult;

function execute(op: Operation) {
  const result = op();
  if (result) {
    console.log(result);
  }
}

type Predicate<T> = (input: T) => boolean;
type MapFn<IN, OUT> = (input: IN) => OUT;

type FilesystemSelector = () => Iterable<Path>;
type FilesystemOperation = (selector: FilesystemSelector) => OperationResult;

function rename(map: MapFn<Path, Path>) : FilesystemOperation {
  return (selector) => {
    const paths = selector();
    for (let oldPath of paths) {
      const newPath = map(oldPath);
      if (newPath !== oldPath) {
        fsRename(oldPath, newPath);
      }
    };
    return "";
  }
}


function testRename() {
  const addBakSuffix: MapFn<Path, Path> = input => path(`${input.fullPath}.bak`);
  const inputFiles = [path("/foo/bar"), path("/foo/bar/baz.bar"), path("/foo/bar", "qux")];
  const fileSelector = () => inputFiles;

  rename(addBakSuffix)(fileSelector);
}

testRename();
