import { rejects } from "assert";
import {
  MK_MODULE,
  MK_NATIVE_FN,
  MK_NULL,
  MK_OBJECT,
  MK_STRING,
  ObjectVal,
  RuntimeVal,
  StringVal,
} from "../values";
import { readFileSync } from "fs";
import { evaluate } from "../interpreter";
import Parser from "../../frontend/parser";
import Environment from "../environment";
import * as fs from "fs";
import { throwError } from "../error-handler";
import validateArgs from "../param-checker";

const writeFile = MK_NATIVE_FN((args, env) => {
  if (
    args.length != 2 ||
    args[0].type != "string" ||
    args[1].type != "string"
  ) {
    throwError("write(): invaild arguments", env);
    return MK_NULL();
  } else {
    fs.writeFileSync(
      (args[0] as StringVal).value,
      (args[1] as StringVal).value,
    );
    return MK_NULL();
  }
});

const appendFile = MK_NATIVE_FN((args, env) => {
  if (
    !validateArgs(args,
      {
        type: [ "string" ],
        count: 2
      }
    )
  ) {
    throwError("append(): invaild arguments", env);
    return MK_NULL();
  } else {
    fs.appendFileSync(
      (args[0] as StringVal).value,
      (args[1] as StringVal).value,
    );
    return MK_NULL();
  }
});

const readFile = MK_NATIVE_FN((args, env) => {
  if (!validateArgs(args, { type: [ "string" ], count: 1 })) {
    throwError("read(): Invaild args", env);
    return MK_NULL();
  }
  return MK_STRING(readFileSync((args[0] as StringVal).value).toString());
});

const requirefile = MK_NATIVE_FN((args, env) => {
  if (!validateArgs(args, { type: [ "string" ], count: 1 })) {
    throwError("require(): invaild args", env);
    return MK_NULL();
  }

  // evaluate and return result
  const parser = new Parser();
  const enviroment = new Environment(env);
  return evaluate(
    parser.produceAST(readFileSync((args[0] as StringVal).value).toString()),
    enviroment,
  );
});

const map = new Map<string, RuntimeVal>();

map.set("read", readFile);
map.set("write", writeFile);
map.set("append", appendFile);

map.set("require", requirefile);

export default MK_MODULE("file", MK_OBJECT(map) as ObjectVal);
