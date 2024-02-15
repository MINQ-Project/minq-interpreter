// https://github.com/maciko84/minq
// -----------------------------------------------------------
// ---------------          PARSER         -------------------
// ---  Responsible for producing AST from the tokens.     ---
// -----------------------------------------------------------
import { constrainedMemory, exit } from "process";
import {
  AssignmentExpr,
  BinaryExpr,
  CallExpr,
  Expr,
  Identifier,
  MemberExpr,
  NumericLiteral,
  ObjectLiteral,
  StringLiteral,
  Program,
  Property,
  Stmt,
  VarDeclaration,
  FunctionDeclaration,
  IfStatement,
  LogicExpr,
  WhileLoop,
  ImportStatement,
  Decl,
  ClassDeclaration,
  List,
  ModuleDeclaration,
  SandboxStatement,
  EnumDeclaration,
} from "./ast";

import { Token, tokenize, TokenType } from "./lexer";
import { isUnparsedSource, tokenToString } from "typescript";

/**
 * Frontend for producing a valid AST from sourcecode
 */
export default class Parser {
  private i: number = 0;
  private tokens: Token[] = [];

  /*
   * Determines if the parsing is complete and the END OF FILE Is reached.
   */
  private not_eof(): boolean {
    return this.tokens[0].type != TokenType.EOF;
  }

  /**
   * Returns the currently available token
   */
  private at() {
    return this.tokens[0] as Token;
  }

  /**
   * Returns the previous token and then advances the tokens array to the next value.
   */
  private eat() {
    const prev = this.tokens.shift() as Token;
    this.i++;
    return prev;
  }

  /**
   * Returns the previous token and then advances the tokens array to the next value.
   *  Also checks the type of expected token and throws if the values dnot match.
   */
  private expect(type: TokenType, err: any) {
    const prev = this.tokens.shift() as Token;
    if (!prev || prev.type != type) {
      console.error(
        "Parser Error:\n",
        err,
        prev,
        " - Expecting: ",
        type,
        " at token: " + this.i.toString(),
      );
      process.exit(1);
    }

    return prev;
  }

  public set(tokens: Token[]) {
    this.tokens = tokens;
  }

  public produceAST(sourceCode: string): Program {
    this.tokens = tokenize(sourceCode);
    const program: Program = {
      kind: "Program",
      body: [],
    };
    // Parse until end of file
    while (this.not_eof()) {
      program.body.push(this.parse_stmt());
    }

    return program;
  }

  // Handle complex statement types
  private parse_stmt(): Stmt {
    // skip to parse_expr
    switch (this.at().type) {
      case TokenType.Let:
      case TokenType.Const:
        return this.parse_var_declaration();
      case TokenType.Fn:
        return this.parse_fn_declaration(undefined);
      case TokenType.ClassKeyword:
        return this.parse_class_declaration();
      case TokenType.If:
        return this.parse_if_statement();
      case TokenType.While:
        return this.parse_while_loop();
      case TokenType.ImportKeyword:
        return this.parse_import_statement();
      case TokenType.ModuleKeyword:
        return this.parse_module_declaration();
      case TokenType.SandboxKeyword:
        return this.parse_sandbox_statement();
      case TokenType.Enum:
        return this.parse_enum_declaration();
      default:
        return this.parse_expr();
    }
  }

  parse_enum_declaration(): Stmt {
    this.eat(); // eat enum keyword
    const name = this.expect(
      TokenType.Identifier,
      "Expected identifier after enum keyword",
    ).value;
    const list: string[] = [];
    this.expect(TokenType.OpenBrace, "Expected open brace in enum declaration");
    while (
      this.at().type !== TokenType.CloseBrace &&
      this.at().type !== TokenType.EOF
    ) {
      if (this.at().type === TokenType.Identifier) {
        list.push(
          this.expect(TokenType.Identifier, "Expected Identifier.").value,
        );
      }

      if (this.at().type === TokenType.Comma) {
        // Consume the comma to move to the next value
        this.eat();
      } else if (this.at().type !== TokenType.CloseBrace) {
        console.error("Parser Error:\n", "Unexpected token in enum", this.at());
        process.exit(1);
      }
    }
    return {
      kind: "EnumDeclaration",
      items: list,
    } as EnumDeclaration;
  }

