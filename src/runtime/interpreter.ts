import { NumberVal, RuntimeVal, StringVal } from "./values";
import {
  AssignmentExpr,
  BinaryExpr,
  CallExpr,
  FunctionDeclaration,
  Identifier,
  NumericLiteral,
  ObjectLiteral,
  StringLiteral,
  Program,
  Stmt,
  VarDeclaration,
  MemberExpr,
  IfStatement,
  LogicExpr,
  WhileLoop,
  ImportStatement,
  ClassDeclaration,
  ModuleDeclaration,
  SandboxStatement,
} from "../frontend/ast";
import Environment from "./environment";
import {
  eval_class_declaration,
  eval_function_declaration,
  eval_if_statement,
  eval_import_statement,
  eval_module_declaration,
  eval_program,
  eval_sandbox_statement,
  eval_var_declaration,
  eval_while_loop,
} from "./eval/statements";
import {
  eval_assignment,
  eval_binary_expr,
  eval_call_expr,
  eval_identifier,
  eval_logic_expr,
  eval_member_expr,
  eval_object_expr,
} from "./eval/expressions";
export function evaluate(astNode: Stmt, env: Environment): RuntimeVal {
  switch (astNode.kind) {
    case "NumericLiteral":
      return {
        value: (astNode as NumericLiteral).value,
        type: "number",
      } as NumberVal;
    case "Identifier":
      return eval_identifier(astNode as Identifier, env);
    case "ObjectLiteral":
      return eval_object_expr(astNode as ObjectLiteral, env);
    case "CallExpr":
      return eval_call_expr(astNode as CallExpr, env);
    case "AssignmentExpr":
      return eval_assignment(astNode as AssignmentExpr, env);
    case "BinaryExpr":
      return eval_binary_expr(astNode as BinaryExpr, env);
    case "Program":
      console.log("Interpreting...");
      return eval_program(astNode as Program, env);
    case "MemberExpr":
      return eval_member_expr(astNode as MemberExpr, env);
    // Handle statements
    case "VarDeclaration":
      return eval_var_declaration(astNode as VarDeclaration, env);
    case "FunctionDeclaration":
      return eval_function_declaration(astNode as FunctionDeclaration, env);
    case "IfStatement":
      return eval_if_statement(astNode as IfStatement, env);
    case "LogicExpr":
      return eval_logic_expr(astNode as LogicExpr, env);
    case "WhileLoop":
      return eval_while_loop(astNode as WhileLoop, env);
    case "ImportStatement":
      return eval_import_statement(astNode as ImportStatement, env);
    case "ClassDeclaration":
      return eval_class_declaration(astNode as ClassDeclaration, env);
    case "ModuleDeclaration":
      return eval_module_declaration(astNode as ModuleDeclaration, env);
    case "SandboxStatement":
      return eval_sandbox_statement(astNode as SandboxStatement, env);
    // Handle unimplimented ast types as error.
    default:
      console.error(
        "This AST Node has not yet been setup for interpretation.\n",
        astNode,
      );
      console.log(astNode.kind);
      process.exit(0);
  }
}
