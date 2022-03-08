import { grammar } from './grammar';
import { expect } from './test';
import { dryrun } from './safefs';

if (!dryrun) {
  throw new Error("Can only test in dryrun mode");
}

const mismatch = grammar("foobar");
expect(!mismatch.isMatch);

const match = grammar("add suffix .bak to files and folders");
expect(match.isMatch);
match.result();

const match2 = grammar("add suffix .wutwut to files and folders");
expect(match2.isMatch);
match2.result();
