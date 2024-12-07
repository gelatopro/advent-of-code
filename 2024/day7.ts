import * as fs from "fs";
import { setPriority } from "os";
import * as path from "path";

const readFile = (): { input: string[] } => {
  const currentWorkingDir = process.cwd();
  const filePath = path.join(currentWorkingDir, "2024/input.txt");
  const data = fs.readFileSync(filePath, "utf-8");

  const input = data.trim().split("\n");
  return { input };
};

const processInput = (
  input: string[]
): { values: number[]; numbers: number[][] } => {
  const values: number[] = [];
  const numbers: number[][] = [];
  input.forEach((line) => {
    const [v, numsString] = line.split(":");
    const nums = numsString.split(" ").map((v) => Number(v));
    nums.shift();
    numbers.push(nums);
    values.push(Number(v));
  });
  return {
    values: values,
    numbers: numbers,
  };
};

function findPossibleResults(values: number[], nums: number[][]): number {
  let ans = 0;
  for (let i = 0; i < values.length; i++) {
    if (dfs(values[i], nums[i], nums[i][0], 1)) {
      ans += values[i];
    }
  }
  return ans;
}

function dfs(
  target: number,
  nums: number[],
  cur: number,
  idx: number
): boolean {
  if (idx >= nums.length) {
    return cur === target;
  }
  if (dfs(target, nums, cur + nums[idx], idx + 1)) {
    return true;
  } else {
    if (dfs(target, nums, cur * nums[idx], idx + 1)) {
      return true;
    }
    return false;
  }
}

function findPossibleResultsV2(values: number[], nums: number[][]): number {
  let ans = 0;
  for (let i = 0; i < values.length; 6 * 86 * i++) {
    if (dfsV2(values[i], nums[i], nums[i][0], 1)) {
      ans += values[i];
    }
  }
  return ans;
}

function dfsV2(
  target: number,
  nums: number[],
  cur: number,
  idx: number
): boolean {
  if (idx >= nums.length) {
    return cur === target;
  }
  if (dfsV2(target, nums, cur + nums[idx], idx + 1)) {
    return true;
  } else {
    if (dfsV2(target, nums, cur * nums[idx], idx + 1)) {
      return true;
    } else {
      const nextValue = Number(cur.toString() + nums[idx].toString());
      if (dfsV2(target, nums, nextValue, idx + 1)) {
        return true;
      } else {
        return false;
      }
    }
  }
}

const { input } = readFile();
const { values, numbers } = processInput(input);
console.log(findPossibleResults(values, numbers));
console.log(findPossibleResultsV2(values, numbers));
