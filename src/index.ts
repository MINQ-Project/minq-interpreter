import Parser from "./frontend/parser";
import * as fs from "fs";
import { createGlobalEnv } from "./runtime/environment";
import { evaluate } from "./runtime/interpreter";
import { exit } from "process";
import * as yargs from "yargs";
import { ValueToString } from "./runtime/printer";
import file from "./runtime/modules/file";
import MinqConsole from "./console";

const argv = yargs
  .option("file", {
    alias: "f",
    description: "File to run",
    type: "string",
  })
  .option("log", {
    alias: "l",
    description: "Log the result",
    type: "boolean",
  })
  .help()
  .alias("help", "h").argv as any;

try {
  run(argv.file, argv.log);
} catch (reason) {
  console.error(reason);
  exit(-1);
}

function run(filename: string, log: boolean): void {
  if (!filename) {
    MinqConsole();
  }
  const parser = new Parser();
  const env = createGlobalEnv();

  const input = fs.readFileSync(filename, "utf-8").toString();
  const program = parser.produceAST(input);

  const result = evaluate(program, env);
  if (log) {
    console.log(ValueToString(result));
  }
}