  parse_sandbox_statement(): Stmt {
    this.eat(); // eat statement keyword

    this.expect(
      TokenType.OpenBrace,
      "Expected open brace after sandbox keyword",
    );
    const body: Stmt[] = [];

    while (
      this.at().type !== TokenType.EOF &&
      this.at().type !== TokenType.CloseBrace
    ) {
      body.push(this.parse_stmt());
    }
    this.expect(
      TokenType.CloseBrace,
      "Expected close brace in sandbox statement",
    );

    let target: undefined | string = undefined;

    if(this.at().type == TokenType.ToKeyword) {
      this.eat(); // eat to keyword
      target = this.expect(TokenType.Identifier, "Expected identifier after 'to' keyword").value;
    }

      return {
      kind: "SandboxStatement",
      body,
      target,
    } as SandboxStatement;
  }
  parse_module_declaration(): Stmt {
    this.eat(); // eat module keyword

    const name = this.expect(
      TokenType.Identifier,
      "Identifier expected after module keyword",
    ).value;
    this.expect(
      TokenType.OpenBrace,
      "Expected open brace after class identifier",
    );
    const items: Decl[] = [];
    while (this.at().type != TokenType.CloseBrace || this.not_eof()) {
      if (this.at().type == TokenType.CloseBrace) break;
      switch (this.at().type) {
        case TokenType.Const:
          items.push(this.parse_var_declaration());
          break;

        case TokenType.Fn:
          const func = this.parse_fn_declaration(false) as FunctionDeclaration;
          items.push(func);
          break;
        default:
          console.error("invaild token found in module: " + this.at().value);
          exit(1);
      }
    }
    this.expect(TokenType.CloseBrace, "expected close brace at end of module");
    return {
      kind: "ModuleDeclaration",
      name: name,
      body: items,
    } as ModuleDeclaration;
  }

  parse_class_declaration(): Stmt {
    this.eat(); // eat class keyword

    const name = this.expect(
      TokenType.Identifier,
      "Identifier expected after class keyword",
    );
    this.expect(
      TokenType.OpenBrace,
      "Expected open brace after class identifier",
    );
    const items: Decl[] = [];
    let constructor: Decl | undefined = undefined;
    while (this.at().type != TokenType.CloseBrace || this.not_eof()) {
      if (this.at().type == TokenType.CloseBrace) break;
      switch (this.at().type) {
        case TokenType.Const:
          items.push(this.parse_var_declaration());
          break;

        case TokenType.Fn:
          const func = this.parse_fn_declaration(false) as FunctionDeclaration;
          if (func.name == "constructor") {
            if (constructor) {
              console.error("cannot create multiple constructors for now!");
            } else {
              constructor = func;
            }
          } else {
            items.push(func);
          }
          break;
        default:
          console.error("invaild token found in class: " + this.at().value);
          exit(1);
      }
    }
    this.expect(TokenType.CloseBrace, "expected close brace at end of class");
    if (constructor == undefined) {
      console.error("undefined constructor in class: " + name.value);
    }
    return {
      kind: "ClassDeclaration",
      name: name.value,
      constructor: constructor,
      body: items,
    } as ClassDeclaration;
  }

  parse_import_statement(): Stmt {
    this.eat(); // eat import keyword
    const name = this.expect(
      TokenType.Identifier,
      "Expected module name in import statement",
    ).value;
    let alias: string | undefined = undefined;

    if (this.at().type == TokenType.AsKeyword) {
      this.eat(); // eat as keyword
      const name = this.expect(
        TokenType.Identifier,
        "Expected alias name after as keyword in import statement",
      );
      alias = name.value;
    }

    return {
      kind: "ImportStatement",
      name,
      alias,
    } as ImportStatement;
  }

