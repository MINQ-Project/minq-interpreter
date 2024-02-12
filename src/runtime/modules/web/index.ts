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
import { marked } from "marked";

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
    function parseFile(val: string, query: any): any {
      if (val.endsWith(".mqhtml") || val.endsWith(".minqhtml"))
      {
        return {
            ContentType: "text/html",
            value: ParseMQHTML(readFileSync(val).toString(), (_, env) => {
              env.declareVar("query", MK_RUNTIMEVAL(query), true);
              return MK_NULL();
            })

        }
      }
      else if (val.endsWith(".html")) {
        return {
          ContentType: "text/html",
          value: readFileSync(val).toString()
        }
      }
      else if (val.endsWith(".css")) {
        return {
          ContentType: "text/css",
          value: readFileSync(val).toString()
        }
      }
      else if (val.endsWith(".md")) {
        const htmlString = marked.parse(val);
        return {
          ContentType: "text/html",
          value: htmlString 
        }
      }
      else if (val.endsWith(".js")) {
        return {
          ContentType: "application/javascript",
          value: readFileSync(val).toString()
        }
      }
      else {
        return {
          ContentType: "application/octet-stream",
          value: readFileSync(val).toString()
        }
      }
    }
    app.use(cookieParser());
    app.get("/", (req, res) => {
      const returned = parseFile(config?.indexUrl as string, req.query);
      res.setHeader("Content-Type", returned.ContentType) 
      res.send(
        returned.value
      );
      res.end();
    });
    config.urls.forEach((val, key) => {
      app.get("/" + key, (req, res) => {
        const returned = parseFile(val, req.query);
        res.setHeader("Content-Type", returned.ContentType) 
        res.send(
          returned.value
        );
        res.end();
      });
    });

    console.log(
      "Web: Application runned on port: " +
        (args[0] as NumberVal).value.toString(),
    );
    // Listen app
    app.listen((args[0] as NumberVal).value);
  }
  return MK_NULL();
});

const map = new Map<string, RuntimeVal>();
map.set("loadConfig", loadConfig);
map.set("runOnPort", runOnPort);
export default MK_MODULE("web", MK_OBJECT(map) as ObjectVal);
