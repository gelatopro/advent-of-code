import * as fs from "fs";
import * as path from "path";

const _readFile = (): string[] => {
  const filePath = path.join(__dirname, "input.txt");
  const data = fs.readFileSync(filePath, "utf-8");

  const input = data.trim().split("\n");
  return input;
};

const _processInput = (
  input: string[]
): {
  gatesIds: Map<string, number>;
  gatesNames: string[];
  gatesValues: number[];
  edgeDescription: string[];
} => {
  const gatesIds: Map<string, number> = new Map();
  const gatesNames: string[] = [];
  const gatesValues: number[] = [];
  let edgeDescription: string[] = [];
  let n = 0;
  for (let i = 0; i < input.length; i++) {
    if (input[i] === "") {
      edgeDescription = input.slice(i + 1, input.length);
      break;
    } else {
      const [name, vStr] = input[i].split(":");
      const v = Number(vStr);
      addToGraph(gatesIds, gatesNames, name);
      gatesValues.push(v);
    }
  }
  return {
    gatesIds: gatesIds,
    gatesNames: gatesNames,
    gatesValues: gatesValues,
    edgeDescription: edgeDescription,
  };
};

function addToGraph(
  gatesId: Map<string, number>,
  gatesNames: string[],
  gateName: string
): number {
  if (gatesId.has(gateName)) {
    return gatesId.get(gateName)!;
  } else {
    gatesNames.push(gateName);
    gatesId.set(gateName, gatesNames.length - 1);
    return gatesNames.length - 1;
  }
}

function addEdge(
  next: Map<number, number[]>,
  prev: Map<number, number[]>,
  from: number,
  to: number
) {
  if (next.has(from)) {
    next.set(from, [...next.get(from)!, to]);
  } else {
    next.set(from, [to]);
  }
  if (prev.has(to)) {
    prev.set(to, [...prev.get(to)!, from]);
  } else {
    prev.set(to, [from]);
  }
}

function simulate(
  gatesIds: Map<string, number>,
  gatesNames: string[],
  gatesValues: number[],
  edgeDescription: string[]
): number {
  const { next, prev, gateOperations } = _buildGraph(
    gatesIds,
    gatesNames,
    edgeDescription
  );

  let n = gatesNames.length;

  if (gatesValues.length < n) {
    gatesValues.concat(Array(n - gatesValues.length).fill(-1));
  }

  const inDegree: number[] = Array(n).fill(0);
  for (let from = 0; from < n; from++) {
    const nextGates = next.get(from);
    if (nextGates) {
      for (let to of nextGates) {
        inDegree[to]++;
      }
    }
  }

  const queue: number[] = [];
  for (let v = 0; v < n; v++) if (inDegree[v] === 0) queue.push(v);

  while (queue.length > 0) {
    const v = queue.shift()!;
    const nextNodes = next.get(v);
    if (nextNodes) {
      for (let u of nextNodes) {
        inDegree[u]--;
        if (inDegree[u] === 0) {
          queue.push(u);

          const [from1, from2] = prev.get(u)!;
          gatesValues[u] = _calc(
            gatesValues[from1],
            gatesValues[from2],
            gateOperations.get(u)!
          );
        }
      }
    }
  }

  //   console.log(gatesNames);
  //   console.log(gatesValues);
  return _calOutputNumber(gatesNames, gatesValues);
}

interface Gate {
  name: string;
  value: number;
}

function _calOutputNumber(gatesNames: string[], gatesValues: number[]): number {
  const gates: Gate[] = [];
  for (let i = 0; i < gatesNames.length; i++)
    if (gatesNames[i].startsWith("z")) {
      gates.push({ name: gatesNames[i], value: gatesValues[i] });
    }
  gates.sort((a, b) => a.name.localeCompare(b.name));
  let n: bigint = 0n;
  for (let i = 0; i < gates.length; i++) {
    console.log(`${gates[i].name}: ${gates[i].value}`);
    if (gates[i].value === 1) {
      n |= 1n << BigInt(i);
    }
  }
  return Number(n);
}

