import * as fs from "fs";
import * as path from "path";

type Coordinates = {
  x: number;
  y: number;
};

const _readFile = (): { input: string[] } => {
  const filePath = path.join(__dirname, "input.txt");
  const data = fs.readFileSync(filePath, "utf-8");

  const input = data.trim().split("\n");
  return { input };
};

const _processInput = (
  input: string[]
): { a: Coordinates[]; b: Coordinates[]; prize: Coordinates[] } => {
  const a: Coordinates[] = [],
    b: Coordinates[] = [],
    prize: Coordinates[] = [];

  for (let i = 0; i < input.length; i++) {
    if (input[i].startsWith("Button")) {
      let match1 = input[i].match(/X\+(\d+).*Y\+(\d+)/);
      if (match1) {
        const x = parseInt(match1[1], 10);
        const y = parseInt(match1[2], 10);
        a.push({ x: x, y: y });
      }
      match1 = input[i + 1].match(/X\+(\d+).*Y\+(\d+)/);
      if (match1) {
        const x = parseInt(match1[1], 10);
        const y = parseInt(match1[2], 10);
        b.push({ x: x, y: y });
      }
      match1 = input[i + 2].match(/X=(\d+),\s*Y=(\d+)/);
      if (match1) {
        const x = parseInt(match1[1], 10);
        const y = parseInt(match1[2], 10);
        prize.push({ x: x, y: y });
      }
      i = i + 2;
    }
  }
  return {
    a: a,
    b: b,
    prize: prize,
  };
};

const _alterPrize = (prize: Coordinates[]): Coordinates[] => {
  for (let p of prize) {
    p.x += 10000000000000;
    p.y += 10000000000000;
  }
  return prize;
};

function calMinToken(
  a: Coordinates[],
  b: Coordinates[],
  prize: Coordinates[]
): number {
  let ans = 0;
  for (let k = 0; k < a.length; k++) {
    let minToken: number | null = null;
    for (let i = 0; i <= 100; i++)
      for (let j = 0; j <= 100; j++)
        if (
          a[k].x * i + b[k].x * j === prize[k].x &&
          a[k].y * i + b[k].y * j === prize[k].y
        ) {
          // console.log(
          //   `push a button ${i} times, b button ${j} times, win prize ${prize[k]}`
          // );
          if (!minToken || i * 3 + j < minToken) {
            minToken = i * 3 + j;
          }
        }

    if (minToken) {
      ans += minToken;
    }
  }
  return ans;
}

function calMinTokenV2(
  a: Coordinates[],
  b: Coordinates[],
  prize: Coordinates[]
): number {
  let ans = 0;
  for (let i = 0; i < a.length; i++) {
    const minToken = _calc(
      prize[i].x,
      prize[i].y,
      a[i].x,
      a[i].y,
      b[i].x,
      b[i].y
    );
    if (minToken) ans += minToken;
  }
  return ans;
}

function _calc(
  x: number,
  y: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number | null {
  if (x1 * y2 === x2 * y1) {
    // https://en.wikipedia.org/wiki/B%C3%A9zout%27s_identity
    if (x1 * y2 === x2 * y1 && x2 * y === x * y2) {
      const c = _gcd(y1, y2);
      if (y % c === 0) {
        // better solution：https://en.wikipedia.org/wiki/Extended_Euclidean_algorithm
        let ans: number | null = null;
        for (let i = 0; i < Math.floor(y / y1); i++) {
          const tmp = y - y1 * i;
          if (tmp >= 0 && tmp % y2 === 0) {
            const j = tmp / y2;
            if (!ans || i * 3 + j < ans) {
              ans = i * 3 + j;
            }
          }
        }
        return ans;
      } else {
        return null;
      }
    } else {
      return null;
    }
  } else {
    const d = x1 * y2 - y1 * x2;
    if ((x * y2 - y * x2) % d === 0 && (y * x1 - x * y1) % d === 0) {
      const a = (x * y2 - y * x2) / d,
        b = (y * x1 - x * y1) / d;
      if (a >= 0 && b >= 0) {
        return 3 * a + b;
      } else {
        return null;
      }
    }
    return null;
  }
}

function _gcd(a: number, b: number): number {
  return b === 0 ? a : _gcd(b, a % b);
}

const { input } = _readFile();
let { a, b, prize } = _processInput(input);
console.log(calMinToken(a, b, prize));
prize = _alterPrize(prize);
console.log(calMinTokenV2(a, b, prize));
