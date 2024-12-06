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

type Step = {
  x: number;
  y: number;
  direction: number;
};

type AdditionalBlocker = {
  x: number;
  y: number;
};

function countGuardPositions(map: string[]): number {
  const { x, y } = findInitialPosition(map);
  const visited: boolean[][][] = Array.from({ length: map.length }, () =>
    Array.from({ length: map[0].length }, () => Array(4).fill(false))
  );
  const { visitedPositions } = patrol(map, x, y);
  return visitedPositions;
}

function patrol(
  map: string[],
  x: number,
  y: number,
  blocker: AdditionalBlocker | null = null
): { visitedPositions: number; trapped: boolean } {
  const visited: boolean[][][] = Array.from({ length: map.length }, () =>
    Array.from({ length: map[0].length }, () => Array(4).fill(false))
  );
  const queue: Step[] = [];
  const dx = [-1, 0, 1, 0];
  const dy = [0, 1, 0, -1];
  let dir = 0;
  queue.push({ x: x, y: y, direction: 0 });
  visited[x][y][0] = true;

  let trapped = false;

  while (queue.length > 0) {
    const cur = queue.shift()!;
    const nx = cur.x + dx[cur.direction];
    const ny = cur.y + dy[cur.direction];
    if (validPosition(map, nx, ny)) {
      if (map[nx][ny] !== "#" && notBlocked(nx, ny, blocker)) {
        // valid move, never visited in this direction
        if (!visited[nx][ny][cur.direction]) {
          visited[nx][ny][cur.direction] = true;
          queue.push({ x: nx, y: ny, direction: cur.direction });
        } else {
          trapped = true;
        }
      } else {
        // change direction, stay in current position
        const nDir = (cur.direction + 1) % 4;
        if (!visited[cur.x][cur.y][nDir]) {
          visited[cur.x][cur.y][nDir] = true;
          queue.push({ x: cur.x, y: cur.y, direction: nDir });
        } else {
          trapped = true;
        }
      }
    }
  }

  let visitedPositions = 0;
  for (let i = 0; i < map.length; i++)
    for (let j = 0; j < map[0].length; j++) {
      let flag = false;
      for (let k = 0; k < 4; k++)
        if (visited[i][j][k]) {
          flag = true;
          break;
        }
      if (flag) {
        visitedPositions++;
      }
    }
  return { visitedPositions: visitedPositions, trapped: trapped };
}

function trapGuard(map: string[]): number {
  const { x, y } = findInitialPosition(map);
  let ans = 0;

  for (let i = 0; i < map.length; i++) {
    const row = map[i];
    for (let j = 0; j < map[i].length; j++) {
      if (map[i][j] === ".") {
        const { trapped } = patrol(map, x, y, { x: i, y: j });
        if (trapped) {
          ans++;
        }
        map[i] = row;
      }
    }
  }
  return ans;
}

function notBlocked(x: number, y: number, blocker: AdditionalBlocker | null) {
  if (blocker === null) {
    return true;
  } else {
    return x != blocker.x || y != blocker.y;
  }
}

function validPosition(map: string[], x: number, y: number): boolean {
  if (x >= 0 && x < map.length && y >= 0 && y < map[0].length) return true;
  return false;
}

function findInitialPosition(map: string[]): { x: number; y: number } {
  let x = -1,
    y = -1;
  for (let i = 0; i < map.length; i++)
    for (let j = 0; j < map[0].length; j++)
      if (map[i][j] === "^") {
        x = i;
        y = j;
      }
  return { x: x, y: y };
}

const { input } = readFile();
console.log(countGuardPositions(input));
console.log(trapGuard(input));
