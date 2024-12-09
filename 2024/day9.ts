import * as fs from "fs";
import * as path from "path";
import { BinarySearchTree } from "@datastructures-js/binary-search-tree";

const readFile = (): { input: string } => {
  const filePath = path.join(__dirname, "input.txt");
  const data = fs.readFileSync(filePath, "utf-8");

  return { input: data };
};

function moveFileAndCalCheckSum(diskMap: string): number {
  const diskSpace = restoreDiskSpace(diskMap);
  moveFileBlocks(diskSpace);
  return calCheckSum(diskSpace);
}

function moveWholeFileAndCalCheckSum(diskMap: string): number {
  const diskSpace = restoreDiskSpace(diskMap);
  moveWholeFileBruteForce(diskSpace);
  return calCheckSum(diskSpace);
}

function restoreDiskSpace(diskMap: string): number[] {
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

function moveFileBlocks(diskSpace: number[]) {
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

function moveWholeFileBruteForce(diskSpace: number[]) {
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

// TODO: try to optimize the brute force, but this function is incorrect for now.
function moveWholeFile(diskSpace: number[]) {
  const tree = new BinarySearchTree<Block>((a, b) => {
    if (a.length === b.length) return a.idx - b.idx;
    return a.length - b.length;
  });

  const files: Block[] = [];

  for (let i = 0; i < diskSpace.length; ) {
    let j = i + 1;
    while (j < diskSpace.length && diskSpace[j] === diskSpace[i]) j++;
    const length = j - i,
      v = diskSpace[i];
    if (v === -1) {
      tree.insert({ length: length, idx: i, fileNumber: null });
    } else {
      files.push({ length: length, idx: i, fileNumber: v });
    }
    i = j;
  }

  for (let i = files.length - 1; i >= 0; i--) {
    const fileIdx = files[i].idx,
      fileLength = files[i].length,
      fileNumber = files[i].fileNumber;

    // console.log(fileNumber);
    // printDisk(diskSpace);
    // printTree(tree);

    let emptySpace = tree.upperBound({
      length: fileLength,
      idx: -1e10,
      fileNumber: null,
    });

    // if (emptySpace && emptySpace.getValue().idx < fileIdx) {
    //   const start = emptySpace.getValue().idx,
    //     spaceLength = emptySpace.getValue().length;
    //   for (let j = 0; j < fileLength; j++) {
    //     diskSpace[start + j] = fileNumber!;
    //     diskSpace[fileIdx + j] = -1;
    //   }

    //   // step 1: the previous empty space now has shrunk, update the bst
    //   tree.removeNode(emptySpace);
    //   if (spaceLength > fileLength) {
    //     tree.insert({
    //       length: spaceLength - fileLength,
    //       idx: start + fileLength,
    //       fileNumber: null,
    //     });
    //   }
    // }

    // not great but could work
    let tryLength = fileLength;
    while (emptySpace) {
      if (emptySpace && emptySpace.getValue().idx < fileIdx) {
        const start = emptySpace.getValue().idx,
          spaceLength = emptySpace.getValue().length;
        for (let j = 0; j < fileLength; j++) {
          diskSpace[start + j] = fileNumber!;
          diskSpace[fileIdx + j] = -1;
        }

        // step 1: the previous empty space now has shrunk, update the bst
        tree.removeNode(emptySpace);
        if (spaceLength > fileLength) {
          tree.insert({
            length: spaceLength - fileLength,
            idx: start + fileLength,
            fileNumber: null,
          });
        }

        break;
      } else {
        emptySpace = tree.upperBound({
          length: tryLength + 1,
          idx: fileIdx,
          fileNumber: null,
        });
        tryLength++;
      }
    }
  }
}

function printTree(tree: BinarySearchTree<Block>) {
  tree.traverseInOrder((v) => console.log(v.getValue()));
  console.log("---");
}

function printDisk(diskSpace: number[]) {
  let disk = "";
  for (let v of diskSpace) {
    if (v === -1) disk += ".";
    else disk += v.toString();
  }
  console.log(disk);
}

function calCheckSum(diskSpace: number[]): number {
  let res = 0;
  for (let i = 0; i < diskSpace.length; i++)
    if (diskSpace[i] !== -1) res += diskSpace[i] * i;
  return res;
}

const { input } = readFile();
// console.log(moveFileAndCalCheckSum(input));
console.log(moveWholeFileAndCalCheckSum(input));
