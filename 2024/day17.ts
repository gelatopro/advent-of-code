import * as fs from "fs";
import { endianness } from "os";
import * as path from "path";

let a: number,
  b: number,
  c: number,
  oa: number,
  ob: number,
  oc: number,
  program: number[],
  pointer: number,
  output: number[] = [];

const _readFile = (): string[] => {
  const filePath = path.join(__dirname, "input.txt");
  const data = fs.readFileSync(filePath, "utf-8");

  const input = data.trim().split("\n");
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

const _processInput = (
  input: string[]
): { a: number; b: number; c: number; program: number[] } => {
  const a = Number(input[0].split(" ")[2]);
  const b = Number(input[1].split(" ")[2]);
  const c = Number(input[2].split(" ")[2]);
  const program = input[4]
    .split(" ")[1]
    .split(",")
    .map((v) => Number(v));
  return {
    a: a,
    b: b,
    c: c,
    program: program,
  };
};

function runProgram(program: number[]): string {
  pointer = 0;
  while (pointer < program.length) {
    _run(program[pointer], program[pointer + 1]);
  }
  return output.join(",");
}

function _run(opcode: number, operand: number) {
  switch (opcode) {
    case 0:
      _adv(operand);
      break;
    case 1:
      _bxl(operand);
      break;
    case 2:
      _bst(operand);
      break;
    case 3:
      _jnz(operand);
      break;
    case 4:
      _bxc(operand);
      break;
    case 5:
      _out(operand);
      break;
    case 6:
      _bdv(operand);
      break;
    case 7:
      _cdv(operand);
      break;
    default:
      throw Error(`opcode ${opcode} not recongnized!`);
  }
}

function _adv(comboOperand: number) {
  a = Math.trunc(a / Math.pow(2, _getComboValue(comboOperand)));
  pointer += 2;
}

function _bxl(comboOperand: number) {
  b = Number(BigInt(b) ^ BigInt(_getLiteralValue(comboOperand)));
  pointer += 2;
}

function _bst(comboOperand: number) {
  b = _getComboValue(comboOperand) % 8;
  pointer += 2;
}

function _jnz(comboOperand: number) {
  if (a !== 0) {
    pointer = _getLiteralValue(comboOperand);
  } else {
    pointer += 2;
  }
}

function _bxc(comboOperand: number) {
  b = Number(BigInt(b) ^ BigInt(c));
  pointer += 2;
}

function _out(comboOperand: number) {
  output.push(_getComboValue(comboOperand) % 8);
  pointer += 2;
}

function _bdv(comboOperand: number) {
  b = Math.trunc(a / Math.pow(2, _getComboValue(comboOperand)));
  pointer += 2;
}

function _cdv(comboOperand: number) {
  c = Math.trunc(a / Math.pow(2, _getComboValue(comboOperand)));
  pointer += 2;
}

function _getComboValue(comboOperand: number): number {
  if (comboOperand >= 0 && comboOperand <= 3) return comboOperand;
  if (comboOperand === 4) return a;
  if (comboOperand === 5) return b;
  if (comboOperand === 6) return c;
  throw Error(`Invalid combo operand ${comboOperand}`);
}

function _getLiteralValue(comboOperand: number): number {
  return comboOperand;
}

const input = _readFile();
({ a, b, c, program } = _processInput(input));
console.log(runProgram(program));

let a1BitArray: number[] = [];
let answer: number | null = null;
function serach3(expected: number[]): number {
  _dfs2(expected, 0, 0, true, false);
  if (answer) {
    return answer;
  } else {
    throw Error("answer not found!");
  }
}

function _dfs2(
  expected: number[],
  outputIdx: number,
  a1Idx: number,
  findB: boolean,
  findC: boolean
) {
  if (outputIdx >= expected.length) {
    let tooLarge = false;
    for (let i = a1BitArray.length - 1; i >= 0; i--)
      if (a1BitArray[i] === 1) {
        if (i >= 52) {
          tooLarge = true;
          break;
        }
      }
    if (!tooLarge) {
      const v = _tonumber(a1BitArray);
      if (!answer || v < answer) {
        answer = v;
        console.log(
          `found answer!: ${v}, bit array length: ${a1BitArray.length}, array= ${a1BitArray}`
        );
      }
    }
    return;
  }

  if (findB) {
    if (a1Idx + 2 >= a1BitArray.length) {
      // no enough bits for b
      for (let v = 0; v < 2; v++) {
        a1BitArray.push(v);
        _dfs2(expected, outputIdx, a1Idx, findB, findC);
        a1BitArray.pop();
      }
    } else {
      findB = false;
      findC = true;
    }
  }

  if (findC) {
    // found b, now, find c
    let ob1 = _toValue(a1BitArray, a1Idx, a1Idx + 3);
    let b1 = ob1 ^ 1;
    if (a1Idx + b1 + 2 < a1BitArray.length) {
      // also found c, try to validate
      let c1 = _toValue(a1BitArray, a1Idx + b1, a1Idx + b1 + 3);
      let t1 = b1 ^ c1;
      let t2 = t1 ^ 6;
      if (t2 === expected[outputIdx]) {
        // found the correct answer for outputIdx
        _dfs2(expected, outputIdx + 1, a1Idx + 3, true, false);
      }
    } else {
      // no enough bits for c, search
      for (let v = 0; v < 2; v++) {
        a1BitArray.push(v);
        _dfs2(expected, outputIdx, a1Idx, false, true);
        a1BitArray.pop();
      }
    }
  }
}

function _toValue(a: number[], from: number, to: number): number {
  let res = 0,
    base = 1;
  for (let i = from; i < to; i++) {
    if (a[i] === 1) {
      res += 1 << (i - from);
    }
  }
  return res;
}

function _tonumber(a: number[]): number {
  let result: bigint = 0n; // Use BigInt
  for (let i = 0; i < a.length; i++) {
    result |= BigInt(a[i]) << BigInt(i); // Convert to BigInt and shift
  }
  return Number(result);
}

const expectedRes = [2, 4, 1, 1, 7, 5, 0, 3, 4, 7, 1, 6, 5, 5, 3, 0];
console.log(serach3(expectedRes));
