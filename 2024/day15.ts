import * as fs from "fs";
import * as path from "path";

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

const _processInput = (input: string[]): { map: string[]; moves: string } => {
  const map: string[] = [];
  let moves = "";
  let i = 0;
  for (; i < input.length && input[i] !== ""; i++) {
    map.push(input[i]);
  }
  for (i = i + 1; i < input.length; i++) moves += input[i];
  return {
    map: map,
    moves: moves,
  };
};

interface Position {
  x: number;
  y: number;
}

function moveRobot(map: number[][], moves: string): number {
  let robot = _getRobotPosition(map);
  for (let i = 0; i < moves.length; i++) {
    if (moves[i] === "^") robot = _moveUp(map, robot);
    if (moves[i] === "v") robot = _moveDown(map, robot);
    if (moves[i] === ">") robot = _moveRight(map, robot);
    if (moves[i] === "<") robot = _moveLeft(map, robot);
  }
  // _printMap(_convertToStrMap(map));
  return _calGPS(map);
}

function moveRobotV2(map: number[][], moves: string): number {
  let robot = _getRobotPosition(map);
  for (let i = 0; i < moves.length; i++) {
    if (moves[i] === "^") robot = _moveUpV2(map, robot);
    if (moves[i] === "v") robot = _moveDownV2(map, robot);
    if (moves[i] === ">") robot = _moveRightV2(map, robot);
    if (moves[i] === "<") robot = _moveLeftV2(map, robot);
    // console.log(`Moving direction: ${moves[i]}`);
    // console.log(_convertToStrMap(map));
    // console.log("----");
  }
  _printMap(_convertToStrMap(map));
  return _calGPS(map);
}

function _getRobotPosition(map: number[][]): Position {
  for (let i = 0; i < map.length; i++)
    for (let j = 0; j < map[0].length; j++)
      if (map[i][j] === 2) {
        return { x: i, y: j };
      }
  throw new Error("can't find robot");
}

function _moveUp(map: number[][], robot: Position): Position {
  let i = robot.x - 1;
  while (i >= 0 && map[i][robot.y] === 1) i--;
  if (map[i][robot.y] === 0) {
    for (let j = i; j < robot.x; j++) map[j][robot.y] = map[j + 1][robot.y];
    map[robot.x][robot.y] = 0;
    return { x: robot.x - 1, y: robot.y };
  } else {
    return robot;
  }
}
function _moveDown(map: number[][], robot: Position): Position {
  let i = robot.x + 1;
  while (i < map.length && map[i][robot.y] === 1) i++;
  if (map[i][robot.y] === 0) {
    for (let j = i; j > robot.x; j--) map[j][robot.y] = map[j - 1][robot.y];
    map[robot.x][robot.y] = 0;
    return { x: robot.x + 1, y: robot.y };
  } else {
    return robot;
  }
}
function _moveLeft(map: number[][], robot: Position): Position {
  let i = robot.y - 1;
  while (i >= 0 && map[robot.x][i] === 1) i--;
  if (map[robot.x][i] === 0) {
    for (let j = i; j < robot.y; j++) map[robot.x][j] = map[robot.x][j + 1];
    map[robot.x][robot.y] = 0;
    return { x: robot.x, y: robot.y - 1 };
  } else {
    return robot;
  }
}
function _moveRight(map: number[][], robot: Position): Position {
  let i = robot.y + 1;
  while (i < map[0].length && map[robot.x][i] === 1) i++;
  if (map[robot.x][i] === 0) {
    for (let j = i; j > robot.y; j--) map[robot.x][j] = map[robot.x][j - 1];
    map[robot.x][robot.y] = 0;
    return { x: robot.x, y: robot.y + 1 };
  } else {
    return robot;
  }
}

function _swap(
  map: number[][],
  x1: number,
  y1: number,
  x2: number,
  y2: number
) {
  const tmp = map[x1][y1];
  map[x1][y1] = map[x2][y2];
  map[x2][y2] = tmp;
}

function _expand(
  map: number[][],
  startX: number,
  startY: number,
  dx: number
): { q: Position[]; canMove: boolean } {
  const inQueue: boolean[][] = Array.from({ length: map.length }, () =>
    Array(map[0].length).fill(false)
  );
  const q: Position[] = [{ x: startX, y: startY }];
  inQueue[startX][startY] = true;

  let canMove = true,
    l = 0,
    r = 1;

  while (l < r) {
    let cx = q[l].x,
      cy = q[l].y;
    l++;
    if (cx === 0 || map[cx + dx][cy] === -1) {
      // hit wall
      canMove = false;
      break;
    } else if ((cx > 0 && map[cx + dx][cy] === 3) || map[cx + dx][cy] === 4) {
      // next to another box
      if (!inQueue[cx + dx][cy]) {
        q.push({ x: cx + dx, y: cy });
        r++;
        inQueue[cx + dx][cy] = true;
      }
      if (map[cx + dx][cy] === 3 && !inQueue[cx + dx][cy + 1]) {
        q.push({ x: cx + dx, y: cy + 1 });
        r++;
        inQueue[cx + dx][cy + 1] = true;
      }
      if (map[cx + dx][cy] === 4 && !inQueue[cx + dx][cy - 1]) {
        q.push({ x: cx + dx, y: cy - 1 });
        r++;
        inQueue[cx + dx][cy - 1] = true;
      }
    } // empty space, do nothing
  }

  return {
    q: q,
    canMove: canMove,
  };
}