function _calc(a: number, b: number, operation: string): number {
  if (operation === "AND") {
    return a & b;
  } else if (operation === "OR") {
    return a || b;
  } else if (operation === "XOR") {
    return a ^ b;
  } else {
    throw Error(`${operation} not supported!`);
  }
}

function _buildGraph(
  gatesId: Map<string, number>,
  gatesNames: string[],
  edgeDescription: string[]
): {
  next: Map<number, number[]>;
  prev: Map<number, number[]>;
  gateOperations: Map<number, string>;
} {
  const next: Map<number, number[]> = new Map();
  const prev: Map<number, number[]> = new Map();
  const gateOpreations: Map<number, string> = new Map();

  for (let edge of edgeDescription) {
    const [condition, toStr] = edge.split("->").map((str) => str.trim());
    let from1Str = "",
      from2Str = "",
      operation = "";
    if (condition.includes("AND")) {
      [from1Str, from2Str] = condition.split("AND").map((str) => str.trim());
      operation = "AND";
    } else if (condition.includes("XOR")) {
      [from1Str, from2Str] = condition.split("XOR").map((str) => str.trim());
      operation = "XOR";
    } else if (condition.includes("OR")) {
      [from1Str, from2Str] = condition.split("OR").map((str) => str.trim());
      operation = "OR";
    }
    let from1 = addToGraph(gatesId, gatesNames, from1Str);
    let from2 = addToGraph(gatesId, gatesNames, from2Str);
    let to = addToGraph(gatesId, gatesNames, toStr);
    addEdge(next, prev, from1, to);
    addEdge(next, prev, from2, to);
    gateOpreations.set(to, operation);
  }
  return {
    next: next,
    prev: prev,
    gateOperations: gateOpreations,
  };
}

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

const input = _readFile();
const { gatesIds, gatesNames, gatesValues, edgeDescription } =
  _processInput(input);

// console.log(gatesId);
// console.log(gatesNames);
// console.log(gatesValues);
// console.log(edgeDescription);
// console.log(simulate(gatesIds, gatesNames, gatesValues, edgeDescription));

process(edgeDescription);

function process(edgeDescription: string[]) {
  const sortedEdges: string[] = [];
  for (let edge of edgeDescription) {
    const [condition, toStr] = edge.split("->").map((str) => str.trim());
    let from1Str = "",
      from2Str = "",
      operation = "";
    if (condition.includes("AND")) {
      [from1Str, from2Str] = condition.split("AND").map((str) => str.trim());
      operation = "AND";
    } else if (condition.includes("XOR")) {
      [from1Str, from2Str] = condition.split("XOR").map((str) => str.trim());
      operation = "XOR";
    } else if (condition.includes("OR")) {
      [from1Str, from2Str] = condition.split("OR").map((str) => str.trim());
      operation = "OR";
    }
    if (from1Str > from2Str) {
      sortedEdges.push(
        from2Str + " " + operation + " " + from1Str + "->" + toStr
      );
    } else {
      sortedEdges.push(
        from1Str + " " + operation + " " + from2Str + "->" + toStr
      );
    }
  }

  sortedEdges.sort((a, b) => a.localeCompare(b));

  let str = "";
  for (let edge of sortedEdges) {
    str += edge + "\n";
  }
  _writeFile(str, "output.txt");
}

enum Operation {
  INVALID,
  XOR,
  AND,
  OR,
}

interface GateOperation {
  a: string;
  b: string;
  c: string;
  op: Operation;
}

