import Environment from "./environment";
import { Decl, Stmt } from "../frontend/ast";
export type ValueType =
  | "null"
  | "number"
  | "boolean"
  | "object"
  | "native-fn"
  | "function"
  | "string"
  | "class"
  | "module"
  | "native-cl"
  | "list"
  | "enum";

export interface RuntimeVal {
  type: ValueType;
}

/**
 * Defines a value of undefined meaning
 */
export interface NullVal extends RuntimeVal {
  type: "null";
  value: null;
}

export function MK_NULL() {
  return { type: "null", value: null } as NullVal;
}

export interface BooleanVal extends RuntimeVal {
  type: "boolean";
  value: boolean;
}

export function MK_BOOL(b = true) {
  return { type: "boolean", value: b } as BooleanVal;
}

/**
 * Runtime value that has access to the raw native javascript number.
 */
export interface NumberVal extends RuntimeVal {
  type: "number";
  value: number;
}

export function MK_NUMBER(n = 0) {
  return { type: "number", value: n } as NumberVal;
}

/**
 * Runtime value that has access to the raw native javascript number.
 */
export interface ObjectVal extends RuntimeVal {
  type: "object";
  properties: Map<string, RuntimeVal>;
}

export function MK_OBJECT(obj: Map<string, RuntimeVal>) {
  return {
    type: "object",
    properties: obj,
  } as RuntimeVal;
}

export type FunctionCall = (args: RuntimeVal[], env: Environment) => RuntimeVal;

export interface NativeFnValue extends RuntimeVal {
  type: "native-fn";
  call: FunctionCall;
}
export function MK_NATIVE_FN(call: FunctionCall) {
  return { type: "native-fn", call } as NativeFnValue;
}

export interface FunctionValue extends RuntimeVal {
  type: "function";
  name: string;
  parameters: string[];
  declarationEnv: Environment;
  body: Stmt[];
}

export interface ClassVal extends RuntimeVal {
  type: "class";
  name: string;
  constructor: FunctionValue;
  body: Map<string, RuntimeVal>;
}

export interface ModuleVal extends RuntimeVal {
  type: "module";
  name: string;
  body: Map<string, RuntimeVal>;
}

export function MK_MODULE(name: string, properties: ObjectVal) {
  return {
    type: "module",
    name,
    body: properties.properties,
  } as ModuleVal;
}

export interface NativeClassVal extends RuntimeVal {
  type: "native-cl";
  name: string;
  constructor: NativeFnValue;
  body: Map<string, RuntimeVal>;
}

export function MK_NATIVE_CLASS(
  name: string,
  constructor: FunctionCall,
  properties: ObjectVal,
) {
  return {
    type: "native-cl",
    name,
    constructor: MK_NATIVE_FN(constructor),
    body: properties.properties,
  } as NativeClassVal;
}

export interface StringVal extends RuntimeVal {
  type: "string";
  value: string;
}

export function MK_STRING(value: string) {
  return {
    type: "string",
    value,
  } as StringVal;
}

export interface ListVal extends RuntimeVal {
  type: "list";
  elements: RuntimeVal[];
}

export function MK_LIST(...items: RuntimeVal[]) {
  return {
    type: "list",
    elements: items,
  } as ListVal;
}

export interface EnumVal extends RuntimeVal {
  type: "enum";
  elements: string[];
}

export function MK_ENUM(...items: string[]) {
  return {
    type: "enum",
    elements: items,
  } as EnumVal;
}
/**
 * Converts value to RuntimeVal
 * @param value Value to convert.
 * @returns RuntimeVal from value
 */
export function MK_RUNTIMEVAL(value: any): RuntimeVal {
  if (value === null) {
    return MK_NULL();
  } else if (typeof value === 'boolean') {
    return MK_BOOL(value);
  } else if (typeof value === 'number') {
    return MK_NUMBER(value);
  } else if (typeof value === 'string') {
    return MK_STRING(value);
  } else if (Array.isArray(value)) {
    const elements = value.map((element) => MK_RUNTIMEVAL(element));
    return MK_LIST(...elements);
  } else if (typeof value === 'object') {
    const properties = new Map<string, RuntimeVal>();

    for (const key in value) {
      if (value.hasOwnProperty(key)) {
        const innerValue = value[key];
        properties.set(key, MK_RUNTIMEVAL(innerValue));
      }
    }

    return MK_OBJECT(properties);
  } else {
    // Default to null if the type is not supported
    return MK_NULL();
  }
}
/**
 * Converts RuntimeVal to Javascript object
 * @param val RuntimeVal to convert
 * @returns Javascript object from val
 */
export function RuntimeValToJsObject(val: RuntimeVal): any {
  switch(val.type) {
    case "string":
      return (val as StringVal).value
    case "number":
      return (val as NumberVal).value
    case "boolean":
      return (val as BooleanVal).value
    case "object":
      let object = new Map<string, any>();
      // create object
      (val as ObjectVal).properties.forEach((val, key) => {
        object.set(key, RuntimeValToJsObject(val));
      });
      
      return Object.fromEntries(object);
    case "function":
      return "<FUNCTION>"
    case "null":
      return null;
    case "native-fn":
      return (val as NativeFnValue).call;
    case "class":
      return "[CLASS]"
    case "module":
      return "[MODULE]"
    case "native-cl":
      return "[NATIVE-CLASS]"
    case "list":
      // create list
      let list: Array<any> = [];
      (val as ListVal).elements.forEach(element => {
        list.push(RuntimeValToJsObject(element));
      });

      return list;
    case "enum":
      return "[ENUM]"
  }
}