  parse_if_statement(): Stmt {
    this.eat(); // eat if keyword

    this.expect(TokenType.OpenParen, "Expected open paren in if statement");
    if (this.tokens[0].type == TokenType.Comma) {
      console.error("Expected value instead of comma");
      exit(-1);
    }
    const argument = this.parse_logic_expr();

    this.expect(TokenType.CloseParen, "Expected close paren in if statement");

    this.expect(TokenType.OpenBrace, "Expected open brace in if statement");

    const body: Stmt[] = [];

    while (
      this.at().type !== TokenType.EOF &&
      this.at().type !== TokenType.CloseBrace
    ) {
      body.push(this.parse_stmt());
    }
    this.expect(TokenType.CloseBrace, "Expected close brace in if statement");
    return {
      kind: "IfStatement",
      body: body,
      value: argument,
    } as IfStatement;
  }

  parse_while_loop(): Stmt {
    this.eat(); // eat while keyword

    this.expect(TokenType.OpenParen, "Expected open paren in while loop");
    if (this.tokens[0].type == TokenType.Comma) {
      console.error("Expected value instead of comma");
      exit(-1);
    }
    const argument = this.parse_logic_expr();

    this.expect(TokenType.CloseParen, "Expected close paren in while loop");

    this.expect(TokenType.OpenBrace, "Expected open brace in while loop");

    const body: Stmt[] = [];

    while (
      this.at().type !== TokenType.EOF &&
      this.at().type !== TokenType.CloseBrace
    ) {
      body.push(this.parse_stmt());
    }
    this.expect(TokenType.CloseBrace, "Expected close brace in while loop");
    return {
      kind: "WhileLoop",
      body: body,
      value: argument,
    } as WhileLoop;
  }

  parse_fn_declaration(islambda?: boolean): Stmt {
    let name = "";
    let lambada;
    this.eat(); // eat function / def keyword
    if (islambda == true && this.at().type !== TokenType.OpenParen) {
      this.expect(
        TokenType.OpenParen,
        "expected open paren in lambda function (can be forced when using function keyword as expression)",
      );
    }

    if (islambda == false && this.at().type !== TokenType.Identifier) {
      this.expect(
        TokenType.Identifier,
        "expected identifier in function (can be forced in classes or modules)",
      );
    }

    if (this.at().type == TokenType.Identifier) {
      name = this.eat().value;
      lambada = false;
    } else {
      lambada = true;
    }

    const args = this.parse_args();
    const params: string[] = [];
    for (const arg of args) {
      if (arg.kind !== "Identifier") {
        console.log(arg);
        throw "Inside function declaration expected parameters to be of type string.";
      }

      params.push((arg as Identifier).symbol);
    }

    this.expect(
      TokenType.OpenBrace,
      "Expected function body following declaration",
    );
    const body: Stmt[] = [];

    while (
      this.at().type !== TokenType.EOF &&
      this.at().type !== TokenType.CloseBrace
    ) {
      body.push(this.parse_stmt());
    }

    this.expect(
      TokenType.CloseBrace,
      "Closing brace expected inside function declaration",
    );

    const fn = {
      lambada,
      body,
      name,
      parameters: params,
      kind: "FunctionDeclaration",
    } as FunctionDeclaration;

    return fn;
  }

  // LET IDENT;
  // ( LET | CONST ) IDENT = EXPR;
  parse_var_declaration(): Stmt {
    const isConstant = this.eat().type == TokenType.Const;
    const identifier = this.expect(
      TokenType.Identifier,
      "Expected identifier name following let | const keywords.",
    ).value;

    this.expect(
      TokenType.Equals,
      "Expected equals token following identifier in var declaration.",
    );

    const declaration = {
      kind: "VarDeclaration",
      value: this.parse_expr(),
      identifier,
      constant: isConstant,
    } as VarDeclaration;

    // Remove the following lines that expect a semicolon
    // this.expect(
    //     TokenType.Semicolon,
    //     "Variable declaration statement must end with semicolon."
    // );

    return declaration;
  }

