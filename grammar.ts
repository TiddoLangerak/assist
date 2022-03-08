import { parse, $ } from './parser';
import * as ops from './operations';
import { FileSystemSelector } from './safefs';
import { MapFn } from './function';
import { Path } from './path';


const rename = parse($`rename ${target} ${renameOp}`, (target: FileSystemSelector, renameOp: MapFn<Path, Path>) => {
  return () => ops.rename(renameOp)(target)
});

