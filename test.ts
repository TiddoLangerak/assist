export function expect(condition: boolean) : asserts condition is true {
  if (!condition) {
    throw new Error("Failed expectation");
  }
}
