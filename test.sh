#!/bin/bash

for t in *.test.ts; do 
  echo "Testing $t";
  ts-node $t;
  printf "\n\n\n";
done;
