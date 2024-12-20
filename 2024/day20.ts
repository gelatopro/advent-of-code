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

const dx = [0, 1, 0, -1];
const dy = [1, 0, -1, 0];

function calCheats(m: string[]): number {
  const start = _getPosition(m, "S")!;
  const end = _getPosition(m, "E")!;
  const f = Array.from({ length: m.length }, () => Array(m[0].length).fill(-1));
  f[start.x][start.y] = 0;
  const q: Position[] = [{ x: start.x, y: start.y }];
  const orginalShortestPath = _getShortestPath(m, f, q, end);
  let ans = 0;
  // enumurate possible cheats
  for (let x = 0; x < m.length; x++)
    for (let y = 0; y < m[0].length; y++)
      if (f[x][y] !== -1) {
        // in the path
        for (let i = 0; i < 4; i++) {
          const x1 = x + dx[i],
            y1 = y + dy[i];
          if (_inMap(m, x1, y1) && m[x1][y1] === "#") {
            for (let j = 0; j < 4; j++) {
              const x2 = x1 + dx[j],
                y2 = y1 + dy[j];
              if (_validMove(m, x2, y2)) {
                // find a (x1,y1) that was a wall, and a adjcent (x2,y2) that is a track.
                if (f[x][y] + 2 < f[x2][y2]) {
                  const newPathLength =
                    f[x][y] + 2 + (f[end.x][end.y] - f[x2][y2]);
                  if (orginalShortestPath - newPathLength >= 100) ans++;
                }
              }
            }
          }
        }
      }
  return ans;
}

function calCheatsV2(m: string[]): number {
  const start = _getPosition(m, "S")!;
  const end = _getPosition(m, "E")!;
  const f = Array.from({ length: m.length }, () => Array(m[0].length).fill(-1));
  f[start.x][start.y] = 0;
  const q: Position[] = [{ x: start.x, y: start.y }];
  const orginalShortestPath = _getShortestPath(m, f, q, end);
  let ans = 0;
  const tracks: Position[] = [];
  for (let i = 0; i < m.length; i++)
    for (let j = 0; j < m[0].length; j++)
      if (f[i][j] >= 0) {
        tracks.push({ x: i, y: j });
      }

  let resMap: Map<number, number> = new Map();

  for (let i = 0; i < tracks.length; i++)
    for (let j = 0; j < tracks.length; j++)
      if (i !== j) {
        const cheatLength = _getLength(tracks[i], tracks[j]);
        if (
          cheatLength <= 20 &&
          f[tracks[i].x][tracks[i].y] + cheatLength <
            f[tracks[j].x][tracks[j].y]
        ) {
          const newLength =
            f[tracks[i].x][tracks[i].y] +
            cheatLength +
            (f[end.x][end.y] - f[tracks[j].x][tracks[j].y]);
          const delta = orginalShortestPath - newLength;
          if (delta >= 100) ans++;
          resMap.set(delta, (resMap.get(delta) || 0) + 1);
        }
      }

  //   // Convert the map entries to an array of [key, value] pairs
  //   const sortedEntries: [number, number][] = Array.from(resMap.entries()).sort(
  //     (a, b) => a[0] - b[0]
  //   );

  //   sortedEntries.forEach(([key, value]) => {
  //     if (key >= 100) {
  //       console.log(`save: ${key} picoseconds, # of cheats : ${value}`);
  //     }
  //   });

  return ans;
}

function _getPosition(m: string[], target: string): Position | null {
  for (let i = 0; i < m.length; i++)
    for (let j = 0; j < m[i].length; j++)
      if (m[i][j] === target) return { x: i, y: j };
  return null;
}

function _getLength(p1: Position, p2: Position): number {
  return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
}

function _getShortestPath(
  m: string[],
  f: number[][],
  q: Position[],
  end: Position
): number {
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
  return f[end.x][end.y];
}

function _validMove(m: string[], x: number, y: number): boolean {
  return _inMap(m, x, y) && (m[x][y] === "." || m[x][y] === "E");
}

function _inMap(m: string[], x: number, y: number): boolean {
  return x >= 0 && x < m.length && y >= 0 && y < m[0].length;
}

const input = _readFile();
console.log(calCheats(input));
console.log(calCheatsV2(input));
