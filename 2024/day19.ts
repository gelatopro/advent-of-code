import * as fs from "fs";
import * as path from "path";

const _readFile = (): string[] => {
  const filePath = path.join(__dirname, "input.txt");
  const data = fs.readFileSync(filePath, "utf-8");

  const input = data.trim().split("\n");
  return input;
};

const _processInput = (
  input: string[]
): { patterns: string[]; designs: string[] } => {
  const patterns = input[0].split(",").map((str) => str.trim());
  const designs = input.slice(2, input.length);
  return {
    patterns: patterns,
    designs: designs,
  };
};

const _writeFile = (data: string, filename: string) => {
  const filePath = path.join(__dirname, filename);
  fs.writeFile(filePath, data, (err) => {
    if (err) {
      console.error("Error writing to file", err);
    } else {
      console.log("Data written successfully to", filePath);
    }
  });
};

function countPossibleDesigns(patterns: string[], designs: string[]): number {
  let res = 0;
  for (let design of designs) {
    if (_countPossibleCombos(patterns, design) > 0) {
      res++;
    }
  }
  return res;
}

function countCombosOfPossibleDesigns(
  patterns: string[],
  designs: string[]
): number {
  let res = 0;
  for (let design of designs) {
    const count = _countPossibleCombos(patterns, design);
    if (count > 0) {
      res += count;
    }
  }
  return res;
}

function _countPossibleCombos(patterns: string[], design: string): number {
  const f: number[] = Array(design.length + 2).fill(0);
  f[0] = 1;
  for (let i = 0; i < design.length; i++)
    if (f[i] > 0) {
      for (let j = 0; j < patterns.length; j++) {
        if (_match(patterns[j], design, i)) f[i + patterns[j].length] += f[i];
      }
    }

  return f[design.length];
}

function _match(pattern: string, design: string, idx: number): boolean {
  if (idx + pattern.length > design.length) return false;
  for (let i = 0; i < pattern.length; i++)
    if (pattern[i] !== design[idx + i]) return false;
  return true;
}

const input = _readFile();
const { patterns, designs } = _processInput(input);
console.log(countPossibleDesigns(patterns, designs));
console.log(countCombosOfPossibleDesigns(patterns, designs));
