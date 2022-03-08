export function expect(condition: boolean) {
  if (!condition) {
    throw new Error("Failed expectation");
  }
}
