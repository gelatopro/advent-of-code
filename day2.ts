import * as fs from "fs";

const readFile = (): { reports: number[][] } => {
  const data = fs.readFileSync(
    "/Users/yaominggong/repo/advent-of-code-2024/input.txt",
    "utf-8"
  );

  const lines = data.trim().split("\n");
  const reports: number[][] = [];

  lines.forEach((line) => {
    const values = line.trim().split(/\s+/).map(Number);
    reports.push(values);
  });

  return { reports };
};

function countSafeReports(reports: number[][]): number {
  let ans = 0;
  for (let i = 0; i < reports.length; i++) {
    if (reports[i].length === 1) {
      ans++;
    } else {
      if (reports[i][1] > reports[i][0]) {
        if (isSafeReport(true, reports[i])) ans++;
      } else {
        if (isSafeReport(false, reports[i])) ans++;
      }
    }
  }
  return ans;
}

function countSafeReportsWithDampener(reports: number[][]): number {
  let ans = 0;
  for (let i = 0; i < reports.length; i++) {
    if (reports[i].length === 1) {
      ans++;
    } else {
      if (isSafeReportWithDampener(reports[i])) ans++;
    }
  }
  return ans;
}

function isSafeReport(ascending: boolean, report: number[]) {
  if (ascending) {
    for (let i = 1; i < report.length; i++) {
      if (report[i] - report[i - 1] < 1 || report[i] - report[i - 1] > 3)
        return false;
    }
    return true;
  } else {
    for (let i = 1; i < report.length; i++) {
      if (report[i - 1] - report[i] < 1 || report[i - 1] - report[i] > 3)
        return false;
    }
    return true;
  }
}

function isSafeReportWithDampener(report: number[]): boolean {
  if (tryDampener(true, report)) return true;
  if (tryDampener(false, report)) return true;
  return false;
}

function tryDampener(ascending: boolean, report: number[]): boolean {
  const prefixGood: boolean[] = new Array(report.length).fill(false);
  const suffixGood: boolean[] = new Array(report.length).fill(false);
  prefixGood[0] = true;
  for (let i = 1; i < report.length; i++) {
    if (
      Math.abs(report[i] - report[i - 1]) >= 1 &&
      Math.abs(report[i] - report[i - 1]) <= 3 &&
      report[i] > report[i - 1] === ascending
    ) {
      prefixGood[i] = prefixGood[i - 1] && true;
    } else {
      prefixGood[i] = false;
    }
  }
  if (prefixGood[report.length - 1]) return true;

  suffixGood[report.length - 1] = true;
  for (let i = report.length - 2; i >= 0; i--) {
    if (
      Math.abs(report[i + 1] - report[i]) >= 1 &&
      Math.abs(report[i + 1] - report[i]) <= 3 &&
      report[i + 1] > report[i] === ascending
    ) {
      suffixGood[i] = suffixGood[i + 1] && true;
    } else {
      suffixGood[i] = false;
    }
  }
  if (suffixGood[0]) return true;

  // now try use dampener once

  // remove first
  if (suffixGood[1]) return true;
  // remove last
  if (prefixGood[report.length - 2]) return true;

  // remove one in the middle
  for (let i = 1; i < report.length - 1; i++) {
    if (prefixGood[i - 1] && suffixGood[i + 1]) {
      if (
        Math.abs(report[i + 1] - report[i - 1]) >= 1 &&
        Math.abs(report[i + 1] - report[i - 1]) <= 3 &&
        report[i + 1] > report[i - 1] === ascending
      ) {
        return true;
      }
    }
  }
  return false;
}

const { reports } = readFile();
console.log(countSafeReportsWithDampener(reports));
