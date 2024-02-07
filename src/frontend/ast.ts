// https://github.com/maciko84/minq

// -----------------------------------------------------------
// --------------          AST TYPES        ------------------
// ---         Defines the structure of MINQ AST           ---
// -----------------------------------------------------------

export type NodeType =
  // STATEMENTS
  | "Program"
  | "VarDeclaration"
  | "FunctionDeclaration"
  | "ClassDeclaration"
  | "ModuleDeclaration"
  | "IfStatement"
  | "WhileLoop"
  | "ImportStatement"
  | "SandboxStatement"
  | "EnumDeclaration"
  // EXPRESSIONS
  | "AssignmentExpr"
  | "MemberExpr"
  | "CallExpr"
  | "LogicExpr"
  | "List"
  // Literals
  | "Property"
  | "ObjectLiteral"
  | "NumericLiteral"
  | "Identifier"
  | "BinaryExpr"
  | "StringLiteral";

/**
 * Statements do not result in a value at runtime.
 They contain one or more expressions internally */
export interface Stmt {
  kind: NodeType;
}

/**
 * Defines a block which contains many statements.
 * -  Only one program will be contained in a file.
 */
export interface Program extends Stmt {
  kind: "Program";
  body: Stmt[];
}

export interface IfStatement extends Stmt {
  kind: "IfStatement";
  value: Expr;
  body: Stmt[];
}

export interface WhileLoop extends Stmt {
  kind: "WhileLoop";
  value: Expr;
  body: Stmt[];
}

export interface ImportStatement extends Stmt {
  kind: "ImportStatement";
  name: string;
  alias?: string;
}

export interface SandboxStatement extends Stmt {
  kind: "SandboxStatement";
  body: Stmt[];
}
/**
 * represents a declaration expressions
 */
export interface Decl extends Stmt {}

export interface VarDeclaration extends Decl {
  kind: "VarDeclaration";
  constant: boolean;
  identifier: string;
  value?: Expr;
}

export interface FunctionDeclaration extends Decl {
  lambada: boolean;
  kind: "FunctionDeclaration";
  parameters: string[];
  name: string;
  body: Stmt[];
}

export interface ClassDeclaration extends Decl {
  kind: "ClassDeclaration";
  constructor: FunctionDeclaration;
  name: string;
  body: Decl[];
}

export interface ModuleDeclaration extends Decl {
  kind: "ModuleDeclaration";
  name: string;
  body: Decl[];
}

export interface EnumDeclaration extends Decl {
  kind: "EnumDeclaration",
  name: string;
  items: string[]
}

/**  Expressions will result in a value at runtime unlike Statements */
export interface Expr extends Stmt {}

export interface AssignmentExpr extends Expr {
  kind: "AssignmentExpr";
  assigne: Expr;
  value: Expr;
}

/**
 * A operation with two sides seperated by a operator.
 * Both sides can be ANY Complex Expression.
 * - Supported Operators -> + | - | / | * | %
 */
export interface BinaryExpr extends Expr {
  kind: "BinaryExpr";
  left: Expr;
  right: Expr;
  operator: string; // needs to be of type BinaryOperator
}

export interface CallExpr extends Expr {
  kind: "CallExpr";
  args: Expr[];
  caller: Expr;
}

export interface MemberExpr extends Expr {
  kind: "MemberExpr";
  object: Expr;
  property: Expr;
  computed: boolean;
}

export interface LogicExpr extends Expr {
  kind: "LogicExpr";
  left: Expr;
  right: Expr;
  operator: string;
}

// LITERAL / PRIMARY EXPRESSION TYPES
/**
 * Represents a user-defined variable or symbol in source.
 */
export interface Identifier extends Expr {
  kind: "Identifier";
  symbol: string;
}

/**
 * Represents a numeric constant inside the soure code.
 */
export interface NumericLiteral extends Expr {
  kind: "NumericLiteral";
  value: number;
}

export interface StringLiteral extends Expr {
  kind: "StringLiteral";
  value: string;
}

export interface Property extends Expr {
  kind: "Property";
  key: string;
  value?: Expr;
}

export interface ObjectLiteral extends Expr {
  kind: "ObjectLiteral";
  properties: Property[];
}

export interface List extends Expr {
  kind: "List";
  value: Expr[];
}
