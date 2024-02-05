// MINQ CONSOLE
import { prompt } from "readline-sync";
import { createGlobalEnv } from "./runtime/environment";
import { formatWithOptions } from "util";
import Parser from "./frontend/parser";
import { evaluate } from "./runtime/interpreter";
import { ValueToString } from "./runtime/printer";

export default function MinqConsole() {
  console.log("MINQ Console Mode");
  console.log("2024 (C) Copyright Maciko84");

  const env = createGlobalEnv();

  const parser = new Parser();

  while (true) {
    const code = prompt({
      prompt: "> ",
    });
    const val = evaluate(parser.produceAST(code), env);
    if (val.type !== "null") {
      console.log(ValueToString(val));
    }
  }
}
