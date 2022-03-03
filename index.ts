const command = process.argv.slice(2).join(" ");

const noargs = new Map<string, string>();

enum Token {
  LITERAL,
  SENTENCE,
  EACH,
  FILE,
  FOLDER
}

interface Match {
  token: Token;
  match: string;
  remaining: string;
  args: Map<string, string>
}

type Parser = (input: string) => Match | null;

function match(token: Token, value: string): Parser {
  return input => 
    input.startsWith(value)
      ? {
        token,
        match: value,
        remaining: input.substr(value.length),
        args: noargs
      }
      : null;
}

function _(value: string): Parser {
  return match(literal, string);
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

// TODO: this should implement sentences. With whitespace as separators
function $(...parsers: Parser[]): Parser {
  
}


const each = oneof(Token.EACH, _("foreach"), _("for each"), _("for every"));
const file = match(Token.FILE, "file");
const folder = oneof(Token.FOLDER, _("directory"), _("folder"), _("dir"));
const object = oneof(Token.OBJECT, file, folder);
const eachObject = $(each, object);




