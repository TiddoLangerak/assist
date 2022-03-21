import { Awaitable } from './promise';
import { AwaitableIterable } from './awaitableIterable';

// Just testing all sorts of scenarios

async function _(i: AwaitableIterable<string>) {
  // Must use for await for AwaitableIterable
  for await (let x of await i) {
    x.substr(0);
  }
}

_(["foo", "bar"]);
_(Promise.resolve(["foo", "bar"]));
_([Promise.resolve("foo"), Promise.resolve("bar")]);
_(Promise.resolve([Promise.resolve("foo"), Promise.resolve("bar")]));

async function* agen() {
  yield "foo"; yield "bar";
}
_(agen());

function* gen() {
  yield "foo"; yield "bar";
}
_(gen());
_(Promise.resolve(gen()));

function* gena() {
  yield Promise.resolve("foo"); yield Promise.resolve("bar");
}

_(gena());
_(Promise.resolve(gena()));

