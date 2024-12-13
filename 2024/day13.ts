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

const { input } = _readFile();
let { a, b, prize } = _processInput(input);
console.log(calMinToken(a, b, prize));
prize = _alterPrize(prize);