  // Handle expressions
  private parse_expr(): Expr {
    return this.parse_assignment_expr();
  }

  private parse_assignment_expr(): Expr {
    const left = this.parse_object_expr();

    if (this.at().type == TokenType.Equals) {
      this.eat(); // advance past equals
      const value = this.parse_assignment_expr();
      return { value, assigne: left, kind: "AssignmentExpr" } as AssignmentExpr;
    }

    return left;
  }

  private parse_object_expr(): Expr {
    // { Prop[] }
    if (this.at().type !== TokenType.OpenBrace) {
      return this.parse_additive_expr();
    }

    this.eat(); // advance past open brace.
    const properties = new Array<Property>();

    while (this.not_eof() && this.at().type != TokenType.CloseBrace) {
      const key = this.expect(
        TokenType.Identifier,
        "Object literal key expected",
      ).value;

      // Allows shorthand key: pair -> { key, }
      if (this.at().type == TokenType.Comma) {
        this.eat(); // advance past comma
        properties.push({ key, kind: "Property" } as Property);
        continue;
      } // Allows shorthand key: pair -> { key }
      else if (this.at().type == TokenType.CloseBrace) {
        properties.push({ key, kind: "Property" });
        continue;
      }

      // { key: val }
      this.expect(
        TokenType.Colon,
        "Missing colon following identifier in ObjectExpr",
      );
      const value = this.parse_expr();

      properties.push({ kind: "Property", value, key });
      if (this.at().type != TokenType.CloseBrace) {
        this.expect(
          TokenType.Comma,
          "Expected comma or closing bracket following property",
        );
      }
    }

    this.expect(TokenType.CloseBrace, "Object literal missing closing brace.");
    return { kind: "ObjectLiteral", properties } as ObjectLiteral;
  }

  // Handle Addition & Subtraction Operations
  private parse_additive_expr(): Expr {
    let left = this.parse_multiplicitave_expr();

    while (this.at().value == "+" || this.at().value == "-") {
      const operator = this.eat().value;
      const right = this.parse_multiplicitave_expr();
      left = {
        kind: "BinaryExpr",
        left,
        right,
        operator,
      } as BinaryExpr;
    }

    return left;
  }

  // Handle Multiplication, Division & Modulo Operations
  private parse_multiplicitave_expr(): Expr {
    let left = this.parse_call_member_expr();

    while (
      this.at().value == "/" ||
      this.at().value == "*" ||
      this.at().value == "%"
    ) {
      const operator = this.eat().value;
      const right = this.parse_call_member_expr();
      left = {
        kind: "BinaryExpr",
        left,
        right,
        operator,
      } as BinaryExpr;
    }

    return left;
  }

  // foo.x()()
  private parse_call_member_expr(): Expr {
    const member = this.parse_member_expr();

    if (this.at().type == TokenType.OpenParen) {
      return this.parse_call_expr(member);
    }

    return member;
  }

  private parse_call_expr(caller: Expr): Expr {
    let call_expr: Expr = {
      kind: "CallExpr",
      caller,
      args: this.parse_args(),
    } as CallExpr;

    if (this.at().type == TokenType.OpenParen) {
      call_expr = this.parse_call_expr(call_expr);
    }

    return call_expr;
  }

  private parse_logic_expr(): Expr {
    const left = this.parse_expr();
    if (this.at().type === TokenType.LogicOperator) {
      const BooleanOperator = this.expect(
        TokenType.LogicOperator,
        "Expected logic operator while parsing logic expression.",
      ).value;
      const right = this.parse_expr();
      return {
        left,
        right,
        operator: BooleanOperator,
        kind: "LogicExpr",
      } as LogicExpr;
    } else return left;
  }

