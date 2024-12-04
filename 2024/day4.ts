import { match } from "assert";
import exp from "constants";
import * as fs from "fs";
import * as path from "path";

const readFile = (): { puzzle: string[] } => {
  const currentWorkingDir = process.cwd();
  const filePath = path.join(currentWorkingDir, "2024/input.txt");
  const data = fs.readFileSync(filePath, "utf-8");

  const puzzle = data.trim().split("\n");
  return { puzzle };
};

function countXMAS(puzzle: string[]): number {
  let ans = 0;
  for (let i = 0; i < puzzle.length; i++)
    for (let j = 0; j < puzzle[0].length; j++) ans += findXMASv2(puzzle, i, j);
  return ans;
}

// ignore SAMX as it will be counted
function findXMAS(puzzle: string[], x: number, y: number): number {
  const xmas = "XMAS";
  let ans = 0;
  // down
  let found = true;
  for (let i = 0; i < 4; i++)
    if (!validCell(puzzle, x + i, y) || puzzle[x + i][y] !== xmas[i]) {
      found = false;
      break;
    }
  if (found) ans++;

  // up
  found = true;
  for (let i = 0; i < 4; i++)
    if (!validCell(puzzle, x - i, y) || puzzle[x - i][y] !== xmas[i]) {
      found = false;
      break;
    }
  if (found) ans++;

  // left
  found = true;
  for (let i = 0; i < 4; i++)
    if (!validCell(puzzle, x, y - i) || puzzle[x][y - i] !== xmas[i]) {
      found = false;
      break;
    }
  if (found) ans++;

  // right
  found = true;
  for (let i = 0; i < 4; i++)
    if (!validCell(puzzle, x, y + i) || puzzle[x][y + i] !== xmas[i]) {
      found = false;
      break;
    }
  if (found) ans++;

  // left top
  found = true;
  for (let i = 0; i < 4; i++)
    if (!validCell(puzzle, x - i, y - i) || puzzle[x - i][y - i] !== xmas[i]) {
      found = false;
      break;
    }
  if (found) ans++;

  // left down
  found = true;
  for (let i = 0; i < 4; i++)
    if (!validCell(puzzle, x + i, y - i) || puzzle[x + i][y - i] !== xmas[i]) {
      found = false;
      break;
    }
  if (found) ans++;

  // right up
  found = true;
  for (let i = 0; i < 4; i++)
    if (!validCell(puzzle, x - i, y + i) || puzzle[x - i][y + i] !== xmas[i]) {
      found = false;
      break;
    }
  if (found) ans++;

  // right down
  found = true;
  for (let i = 0; i < 4; i++)
    if (!validCell(puzzle, x + i, y + i) || puzzle[x + i][y + i] !== xmas[i]) {
      found = false;
      break;
    }
  if (found) ans++;
  return ans;
}

// accept corrdinates of the center A
function findXMASv2(puzzle: string[], x: number, y: number): number {
  let ans = 0;
  const patterns = [
    ["M.S", ".A.", "M.S"],
    ["S.S", ".A.", "M.M"],
    ["M.M", ".A.", "S.S"],
    ["S.M", ".A.", "S.M"],
  ];

  let foundPattern = false;
  if (validCell(puzzle, x - 1, y - 1) && validCell(puzzle, x + 1, y + 1)) {
    const subPuzzle = getX(puzzle, x, y);

    for (let i = 0; i < 4; i++) {
      if (
        patternMatch(subPuzzle[0], patterns[i][0]) &&
        patternMatch(subPuzzle[2], patterns[i][2]) &&
        subPuzzle[1][1] === "A"
      ) {
        foundPattern = true;
        break;
      }
    }
  }
  if (foundPattern) return 1;
  else return 0;
}

function patternMatch(a: string, b: string): boolean {
  return a[0] === b[0] && a[2] == b[2];
}

function getX(puzzle: string[], x: number, y: number): string[] {
  const res: string[] = [];
  res.push(puzzle[x - 1].substring(y - 1, y + 2));
  res.push(puzzle[x].substring(y - 1, y + 2));
  res.push(puzzle[x + 1].substring(y - 1, y + 2));
  return res;
}

function validCell(puzzle: string[], x: number, y: number): boolean {
  return x >= 0 && x < puzzle.length && y >= 0 && y < puzzle[0].length;
}

const { puzzle } = readFile();
console.log(countXMAS(puzzle));
