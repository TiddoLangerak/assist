export type Awaitable<T> = T | PromiseLike<T>;
export type AwaitableIterable<T> = AsyncIterable<T> | Iterable<Awaitable<T>>;


/** 
 * Test below kinda shows what we want to achieve.
 * We want to use AwaitableIterable to receive some list of values, with asyncness
 * OPTIONAL at any point in the input (and thus REQUIRED when processing)
 * This means we want to support:
 * - arrays
 * - generators
 * - arrays of promises
 * - async generators
 * - promises of all of the above
 */
function typeTest() {

  async function _(i: Awaitable<AwaitableIterable<string>>) {
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
  _(Promise.resolve(agen()));

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

}

typeTest();
