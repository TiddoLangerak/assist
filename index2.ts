import { Path, path } from './path';
import { cwd } from 'process';
import * as safefs from './safefs';
import { execute, rename, FileSystemSelector, FileSystemOperation, Operation } from './operations';
import { Fn } from './function';
// ===== 
// Let's work backwards

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
  const addBakSuffix: Fn<Path, Path> = input => path(`${input.fullPath}.bak`);
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

