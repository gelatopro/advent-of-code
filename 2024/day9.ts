import * as fs from "fs";
import * as path from "path";
import { BinarySearchTree } from "@datastructures-js/binary-search-tree";
import { BST } from "./BST";
import { MinPriorityQueue } from "@datastructures-js/priority-queue";

const readFile = (): { input: string } => {
  const filePath = path.join(__dirname, "input.txt");
  const data = fs.readFileSync(filePath, "utf-8");

  return { input: data };
};

function moveFileAndCalCheckSum(diskMap: string): number {
  const diskSpace = _restoreDiskSpace(diskMap);
  _moveFileBlocks(diskSpace);
  return _calCheckSum(diskSpace);
}

function moveWholeFileAndCalCheckSum(diskMap: string): number {
  const diskSpace2 = _restoreDiskSpace(diskMap);
  _moveWholeFile(diskSpace2);

  return _calCheckSum(diskSpace2);
}

function _checkFirstDiscrepancy(a: number[], b: number[]) {
  for (let i = 0; i < a.length; i++)
    if (a[i] !== b[i]) {
      console.log(
        `first discrepancy found at idx ${i}, a[i] = ${a[i]}, b[i] = ${b[i]}`
      );
      break;
    }

  _printDisk(a.slice(0, 25));
  _printDisk(b.slice(0, 25));
}

function _restoreDiskSpace(diskMap: string): number[] {
  const diskSpace: number[] = [];
  let id = 0;
  for (let i = 0; i < diskMap.length; i++) {
    if (i % 2 !== 0) {
      for (let j = 0; j < Number(diskMap[i]); j++) diskSpace.push(-1);
    } else {
      for (let j = 0; j < Number(diskMap[i]); j++) diskSpace.push(id);
      id++;
    }
  }
  return diskSpace;
}

function _moveFileBlocks(diskSpace: number[]) {
  let l = 0,
    r = diskSpace.length - 1;

  while (l < r) {
    while (l < diskSpace.length && diskSpace[l] !== -1) l++;
    while (r >= 0 && diskSpace[r] === -1) r--;
    if (l < r) {
      diskSpace[l] = diskSpace[r];
      diskSpace[r] = -1;
      l++;
      r--;
    }
  }
}

interface Block {
  length: number;
  idx: number;
  fileNumber: number | null;
}

function _moveWholeFileBruteForce(diskSpace: number[]) {
  const files: Block[] = [];
  const spaces: Block[] = [];
  for (let i = 0; i < diskSpace.length; ) {
    let j = i + 1;
    while (j < diskSpace.length && diskSpace[j] === diskSpace[i]) j++;
    const length = j - i,
      v = diskSpace[i];
    if (v === -1) {
      spaces.push({ length: length, idx: i, fileNumber: -1 });
    } else {
      files.push({ length: length, idx: i, fileNumber: v });
    }
    i = j;
  }

  for (let i = files.length - 1; i >= 0; i--) {
    for (let j = 0; j < spaces.length && spaces[j].idx < files[i].idx; j++)
      if (spaces[j].length >= files[i].length) {
        for (let k = 0; k < files[i].length; k++) {
          diskSpace[spaces[j].idx + k] = files[i].fileNumber!;
          diskSpace[files[i].idx + k] = -1;
        }

        spaces[j].length -= files[i].length;
        spaces[j].idx = spaces[j].idx + files[i].length;

        break;
      }
    // printDisk(diskSpace);
  }
}

// key observation is that there are only 9 possible lengths (0-9).
// So the solution is to maintain a MinPriorityQueue for each length
function _moveWholeFile(diskSpace: number[]) {
  const emptySpaces: MinPriorityQueue<number>[] = Array.from(
    { length: 10 },
    () => new MinPriorityQueue()
  );
  const files: Block[] = [];

  for (let i = 0; i < diskSpace.length; ) {
    let j = i + 1;
    while (j < diskSpace.length && diskSpace[j] === diskSpace[i]) j++;
    const length = j - i,
      v = diskSpace[i];
    if (v === -1) {
      emptySpaces[length].enqueue(length, i);
    } else {
      files.push({ length: length, idx: i, fileNumber: v });
    }
    i = j;
  }

  for (let i = files.length - 1; i >= 0; i--) {
    const fileIndex = files[i].idx,
      fileLength = files[i].length,
      fileNumber = files[i].fileNumber;

    let availableSpaceIdx: number | null = null;
    let choosenLength: number | null = null;

    // find the smallest idx from MinPriorityQueues with length >= fileLength
    for (let len = fileLength; len < 10; len++) {
      if (!emptySpaces[len].isEmpty()) {
        const idx = emptySpaces[len].front().priority;
        if (!availableSpaceIdx || idx < availableSpaceIdx) {
          availableSpaceIdx = idx;
          choosenLength = len;
        }
      }
    }

    if (availableSpaceIdx && availableSpaceIdx < fileIndex) {
      const tmp = emptySpaces[choosenLength!].dequeue();
      const spaceLength = tmp.element;
      for (let j = 0; j < fileLength; j++) {
        diskSpace[fileIndex + j] = -1;
        diskSpace[availableSpaceIdx + j] = fileNumber!;
      }

      if (spaceLength > fileLength) {
        emptySpaces[spaceLength - fileLength].enqueue(
          spaceLength - fileLength,
          availableSpaceIdx + fileLength
        );
      }
    }
  }
}

function _printDisk(diskSpace: number[]) {
  let disk = "";
  for (let v of diskSpace) {
    if (v === -1) disk += ".";
    else disk += v.toString();
  }
  console.log(disk);
}

function _calCheckSum(diskSpace: number[]): number {
  let res = 0;
  for (let i = 0; i < diskSpace.length; i++)
    if (diskSpace[i] !== -1) res += diskSpace[i] * i;
  return res;
}

const { input } = readFile();
console.log(moveFileAndCalCheckSum(input));
console.log(moveWholeFileAndCalCheckSum(input));
