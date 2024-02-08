import { Marked, marked } from "marked";
import Parser from "../../../frontend/parser";
import { createGlobalEnv } from "../../environment";
import { evaluate } from "../../interpreter";
import validateArgs from "../../param-checker";
import { ValueToString } from "../../printer";
import { FunctionCall, MK_NATIVE_FN, MK_NULL, MK_STRING, StringVal } from "../../values";
import katex from "katex";

const renderer = new marked.Renderer();
renderer.text = (text: string) => {
  return katex.renderToString(text, { throwOnError: false });
};
marked.use({ renderer });

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
    env.declareVar("md", MK_NATIVE_FN((args, env) => {
      if(!validateArgs(args, { type: [ "string" ] }))
      {
        throw "md(): invaild args"
      }
      const htmlString = marked.parse((args[0] as StringVal).value);
      return MK_STRING(htmlString as string);
    }), true);
    const newcode = code.substring(4, code.length - 2);
    const ast = parser.produceAST(newcode);
    evaluate(ast, env);

    return result;
   
  });

  return newText;
}
