import Environment from "../../environment";
import { throwError } from "../../error-handler";
import { ValueToString } from "../../printer";
import { MK_NULL, ObjectVal, StringVal } from "../../values";

export interface MQWebProjectConfig {
  urls: Map<string, string>;
  indexUrl: string;
}
// Convertor of MINQ object to MQWebProjectConfig
export default function CreateConfig(object: ObjectVal, env: Environment) {
  if (
    !object.properties.has("urls") ||
    object.properties.get("urls")?.type !== "object"
  ) {
    throwError("WebERROR: Config Does not have Urls Defined", env);
    return undefined;
  } else {
    const urls = new Map<string, string>();
    (object.properties.get("urls") as ObjectVal).properties.forEach(
      (val, key) => {
        if (val.type !== "string") {
          throw "WebERROR: Expected to value be of type 'string'";
        }
        urls.set(key, (val as StringVal).value);
      },
    );
    if (!urls.has("__index__")) {
      throw "WebERROR: __index__ not defined in urls";
    } else {
      return {
        urls,
        indexUrl: urls.get("__index__") as string,
      } as MQWebProjectConfig;
    }
  }
}
