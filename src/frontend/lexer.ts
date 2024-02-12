// https://github.com/maciko84/minq
// -----------------------------------------------------------
// ---------------          LEXER          -------------------
// ---  Responsible for producing tokens from the source   ---
// -----------------------------------------------------------

import { Console } from "console";

// Represents tokens that our language understands in parsing.
export enum TokenType {
  // Literal Types
  Number,
  Identifier,
  String,
  // Keywords
  Let,
  Const,

  // statement keywords
  If,
  While,
  Fn,
  ClassKeyword,
  ModuleKeyword,
  SandboxKeyword,
  Enum,

  // import statement keywords
  ImportKeyword,
  AsKeyword,

  // Grouping * Operators
  BinaryOperator,
  LogicOperator,
  Equals,
  Comma,
  Dot,
  Colon,
  OpenParen, // (
  CloseParen, // )
  OpenBrace, // {
  CloseBrace, // }
  OpenBracket, // [
  CloseBracket, //]
  EOF, // Signified the end of file
}

/**
 * Constant lookup for keywords and known identifiers + symbols.
 */
const KEYWORDS: Record<string, TokenType> = {
  var: TokenType.Let,
  const: TokenType.Const,

  function: TokenType.Fn,
  def: TokenType.Fn,
  class: TokenType.ClassKeyword,
  module: TokenType.ModuleKeyword,
  enum: TokenType.Enum,

  if: TokenType.If,
  while: TokenType.While,
  sandbox: TokenType.SandboxKeyword,

  import: TokenType.ImportKeyword,
  as: TokenType.AsKeyword,
};

// Reoresents a single token from the source-code.
export interface Token {
  value: string; // contains the raw value as seen inside the source code.
  type: TokenType; // tagged structure.
}

// Returns a token of a given type and value
function token(value = "", type: TokenType): Token {
  return { value, type };
}

/**
 * Returns whether the character is vaild in names
 */
function isalpha(src: string) {
  return (
    src === "_" ||
    (src.toUpperCase() !== src.toLowerCase() &&
      ((src >= "a" && src <= "z") || (src >= "A" && src <= "Z")))
  );
}

/**
 * Returns true if the character is whitespace like -> [\s, \t, \n]
 */
function isskippable(str: string) {
  return str == " " || str == "\n" || str == "\t" || str == "\r";
}

/**
 Return whether the character is a valid number -> [0-9] .
 */
function isint(str: string) {
  const c = str.charCodeAt(0);
  const bounds = ["0".charCodeAt(0), "9".charCodeAt(0)];
  return (c >= bounds[0] && c <= bounds[1]) || c == ".".charCodeAt(0);
}

/**
 * Given a string representing source code: Produce tokens and handles
 * possible unidentified characters.
 *
 * - Returns a array of tokens.
 * - Does not modify the incoming string.
 */
