import { time } from "console";
import * as fs from "fs";
import { tmpdir } from "os";
import * as path from "path";

const _readFile = (): { input: string[] } => {
  const filePath = path.join(__dirname, "input.txt");
  const data = fs.readFileSync(filePath, "utf-8");

  const input = data.split(" ");

  return { input };
};

function transform(stones: string[], times: number): number {
  for (let i = 0; i < times; i++) {
    stones = _blink(stones);
  }
  return stones.length;
}

const blinkMap: Map<number, Map<number, number>> = new Map();

const _addToMap = (x: number, y: number, z: number) => {
  if (!blinkMap.has(x)) {
    blinkMap.set(x, new Map());
  }
  blinkMap.get(x)!.set(y, z);
};

function transformV2(stones: string[], times: number): number {
  let ans = 0;
  for (let i = 0; i < stones.length; i++) {
    ans += _dfs(stones[i], times);
  }
  return ans;
}

function _dfs(stone: string, times: number): number {
  let stoneNumber = Number(stone);
  if (blinkMap.has(stoneNumber) && blinkMap.get(stoneNumber)?.has(times)) {
    return blinkMap.get(stoneNumber)?.get(times)!;
  }

  let tmp: string[] = [];
  if (times <= 25) {
    tmp = [stone];
    for (let i = 0; i < times; i++) {
      tmp = _blink(tmp);
    }
    _addToMap(stoneNumber, times, tmp.length);
    return tmp.length;
  } else {
    let tmp = [stone];
    for (let i = 0; i < 5; i++) {
      tmp = _blink(tmp);
    }
    _addToMap(stoneNumber, 5, tmp.length);
    let ans = 0;
    for (let i = 0; i < tmp.length; i++) {
      ans += _dfs(tmp[i], times - 5);
    }

    _addToMap(stoneNumber, times, ans);
    return ans;
  }
}

function _blink(stones: string[]): string[] {
  const tmp: string[] = [];
  for (let i = 0; i < stones.length; i++) {
    if (Number(stones[i]) === 0) {
      tmp.push("1");
    } else if (stones[i].length % 2 === 0 && stones[i].length > 1) {
      const twoStones = _splitStone(stones[i]);
      tmp.push(twoStones[0]);
      tmp.push(twoStones[1]);
    } else {
      tmp.push((Number(stones[i]) * 2024).toString());
    }
  }
  return tmp;
}

function _splitStone(stone: string): string[] {
  return [
    Number(stone.slice(0, stone.length / 2)).toString(),
    Number(stone.slice(stone.length / 2, stone.length)).toString(),
  ];
}

const { input } = _readFile();
console.log(input);
console.log(transform(input, 25));
console.log(transformV2(input, 75));
console.log(blinkMap.size);
