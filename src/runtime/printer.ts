import {
  RuntimeVal,
  StringVal,
  NumberVal,
  BooleanVal,
  ObjectVal,
  ListVal,
} from "./values";

export function ValueToString(value: RuntimeVal, indent = 0): string {
  const indentation = " ".repeat(indent);
  const nestedIndentation = " ".repeat(indent + 2);

  if (value.type == "string") {
    return '"' + (value as StringVal).value + '"';
  } else if (value.type == "number") {
    return (value as NumberVal).value.toString();
  } else if (value.type == "null") {
    return "NULL";
  } else if (value.type == "function" || value.type == "native-fn") {
    return "[FUNCTION]";
  } else if (value.type == "boolean") {
    if ((value as BooleanVal).value) {
      return "true";
    } else {
      return "false";
    }
  } else if (value.type == "object") {
    const map = new Map<string, string>();
    (value as ObjectVal).properties.forEach((val, key) => {
      map.set(key, ValueToString(val, indent + 2));
    });
    const obj = Object.fromEntries(map);

    const properties = Object.entries(obj)
      .map(([key, value]) => `${nestedIndentation}${key}: ${value}`)
      .join(",\n");

    return `{\n${properties}\n${indentation}}`;
  } else if (value.type == "class" || value.type == "native-cl") {
    return "[CLASS]";
  } else if (value.type == "list") {
    const map = new Map<string, string>();
    const elements = (value as ListVal).elements;
    const elementsstringified: string[] = [];
    elements.forEach((val) => {
      elementsstringified.push(
        nestedIndentation + ValueToString(val, indent + 1),
      );
    });
    const items = elementsstringified.join(",\n");

    return `[\n${items}\n]`;
  } else if (value.type == "module") {
    return "[MODULE]";
  } else {
    return "<UNPRINTABLE>";
  }
}
