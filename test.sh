#!/bin/bash
set -e;

trap 'rm -f "$TMPFILE"' EXIT

TMPFILE=$(mktemp -p . "test.XXXXXX.ts")

for t in *.test.ts **/*.test.ts; do 
  echo "console.error(\"Testing $t\n\n\")" >> $TMPFILE;
  echo "import \"./$t\";" >> $TMPFILE;
done;
ts-node $TMPFILE > /dev/null;
