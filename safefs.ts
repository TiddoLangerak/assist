import { Path } from './path';
import { logger } from './debug';
const dryrunLog = logger('safefs-dryrun');
const dryrun = true;

interface SafeFs {
  rename: (from: Path, to: Path) => void;
}

const dryrunFs: SafeFs = {
  rename(from: Path, to: Path) {
    dryrunLog(`Renaming ${from.fullPath} to ${to.fullPath}`);
  }
}

function _<FUNC extends keyof SafeFs>(key: FUNC): SafeFs[FUNC] {
  if (!dryrun) {
    throw new Error("Not yet implemented");
  }
  return dryrunFs[key];
}

export const rename = _('rename');
