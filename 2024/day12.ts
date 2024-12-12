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

function calFencePrice(map: string[]): number {
  const visited = Array.from({ length: map.length }, () =>
    Array(map[0].length).fill(0)
  );

  let totalPrice = 0,
    regionNumber = 0;

  for (let i = 0; i < map.length; i++)
    for (let j = 0; j < map[0].length; j++)
      if (!visited[i][j]) {
        regionNumber++;
        const { area, perimeter } = _dfs(map, visited, regionNumber, i, j);
        totalPrice += area * perimeter;
      }

  return totalPrice;
}

function calFencePriceV2(map: string[]): number {
  const visited = Array.from({ length: map.length }, () =>
    Array(map[0].length).fill(0)
  );

  let totalPrice = 0,
    regionNumber = 0;

  const areas: number[] = [];
  let areaCode: string = "";

  for (let i = 0; i < map.length; i++)
    for (let j = 0; j < map[0].length; j++)
      if (!visited[i][j]) {
        regionNumber++;
        const { area } = _dfs(map, visited, regionNumber, i, j);
        areas.push(area);
        areaCode += map[i][j];
      }

  for (let i = 0; i < areas.length; i++) {
    const sides = _calSides(visited, i + 1);
    // console.log(`areaCode:${areaCode[i]}, area: ${areas[i]}, sides: ${sides}`);
    totalPrice += sides * areas[i];
  }
  return totalPrice;
}

function _calSides(visited: number[][], regionNumber: number): number {
  let sides = 0;
  for (let r = 0; r < visited.length; r++) {
    for (let c = 0; c < visited[r].length; ) {
      if (visited[r][c] !== regionNumber || !_hasUpperSide(visited, r, c)) {
        c++;
      } else {
        let i = c;
        while (
          i < visited[r].length &&
          visited[r][i] === regionNumber &&
          _hasUpperSide(visited, r, i)
        )
          i++;
        sides++;
        c = i + 1;
      }
    }

    for (let c = 0; c < visited[r].length; ) {
      if (visited[r][c] !== regionNumber || !_hasLowerSide(visited, r, c)) {
        c++;
      } else {
        let i = c;
        while (
          i < visited[r].length &&
          visited[r][i] === regionNumber &&
          _hasLowerSide(visited, r, i)
        )
          i++;
        sides++;
        c = i + 1;
      }
    }
  }

  for (let c = 0; c < visited[0].length; c++) {
    for (let r = 0; r < visited.length; ) {
      if (visited[r][c] !== regionNumber || !_hasLeftSide(visited, r, c)) {
        r++;
      } else {
        let i = r;
        while (
          i < visited.length &&
          visited[i][c] === regionNumber &&
          _hasLeftSide(visited, i, c)
        )
          i++;
        sides++;
        r = i + 1;
      }
    }

    for (let r = 0; r < visited.length; ) {
      if (visited[r][c] !== regionNumber || !_hasRightSide(visited, r, c)) {
        r++;
      } else {
        let i = r;
        while (
          i < visited.length &&
          visited[i][c] === regionNumber &&
          _hasRightSide(visited, i, c)
        )
          i++;
        sides++;
        r = i + 1;
      }
    }
  }

  return sides;
}

function _hasUpperSide(visited: number[][], x: number, y: number): boolean {
  return x === 0 || visited[x][y] !== visited[x - 1][y];
}

function _hasLowerSide(visited: number[][], x: number, y: number): boolean {
  return x === visited.length - 1 || visited[x][y] !== visited[x + 1][y];
}
function _hasLeftSide(visited: number[][], x: number, y: number): boolean {
  return y === 0 || visited[x][y] !== visited[x][y - 1];
}
function _hasRightSide(visited: number[][], x: number, y: number): boolean {
  return y === visited[0].length - 1 || visited[x][y] !== visited[x][y + 1];
}

function _dfs(
  map: string[],
  visited: number[][],
  regionNumber: number,
  x: number,
  y: number
): { area: number; perimeter: number } {
  visited[x][y] = regionNumber;
  let currentArea = 1,
    currentPerimeter = 0;

  for (let i = 0; i < 4; i++) {
    const nx = x + dx[i],
      ny = y + dy[i];
    if (_validMove(map, x, y, nx, ny)) {
      if (!visited[nx][ny]) {
        const { area, perimeter } = _dfs(map, visited, regionNumber, nx, ny);
        currentArea += area;
        currentPerimeter += perimeter;
      }
    } else {
      currentPerimeter++;
    }
  }

  return {
    area: currentArea,
    perimeter: currentPerimeter,
  };
}

function _validMove(
  map: string[],
  x: number,
  y: number,
  nx: number,
  ny: number
): boolean {
  if (nx >= 0 && nx < map.length && ny >= 0 && ny < map[0].length) {
    if (map[x][y] === map[nx][ny]) return true;
    return false;
  }
  return false;
}

const { input } = _readFile();
// console.log(input);
console.log(calFencePrice(input));
console.log(calFencePriceV2(input));
