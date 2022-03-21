import { Fn } from './function';
export type ParseResult<T> = { isMatch: false } | { isMatch: true, readonly match: string, readonly result: T };
export type Parser<T> = (input: string) => ParseResult<T>;


type ParseResultType<W> = W extends Parser<infer T> ? T : never;
type ParseResultTypes<Tuple extends readonly [...any[]]> = {
  [Index in keyof Tuple]: ParseResultType<Tuple[Index]>;
};
type ParseResultBuilder<SubParsers extends readonly [...any[]], Result> = (...argws: ParseResultTypes<SubParsers>) => Result;

export const nomatch : ParseResult<any> = { isMatch: false };

export function $
  <SubParsers extends Parser<unknown>[]>
  (literals: TemplateStringsArray, ...subParsers: SubParsers) 
    : <Result>(builder: ParseResultBuilder<SubParsers, Result>) => Parser<Result> {
  return builder => input => {
    // TODO: Refactor this, it's a mess
    let match = "";
    // Can't type this yet
    let subResults : any[] = [];

    // Literals and subparsers alternate, starting and ending both with literals
    for (let i = 0; i < subParsers.length; i++) {
      const literal = literals[i];
      const parser = subParsers[i];

      // 1. Parse literal `i`
      if (!input.startsWith(literal)) {
        return nomatch;
      };

      input = input.substr(literal.length);
      match += literal;

      // 2. Parse subparser `i`
      const parseResult = subParsers[i](input);
      if (!parseResult.isMatch) {
        return nomatch;
      }
      input = input.substr(parseResult.match.length);
      match += parseResult.match;
      subResults.push(parseResult.result);
    }

    // 3. parse last literal
    const suffix = literals[literals.length - 1];

    if (!input.startsWith(suffix)) {
      return nomatch;
    }
    match += suffix;

    const result = builder(...subResults as any);

    return {
      isMatch: true,
      match,
      result
    };
  };
}

export function literal(value: string): Parser<string>;
export function literal<T>(value: string, result: T): Parser<T>;
export function literal<T>(value: string, result?: T): Parser<T | string>{
  const match = {
    isMatch: true,
    match: value,
    result: result ? result : value
  };
  return input => input.startsWith(value)
    ? match
    : nomatch;
}

export function parseRe<R>
  (re: RegExp, toResult?: Fn<RegExpMatchArray, R>)
    : Parser<R> {
  if (re.global) {
    throw new Error("Cannot use global regexp");
  }
  return input => {
    const reMatch = input.match(re);
    if (!reMatch) {
      return nomatch;
    }
    return {
      isMatch: true,
      match: reMatch[0],
      result: toResult ? toResult(reMatch) : reMatch[0]
    }
  }
}

export function oneOf<T>(...parsers: Parser<T>[]): Parser<T> {
  return input => {
    for (let parser of parsers) {
      const result = parser(input);
      if (result.isMatch) {
        return result;
      }
    }
    return nomatch;
  }
}

export function mapResult<I, O>(parser: Parser<I>, map: (i: I) => O) : Parser<O> {
  return input => {
    const result = parser(input);
    if (result.isMatch) {
      return {
        ...result,
        result: map(result.result)
      }
    }
    return result;
  }
}
