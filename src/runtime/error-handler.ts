import Environment from "./environment";
import { evaluate } from "./interpreter";
import validateArgs from "./param-checker";
import { ValueToString } from "./printer";
import { FunctionValue, MK_LIST, MK_MODULE, MK_NATIVE_FN, MK_NULL, MK_OBJECT, MK_STRING, ObjectVal, RuntimeVal } from "./values";

// MINQ error handling system
const listeners: FunctionValue[] = []


const throw_error = MK_NATIVE_FN((args, env) => {
    listeners.forEach((listener) => {
        // set args
        const listenerCount = listener.parameters.length;
        const givenCount = args.length;

        const enviroment = new Environment(env);
        for (let index = 0; index < listenerCount; index++) {
            if(index < givenCount) {
                enviroment.declareVar(listener.parameters[index], args[index], true);   
            } else {
                enviroment.declareVar(listener.parameters[index], MK_NULL(), true);
            }
        }

        // invoke
        listener.body.forEach((val) => {
            evaluate(val, enviroment);
        })
    })
    if (listeners.length === 0) {
        console.warn("[MINQ] Unhandled Errors:\n" + ValueToString(MK_LIST(...args)));
    }
    return MK_NULL();
});

export function throwError(error: string, env: Environment) {
    throw_error.call([ MK_STRING(error) ], env);
}

const add_listener = MK_NATIVE_FN((args, env) => {
    if(!validateArgs(args, {
        count: 1,
        type: [ "function" ]
    })) {
        throwError("listen(): Invaild Args!", env);
    }
    else {
        listeners.push(args[0] as FunctionValue);
    }
    return MK_NULL();
})

const map = new Map<string, RuntimeVal>();
map.set("throw", throw_error);
map.set("listen", add_listener);
export default MK_MODULE("error", MK_OBJECT(map) as ObjectVal);