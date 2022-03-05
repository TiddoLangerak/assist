export function logger(name: string) {
  const prefix = `[${name}]`
  return (...args: any[]) => {
    console.debug(new Date(), prefix, ...args);
  }
}
