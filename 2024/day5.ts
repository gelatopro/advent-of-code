import * as fs from "fs";
import * as path from "path";

const readFile = (): { input: string[] } => {
  const currentWorkingDir = process.cwd();
  const filePath = path.join(currentWorkingDir, "2024/input.txt");
  const data = fs.readFileSync(filePath, "utf-8");

  const input = data.trim().split("\n");
  return { input };
};

function processInput(input: string[]): {
  orderMap: number[][];
  updates: number[][];
} {
  const orders: number[][] = [];
  const updates: number[][] = [];
  input.forEach((value, index) => {
    const order = value.split("|");
    if (order.length === 2) {
      orders.push(order.map((v) => Number(v)));
    } else {
      const update = value.split(",");
      if (update.length > 1) {
        updates.push(update.map((v) => Number(v)));
      }
    }
  });

  return {
    orderMap: orders,
    updates: updates,
  };
}

function findSafeUpdate(orderMap: number[][], updates: number[][]): number {
  let ans = 0;
  const dependencies = buildDependencies(orderMap);
  for (let i = 0; i < updates.length; i++) {
    let safeUpdate = isSafeUpdate(updates[i], dependencies);
    if (safeUpdate) {
      ans += updates[i][Math.floor(updates[i].length / 2)];
    }
  }
  return ans;
}

function fixUnSafeUpdate(orderMap: number[][], updates: number[][]): number {
  let ans = 0;
  const dependencies = buildDependencies(orderMap);
  for (let i = 0; i < updates.length; i++) {
    let safeUpdate = isSafeUpdate(updates[i], dependencies);
    if (!safeUpdate) {
      const tmp: number[] = [];
      updates[i].forEach((v) => {
        if (tmp.length === 0) {
          tmp.push(v);
        } else {
          if (dependencies[v][tmp[0]]) {
            tmp.unshift(v);
          } else {
            let j = 0;
            while (j < tmp.length && dependencies[tmp[j]][v]) j++;
            if (j === tmp.length) {
              tmp.push(v);
            } else {
              tmp.splice(j, 0, v);
            }
          }
        }
      });

      ans += tmp[Math.floor(tmp.length / 2)];
    }
  }
  return ans;
}

function isSafeUpdate(update: number[], dependencies: boolean[][]): boolean {
  let safeUpdate = true;

  for (let j = 0; j < update.length; j++)
    for (let k = j + 1; k < update.length; k++) {
      const x = update[j],
        y = update[k];
      if (dependencies[y][x]) {
        safeUpdate = false;
        break;
      }
    }

  return safeUpdate;
}

function buildDependencies(orderMap: number[][]): boolean[][] {
  const dependencies: boolean[][] = Array.from({ length: 100 }, () =>
    Array(100).fill(false)
  );
  for (let i = 0; i < orderMap.length; i++) {
    dependencies[orderMap[i][0]][orderMap[i][1]] = true;
  }
  return dependencies;
}

const { input } = readFile();
const { orderMap, updates } = processInput(input);
console.log(findSafeUpdate(orderMap, updates));
console.log(fixUnSafeUpdate(orderMap, updates));
