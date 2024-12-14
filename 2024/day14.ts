import * as fs from "fs";
import * as path from "path";

type V = {
  x: number;
  y: number;
};

const r = 103,
  c = 101;

const _readFile = (): string[] => {
  const filePath = path.join(__dirname, "input.txt");
  const data = fs.readFileSync(filePath, "utf-8");

  const input = data.trim().split("\n");
  return input;
};

const _writeFile = (data: string) => {
  const filePath = path.join(__dirname, "output.txt");
  fs.writeFile(filePath, data, (err) => {
    if (err) {
      console.error("Error writing to file", err);
    } else {
      console.log("Data written successfully to", filePath);
    }
  });
};

const _processInput = (input: string[]): { positions: V[]; vectors: V[] } => {
  const positions: V[] = [];
  const vectors: V[] = [];

  for (let line of input) {
    const regex = /p=(-?\d+),(-?\d+)\s+v=(-?\d+),(-?\d+)/;
    const match = line.match(regex);
    if (match) {
      const y1 = parseInt(match[1], 10);
      const x1 = parseInt(match[2], 10);
      const y2 = parseInt(match[3], 10);
      const x2 = parseInt(match[4], 10);
      positions.push({ x: x1, y: y1 });
      vectors.push({ x: x2, y: y2 });
    }
  }

  return {
    positions: positions,
    vectors: vectors,
  };
};

function predictRobots(positions: V[], vectors: V[]): number {
  const newPositions: V[] = [];
  for (let i = 0; i < positions.length; i++) {
    newPositions.push(_moveRobot(positions[i], vectors[i], 100));
  }
  _printMap(newPositions);
  return _calSafeFactor(newPositions);
}

function minTimeToFormTree(positions: V[], vectors: V[]): number {
  for (let i = 1; i < 10000; i++) {
    const newPositions: V[] = Array.from(positions);
    for (let j = 0; j < positions.length; j++)
      newPositions[j] = _moveRobot(newPositions[j], vectors[j], i);
    if (_findTree(newPositions)) {
      console.log(`Found Tree at iteration: ${i}`);
      _printMap(newPositions);
      return i;
    }
  }
  return -1;
}

function _moveRobot(position: V, vector: V, seconds: number): V {
  let x = position.x,
    y = position.y;
  x = (x + (vector.x + r) * seconds) % r;
  y = (y + (vector.y + c) * seconds) % c;
  return { x: x, y: y };
}

function _calSafeFactor(positions: V[]): number {
  let q1 = 0,
    q2 = 0,
    q3 = 0,
    q4 = 0;
  for (let position of positions) {
    if (position.x <= 50) {
      if (position.y <= 49) q1++;
      else if (position.y >= 51) q2++;
    } else if (position.x >= 52) {
      if (position.y <= 49) q3++;
      else if (position.y >= 51) q4++;
    }
  }
  return q1 * q2 * q3 * q4;
}

function _findTree(positions: V[]): boolean {
  const m = Array.from({ length: r }, () => Array(c).fill(0));
  for (let position of positions) {
    m[position.x][position.y]++;
  }
  for (let i = 0; i < r; i++)
    for (let j = 0; j < c; j++)
      if (m[i][j] === 1 && !_hasRobot(m, i, j - 1) && !_hasRobot(m, i, j + 1)) {
        let isTree = true;
        for (let level = 0; level < 5; level++) {
          for (let k = j - level; k <= j + level; k++)
            if (!_hasRobot(m, i + level, k)) {
              isTree = false;
              break;
            }
        }
        if (isTree) return true;
      }
  return false;
}

function _hasRobot(m: number[][], x: number, y: number): boolean {
  return x >= 0 && x < r && y >= 0 && y < c && m[x][y] > 0;
}

function _printMap(positions: V[]) {
  const m = Array.from({ length: r }, () => Array(c).fill(0));
  for (let position of positions) {
    m[position.x][position.y] = 1;
  }

  let mStr = "";
  for (let i = 0; i < r; i++) {
    let str = "";
    for (let j = 0; j < c; j++)
      if (m[i][j] === 0) str += ".";
      else str += "1";
    mStr += "\n";
    mStr += str;
  }
  _writeFile(mStr);
}

const input = _readFile();
const { positions, vectors } = _processInput(input);
console.log(predictRobots(positions, vectors));
console.log(minTimeToFormTree(positions, vectors));