function process2(edgeDescription: string[]) {
  const ops = _toGateOperations(edgeDescription);
  let prevCarry = "gmk";
  for (let i = 1; i < 45; i++) {
    if (i === 35) {
      console.log(11);
    }
    const x = _getSymbol(i, "x");
    const y = _getSymbol(i, "y");
    const z = _getSymbol(i, "z");
    const xor = _findByOperands(ops, x, y, Operation.XOR);
    const zi = _findByResult(ops, z)!;
    const actualPrevCarry = _findPrevCarry(zi, xor!.c);
    if (actualPrevCarry === null || actualPrevCarry !== prevCarry) {
      console.log(`possible error: bit ${i}`);
    }

    const and = _findByOperands(ops, x, y, Operation.AND)!;
    const prevCarryAndxyXOR = _findByOperands(
      ops,
      prevCarry,
      xor!.c,
      Operation.AND
    );

    if (prevCarryAndxyXOR === null) {
      console.log(`possible error prevCarry&xor at bit ${i}`);
    } else {
      const carry = _findByOperands(
        ops,
        and.c,
        prevCarryAndxyXOR!.c,
        Operation.OR
      );
      if (carry === null) {
        console.log(`possible carry error at bit ${i}`);
      } else {
        prevCarry = carry?.c;
      }
    }
  }
}

function _toGateOperations(edgeDescription: string[]): GateOperation[] {
  const ops: GateOperation[] = [];
  for (let edge of edgeDescription) {
    const [condition, toStr] = edge.split("->").map((str) => str.trim());
    let from1Str = "",
      from2Str = "";
    let operation = Operation.INVALID;
    if (condition.includes("AND")) {
      [from1Str, from2Str] = condition.split("AND").map((str) => str.trim());
      operation = Operation.AND;
    } else if (condition.includes("XOR")) {
      [from1Str, from2Str] = condition.split("XOR").map((str) => str.trim());
      operation = Operation.XOR;
    } else if (condition.includes("OR")) {
      [from1Str, from2Str] = condition.split("OR").map((str) => str.trim());
      operation = Operation.OR;
    } else {
      throw Error("failed to parse edge descriptions");
    }
    ops.push({ a: from1Str, b: from2Str, c: toStr, op: operation });
  }
  return ops;
}

function _findPrevCarry(
  zi: GateOperation,
  sumWithoutCarry: string
): string | null {
  if (zi.a === sumWithoutCarry) return zi.b;
  else if (zi.b === sumWithoutCarry) return zi.a;
  else return null;
}

function _findByOperands(
  ops: GateOperation[],
  symbol1: string,
  symbol2: string,
  operation: Operation
): GateOperation | null {
  for (let op of ops) {
    if (op.op === operation) {
      if (
        (op.a === symbol1 && op.b === symbol2) ||
        (op.a === symbol2 && op.b === symbol1)
      ) {
        return op;
      }
    }
  }
  return null;
}

function _findByResult(
  ops: GateOperation[],
  resultSymbol: string
): GateOperation | null {
  for (let op of ops) {
    if (op.c === resultSymbol) return op;
  }
  return null;
}

function _getSymbol(i: number, prefix: string): string {
  if (i >= 10) return prefix + i.toString();
  else return prefix + "0" + i.toString();
}

process2(edgeDescription);

// ANSWER: all pairs
// gmt <> z07
// cbj <> qjj
// dmn <> z18
// cfk <> z35

// This is the function to add two numbers bit by bit.
// I use process2() to print for exception cases, fix it by manual calculation
// crafted the answered above manually..
// the solution can also be automated, basically for each error case
// we need to find the wrong outputs to swap, a few observations
// prevCarry is always correct, so to find the calculation such that
// a ^ prevCarry -> the result of this should be z(i)
// b & prevCarry -> b should be (x[i] ^ y[i])
function addNumbersUsingBitOps(
  a: number[],
  b: number[],
  c: number[],
  i: number,
  prevCarry: number
) {
  if (i >= c.length) return;

  // Correctly compute the sum without carry
  const sumWithoutCarry = a[i] ^ b[i];

  // Add the carry to the sum
  c[i] = sumWithoutCarry ^ prevCarry;

  // Compute the carry for the next step
  const carry = (a[i] & b[i]) | (prevCarry & (a[i] ^ b[i]));

  addNumbersUsingBitOps(a, b, c, i + 1, carry);
}
