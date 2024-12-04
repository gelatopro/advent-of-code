import * as fs from "fs";
import * as path from "path";

const readFile = (): { data: string } => {
  const currentWorkingDir = process.cwd();
  const filePath = path.join(currentWorkingDir, "2024/input.txt");
  const data = fs.readFileSync(filePath, "utf-8");

  return { data };
};

function calculateFromCorruptedMemory(data: string): number {
  let ans = 0;
  let flag = true;
  for (let i = 0; i < data.length - 8; ) {
    if (isDo(data.substring(i, i + 4))) {
      flag = true;
      i = i + 4;
      continue;
    } else if (isDont(data.substring(i, i + 7))) {
      flag = false;
      i = i + 7;
      continue;
    }

    if (flag && isMulPrefix(data.substring(i, i + 4))) {
      const lhs = getNextNumber(data, i + 4, ",");

      if (!lhs.isNumber) {
        i = lhs.stopIndex;
      } else {
        const rhs = getNextNumber(data, lhs.stopIndex + 1, ")");
        i = rhs.stopIndex;
        if (rhs.isNumber) {
          // valid mul
          ans += lhs.value * rhs.value;
        }
      }
    } else {
      i++;
    }
  }
  return ans;
}

function getNextNumber(
  data: string,
  startIndex: number,
  endChar: string
): { isNumber: boolean; value: number; stopIndex: number } {
  let j = startIndex;
  let isValidNumber = true;
  let v = 0;
  while (j < data.length && data[j] !== endChar) {
    const x = Number(data[j]);
    if (isNaN(x)) {
      isValidNumber = false;
      break;
    } else {
      v = v * 10 + x;
      j++;
    }
  }
  if (!isValidNumber) {
    return {
      isNumber: false,
      value: 0,
      stopIndex: j,
    };
  } else {
    return {
      isNumber: true,
      value: v,
      stopIndex: j,
    };
  }
}

function isMulPrefix(data: string): boolean {
  return data === "mul(";
}

function isDo(data: string): boolean {
  return data === "do()";
}

function isDont(data: string): boolean {
  return data === "don't()";
}

const { data } = readFile();
console.log(calculateFromCorruptedMemory(data));
