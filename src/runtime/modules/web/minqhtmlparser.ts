import Parser from "../../../frontend/parser";
import { createGlobalEnv } from "../../environment";
import { evaluate } from "../../interpreter";
import { ValueToString } from "../../printer";
import { FunctionCall, MK_NATIVE_FN, MK_NULL, StringVal } from "../../values";

export default function ParseMQHTML(mqhtml: string, creator: FunctionCall) {
  const pattern = /<\?mq\s(.*?)\?>/gs;
  const newText = mqhtml.replace(pattern, (code) => {
    const parser = new Parser();
    const env = createGlobalEnv();
    creator([], env);
    let result = "";
    // special function for adding text into result
    env.declareVar(
      "echo",
      MK_NATIVE_FN((args, _env) => {
        args.forEach((element) => {
          if (element.type == "string") {
            result += (element as StringVal).value;
          } else {
            result += ValueToString(element);
          }
        });
        return MK_NULL();
      }),
      true,
    );
    const newcode = code.substring(4, code.length - 2);
    const ast = parser.produceAST(newcode);
    evaluate(ast, env);
    return result;
  });
  return newText;
}
