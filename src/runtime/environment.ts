import { MK_NULL, RuntimeVal } from "./values";

import { initializeValues } from "./modules";
import { throwError } from "./error-handler";

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
      throwError(`Cannot declare variable ${varname}. As it already is defined.`, this);
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
      throwError(`Cannot reasign to variable ${varname} as it was declared constant.`, this);
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
      throwError(`Cannot resolve '${varname}' as it does not exist.`, this);
      // trick interpreter
      const trickEnv = new Environment();
      trickEnv.declareVar(varname, MK_NULL(), true);
      return trickEnv;
    }

    return this.parent.resolve(varname);
  }

  public deleteVar(varname: string): RuntimeVal {
    if (!this.variables.has(varname)) {
      throwError(`cannot delete var '${varname}' as it does not exist.`, this);
      return MK_NULL();
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