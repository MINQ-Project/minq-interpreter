import {
  AssignmentExpr,
  BinaryExpr,
  CallExpr,
  Identifier,
  LogicExpr,
  MemberExpr,
  ObjectLiteral,
} from "../../frontend/ast";
import Environment from "../environment";
import { evaluate } from "../interpreter";
import { ValueToString } from "../printer";
import {
  BooleanVal,
  ClassVal,
  FunctionValue,
  ListVal,
  MK_BOOL,
  MK_NULL,
  MK_NUMBER,
  ModuleVal,
  NativeClassVal,
  NativeFnValue,
  NumberVal,
  ObjectVal,
  RuntimeVal,
  StringVal,
} from "../values";

function eval_numeric_binary_expr(
  lhs: NumberVal,
  rhs: NumberVal,
  operator: string,
): NumberVal {
  let result: number;
  if (operator == "+") {
    result = lhs.value + rhs.value;
  } else if (operator == "-") {
    result = lhs.value - rhs.value;
  } else if (operator == "*") {
    result = lhs.value * rhs.value;
  } else if (operator == "/") {
    if (rhs.value == 0) {
      throw "ERROR: DIVISION BY ZERO!";
    }
    result = lhs.value / rhs.value;
  } else {
    result = lhs.value % rhs.value;
  }

  return { value: result, type: "number" };
}

/**
 * Evaulates expressions following the binary operation type.
 */
export function eval_binary_expr(
  binop: BinaryExpr,
  env: Environment,
): RuntimeVal {
  const lhs = evaluate(binop.left, env);
  const rhs = evaluate(binop.right, env);

  // Only currently support numeric operations
  if (lhs.type == "number" && rhs.type == "number") {
    return eval_numeric_binary_expr(
      lhs as NumberVal,
      rhs as NumberVal,
      binop.operator,
    );
  }

  // One or both are NULL
  return MK_NULL();
}

export function eval_logic_expr(
  logexpr: LogicExpr,
  env: Environment,
): RuntimeVal {
  function getHashCode(val: RuntimeVal) {
    const type = val.type;
    let hash = 1;
    type.split("").forEach((char) => {
      hash *= char.charCodeAt(0);
    });
    if (type == "boolean") {
      if ((val as BooleanVal).value) {
        hash *= 2;
        return hash;
      } else {
        hash *= 3;
        return hash;
      }
    } else if (type == "string") {
      (val as StringVal).value.split("").forEach((char) => {
        hash *= char.charCodeAt(0);
      });
      return hash;
    } else if (type == "object") {
      (val as ObjectVal).properties.forEach((value, key) => {
        key.split("").forEach((char) => {
          hash += char.charCodeAt(0);
        });
        hash += getHashCode(value);
      });
    } else if (type === "native-fn" || type === "function") {
      throw "Cannot compare functions!";
    } else if (type === "null") {
      return hash;
    } else if (type === "list") {
      (val as ListVal).elements.forEach((el) => {
        hash *= getHashCode(el);
      });
    } else if (type === "number") {
      hash += (val as NumberVal).value;
    }
    return hash;
  }
  const lhs = evaluate(logexpr.left, env);
  const rhs = evaluate(logexpr.right, env);
  if (logexpr.operator == "==") {
    return MK_BOOL(getHashCode(lhs) == getHashCode(rhs));
  } else if (logexpr.operator == "!=") {
    return MK_BOOL(getHashCode(lhs) != getHashCode(rhs));
  } else if (logexpr.operator == "<") {
    if (lhs.type != "number" || rhs.type != "number") {
      throw "Error: rhs and lhs must be numbers";
    }
    return MK_BOOL((lhs as NumberVal).value < (rhs as NumberVal).value);
  } else if (logexpr.operator == ">") {
    if (lhs.type != "number" || rhs.type != "number") {
      throw "Error: rhs and lhs must be numbers";
    }
    return MK_BOOL((lhs as NumberVal).value > (rhs as NumberVal).value);
  } else return MK_NULL();
}

export function eval_identifier(
  ident: Identifier,
  env: Environment,
): RuntimeVal {
  const val = env.lookupVar(ident.symbol);
  return val;
}

export function eval_assignment(
  node: AssignmentExpr,
  env: Environment,
): RuntimeVal {
  if (node.assigne.kind !== "Identifier") {
    throw `Invalid LHS inaide assignment expr ${JSON.stringify(node.assigne)}`;
  }

  const varname = (node.assigne as Identifier).symbol;
  return env.assignVar(varname, evaluate(node.value, env));
}

export function eval_object_expr(
  obj: ObjectLiteral,
  env: Environment,
): RuntimeVal {
  const object = { type: "object", properties: new Map() } as ObjectVal;
  for (const { key, value } of obj.properties) {
    const runtimeVal =
      value == undefined ? env.lookupVar(key) : evaluate(value, env);

    object.properties.set(key, runtimeVal);
  }

  return object;
}

