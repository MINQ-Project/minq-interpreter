import validateArgs from "../param-checker";
import { throwError } from "../error-handler";
import {
  BooleanVal,
  MK_BOOL,
  MK_MODULE,
  MK_NATIVE_FN,
  MK_NULL,
  MK_OBJECT,
  ObjectVal,
  RuntimeVal,
} from "../values";

const not = MK_NATIVE_FN((args, env) => {
  if (
    !validateArgs(args, {
      type: ["boolean"],
      count: 1,
    })
  ) {
    throwError("LOGIC: invaild args", env);
    return MK_NULL();
  }
  return MK_BOOL(!(args[0] as BooleanVal).value);
});

const and = MK_NATIVE_FN((args, env) => {
  if (
    !validateArgs(args, {
      type: ["boolean"],
      count: 2,
    })
  ) {
    throwError("LOGIC: invaild args", env);
    return MK_NULL();
  }
  return MK_BOOL(
    (args[0] as BooleanVal).value && (args[1] as BooleanVal).value,
  );
});

const nand = MK_NATIVE_FN((args, env) => {
  if (
    !validateArgs(args, {
      type: ["boolean"],
      count: 2,
    })
  ) {
    throwError("LOGIC: invaild args", env);
    return MK_NULL();
  }
  return MK_BOOL(
    !((args[0] as BooleanVal).value && (args[1] as BooleanVal).value),
  );
});

const or = MK_NATIVE_FN((args, env) => {
  if (
    !validateArgs(args, {
      type: ["boolean"],
      count: 2,
    })
  ) {
    throwError("LOGIC: invaild args", env);
    return MK_NULL();
  }
  return MK_BOOL(
    (args[0] as BooleanVal).value || (args[1] as BooleanVal).value,
  );
});

const nor = MK_NATIVE_FN((args, env) => {
  if (
    !validateArgs(args, {
      type: ["boolean"],
      count: 2,
    })
  ) {
    throwError("LOGIC: invaild args", env);
    return MK_NULL();
  }
  return MK_BOOL(
    !((args[0] as BooleanVal).value || (args[1] as BooleanVal).value),
  );
});

const xor = MK_NATIVE_FN((args, env) => {
  if (
    !validateArgs(args, {
      type: ["boolean"],
      count: 2,
    })
  ) {
    throwError("LOGIC: invaild args", env);
    return MK_NULL();
  }
  const left = (args[0] as BooleanVal).value;
  const right = (args[1] as BooleanVal).value;
  return MK_BOOL((left || right) && !(left && right));
});

const nxor = MK_NATIVE_FN((args, env) => {
  if (
    !validateArgs(args, {
      type: ["boolean"],
      count: 2,
    })
  ) {
    throwError("LOGIC: invaild args", env);
    return MK_NULL();
  }
  const left = (args[0] as BooleanVal).value;
  const right = (args[1] as BooleanVal).value;
  return MK_BOOL(!((left || right) && !(left && right)));
});

const map = new Map<string, RuntimeVal>();
map.set("not", not);
map.set("and", and);
map.set("or", or);
map.set("xor", xor);

map.set("nand", nand);
map.set("nor", nor);
map.set("nxor", nxor);
export default MK_MODULE("logic", MK_OBJECT(map) as ObjectVal);
