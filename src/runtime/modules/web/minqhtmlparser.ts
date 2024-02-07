import Parser from "../../../frontend/parser";
import { createGlobalEnv } from "../../environment";
import { evaluate } from "../../interpreter";
import { ValueToString } from "../../printer";
import { MK_NATIVE_FN, MK_NULL, StringVal } from "../../values";

export default function ParseMQHTML(mqhtml: string) {
  const pattern = /<\?mq\s(.*?)\?>/gs;

  const newText = mqhtml.replace(pattern, (code) => {
    const parser = new Parser();
    const env = createGlobalEnv();
    let result = "";
    // special function for adding text into result
    env.declareVar(
      "echo",
      MK_NATIVE_FN((args, env) => {
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
    const ast = parser.produceAST(code);
    evaluate(ast, env);
    return result;
  });
  return newText;
}
