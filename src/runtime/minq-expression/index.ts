import { appendFileSync, readFileSync, writeFileSync } from "fs";
import { MK_NATIVE_FN, RuntimeVal, MK_STRING, StringVal, MK_NULL, MK_OBJECT, MK_MODULE, FunctionValue, ModuleVal, ObjectVal, MK_RUNTIMEVAL } from "../values";
import validateArgs from "../param-checker";
import Environment from "../environment";
import { evaluate } from "../interpreter";
import modules from "../modules";
import e from "express";
import { throwError } from "../error-handler";
// minq (or mq) is a main function of MINQ!

function _MK_THEN_FUNCTION(val: RuntimeVal) {
    const func = MK_NATIVE_FN((args, env) => {
        if(!validateArgs(args, { type: [ "function" ], count: 1 })) {
            throwError("then(): Invaild args", env);
            return MK_NULL();
        }
        else {
            // evaluate function
            const enviroment = new Environment(env);
            const f = (args[0] as FunctionValue)
            if(f.parameters.length < 1) {
                throwError("invaild function. at least 1 args", env);
            }
            enviroment.declareVar(f.parameters[0], val, true);
            let last: RuntimeVal = MK_NULL();
            f.body.forEach((element) => {
                last = evaluate(element, enviroment);
            });
            return last;
        }
    });
    return func
}

function _MK_FILE_REFERENCE(file: string) {
    const map = new Map<string, RuntimeVal>();
    map.set("read", MK_NATIVE_FN((args, env) => {
        if(args.length !== 0) {
            throwError("MINQ QUERY ERROR: args are invaild!", env);
            return MK_NULL();
        }
        else return MK_STRING(readFileSync(file).toString());
    }))
    map.set("write", MK_NATIVE_FN((args, env) => {
        if(!validateArgs(args, {
            type: [ "string" ],
            count: 1
        })) {
            throwError("MINQ QUERY ERROR: args are invaild!", env);
            return MK_NULL();
        }
        else {
            writeFileSync(file, (args[0] as StringVal).value)
            return MK_NULL();
        }
    }))
    map.set("append", MK_NATIVE_FN((args, env) => {
        if(!validateArgs(args, {
            type: [ "string" ],
            count: 1
        })) {
            throwError( "MINQ QUERY ERROR: args are invaild!", env );
            return MK_NULL();
        }
        else {
            appendFileSync(file, (args[0] as StringVal).value)
            return MK_NULL();
        }
        
    }))    
    
    map.set("json", MK_NATIVE_FN((args, env) => {
        if(args.length !== 0) {
            throwError( "MINQ QUERY ERROR: args are invaild!", env );
            return MK_NULL();
        }
        else {
            try {
                return MK_RUNTIMEVAL(JSON.parse(readFileSync(file).toString()));
            }
            catch(error) {
                throwError( "An unknown Error experienced! )-:", env )
                return MK_NULL();
            }
        }
    }));

    map.set("then", _MK_THEN_FUNCTION(MK_OBJECT(map)));
    return MK_OBJECT(map);
}

function _MK_MODULE_REFERENCE(name: string, env: Environment) {
    if(!modules.has(name)) {
        throwError("MODULE ERROR: no build-in-module named " + name, env);
        return MK_NULL();
    }
    else {
        const module = modules.get(name)
        let module2 = (module as ModuleVal).body;
        module2.set("then", _MK_THEN_FUNCTION(MK_MODULE((module as ModuleVal).name, MK_OBJECT(module2) as ObjectVal)))
        return MK_MODULE((module as ModuleVal).name, MK_OBJECT(module2) as ObjectVal);
    }
}

function _MK_MINQ_OBJ(tokens: string, env: Environment) {
    if(tokens.charAt(0) === "@") {
        return _MK_MODULE_REFERENCE(tokens.substring(1, tokens.length), env);
    }
    else if (tokens.charAt(0) === "#") {
        return _MK_FILE_REFERENCE(tokens.substring(1, tokens.length))
    }
    else {
         throwError("ERROR: INVAILD MINQ EXPRESSION: " + tokens, env);
         return MK_NULL();
    }

}

const minq = MK_NATIVE_FN((args, env) => {
    if(!validateArgs(args, {type: [ "string"], count: 1})) {
        throwError("ERROR: INVAILD ARGS IN MINQ EXPRESSION", env);
        return MK_NULL();
    }
    else return _MK_MINQ_OBJ((args[0] as StringVal).value, env);
});
export default minq;