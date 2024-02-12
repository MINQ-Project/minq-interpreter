import { appendFileSync, readFileSync, writeFileSync } from "fs";
import { MK_NATIVE_FN, RuntimeVal, MK_STRING, StringVal, MK_NULL, MK_OBJECT, MK_MODULE, FunctionValue, ModuleVal, ObjectVal } from "./values";
import validateArgs from "./param-checker";
import Environment from "./environment";
import { evaluate } from "./interpreter";
import modules from "./modules";
import e from "express";
// minq (or mq) is a main function of MINQ!

function _MK_THEN_FUNCTION(val: RuntimeVal) {
    const func = MK_NATIVE_FN((args, env) => {
        if(!validateArgs(args, { type: [ "function" ], count: 1 })) {
            throw "then(): Invaild args"
        }
        else {
            // evaluate function
            const enviroment = new Environment(env);
            const f = (args[0] as FunctionValue)
            if(f.parameters.length < 1) {
                throw "invaild function. at least 1 args"
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
            throw "MINQ QUERY ERROR: args are invaild!"
        }
        else return MK_STRING(readFileSync(file).toString());
    }))
    map.set("write", MK_NATIVE_FN((args, env) => {
        if(!validateArgs(args, {
            type: [ "string" ],
            count: 1
        })) {
            throw "MINQ QUERY ERROR: args are invaild!"
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
            throw "MINQ QUERY ERROR: args are invaild!"
        }
        else {
            appendFileSync(file, (args[0] as StringVal).value)
            return MK_NULL();
        }
    }))    
    map.set("then", _MK_THEN_FUNCTION(MK_OBJECT(map)));
    return MK_OBJECT(map);
}

function _MK_MODULE_REFERENCE(name: string) {
    if(!modules.has(name)) {
        throw "MODULE ERROR: no build-in-module named " + name
    }
    else {
        const module = modules.get(name)
        let module2 = (module as ModuleVal).body;
        module2.set("then", _MK_THEN_FUNCTION(MK_MODULE((module as ModuleVal).name, MK_OBJECT(module2) as ObjectVal)))
        return MK_MODULE((module as ModuleVal).name, MK_OBJECT(module2) as ObjectVal);
    }
}

function _MK_MINQ_OBJ(tokens: string) {
    if(tokens.charAt(0) === "@") {
        return _MK_MODULE_REFERENCE(tokens.substring(1, tokens.length));
    }
    else if (tokens.charAt(0) === "#") {
        return _MK_FILE_REFERENCE(tokens.substring(1, tokens.length))
    }
    else throw "ERROR: INVAILD MINQ EXPRESSION: " + tokens;
}

const minq = MK_NATIVE_FN((args, env) => {
    if(!validateArgs(args, {type: [ "string"], count: 1})) {
        throw "ERROR: INVAILD ARGS IN MINQ EXPRESSION";
    }
    else return _MK_MINQ_OBJ((args[0] as StringVal).value);
});
export default minq;