export function eval_call_expr(expr: CallExpr, env: Environment): RuntimeVal {
  const args = expr.args.map((arg) => evaluate(arg, env));
  const fn = evaluate(expr.caller, env);

  if (fn.type == "list") {
    if (args.length !== 1) {
      throw "invaild arguments for <get list element> expression!";
    }

    if (args[0].type !== "number") {
      throw "invaild arguments for <get list element> expression!";
    }

    if (
      (args[0] as NumberVal).value < -1 ||
      (args[0] as NumberVal).value > (fn as ListVal).elements.length - 1
    ) {
      throw "Index outside of bounds.";
    }

    return (fn as ListVal).elements[(args[0] as NumberVal).value];
  }

  if (fn.type == "class") {
    const func = (fn as ClassVal).constructor;
    const scope = new Environment(func.declarationEnv);

    // Create the variables for the parameters list
    for (let i = 0; i < func.parameters.length; i++) {
      // TODO Check the bounds here.
      // verify arity of function
      const varname = func.parameters[i];
      scope.declareVar(varname, args[i], false);
    }

    let result: RuntimeVal = MK_NULL();
    // Evaluate the function body line by line
    for (const stmt of func.body) {
      result = evaluate(stmt, scope);
    }

    if (result.type !== "object") {
      throw (
        "ERROR: CLASS CONSTRUCTOR MUST RETURN OBJECT, RETURNED: '" +
        result.type +
        "'!"
      );
    }
    return result;
  }

  if (fn.type == "native-cl") {
    const func = (fn as NativeClassVal).constructor;
    const result = func.call(args, env);
    return result;
  }

  if (fn.type == "native-fn") {
    const result = (fn as NativeFnValue).call(args, env);
    return result;
  }

  if (fn.type == "function") {
    const func = fn as FunctionValue;
    const scope = new Environment(func.declarationEnv);

    // Create the variables for the parameters list
    for (let i = 0; i < func.parameters.length; i++) {
      // TODO Check the bounds here.
      // verify arity of function
      const varname = func.parameters[i];
      scope.declareVar(varname, args[i], false);
    }

    let result: RuntimeVal = MK_NULL();
    // Evaluate the function body line by line
    for (const stmt of func.body) {
      result = evaluate(stmt, scope);
    }

    return result;
  }

  throw "Cannot call value that is not a function: " + JSON.stringify(fn);
}

export function eval_member_expr(
  expr: MemberExpr,
  env: Environment,
): RuntimeVal {
  const object = evaluate(expr.object, env);
  const identifier = expr.property;
  if (object.type == "object") {
    if (identifier.kind !== "Identifier") {
      throw "Cannot access nothing other than identifier from object!";
    }

    const object_obj = object as ObjectVal;
    if (!object_obj.properties.has((identifier as Identifier).symbol)) {
      throw (
        "Key '" +
        (identifier as Identifier).symbol +
        "' does not exist in object:\n" +
        ValueToString(object_obj)
      );
    }
    //console.log((expr.property as Identifier).symbol)
    return object_obj.properties.get(
      (identifier as Identifier).symbol,
    ) as RuntimeVal;
  } else if (object.type == "list") {
    if (identifier.kind !== "Identifier") {
      throw "cannot access nothing other that identifier from list.";
    }
    switch ((identifier as Identifier).symbol) {
      case "length":
        return MK_NUMBER((object as ListVal).elements.length);
      default:
        throw (
          "Cannot get '" + (identifier as Identifier).symbol + "' from list!"
        );
    }
  } else if (object.type == "class") {
    if (identifier.kind !== "Identifier") {
      throw "cannot access nothing other that identifier from class.";
    }

    const symbol = (identifier as Identifier).symbol;
    const enviroment = (object as ClassVal).body;
    if (!enviroment.has(symbol)) {
      throw (
        "class '" +
        (object as ClassVal).name +
        "' does not have static property: " +
        symbol +
        "!"
      );
    } else return enviroment.get(symbol) as RuntimeVal;
  } else if (object.type == "native-cl") {
    if (identifier.kind !== "Identifier") {
      throw "cannot access nothing other than identifier from class.";
    }

    const symbol = (identifier as Identifier).symbol;
    const enviroment = (object as NativeClassVal).body;
    if (!enviroment.has(symbol)) {
      throw (
        "native class '" +
        (object as ClassVal).name +
        "' does not have static property: " +
        symbol +
        "!"
      );
    } else return enviroment.get(symbol) as RuntimeVal;
  } else if (object.type == "module") {
    if (identifier.kind !== "Identifier") {
      throw "cannot access nothing other than identifier from module.";
    }

    const symbol = (identifier as Identifier).symbol;
    const enviroment = (object as NativeClassVal).body;
    if (!enviroment.has(symbol)) {
      throw (
        "module '" +
        (object as ModuleVal).name +
        "' does not have property: " +
        symbol +
        "!"
      );
    } else return enviroment.get(symbol) as RuntimeVal;
  } else throw "Object Expression invaild for type " + identifier.kind + "!";
}
