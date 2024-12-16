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

interface State {
  x: number;
  y: number;
  dir: number;
}

const dx = [0, 1, 0, -1];
const dy = [1, 0, -1, 0];

function run(map: string[]): number {
  const startPosition = _getPosition(map, "S");
  const targetPosition = _getPosition(map, "E");
  const f = _search(map, startPosition, targetPosition);
  let ans: number | null = null;
  for (let i = 0; i < 4; i++)
    if (!ans || f[targetPosition.x][targetPosition.y][i] < ans)
      ans = f[targetPosition.x][targetPosition.y][i];
  return ans ? ans : -1;
}

function countTileInBestPaths(map: string[]): number {
  const startPosition = _getPosition(map, "S");
  const targetPosition = _getPosition(map, "E");
  const f = _search(map, startPosition, targetPosition);
  return _backTrace(map, f, startPosition, targetPosition);
}

function _search(
  map: string[],
  startPosition: Position,
  targetPosition: Position
): number[][][] {
  const f = Array.from({ length: map.length }, () =>
    Array.from({ length: map[0].length }, () => Array(4).fill(-1))
  );
  const q: State[] = [{ x: startPosition.x, y: startPosition.y, dir: 0 }];
  f[startPosition.x][startPosition.y][0] = 0;
  while (q.length > 0) {
    const cur = q.shift()!;

    // move same direction
    let nextState = {
      x: cur.x + dx[cur.dir],
      y: cur.y + dy[cur.dir],
      dir: cur.dir,
    };
    if (_validMove(map, nextState.x, nextState.y)) {
      if (
        f[nextState.x][nextState.y][nextState.dir] === -1 ||
        f[cur.x][cur.y][cur.dir] + 1 <
          f[nextState.x][nextState.y][nextState.dir]
      ) {
        f[nextState.x][nextState.y][nextState.dir] =
          f[cur.x][cur.y][cur.dir] + 1;
        q.push(nextState);
      }
    }

    //rotate +1
    nextState = {
      x: cur.x,
      y: cur.y,
      dir: (cur.dir + 1) % 4,
    };
    if (
      f[nextState.x][nextState.y][nextState.dir] === -1 ||
      f[cur.x][cur.y][cur.dir] + 1000 <
        f[nextState.x][nextState.y][nextState.dir]
    ) {
      f[nextState.x][nextState.y][nextState.dir] =
        f[cur.x][cur.y][cur.dir] + 1000;
      q.push(nextState);
    }

    // rotate -1
    nextState = {
      x: cur.x,
      y: cur.y,
      dir: (cur.dir + 3) % 4,
    };
    if (
      f[nextState.x][nextState.y][nextState.dir] === -1 ||
      f[cur.x][cur.y][cur.dir] + 1000 <
        f[nextState.x][nextState.y][nextState.dir]
    ) {
      f[nextState.x][nextState.y][nextState.dir] =
        f[cur.x][cur.y][cur.dir] + 1000;
      q.push(nextState);
    }
  }
  return f;
}

function _backTrace(
  map: string[],
  f: number[][][],
  startPosition: Position,
  targetPosition: Position
): number {
  const visited = Array.from({ length: map.length }, () =>
    Array(map[0].length).fill(false)
  );
  const q: State[] = [];
  let ans: number | null = null;
  for (let i = 0; i < 4; i++)
    if (!ans || f[targetPosition.x][targetPosition.y][i] < ans)
      ans = f[targetPosition.x][targetPosition.y][i];
  for (let i = 0; i < 4; i++)
    if (f[targetPosition.x][targetPosition.y][i] === ans) {
      q.push({ x: targetPosition.x, y: targetPosition.y, dir: i });
      visited[targetPosition.x][targetPosition.y] = true;
    }

  while (q.length > 0) {
    const cur = q.shift()!;

    // move from same direction, need reversed dir for calculation
    let revDir = (cur.dir + 2) % 4;
    let prevState = {
      x: cur.x + dx[revDir],
      y: cur.y + dy[revDir],
      dir: cur.dir,
    };
    if (
      _validMove(map, prevState.x, prevState.y) &&
      f[prevState.x][prevState.y][prevState.dir] + 1 ===
        f[cur.x][cur.y][cur.dir]
    ) {
      visited[prevState.x][prevState.y] = true;
      q.push(prevState);
    }

    // rotate counter clockwise
    prevState = {
      x: cur.x,
      y: cur.y,
      dir: (cur.dir + 1) % 4,
    };
    if (
      f[prevState.x][prevState.y][prevState.dir] + 1000 ===
      f[cur.x][cur.y][cur.dir]
    ) {
      visited[prevState.x][prevState.y] = true;
      q.push(prevState);
    }

    // rotate countwise
    prevState = {
      x: cur.x,
      y: cur.y,
      dir: (cur.dir + 3) % 4,
    };
    if (
      f[prevState.x][prevState.y][prevState.dir] + 1000 ===
      f[cur.x][cur.y][cur.dir]
    ) {
      visited[prevState.x][prevState.y] = true;
      q.push(prevState);
    }
  }

  _writeFile(_toString(visited), "output.txt");
  let res = 0;
  for (let i = 0; i < visited.length; i++)
    for (let j = 0; j < visited.length; j++) if (visited[i][j]) res++;
  return res;
}

function _toString(visited: boolean[][]): string {
  let tmp = "";
  for (let i = 0; i < visited.length; i++) {
    let str = "";
    for (let j = 0; j < visited[i].length; j++)
      if (visited[i][j]) str += "1";
      else str += "0";
    tmp += str + "\n";
  }
  return tmp;
}

function _validMove(map: string[], x: number, y: number): boolean {
  return (
    x >= 0 && x < map.length && y >= 0 && y < map[0].length && map[x][y] !== "#"
  );
}

function _getPosition(map: string[], mark: string): Position {
  for (let i = 0; i < map.length; i++)
    for (let j = 0; j < map[0].length; j++)
      if (map[i][j] === mark) return { x: i, y: j };
  throw Error(`${mark} not found on map`);
}

const input = _readFile();
console.log(run(input));
console.log(countTileInBestPaths(input));
