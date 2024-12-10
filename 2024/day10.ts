import * as fs from "fs";
import * as path from "path";

const _readFile = (): { input: string[] } => {
  const filePath = path.join(__dirname, "input.txt");
  const data = fs.readFileSync(filePath, "utf-8");

  const input = data.trim().split("\n");
  return { input };
};

const dx = [-1, 0, 1, 0];
const dy = [0, 1, 0, -1];

function countTrailheadScore(map: string[]): number {
  let ans = 0;
  for (let i = 0; i < map.length; i++)
    for (let j = 0; j < map[0].length; j++)
      if (map[i][j] === "0") {
        const visited = Array.from({ length: map.length }, () =>
          Array(map[0].length).fill(false)
        );

        _dfs(map, visited, i, j);
        ans += _getScore(map, visited);
      }
  return ans;
}

function calTrailheadRating(map: string[]): number {
  const f = Array.from({ length: map.length }, () =>
    Array(map[0].length).fill(-1)
  );

  for (let i = 0; i < map.length; i++)
    for (let j = 0; j < map[0].length; j++)
      if (map[i][j] === "0") {
        _dp(map, f, i, j);
      }
  return _getRating(map, f);
}

function _dp(map: string[], f: number[][], x: number, y: number): number {
  if (f[x][y] !== -1) return f[x][y];

  if (map[x][y] === "9") {
    f[x][y] = 1;
    return f[x][y];
  }

  f[x][y] = 0;
  for (let i = 0; i < 4; i++) {
    const nx = x + dx[i],
      ny = y + dy[i];
    if (_validMove(map, x, y, nx, ny)) {
      const nf = _dp(map, f, nx, ny);
      if (nf !== -1) f[x][y] += nf;
    }
  }
  return f[x][y];
}

function _getRating(map: string[], f: number[][]): number {
  let ans = 0;
  for (let i = 0; i < map.length; i++)
    for (let j = 0; j < map[0].length; j++)
      if (map[i][j] === "0" && f[i][j] > 0) ans += f[i][j];
  return ans;
}

function _getScore(map: string[], visited: boolean[][]): number {
  let ans = 0;
  for (let i = 0; i < map.length; i++)
    for (let j = 0; j < map[0].length; j++)
      if (map[i][j] === "9" && visited[i][j]) ans++;

  return ans;
}

function _dfs(map: string[], visited: boolean[][], x: number, y: number) {
  visited[x][y] = true;
  if (map[x][y] === "9") return;
  for (let i = 0; i < 4; i++) {
    const nx = x + dx[i],
      ny = y + dy[i];
    if (_validMove(map, x, y, nx, ny) && !visited[nx][ny]) {
      _dfs(map, visited, nx, ny);
    }
  }
}

function _validMove(
  map: string[],
  x: number,
  y: number,
  nx: number,
  ny: number
): boolean {
  if (_inMap(map, nx, ny)) {
    if (Number(map[x][y]) + 1 === Number(map[nx][ny])) return true;
    return false;
  }
  return false;
}

function _inMap(map: string[], x: number, y: number): boolean {
  return x >= 0 && x < map.length && y >= 0 && y < map[0].length;
}

const { input } = _readFile();
// console.log(input);
console.log(countTrailheadScore(input));
console.log(calTrailheadRating(input));
