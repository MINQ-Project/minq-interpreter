import { resolveTypeReferenceDirective } from "typescript";
import { ValueToString } from "../printer";
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
import readlineSync from "readline-sync";
import { throwError } from "../error-handler";
const log = MK_NATIVE_FN((args, scope) => {
  args.forEach((val) => {
    console.log(ValueToString(val));
  });
  return MK_NULL();
});

const readLine = MK_NATIVE_FN((args, scope) => {
  return MK_STRING(readlineSync.question());
});
const map = new Map<string, RuntimeVal>();

const write = MK_NATIVE_FN((args, scope) => {
  args.forEach((val) => {
    if (val.type !== "string") {
      throwError("Error: can write only strings using 'write' method. use 'log' method for support to other types.", scope);
    } else {
      process.stdout.write((val as StringVal).value);
    }
  });
  return MK_NULL();
});

map.set("log", log);
map.set("write", write);
map.set("read_line", readLine);

const minqconsole = MK_MODULE("console", MK_OBJECT(map) as ObjectVal);

export default minqconsole;