  private parse_args(): Expr[] {
    this.expect(TokenType.OpenParen, "Expected open parenthesis");
    let args: Expr[] = [];

    if (this.at().type !== TokenType.CloseParen) {
      args = this.parse_arguments_list();
    }

    this.expect(
      TokenType.CloseParen,
      "Missing closing parenthesis inside arguments list",
    );

    return args;
  }

  private parse_arguments_list(): Expr[] {
    const args: Expr[] = [];

    while (
      this.at().type !== TokenType.CloseParen &&
      this.at().type !== TokenType.EOF
    ) {
      args.push(this.parse_assignment_expr());

      if (this.at().type === TokenType.Comma) {
        // Consume the comma to move to the next argument
        this.eat();
      } else if (this.at().type !== TokenType.CloseParen) {
        console.error(
          "Parser Error:\n",
          "Unexpected token in arguments list",
          this.at(),
        );
        process.exit(1);
      }
    }

    return args;
  }
  private parse_list_expr(): Expr {
    this.expect(
      TokenType.OpenBracket,
      "Expected open bracket at begin of list expression",
    );
    const list: Expr[] = [];

    while (
      this.at().type !== TokenType.CloseBracket &&
      this.at().type !== TokenType.EOF
    ) {
      list.push(this.parse_assignment_expr());

      if (this.at().type === TokenType.Comma) {
        // Consume the comma to move to the next value
        this.eat();
      } else if (this.at().type !== TokenType.CloseBracket) {
        console.error("Parser Error:\n", "Unexpected token in list", this.at());
        process.exit(1);
      }
    }

    this.expect(TokenType.CloseBracket, "Expected Close Bracket after list"); // eat ]

    return {
      kind: "List",
      value: list,
    } as List;
  }

  private parse_member_expr(): Expr {
    let object = this.parse_primary_expr();

    while (
      this.at().type == TokenType.Dot ||
      this.at().type == TokenType.OpenBracket
    ) {
      const operator = this.eat();
      let property: Expr;
      let computed: boolean;

      // non-computed values aka obj.expr
      if (operator.type == TokenType.Dot) {
        computed = false;
        // get identifier
        property = this.parse_primary_expr();
        if (property.kind != "Identifier") {
          throw `Cannonot use dot operator without right hand side being a identifier`;
        }
      } else {
        // this allows obj[computedValue]
        computed = true;
        property = this.parse_expr();
        this.expect(
          TokenType.CloseBracket,
          "Missing closing bracket in computed value.",
        );
      }

      object = {
        kind: "MemberExpr",
        object,
        property,
        computed,
      } as MemberExpr;
    }

    return object;
  }

  // Orders Of Prescidence
  // Assignment
  // Object
  // AdditiveExpr
  // MultiplicitaveExpr
  // Call
  // Member
  // PrimaryExpr

  // Parse Literal Values & Grouping Expressions
  private parse_primary_expr(): Expr {
    const tk = this.at().type;

    // Determine which token we are currently at and return literal value
    switch (tk) {
      case TokenType.String:
        return {
            kind: "StringLiteral",
            value: this.eat().value
        } as StringLiteral;
      // lambda
      case TokenType.Fn:
        return this.parse_fn_declaration(true);
      case TokenType.OpenBracket:
        return this.parse_list_expr();
      // User defined values.
      case TokenType.Identifier:
        return { kind: "Identifier", symbol: this.eat().value } as Identifier;

      // Constants and Numeric Constants
      case TokenType.Number:
        return {
          kind: "NumericLiteral",
          value: parseFloat(this.eat().value),
        } as NumericLiteral;

      // Grouping Expressions
      case TokenType.OpenParen: {
        this.eat(); // eat the opening paren
        const value = this.parse_expr();
        this.expect(
          TokenType.CloseParen,
          "Unexpected token found inside parenthesised expression. Expected closing parenthesis.",
        ); // closing paren
        return value;
      }

      // Unidentified Tokens and Invalid Code Reached
      default:
        console.error("Unexpected token found during parsing!", this.at());
        process.exit(1);
    }
  }
}
