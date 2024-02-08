import Parser from "../frontend/parser";
import Environment from "./environment";
import { evaluate } from "./interpreter";
import minqconsole from "./modules/console";
import file from "./modules/file";
import json from "./modules/json";
import logic from "./modules/logic";
import math from "./modules/math";
import web from "./modules/web";
import string from "./native-classes/string";
import validateArgs from "./param-checker";
import { ValueToString } from "./printer";
import {
  MK_BOOL,
  MK_LIST,
  MK_NATIVE_FN,
  MK_NULL,
  MK_NUMBER,
  MK_STRING,
  NumberVal,
  RuntimeVal,
  StringVal,
} from "./values";

export function initializeValues(env: Environment) {
  // Values

  env.declareVar("true", MK_BOOL(true), true);
  env.declareVar("false", MK_BOOL(false), true);
  env.declareVar("null", MK_NULL(), true);

  // Arguments
  const list = new Array<RuntimeVal>();
  process.argv.forEach((element) => {
    list.push(MK_STRING(element));
  });
  env.declareVar("args", MK_LIST(...list), true);
  // global functions
  env.declareVar(
    "eval",
    MK_NATIVE_FN((args, env) => {
      const list = new Array<RuntimeVal>();
      args.forEach((val) => {
        const parser = new Parser();
        const enviroment = new Environment(env);
        if (val.type !== "string") {
          throw "eval(): can eval only string!";
        }

        const program = parser.produceAST((val as StringVal).value);

        list.push(evaluate(program, enviroment));
      });
      return MK_LIST(...list);
    }),
    true,
  );

  env.declareVar(
    "time",
    MK_NATIVE_FN((args, scope) => {
      return MK_NUMBER(Date.now());
    }),
    true,
  );

  env.declareVar(
    "exit",
    MK_NATIVE_FN((args, scope) => {
      if (!validateArgs(args, { type: ["number"], count: 1 })) {
        throw "exit(): INVAILD ARGS!";
      }
      process.exit((args[0] as NumberVal).value);
    }),
    true,
  );

  env.declareVar(
    "to_string",
    MK_NATIVE_FN((args, env) => {
      return MK_STRING(ValueToString(args[0]));
    }),
    true,
  );

  env.declareVar(
    "parse_string",
    MK_NATIVE_FN((args, env) => {
      if (args.length != 1 || args[0].type != "string") {
        throw "parse_string(): invaild args";
      }
      return MK_NUMBER(Number.parseFloat((args[0] as StringVal).value));
    }),
    true,
  );

  env.declareVar(
    "typeof",
    MK_NATIVE_FN((args, env) => {
      if (args.length != 1) {
        throw "typeof(): only one argument required!";
      }
      return MK_STRING(args[0].type);
    }),
    true,
  );

  // modules

  env.declareVar(
    "get_module",
    MK_NATIVE_FN((args, env) => {
      if (args.length != 1 || args[0].type != "string") {
        throw "get_module(): invaild args";
      }
      const str = (args[0] as StringVal).value;
      if (!modules.has(str)) {
        throw "get_module(): unknown module '" + str + "'.";
      }
      return modules.get(str) as RuntimeVal;
    }),
    true,
  );

  // native-classes
  env.declareVar("String", string, true);

  return env;
}

const modules = new Map<string, RuntimeVal>();
modules.set("file", file);
modules.set("math", math);
modules.set("console", minqconsole);
modules.set("logic", logic);
modules.set("web", web);
modules.set("json", json);
export default modules;
