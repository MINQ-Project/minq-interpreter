import Parser from "./frontend/parser";
import * as fs from "fs";
import { createGlobalEnv } from "./runtime/environment";
import { evaluate } from "./runtime/interpreter";
import { exit } from "process";
import * as yargs from "yargs";
import { ValueToString } from "./runtime/printer";

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
  .demandOption(["file"], "Please provide source file to run minq interpreter")
  .help()
  .alias("help", "h").argv as any;

try {
  run(argv.file, argv.log);
} catch (reason) {
  console.error(reason);
  exit(-1);
}

function run(filename: string, log: boolean): void {
  const parser = new Parser();
  const env = createGlobalEnv();

  const input = fs.readFileSync(filename, "utf-8").toString();
  const program = parser.produceAST(input);

  const result = evaluate(program, env);
  if (log) {
    console.log(ValueToString(result));
  }
}
