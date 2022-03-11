#!/bin/bash
set -e;

for t in *.test.ts; do 
  echo "Testing $t";
  ts-node $t > /dev/null;
  printf "\n\n\n";
done;