function _moveUpV2(map: number[][], robot: Position): Position {
  if (robot.x > 0 && map[robot.x - 1][robot.y] === 0) {
    // empty spot
    _swap(map, robot.x - 1, robot.y, robot.x, robot.y);
    return { x: robot.x - 1, y: robot.y };
  } else if (robot.x === 0 || map[robot.x - 1][robot.y] === -1) {
    // wall
    return robot;
  } else {
    // trying to push a box up
    const { q, canMove } = _expand(map, robot.x, robot.y, -1);
    if (!canMove) return robot;
    else {
      for (let i = q.length - 1; i >= 0; i--) {
        _swap(map, q[i].x, q[i].y, q[i].x - 1, q[i].y);
      }
      return { x: robot.x - 1, y: robot.y };
    }
  }
}
function _moveDownV2(map: number[][], robot: Position): Position {
  if (robot.x < map.length - 1 && map[robot.x + 1][robot.y] === 0) {
    // empty spot
    _swap(map, robot.x + 1, robot.y, robot.x, robot.y);
    return { x: robot.x + 1, y: robot.y };
  } else if (robot.x === map.length - 1 || map[robot.x + 1][robot.y] === -1) {
    // wall
    return robot;
  } else {
    // trying to push a box up
    const { q, canMove } = _expand(map, robot.x, robot.y, 1);
    if (!canMove) return robot;
    else {
      for (let i = q.length - 1; i >= 0; i--) {
        _swap(map, q[i].x, q[i].y, q[i].x + 1, q[i].y);
      }
      return { x: robot.x + 1, y: robot.y };
    }
  }
}
function _moveLeftV2(map: number[][], robot: Position): Position {
  let i = robot.y - 1;
  const x = robot.x;

  while (i >= 0 && map[x][i] === 4) i -= 2;

  if (map[x][i] === 0) {
    for (let j = i; j < robot.y; j++) map[x][j] = map[x][j + 1];
    map[x][robot.y] = 0;
    return { x: robot.x, y: robot.y - 1 };
  } else {
    return robot;
  }
}
function _moveRightV2(map: number[][], robot: Position): Position {
  let i = robot.y + 1;
  const x = robot.x;

  while (i < map[0].length && map[x][i] === 3) i += 2;

  if (map[x][i] === 0) {
    for (let j = i; j > robot.y; j--) map[x][j] = map[x][j - 1];
    map[x][robot.y] = 0;
    return { x: robot.x, y: robot.y + 1 };
  } else {
    return robot;
  }
}

function _calGPS(map: number[][]): number {
  let res = 0;
  for (let i = 0; i < map.length; i++)
    for (let j = 0; j < map[0].length; j++)
      if (map[i][j] === 1 || map[i][j] === 3) res += i * 100 + j;
  return res;
}

function _covertToNumberMap(map: string[]): number[][] {
  const numMap: number[][] = [];
  for (let line of map) {
    const numLine: number[] = [];
    for (let ch of line) {
      if (ch === ".") numLine.push(0);
      else if (ch === "#") numLine.push(-1);
      else if (ch === "O") numLine.push(1);
      else if (ch === "@") numLine.push(2);
      else if (ch === "[") numLine.push(3);
      else if (ch === "]") numLine.push(4);
    }
    numMap.push(numLine);
  }
  return numMap;
}

function _convertToStrMap(numMap: number[][]): string[] {
  const map: string[] = [];
  for (let numLine of numMap) {
    let str = "";
    for (let num of numLine) {
      if (num === 0) str += ".";
      else if (num === -1) str += "#";
      else if (num === 1) str += "O";
      else if (num === 2) str += "@";
      else if (num === 3) str += "[";
      else if (num === 4) str += "]";
    }
    map.push(str);
  }
  return map;
}

function _printMap(map: string[]) {
  let str = "";
  for (let line of map) {
    str += line;
    str += "\n";
  }
  _writeFile(str);
}

function _scaleMap(map: string[]): string[] {
  const newMap: string[] = [];
  for (let line of map) {
    let str = "";
    for (let ch of line) {
      if (ch === "#") str += "##";
      else if (ch === "O") str += "[]";
      else if (ch === ".") str += "..";
      else if (ch === "@") str += "@.";
    }
    newMap.push(str);
  }
  return newMap;
}

const input = _readFile();
const { map, moves } = _processInput(input);
const numMap = _covertToNumberMap(map);
console.log(moveRobot(numMap, moves));

const scaledMap = _scaleMap(map);
const scaledNumMap = _covertToNumberMap(scaledMap);
console.log(moveRobotV2(scaledNumMap, moves));
