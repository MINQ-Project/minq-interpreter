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
