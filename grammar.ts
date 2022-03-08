import { parse, parseRe, $, Parser } from './parser';
import * as ops from './operations';
import { Operation } from './operations';
import { FileSystemSelector } from './safefs';
import * as safefs from './safefs';
import { MapFn } from './function';
import { path, Path } from './path';
import { cwd } from 'process';

// TODO: probably move this to safefs
async function* listFilePaths() {
  const files = await safefs.listFiles(path(cwd()), false);
  for await (let file of files) {
    yield file.path;
  }
}

// TODO: add support for quoting
const fileName: Parser<string> = parseRe(/\S+/);

// TODO: support more targets
const target : Parser<FileSystemSelector> = 
  parse($`files and folders`, () => listFilePaths); // TODO: actually filter out files only.

// TODO: make generic. Parse open ended input
const addSuffix = (suffix: string) => (input: Path) => path(`${input.fullPath}${suffix}`);
const renameOp : Parser<MapFn<Path, Path>> =
  parse($`add suffix ${fileName}`, (suffix) => addSuffix(suffix));

const rename : Parser<Operation> = 
  parse(
    $`${renameOp} to ${target}`,
    (renameOp: MapFn<Path, Path>, target: FileSystemSelector) => {
      return () => ops.rename(renameOp)(target)
    }
  );

export const grammar = rename;


