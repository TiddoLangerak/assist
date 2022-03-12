import { grammar } from './grammar';
import { expect } from './test';
import { dryrun } from './safefs';

if (!dryrun) {
  throw new Error("Can only test in dryrun mode");
}

async function test() {

  const mismatch = grammar("foobar");
  expect(!mismatch.isMatch);

  const match = grammar("add suffix .bak to files and folders");
  expect(match.isMatch);
  await match.result();

  const match2 = grammar("add suffix .wutwut to files and folders");
  expect(match2.isMatch);
  await match2.result();
}

test();
