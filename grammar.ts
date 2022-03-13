import { parseRe, $, Parser, oneOf } from './parser';
import * as ops from './operations';
import { Operation } from './operations';
import { FileSystemSelector, File } from './safefs';
import * as safefs from './safefs';
import { pipe, Predicate } from './function';
import { path, Path } from './path';
import { cwd } from 'process';
import { map } from './awaitableIterable';
import { AwaitableIterable, PromisedIterable } from './promise';

// TODO: can be done cleaner...
let root = cwd();

const listFilePaths = () => pipe(
  safefs.listFiles(path(root), false),
  map((file: File) => file.path)
);

// TODO: add support for quoting
const fileName: Parser<string> = parseRe(/\S+/);

// TODO: support more targets
const files: Parser<Predicate<File>> = $`files`(() => (f: File) => !f.isDir);
// TODO: this one is broken
const folder: Parser<Predicate<File>> = 
  parseRe(/folders|directories|dirs/, (_) => (f: File) => f.isDir);
const target : Parser<FileSystemSelector> = 
  $`files and folders`(() => listFilePaths); 

const addSuffix = (suffix: string) => (input: Path) => path(`${input.fullPath}${suffix}`);
const addSuffixOp = $`add suffix ${fileName}`((suffix: string) => addSuffix(suffix));

const renameOp = addSuffixOp;

const rename : Parser<Operation> = 
  $`${renameOp} to ${target}`(
    (renameOp: (old: Path) => Path, target: FileSystemSelector) => {
      return () => ops.rename(renameOp)(target)
    }
  );

export const grammar = rename;


