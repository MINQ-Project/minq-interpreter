import {
  MK_MODULE,
  MK_NATIVE_FN,
  MK_NUMBER,
  MK_OBJECT,
  NumberVal,
  ObjectVal,
  RuntimeVal,
} from "../values";
import Environment from "../environment";

// Validate arguments
function validateArgs(args: RuntimeVal[], expectedLength: number): boolean {
  if (args.length !== expectedLength) {
    throw new Error(
      `Expected ${expectedLength} arguments, but got ${args.length}`,
    );
  }
  for (let i = 0; i < args.length; i++) {
    if (args[i].type !== "number") {
      throw new Error(`Argument ${i + 1} must be a number`);
    }
  }
  return true;
}

// ceil(x): Returns the smallest integer greater than or equal to x.
const ceil = MK_NATIVE_FN(
  (args: RuntimeVal[], env: Environment): RuntimeVal => {
    validateArgs(args, 1);
    const x = (args[0] as NumberVal).value;
    return MK_NUMBER(Math.ceil(x));
  },
);

// floor(x): Returns the largest integer less than or equal to x.
const floor = MK_NATIVE_FN(
  (args: RuntimeVal[], env: Environment): RuntimeVal => {
    validateArgs(args, 1);
    const x = (args[0] as NumberVal).value;
    return MK_NUMBER(Math.floor(x));
  },
);

// fabs(x): Returns the absolute value of x.
const fabs = MK_NATIVE_FN(
  (args: RuntimeVal[], env: Environment): RuntimeVal => {
    validateArgs(args, 1);
    const x = (args[0] as NumberVal).value;
    return MK_NUMBER(Math.abs(x));
  },
);

// sqrt(x): Returns the square root of x.
const sqrt = MK_NATIVE_FN(
  (args: RuntimeVal[], env: Environment): RuntimeVal => {
    validateArgs(args, 1);
    const x = (args[0] as NumberVal).value;
    return MK_NUMBER(Math.sqrt(x));
  },
);

// cbrt(x): Returns the cube root of x.
const cbrt = MK_NATIVE_FN(
  (args: RuntimeVal[], env: Environment): RuntimeVal => {
    validateArgs(args, 1);
    const x = (args[0] as NumberVal).value;
    return MK_NUMBER(Math.cbrt(x));
  },
);

// pow(x, y): Returns the value of x raised to the power of y.
const pow = MK_NATIVE_FN((args: RuntimeVal[], env: Environment): RuntimeVal => {
  validateArgs(args, 2);
  const x = (args[0] as NumberVal).value;
  const y = (args[1] as NumberVal).value;
  return MK_NUMBER(Math.pow(x, y));
});

// exp(x): Returns the value of e (Euler's number) raised to the power of x.
const exp = MK_NATIVE_FN((args: RuntimeVal[], env: Environment): RuntimeVal => {
  validateArgs(args, 1);
  const x = (args[0] as NumberVal).value;
  return MK_NUMBER(Math.exp(x));
});

// log(x): Returns the natural logarithm of x.
const log = MK_NATIVE_FN((args: RuntimeVal[], env: Environment): RuntimeVal => {
  validateArgs(args, 1);
  const x = (args[0] as NumberVal).value;
  return MK_NUMBER(Math.log(x));
});

// logTen(x): Returns the base 10 logarithm of x.
const logTen = MK_NATIVE_FN(
  (args: RuntimeVal[], env: Environment): RuntimeVal => {
    validateArgs(args, 1);
    const x = (args[0] as NumberVal).value;
    return MK_NUMBER(Math.log10(x));
  },
);

// cos(x): Returns the cosine of the angle x (expressed in radians).
const cos = MK_NATIVE_FN((args: RuntimeVal[], env: Environment): RuntimeVal => {
  validateArgs(args, 1);
  const x = (args[0] as NumberVal).value;
  return MK_NUMBER(Math.cos(x));
});

// sin(x): Returns the sine of the angle x (expressed in radians).
const sin = MK_NATIVE_FN((args: RuntimeVal[], env: Environment): RuntimeVal => {
  validateArgs(args, 1);
  const x = (args[0] as NumberVal).value;
  return MK_NUMBER(Math.sin(x));
});

