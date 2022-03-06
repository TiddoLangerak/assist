import { Path, path } from './path';
import { logger } from './debug';
import * as fs from 'fs/promises';
import { Awaitable, AwaitableIterable } from './promise';

const dryrunLog = logger('safefs-dryrun');
const dryrun = true;

export interface File {
  readonly path: Path;
  readonly isDir: boolean;
}

interface SafeFs {
  rename: (from: Path, to: Path) => Awaitable<void>;
  listFiles: (root: Path, recursive: boolean) => Awaitable<AwaitableIterable<File>>
}

const realFs: SafeFs = {
  rename(from: Path, to: Path) {
    throw new Error("Not yet implemented");
  },
  async listFiles(root: Path, recursive: boolean) {
    if (recursive) {
      throw new Error("Not yet implemented");
    }
    const files = await fs.readdir(root.fullPath, { withFileTypes: true });
    return files.map(file => ({
      path: path(root.fullPath, file.name),
      isDir: file.isDirectory()
    }));
  }
}

const dryrunFs: SafeFs = {
  rename(from: Path, to: Path) {
    dryrunLog(`Renaming ${from.fullPath} to ${to.fullPath}`);
  },
  listFiles: realFs.listFiles
}

function _<FUNC extends keyof SafeFs>(key: FUNC): SafeFs[FUNC] {
  return dryrun
    ? dryrunFs[key]
    : realFs[key];
}

export const rename = _('rename');
export const listFiles = _('listFiles');
