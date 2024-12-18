import * as fs from "fs";
import * as path from "path";

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

interface Position {
  x: number;
  y: number;
}

const n = 71;
const dx = [0, 1, 0, -1];
const dy = [1, 0, -1, 0];

const _processInput = (input: string[]): Position[] => {
  const p: Position[] = [];
  for (let i = 0; i < input.length; i++) {
    const tmp = input[i].split(",");
    p.push({
      x: Number(tmp[1]),
      y: Number(tmp[0]),
    });
  }
  return p;
};

function findShortestPath(p: Position[], after: number): number {
  const m = _createMap(p, after);
  return _getShortestPath(m);
}

function findFirstBlocking(p: Position[]): string {
  const m = _createMap(p, 0);
  for (let i = 0; i < p.length; i++) {
    m[p[i].x][p[i].y] = 1;
    if (_getShortestPath(m) === -1) return `${p[i].y},${p[i].x}`;
  }
  throw Error("always a path to exit");
}

function _createMap(p: Position[], after: number): number[][] {
  const m = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < after; i++) {
    // console.log(p[i]);
    m[p[i].x][p[i].y] = 1;
  }
  return m;
}

function _getShortestPath(m: number[][]): number {
  const f = Array.from({ length: n }, () => Array(n).fill(-1));
  f[0][0] = 0;
  const q: Position[] = [{ x: 0, y: 0 }];
  while (q.length > 0) {
    const cur = q.shift()!;

    for (let i = 0; i < 4; i++) {
      const nx = cur.x + dx[i],
        ny = cur.y + dy[i];
      if (_validMove(m, nx, ny)) {
        if (f[nx][ny] === -1 || f[cur.x][cur.y] + 1 < f[nx][ny]) {
          f[nx][ny] = f[cur.x][cur.y] + 1;
          q.push({ x: nx, y: ny });
        }
      }
    }
  }
  return f[n - 1][n - 1];
}

function _validMove(m: number[][], x: number, y: number): boolean {
  return x >= 0 && x < n && y >= 0 && y < n && m[x][y] === 0;
}

const input = _readFile();
const positions = _processInput(input);
console.log(findShortestPath(positions, 1024));
console.log(findFirstBlocking(positions));
