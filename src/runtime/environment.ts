import Parser from "../frontend/parser";
import { evaluate } from "./interpreter";
import { ValueToString } from "./printer";
import {
  StringVal,
  MK_BOOL,
  MK_NATIVE_FN,
  MK_NULL,
  MK_NUMBER,
  MK_STRING,
  RuntimeVal,
  NumberVal,
  MK_OBJECT,
  MK_LIST,
} from "./values";

import modules, { initializeValues } from "./modules";

export function createGlobalEnv() {
  const env = initializeValues(new Environment());
  return env;
}

export default class Environment {
  private parent?: Environment;
  private variables: Map<string, RuntimeVal>;
  private constants: Set<string>;

  constructor(parentENV?: Environment) {
    const global = parentENV ? true : false;
    this.parent = parentENV;
    this.variables = new Map();
    this.constants = new Set();
  }

  public declareVar(
    varname: string,
    value: RuntimeVal,
    constant: boolean,
  ): RuntimeVal {
    if (this.variables.has(varname)) {
      throw `Cannot declare variable ${varname}. As it already is defined.`;
    }

    this.variables.set(varname, value);
    if (constant) {
      this.constants.add(varname);
    }
    return value;
  }

  public assignVar(varname: string, value: RuntimeVal): RuntimeVal {
    const env = this.resolve(varname);

    // Cannot assign to constant
    if (env.constants.has(varname)) {
      throw `Cannot reasign to variable ${varname} as it was declared constant.`;
    }

    env.variables.set(varname, value);
    return value;
  }

  public lookupVar(varname: string): RuntimeVal {
    const env = this.resolve(varname);
    return env.variables.get(varname) as RuntimeVal;
  }

  public resolve(varname: string): Environment {
    if (this.variables.has(varname)) {
      return this;
    }

    if (this.parent == undefined) {
      throw `Cannot resolve '${varname}' as it does not exist.`;
    }

    return this.parent.resolve(varname);
  }

  public deleteVar(varname: string): RuntimeVal {
    if (!this.variables.has(varname)) {
      throw `cannot delete var '${varname}' as it does not exist.`;
    }
    const variable = this.lookupVar(varname);
    this.variables.delete(varname);
    return variable;
  }

  public has(varname: string) {
    return this.variables.has(varname);
  }
  public Variables() {
    return this.variables;
  }
}
