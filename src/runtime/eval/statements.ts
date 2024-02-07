import {
  ClassDeclaration,
  EnumDeclaration,
  FunctionDeclaration,
  IfStatement,
  ImportStatement,
  ModuleDeclaration,
  Program,
  SandboxStatement,
  VarDeclaration,
  WhileLoop,
} from "../../frontend/ast";
import Environment, { createGlobalEnv } from "../environment";
import { evaluate } from "../interpreter";
import {
  BooleanVal,
  ClassVal,
  FunctionValue,
  MK_BOOL,
  MK_ENUM,
  MK_NULL,
  ModuleVal,
  RuntimeVal,
} from "../values";

import modules from "../modules";

export function eval_program(program: Program, env: Environment): RuntimeVal {
  let lastEvaluated: RuntimeVal = MK_NULL();
  for (const statement of program.body) {
    lastEvaluated = evaluate(statement, env);
  }
  return lastEvaluated;
}

export function eval_if_statement(statement: IfStatement, env: Environment) {
  const enviroment = new Environment(env);
  const value = statement.value ? evaluate(statement.value, env) : MK_NULL();
  let lastEvaluated: RuntimeVal = MK_NULL();
  if (value.type == "boolean" && (value as BooleanVal).value) {
    statement.body.forEach((element) => {
      lastEvaluated = evaluate(element, enviroment);
    });
  } else if (value.type != "boolean") {
    throw "If statement requires boolean, given: " + value.type;
  }
  return lastEvaluated;
}

export function eval_while_loop(loop: WhileLoop, env: Environment) {
  let value = loop.value ? evaluate(loop.value, env) : MK_NULL();
  let lastEvaluated: RuntimeVal = MK_NULL();
  while (value.type == "boolean" && (value as BooleanVal).value) {
    const enviroment = new Environment(env);
    loop.body.forEach((element) => {
      lastEvaluated = evaluate(element, enviroment);
    });
    value = loop.value ? evaluate(loop.value, env) : MK_NULL();
  }
  if (value.type != "boolean") {
    throw "While Loop requires boolean, given: " + value.type;
  }
  return lastEvaluated;
}

export function eval_var_declaration(
  declaration: VarDeclaration,
  env: Environment,
): RuntimeVal {
  const value = declaration.value
    ? evaluate(declaration.value, env)
    : MK_NULL();

  return env.declareVar(declaration.identifier, value, declaration.constant);
}

export function eval_import_statement(
  statement: ImportStatement,
  env: Environment,
): RuntimeVal {
  const value = statement.name;
  const name = statement.alias ? statement.alias : value;

  if (!modules.has(value)) {
    throw "import: unknown module '" + value + "'.";
  }

  return env.declareVar(name, modules.get(value) as RuntimeVal, true);
}

export function eval_function_declaration(
  declaration: FunctionDeclaration,
  env: Environment,
): RuntimeVal {
  if (!declaration.lambada) {
    // Create new function scope
    const fn = {
      type: "function",
      name: declaration.name,
      parameters: declaration.parameters,
      declarationEnv: env,
      body: declaration.body,
    } as FunctionValue;

    return env.declareVar(declaration.name, fn, true);
  } else {
    // return function because its a lambada
    const fn = {
      type: "function",
      name: declaration.name,
      parameters: declaration.parameters,
      declarationEnv: env,
      body: declaration.body,
    } as FunctionValue;
    return fn;
  }
}

export function eval_class_declaration(
  declaration: ClassDeclaration,
  env: Environment,
): RuntimeVal {
  // Create new class scope
  const enviroment = new Environment(env);
  declaration.body.forEach((element) => {
    evaluate(element, enviroment);
  });
  evaluate(declaration.constructor, enviroment);
  const cl = {
    type: "class",
    name: declaration.name,
    constructor: enviroment.deleteVar("constructor"),
    body: enviroment.Variables(),
  } as ClassVal;

  return env.declareVar(declaration.name, cl, true);
}

export function eval_module_declaration(
  declaration: ModuleDeclaration,
  env: Environment,
): RuntimeVal {
  // Create new module scope
  const enviroment = new Environment(env);
  declaration.body.forEach((element) => {
    evaluate(element, enviroment);
  });
  const mod = {
    type: "module",
    name: declaration.name,
    body: enviroment.Variables(),
  } as ModuleVal;

  return env.declareVar(declaration.name, mod, true);
}

export function eval_sandbox_statement(
  statement: SandboxStatement,
  env: Environment,
): RuntimeVal {
  // create new sandboxed scope
  const enviroment = createGlobalEnv();
  let last: RuntimeVal = MK_NULL();
  statement.body.forEach((node) => {
    last = evaluate(node, enviroment);
  });

  // return result
  return last;
}

export function eval_enum_declaration(
  declaration: EnumDeclaration,
  env: Environment
): RuntimeVal {
  return env.declareVar(declaration.name, MK_ENUM(...declaration.items), true);
}