export function tokenize(sourceCode: string): Token[] {
  const tokens = new Array<Token>();
  const src = sourceCode.split("");

  // produce tokens until the EOF is reached.
  while (src.length > 0) {
    // COMMENTS
    if (src[0] == "/" && (src[1] == "/" || src[1] == "*")) {
      // ONE LINE COMMENT
      if (src[1] == "/") {
        // remove
        src.shift();
        src.shift();

        // consume comment
        while ((src[0] as string) !== "\n") {
          src.shift();
        }
      }

      // MULTILINE COMMENT
      else if (src[1] == "*") {
        // remove
        src.shift();
        src.shift();

        // consume comment
        while ((src[0] as string) !== "*" && (src[1] as string) !== "/") {
          src.shift();
        }
        // consume */
        src.shift();
        src.shift();
      }
    }

    // LOGIC STATEMENTS
    else if (src[0] == "=" && src[1] == "=") {
      src.shift();
      src.shift();
      tokens.push(token("==", TokenType.LogicOperator));
    } else if (src[0] == "!" && src[1] == "=") {
      src.shift();
      src.shift();
      tokens.push(token("!=", TokenType.LogicOperator));
    } else if (src[0] == ">") {
      src.shift();
      tokens.push(token(">", TokenType.LogicOperator));
    } else if (src[0] == "<") {
      src.shift();
      tokens.push(token("<", TokenType.LogicOperator));
    }
    // ONE CHARACTER TOKENS
    else if (src[0] == "(") {
      tokens.push(token(src.shift(), TokenType.OpenParen));
    } else if (src[0] == ")") {
      tokens.push(token(src.shift(), TokenType.CloseParen));
    } else if (src[0] == "{") {
      tokens.push(token(src.shift(), TokenType.OpenBrace));
    } else if (src[0] == "}") {
      tokens.push(token(src.shift(), TokenType.CloseBrace));
    } else if (src[0] == "[") {
      tokens.push(token(src.shift(), TokenType.OpenBracket));
    } else if (src[0] == "]") {
      tokens.push(token(src.shift(), TokenType.CloseBracket));
    } // HANDLE BINARY OPERATORS
    else if (
      src[0] == "+" ||
      src[0] == "-" ||
      src[0] == "*" ||
      src[0] == "/" ||
      src[0] == "%"
    ) {
      tokens.push(token(src.shift(), TokenType.BinaryOperator));
    } // Handle Conditional & Assignment Tokens
    else if (src[0] == "=") {
      tokens.push(token(src.shift(), TokenType.Equals));
    } else if (src[0] == ":") {
      tokens.push(token(src.shift(), TokenType.Colon));
    } else if (src[0] == ",") {
      tokens.push(token(src.shift(), TokenType.Comma));
    } else if (src[0] == ".") {
      tokens.push(token(src.shift(), TokenType.Dot));
    } // HANDLE MULTICHARACTER KEYWORDS, TOKENS, IDENTIFIERS ETC...
    else if (src[0] == '"') {
      // HANDLE STRING LITERAL
      let literal = "";
      src.shift(); // Remove first quote
      while (src[0] != '"') {
        // check for multilines
        if (src[0] == "\n") {
          console.error(
            "Multiline found in string literal. Use \\n escape sequence instead.",
          );
          process.exit(1);
        }
        // Check for escape sequences
        if (src[0] == "\\") {
          src.shift(); // Skip escape character
          // Handle common escape sequences
          switch (src[0]) {
            case "n":
              literal += "\n";
              break;
            case '"':
              literal += '"';
              break;
            case "\\":
              literal += "\\";
              break;
            // Add more cases if needed
            default:
              // Unrecognized escape sequence
              console.error("Unrecognized escape sequence: \\" + src[0]);
              process.exit(1);
          }
          src.shift();
        } else {
          literal += src.shift();
        }
      }
      // Remove closing quote from source
      src.shift();
      tokens.push(token(literal, TokenType.String))
    } // Handle numeric literals -> Integers
    else if (isint(src[0])) {
      let num = "";
      while (src.length > 0 && isint(src[0])) {
        num += src.shift();
      }
      // append new numeric token.
      tokens.push(token(num, TokenType.Number));
    } // Handle Identifier & Keyword Tokens.
    else if (isalpha(src[0])) {
      let ident = "";
      while (src.length > 0 && isalpha(src[0])) {
        ident += src.shift();
      }
      // CHECK FOR RESERVED KEYWORDS
      const reserved = KEYWORDS[ident];
      // If value is not undefined then the identifier is
      // recognized keyword
      if (typeof reserved == "number") {
        tokens.push(token(ident, reserved));
      } else {
        // Unrecognized name must mean user-defined symbol.
        tokens.push(token(ident, TokenType.Identifier));
      }
    } else if (isskippable(src[0])) {
      // Skip unneeded chars.
      src.shift();
    } // Handle unrecognized characters.
    // TODO: Implement better errors and error recovery.
    else {
      console.error("Unrecognized character found in source: ", src[0]);
      process.exit(1);
    }
  }

  tokens.push({ type: TokenType.EOF, value: "EndOfFile" });
  return tokens;
}
