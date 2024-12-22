import * as fs from "fs";
import * as path from "path";

const _readFile = (): number[] => {
  const filePath = path.join(__dirname, "input.txt");
  const data = fs.readFileSync(filePath, "utf-8");

  const input = data
    .trim()
    .split("\n")
    .map((str) => Number(str));
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

function iterateSecretNumbers(secrets: number[], times: number): number {
  const newSecrets: number[] = [];
  let res = 0;
  for (let secret of secrets) {
    let x = BigInt(secret);
    for (let i = 0; i < times; i++) {
      x = _iterate(x);
    }
    res += Number(x);
  }
  return res;
}

function _iterate(a: bigint): bigint {
  a = (a ^ (a * 64n)) % 16777216n;
  a = (a ^ (a / 32n)) % 16777216n;
  a = (a ^ (a * 2048n)) % 16777216n;
  return a;
}

function calcMostBananas(secrets: number[], times: number): number {
  const prices: number[][] = [];
  for (let secret of secrets) {
    const p: number[] = [secret % 10];
    let x = BigInt(secret);
    for (let i = 0; i < times; i++) {
      x = _iterate(x);
      p.push(Number(x) % 10);
    }
    prices.push(p);
  }

  let ans: number | null = null;
  const cache: Map<string, number> = new Map();

  for (let k = 0; k < prices.length; k++) {
    const currentKeySets = new Set<string>();
    for (let i = 0; i + 4 < prices[k].length; i++) {
      const seq = [
        prices[k][i + 1] - prices[k][i],
        prices[k][i + 2] - prices[k][i + 1],
        prices[k][i + 3] - prices[k][i + 2],
        prices[k][i + 4] - prices[k][i + 3],
      ];
      const key = seq.toString();
      if (!currentKeySets.has(key)) {
        currentKeySets.add(key);
        const tmp = (cache.get(key) || 0) + prices[k][i + 4];
        cache.set(key, tmp);
        if (!ans || tmp > ans) ans = tmp;
      }
    }
  }

  return ans === null ? 0 : ans;
}

const input = _readFile();
console.log(iterateSecretNumbers(input, 2000));
console.log(calcMostBananas(input, 2000));
