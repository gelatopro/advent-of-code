import * as fs from "fs";
import * as path from "path";

const readFile = (): { input: string[] } => {
  const filePath = path.join(__dirname, "input.txt");
  const data = fs.readFileSync(filePath, "utf-8");

  const input = data.trim().split("\n");
  return { input };
};

type Position = {
  x: number;
  y: number;
};

function countAntinodes(m: string[]): number {
  const r = m.length,
    c = m[0].length;
  const antennas = findAntenas(m);
  const antinodes: Set<string> = new Set();
  antennas.forEach((positions, _key) => {
    for (let i = 0; i < positions.length; i++)
      for (let j = i + 1; j < positions.length; j++) {
        const { first, second } = calAntinodes(positions[i], positions[j]);
        if (inMap(first, r, c)) {
          antinodes.add(getPositonKey(first));
        }
        if (inMap(second, r, c)) {
          antinodes.add(getPositonKey(second));
        }
      }
  });
  return antinodes.size;
}

function countAntinodesV2(m: string[]): number {
  const r = m.length,
    c = m[0].length;
  const antennas = findAntenas(m);
  const antinodes: Set<string> = new Set();
  antennas.forEach((positions, _key) => {
    positions.forEach((p) => antinodes.add(getPositonKey(p)));

    for (let i = 0; i < positions.length; i++)
      for (let j = i + 1; j < positions.length; j++) {
        const tmp = calValidAntinodesV2(positions[i], positions[j], r, c);
        tmp.forEach((v) => antinodes.add(getPositonKey(v)));
      }
  });
  return antinodes.size;
}

function findAntenas(m: string[]): Map<string, Position[]> {
  const antennas: Map<string, Position[]> = new Map();
  for (let i = 0; i < m.length; i++)
    for (let j = 0; j < m[0].length; j++)
      if (isAntenna(m[i][j])) {
        if (!antennas.has(m[i][j])) {
          antennas.set(m[i][j], []);
        }
        antennas.get(m[i][j])!.push({ x: i, y: j });
      }
  return antennas;
}

function calValidAntinodesV2(
  antenna1: Position,
  antenna2: Position,
  r: number,
  c: number
): Position[] {
  const positions: Position[] = [];
  for (let i = 1; ; i++) {
    const p = {
      x: (antenna2.x - antenna1.x) * i + antenna2.x,
      y: (antenna2.y - antenna1.y) * i + antenna2.y,
    };
    if (inMap(p, r, c)) {
      positions.push(p);
    } else {
      break;
    }
  }

  for (let i = 1; ; i++) {
    const p = {
      x: (antenna1.x - antenna2.x) * i + antenna1.x,
      y: (antenna1.y - antenna2.y) * i + antenna1.y,
    };
    if (inMap(p, r, c)) {
      positions.push(p);
    } else {
      break;
    }
  }

  return positions;
}

function getPositonKey(a: Position): string {
  return `x:${a.x},y:${a.y}`;
}

function calAntinodes(
  antenna1: Position,
  antenna2: Position
): { first: Position; second: Position } {
  return {
    first: {
      x: antenna2.x - antenna1.x + antenna2.x,
      y: antenna2.y - antenna1.y + antenna2.y,
    },
    second: {
      x: antenna1.x - antenna2.x + antenna1.x,
      y: antenna1.y - antenna2.y + antenna1.y,
    },
  };
}

function inMap(p: Position, r: number, c: number): boolean {
  return p.x >= 0 && p.x < r && p.y >= 0 && p.y < c;
}

function isAntenna(ch: string): boolean {
  const asciiCode = ch.charCodeAt(0);
  if (
    (asciiCode >= 48 && asciiCode <= 57) ||
    (asciiCode >= 65 && asciiCode <= 90) ||
    (asciiCode >= 97 && asciiCode <= 122)
  ) {
    return true;
  } else {
    return false;
  }
}

const { input } = readFile();
console.log(countAntinodes(input));
console.log(countAntinodesV2(input));
