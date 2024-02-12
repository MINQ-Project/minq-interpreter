import Environment from "../environment";
import validateArgs from "../param-checker";
import { ValueToString } from "../printer";
import {
  MK_LIST,
  MK_NATIVE_CLASS,
  MK_NATIVE_FN,
  MK_OBJECT,
  MK_STRING,
  NumberVal,
  ObjectVal,
  RuntimeVal,
  StringVal,
} from "../values";

function _construct(args: RuntimeVal[], env: Environment): RuntimeVal {
  let string = "";
  args.forEach((arg) => {
    if (arg.type == "string") {
      string = string + (arg as StringVal).value;
    } else {
      string += ValueToString(arg);
    }
  });
  return MK_STRING(string);
}

function split(args: RuntimeVal[], env: Environment): RuntimeVal {
  if (
    !validateArgs(args, {
      type: ["string"],
      count: 2,
    })
  ) {
    throw "split(): invaild arguments";
  }
  const string = (args[0] as StringVal).value;
  const delimeter = (args[1] as StringVal).value;
  const split = string.split(delimeter);
  const val: RuntimeVal[] = [];
  split.forEach((str) => {
    val.push(MK_STRING(str));
  });
  return MK_LIST(...val);
}

function fromCharCode(args: RuntimeVal[], env: Environment) {
  let string = "";
  if(!validateArgs(args, {
    type: [ "number" ],
    count: undefined
  })) {
    throw "fromCharCode(): invaild args"
  }

  args.forEach((arg) => {
    string += String.fromCharCode((arg as NumberVal).value)
  });
  return MK_STRING(string);
}

const map = new Map<string, RuntimeVal>();

map.set("split", MK_NATIVE_FN(split));
map.set("fromCharCode", MK_NATIVE_FN(fromCharCode))

export default MK_NATIVE_CLASS(
  "String",
  _construct,
  MK_OBJECT(map) as ObjectVal,
);
