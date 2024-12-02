import * as fs from "fs";

const readFileAndCreateArrays = (
  filePath: string
): { col1: number[]; col2: number[] } => {
  //   console.log("Current working directory:", process.cwd());

  // Read the file synchronously
  const data = fs.readFileSync(
    "/Users/yaominggong/repo/advent-of-code-2024/input.txt",
    "utf-8"
  );

  // Split the file into lines
  const lines = data.trim().split("\n");

  // Initialize arrays for the two columns
  const col1: number[] = [];
  const col2: number[] = [];

  // Process each line
  lines.forEach((line) => {
    const [value1, value2] = line.trim().split(/\s+/).map(Number); // Split by spaces/tabs and convert to numbers
    col1.push(value1);
    col2.push(value2);
  });

  return { col1, col2 };
};

function calculateDistance(left: number[], right: number[]): number {
  left.sort();
  right.sort();
  let ans = 0;
  for (let i = 0; i < left.length; i++) {
    ans += Math.abs(left[i] - right[i]);
  }
  return ans;
}

function calculateSimilarScore(left: number[], right: number[]): number {
  const locations = new Map<number, number>();
  right.forEach((value, _) => {
    locations.set(value, (locations.get(value) || 0) + 1);
  });

  let ans = 0;
  left.forEach((value, _) => {
    ans += (locations.get(value) || 0) * value;
  });

  return ans;
}

const { col1, col2 } = readFileAndCreateArrays("data.txt");
console.log(calculateDistance(col1, col2));
console.log(calculateSimilarScore(col1, col2));
