import validateArgs from "../param-checker";
import {
  MK_MODULE,
  MK_NATIVE_CLASS,
  MK_NATIVE_FN,
  MK_OBJECT,
  MK_RUNTIMEVAL,
  MK_STRING,
  ObjectVal,
  RuntimeVal,
  RuntimeValToJsObject,
  StringVal,
} from "../values";

const serialize = MK_NATIVE_FN((args, env) => {
  if (
    !validateArgs(args, {
      type: ["boolean", "null", "string", "object", "number", "list"],
      count: 1,
    })
  ) {
    throw "serialize(): invaild args!";
  }
  return MK_STRING(JSON.stringify(RuntimeValToJsObject(args[0])));
});

const deserialize = MK_NATIVE_FN((args, env) => {
  if (!validateArgs(args, { type: ["string"], count: 1 })) {
    throw "deserialize(): invaild args!";
  }
  return MK_RUNTIMEVAL(JSON.parse((args[0] as StringVal).value));
});

const map = new Map<string, RuntimeVal>();
map.set("serialize", serialize);
map.set("deserialize", deserialize);
export default MK_MODULE("json", MK_OBJECT(map) as ObjectVal);
