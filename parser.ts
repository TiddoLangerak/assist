import { Fn } from './function';
export type ParseResult<T> = { isMatch: false } | { isMatch: true, match: string, result: T };
export type Parser<T> = (input: string) => ParseResult<T>;
export interface Template<SubParsers extends Parser<unknown>[]> {
  readonly literals: TemplateStringsArray;
  readonly subParsers: SubParsers;
}


type ParseResultType<W> = W extends Parser<infer T> ? T : never;
type ParseResultTypes<Tuple extends [...any[]]> = {
  [Index in keyof Tuple]: ParseResultType<Tuple[Index]>;
};

export const nomatch : ParseResult<any> = { isMatch: false };

export function $<SubParsers extends Parser<unknown>[]>(literals: TemplateStringsArray, ...subParsers: SubParsers) : Template<SubParsers> {
  return {
    literals,
    subParsers
  };
}

export function literal<T>(lit: string, result?: T): T {
  const match = {
    isMatch: true,
    match: lit,
    result: result ? result : lit
  };
  return input => input.startsWith(lit)
    ? match
    : nomatch;
}

export function parseRe<R>(re: RegExp, toResult?: Fn<RegExpMatchArray, R>): Parser<R> {
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

//TODO: would be nice if we could somehow make typescript resolve the type aliasses for ParseResultTypes<ARGS>, but not sure how
export function parse<SubParsers extends Parser<any>[], Result>(template: Template<SubParsers>, builder: (...args: ParseResultTypes<SubParsers>) => Result): Parser<Result> {
  // Map doesn't preserve tuples, and I don't see a way to create a map that can. So we'll need to cast to any
  return input => {
    // TODO: Refactor this, it's a mess
    let match = "";
    // Can't type this yet
    let subResults : any[] = [];

    // Literals and subparsers alternate, starting and ending both with literals
    for (let i = 0; i < template.subParsers.length; i++) {
      const literal = template.literals[i];
      const parser = template.subParsers[i];

      // 1. Parse literal `i`
      if (!input.startsWith(literal)) {
        return nomatch;
      };

      input = input.substr(literal.length);
      match += literal;

      // 2. Parse subparser `i`
      const parseResult = template.subParsers[i](input);
      if (!parseResult.isMatch) {
        return nomatch;
      }
      input = input.substr(parseResult.match.length);
      match += parseResult.match;
      subResults.push(parseResult.result);
    }

    // 3. parse last literal
    const suffix = template.literals[template.literals.length - 1];

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
