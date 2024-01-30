import { RuntimeVal, ValueType } from "./values";

export interface Param {
  type: ValueType[];
  count?: number;
}

export default function validateArgs(
  args: RuntimeVal[],
  ...rules: Param[]
): boolean {
  let i = 0;
  let ruleindex = 0;

  while (i < args.length) {
    const rule = rules[ruleindex];
    if (rule.count == 1) {
      if (rule.type.find((val) => val == args[i].type) == undefined) {
        return false;
      }
      i++;
      ruleindex++;
    } else if (rule.count == null) {
      while (rule.type.find((val) => val == args[i].type) != undefined) {
        i++;
      }
      ruleindex++;
    } else {
      const index = i;
      for (; i < (rule.count as number) + index; i++) {
        if (rule.type.find((val) => val == args[i].type) == undefined) {
          return false;
        }
      }
    }
  }
  return true;
}
