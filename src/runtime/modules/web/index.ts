import validateArgs from "../../param-checker";
import {
    MK_MODULE,
  MK_NATIVE_CLASS,
  MK_NATIVE_FN,
  MK_NULL,
  MK_OBJECT,
  MK_RUNTIMEVAL,
  NumberVal,
  ObjectVal,
  RuntimeVal,
} from "../../values";
import CreateConfig, { MQWebProjectConfig } from "./MQWebProjectConfig";
import Express from "express";
import ParseMQHTML from "./minqhtmlparser";
import { readFileSync } from "fs";
import cookieParser from "cookie-parser";

let config: MQWebProjectConfig | undefined;
let app = Express();
const loadConfig = MK_NATIVE_FN((args, env) => {
  if (
    !validateArgs(args, {
      type: ["object"],
      count: 1,
    })
  ) {
    throw "WebERROR: Invaild Args For loadConfig()";
  }

  config = CreateConfig(args[0] as ObjectVal);
  return MK_NULL();
});

const runOnPort = MK_NATIVE_FN((args, env) => {
  if (
    !validateArgs(args, {
      type: ["number"],
      count: 1,
    })
  ) {
    throw "WebERROR: Invaild Args For runOnPort()";
  }
  if (config === undefined) {
    throw "WebERROR: Config Not Defined. please use loadConfig() to load configuration!";
  } else {
    // Create Endpoints for EVERY url and index
    app = Express(); // to verify that it does`nt have endpoints
    app.use(cookieParser());
    app.get("/", (req, res) => {
      res.setHeader("Content-Type", "text/html");
      res.send(
        ParseMQHTML(readFileSync(config?.indexUrl as string).toString(), (_, env) => {
          env.declareVar("query", MK_RUNTIMEVAL(req.query), true)
          return MK_NULL()
        }),
      );
    });
    config.urls.forEach((val, key) => {
      app.get(key, (req, res) => {
        res.setHeader("Content-Type", "text/html");
        res.send(ParseMQHTML(readFileSync(val).toString(), (_, env) => {
          env.declareVar("query", MK_RUNTIMEVAL(req.query), true)
          return MK_NULL()
        }));
      });
    });

    console.log("Web: Application runned on port: " + (args[0] as NumberVal).value.toString())
    // Listen app
    app.listen((args[0] as NumberVal).value);
  }
  return MK_NULL();
});

const map = new Map<string, RuntimeVal>();
map.set("loadConfig", loadConfig);
map.set("runOnPort", runOnPort);
export default MK_MODULE("web", MK_OBJECT(map) as ObjectVal)