import * as fs from "fs";
import * as path from "path";

const numPad: string[] = ["789", "456", "123", "#0A"];
const dirPad: string[] = ["#^A", "<v>"];
const numPadSeqMap = _getCelltoCellmap(numPad);
const dirPadSeqMap = _getCelltoCellmap(dirPad);

const _readFile = (): string[] => {
  const filePath = path.join(__dirname, "input.txt");
  const data = fs.readFileSync(filePath, "utf-8");

  const input = data.trim().split("\n");
  return input;
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

function _getCelltoCellmap(board: string[]): Map<string, string[]> {
  const seqMap: Map<string, string[]> = new Map();
  for (let x1 = 0; x1 < board.length; x1++)
    for (let y1 = 0; y1 < board[0].length; y1++)
      for (let x2 = 0; x2 < board.length; x2++)
        for (let y2 = 0; y2 < board[0].length; y2++)
          if (board[x1][y1] !== "#" && board[x2][y2] !== "#") {
            const ch1 = board[x1][y1],
              ch2 = board[x2][y2];
            const path: string[] = [];
            const sequences: string[] = [];
            _generateAllSequence(board, x1, y1, x2, y2, path, sequences);
            seqMap.set(ch1 + ch2, sequences);
          }
  return seqMap;
}

function unblockKeyPads(codes: string[], depth: number): number {
  let res = 0;
  for (let code of codes) {
    const length2 = _calcSequenceV2(code, depth);
    res += length2 * _getNumValue(code);
  }

  return res;
}

// given a code on num pad, return shortest sequence on directional pad
function _controlNumPad(
  code: string,
  cur: string,
  nextIdx: number,
  path: string[],
  sequences: string[]
) {
  if (nextIdx >= code.length) {
    sequences.push(path.join(""));
    return;
  } else {
    const key = cur + code[nextIdx];
    const possibleSteps = numPadSeqMap.get(key)!;
    for (let step of possibleSteps) {
      path.push(step + "A");
      _controlNumPad(code, code[nextIdx], nextIdx + 1, path, sequences);
      path.pop();
    }
  }
}

// generate all shortest sequences in a board, from (x1,y1)->(x2,y2), with # as blocking cell
function _generateAllSequence(
  board: string[],
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  currentPath: string[],
  sequences: string[]
) {
  if (x1 === x2 && y1 === y2) {
    sequences.push(currentPath.join(""));
    return;
  }
  let dx = 0,
    dy = 0;
  if (x2 > x1) dx = 1;
  else if (x2 < x1) dx = -1;
  if (y2 > y1) dy = 1;
  else if (y2 < y1) dy = -1;

  if (dx !== 0 && board[x1 + dx][y1] !== "#") {
    const move = dx > 0 ? "v" : "^";
    currentPath.push(move);
    _generateAllSequence(board, x1 + dx, y1, x2, y2, currentPath, sequences);
    currentPath.pop();
  }
  if (dy !== 0 && board[x1][y1 + dy] !== "#") {
    const move = dy > 0 ? ">" : "<";
    currentPath.push(move);
    _generateAllSequence(board, x1, y1 + dy, x2, y2, currentPath, sequences);
    currentPath.pop();
  }
}

function _getNumValue(code: string): number {
  return Number(code.slice(0, code.length - 1));
}

function _calcSequenceV2(code: string, depth: number): number {
  const depth1Sequences: string[] = [];
  const numPadPath: string[] = [];
  const cache: Map<string, number> = new Map();
  _controlNumPad(code, "A", 0, numPadPath, depth1Sequences);

  let ans: number | null = null;
  for (let seq of depth1Sequences) {
    let res = _dfs(seq, 1, depth, cache);
    if (!ans || res < ans) ans = res;
  }
  return ans!;
}

function _dfs(
  seq: string,
  curDepth: number,
  targetDepth: number,
  cache: Map<string, number>
): number {
  const cacheKey = seq + "+" + curDepth.toString();
  const possibleRes = cache.get(cacheKey);
  if (possibleRes) {
    return possibleRes;
  }
  if (curDepth === targetDepth) {
    return seq.length;
  }
  let p = "A";
  let ans = 0;
  for (let i = 0; i < seq.length; i++) {
    const key = p + seq[i];
    const possibleNextSeqs = dirPadSeqMap.get(key)!;
    let res: number | null = null;
    for (let next of possibleNextSeqs) {
      const tmpRes = _dfs(next + "A", curDepth + 1, targetDepth, cache);
      if (!res || tmpRes < res) res = tmpRes;
    }
    ans += res!;
    p = seq[i];
  }
  cache.set(cacheKey, ans);
  return ans;
}

const input = _readFile();
console.log(unblockKeyPads(input, 3));
console.log(unblockKeyPads(input, 26));
