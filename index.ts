const command = process.argv.slice(2).join(" ").trim();

enum Token {
  LITERAL = 'LITERAL',
  SEQUENCE = 'SEQUENCE',
  EACH = 'EACH',
  FILE = 'FILE',
  FOLDER = 'FOLDER',
  OBJECT = 'OBJECT',
}

interface Match {
  token: Token;
  match: string;
  remaining: string;
}

interface SequenceMatch extends Match {
  parts: Match[];
}

type Parser = (input: string) => Match | null;

function match(token: Token, value: string): Parser {
  return input => 
    input.startsWith(value)
      ? {
        token,
        match: value,
        remaining: input.substr(value.length).trimLeft(),
      }
      : null;
}

function _(value: string): Parser {
  return match(Token.LITERAL, value);
}

function oneof(token: Token, ...parsers: Parser[]): Parser {
  return input => {
    for (let parser of parsers) {
      const maybeMatch = parser(input);
      if (maybeMatch) {
        return maybeMatch;
      }
    }
    return null;
  }
}

function sequence(result: Match | null) : SequenceMatch | null {
  return result
    ? {
      ...result,
      parts: [result]
    }
    : result;
}

// TODO: this should implement sentences. With whitespace as separators
function $(...parsers: Parser[]): Parser {
  return input => 
    parsers.slice(1)
      .reduce((result, parser) => {
        if (!result) { return result; };
        const newMatch : Match | null = parser(result.remaining);
        if (newMatch) {
          return {
            // TODO: deal better with whitespace
            token: Token.SEQUENCE,
            match: result.match + ' ' + newMatch.match,
            remaining: newMatch.remaining,
            parts: [...result.parts, newMatch]
          };
        }
        return null;
      }, sequence(parsers[0](input)));
}


const each = oneof(Token.EACH, _("foreach"), _("for each"), _("for every"));
const file = match(Token.FILE, "file");
const folder = oneof(Token.FOLDER, _("directory"), _("folder"), _("dir"));
const object = oneof(Token.OBJECT, file, folder);
const eachObject = $(each, object);




