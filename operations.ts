import { Path } from './path';
import { Awaitable, AwaitableIterable } from './promise';
import { Fn } from './function';
import * as safefs from './safefs';
import { FileSystemSelector } from './safefs';

type StreamingOpResult = never; // TODO
export type OperationResult = null | string | StreamingOpResult;
export type Operation = () => Awaitable<OperationResult>;

export type FileSystemOperation = (selector: FileSystemSelector) => Awaitable<OperationResult>;

export function rename(map: Fn<Path, Path>) : FileSystemOperation {
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


export async function execute(op: Operation) {
  const result = await op();
  if (result) {
    console.log(result);
  }
}
