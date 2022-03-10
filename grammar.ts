import { parse, parseRe, $, Parser } from './parser';
import * as ops from './operations';
import { Operation } from './operations';
import { FileSystemSelector, File } from './safefs';
import * as safefs from './safefs';
import { Fn, pipe } from './function';
import { path, Path } from './path';
import { cwd } from 'process';
import { map } from './awaitableIterable';
import { AwaitableIterable, PromisedIterable } from './promise';

// TODO: probably move this to safefs

// TODO: figure out the pipe version of this
/*
const listFilePaths = () => pipe(
  safefs.listFiles(path(cwd()), false),
  map((file: File) => file.path)
);*/
function listFilePaths() : AwaitableIterable<Path> {
  const files = safefs.listFiles(path(cwd()), false);
  return map((file: File) => file.path)(files);
}

// TODO: add support for quoting
const fileName: Parser<string> = parseRe(/\S+/);

// TODO: support more targets
const target : Parser<FileSystemSelector> = 
  parse($`files and folders`, () => listFilePaths); // TODO: actually filter out files only.

// TODO: make generic. Parse open ended input
const addSuffix = (suffix: string) => (input: Path) => path(`${input.fullPath}${suffix}`);
const addSuffixOp = parse($`add suffix ${fileName}`, (suffix) => addSuffix(suffix));
const renameOp = addSuffixOp;

const rename : Parser<Operation> = 
  parse(
    $`${renameOp} to ${target}`,
    (renameOp: Fn<Path, Path>, target: FileSystemSelector) => {
      return () => ops.rename(renameOp)(target)
    }
  );

export const grammar = rename;