// tan(x): Returns the tangent of the angle x (expressed in radians).
const tan = MK_NATIVE_FN((args: RuntimeVal[], env: Environment): RuntimeVal => {
  validateArgs(args, 1);
  const x = (args[0] as NumberVal).value;
  return MK_NUMBER(Math.tan(x));
});

// acos(x): Returns the arccosine (in radians) of x.
const acos = MK_NATIVE_FN(
  (args: RuntimeVal[], env: Environment): RuntimeVal => {
    validateArgs(args, 1);
    const x = (args[0] as NumberVal).value;
    return MK_NUMBER(Math.acos(x));
  },
);

// asin(x): Returns the arcsine (in radians) of x.
const asin = MK_NATIVE_FN(
  (args: RuntimeVal[], env: Environment): RuntimeVal => {
    validateArgs(args, 1);
    const x = (args[0] as NumberVal).value;
    return MK_NUMBER(Math.asin(x));
  },
);

// atan(x): Returns the arctangent (in radians) of x.
const atan = MK_NATIVE_FN(
  (args: RuntimeVal[], env: Environment): RuntimeVal => {
    validateArgs(args, 1);
    const x = (args[0] as NumberVal).value;
    return MK_NUMBER(Math.atan(x));
  },
);

// cosh(x): Returns the hyperbolic cosine of x.
const cosh = MK_NATIVE_FN(
  (args: RuntimeVal[], env: Environment): RuntimeVal => {
    validateArgs(args, 1);
    const x = (args[0] as NumberVal).value;
    return MK_NUMBER(Math.cosh(x));
  },
);

// sinh(x): Returns the hyperbolic sine of x.
const sinh = MK_NATIVE_FN(
  (args: RuntimeVal[], env: Environment): RuntimeVal => {
    validateArgs(args, 1);
    const x = (args[0] as NumberVal).value;
    return MK_NUMBER(Math.sinh(x));
  },
);

// cot(x): Returns the cotangent of the angle x (expressed in radians).
const cot = MK_NATIVE_FN((args: RuntimeVal[], env: Environment): RuntimeVal => {
  validateArgs(args, 1);
  const x = (args[0] as NumberVal).value;
  if (Math.tan(x) === 0) {
    throw new Error("Math error: Division by zero");
  }
  return MK_NUMBER(1 / Math.tan(x));
});

// randomInt(min, max): Returns a random integer between min (inclusive) and max (inclusive).
const randomInt = MK_NATIVE_FN(
  (args: RuntimeVal[], env: Environment): RuntimeVal => {
    validateArgs(args, 2);
    const min = (args[0] as NumberVal).value;
    const max = (args[1] as NumberVal).value;
    if (!Number.isInteger(min) || !Number.isInteger(max)) {
      throw new Error("Both arguments must be integers");
    }
    return MK_NUMBER(Math.floor(Math.random() * (max - min + 1)) + min);
  },
);

// randomFloat(min, max): Returns a random float between min (inclusive) and max (exclusive).
const randomFloat = MK_NATIVE_FN(
  (args: RuntimeVal[], env: Environment): RuntimeVal => {
    validateArgs(args, 2);
    const min = (args[0] as NumberVal).value;
    const max = (args[1] as NumberVal).value;
    return MK_NUMBER(Math.random() * (max - min) + min);
  },
);

const dict = new Map<string, RuntimeVal>();

dict.set("ceil", ceil);
dict.set("floor", floor);
dict.set("fabs", fabs);
dict.set("sqrt", sqrt);
dict.set("cbrt", cbrt);
dict.set("pow", pow);
dict.set("exp", exp);
dict.set("log", log);
dict.set("log_ten", logTen);

dict.set("cos", cos);
dict.set("sin", sin);
dict.set("tan", tan);
dict.set("acos", acos);
dict.set("asin", asin);
dict.set("atan", atan);
dict.set("cosh", cosh);
dict.set("sinh", sinh);
dict.set("cot", cot);

dict.set("random_int", randomInt);
dict.set("random_float", randomFloat);

dict.set("pi", MK_NUMBER(Math.PI));
dict.set("e", MK_NUMBER(Math.E));

export default MK_MODULE("math", MK_OBJECT(dict) as ObjectVal);
