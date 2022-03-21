import { parseRe, $, Parser, oneOf, mapResult } from './parser';
import * as ops from './operations';
import { Operation } from './operations';
import { FileSystemSelector, File } from './safefs';
import * as safefs from './safefs';
import { pipe, Predicate } from './function';
import { path, Path } from './path';
import { cwd } from 'process';
import { AwaitableIterable, map, filter } from './awaitableIterable';
import { PromisedIterable } from './promise';

// TODO: can be done cleaner...
let root = cwd();

const listFilePaths : ((i: Predicate<File>) => AwaitableIterable<Path>) = (fileFilter: Predicate<File>) => 
pipe(
  safefs.listFiles(path(root), false),
  filter(fileFilter),
  map((file: File) => file.path),
  (i: AwaitableIterable<Path>) => i
);

// TODO: add support for quoting
const fileName: Parser<string> = parseRe(/\S+/);

// TODO: support more targets
const files: Parser<Predicate<File>> = $`files`(() => (f: File) => !f.isDir);
// TODO: this one is broken
const folders: Parser<Predicate<File>> = 
  parseRe(/folders|directories|dirs/, (_) => (f: File) => f.isDir);
const filesAndFolders: Parser<Predicate<File>> = oneOf(
  $`${files} and ${folders}`(() => (f: File) => true),
  $`${folders} and ${files}`(() => (f: File) => true),
);

  //TODO: make maps consistent
const target : Parser<FileSystemSelector> = mapResult(
  oneOf(
    files,
    folders,
    filesAndFolders
  ) as Parser<Predicate<File>>, 
  (filter) => () => listFilePaths(filter)
);
  //$`files and folders`(() => listFilePaths); 

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


