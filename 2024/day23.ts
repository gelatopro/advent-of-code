import * as fs from "fs";
import * as path from "path";

const _readFile = (): string[] => {
  const filePath = path.join(__dirname, "input.txt");
  const data = fs.readFileSync(filePath, "utf-8");

  const input = data.trim().split("\n");
  // .map((str) => Number(str));
  return input;
};

const _processInput = (
  input: string[]
): {
  nodeNameToId: Map<string, number>;
  nodeNames: string[];
  adj: number[][];
} => {
  const nodeNameToId: Map<string, number> = new Map();
  const nodeNames: string[] = [];
  const adj: number[][] = [];
  let i = 0;
  for (let line of input) {
    const [v1Str, v2Str] = line.split("-");
    if (v1Str === "aq" && v2Str === "cg") {
      console.log(1);
    }
    let v1 = 0,
      v2 = 0;
    if (!nodeNameToId.has(v1Str)) {
      v1 = i;
      nodeNames[v1] = v1Str;
      i++;
      adj.push([]);
      nodeNameToId.set(v1Str, v1);
    } else {
      v1 = nodeNameToId.get(v1Str)!;
    }

    if (!nodeNameToId.has(v2Str)) {
      v2 = i;
      nodeNames[v2] = v2Str;
      i++;
      adj.push([]);
      nodeNameToId.set(v2Str, v2);
    } else {
      v2 = nodeNameToId.get(v2Str)!;
    }

    adj[v1].push(v2);
    adj[v2].push(v1);
  }
  return {
    nodeNameToId: nodeNameToId,
    nodeNames: nodeNames,
    adj: adj,
  };
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

function findTriples(
  nodeNameToId: Map<string, number>,
  nodeNames: string[],
  adj: number[][]
): number {
  const edges = Array.from({ length: adj.length }, () =>
    Array(adj.length).fill(false)
  );

  for (let v = 0; v < adj.length; v++) {
    for (let u of adj[v]) {
      edges[v][u] = true;
      edges[u][v] = true;
    }
  }

  let ans = 0;
  for (let v1 = 0; v1 < adj.length; v1++)
    for (let v2 = v1 + 1; v2 < adj.length; v2++)
      for (let v3 = v2 + 1; v3 < adj.length; v3++) {
        if (
          nodeNames[v1].startsWith("t") ||
          nodeNames[v2].startsWith("t") ||
          nodeNames[v3].startsWith("t")
        ) {
          if (edges[v1][v2] && edges[v2][v3] && edges[v1][v3]) {
            ans++;
          }
        }
      }

  return ans;
}

function findPassword(nodeNames: string[], adj: number[][]): string {
  const cliques = _findMaxCliques(adj);
  let maxCliqueLength = 0,
    maxCliqueIdx = -1;
  for (let i = 0; i < cliques.length; i++)
    if (cliques[i].length > maxCliqueLength) {
      maxCliqueLength = cliques[i].length;
      maxCliqueIdx = i;
    }

  let res: string[] = [];
  for (let v of cliques[maxCliqueIdx]) {
    res.push(nodeNames[v]);
  }
  res.sort();
  return res.join(",");
}

function _findMaxCliques(adj: number[][]): number[][] {
  const n = adj.length; // Number of nodes
  const cliques: number[][] = [];

  function _bronKerbosch(
    r: Set<number>, // Current clique
    p: Set<number>, // Potential nodes
    x: Set<number> // Excluded nodes
  ): void {
    if (p.size === 0 && x.size === 0) {
      // No more nodes to add; record the current clique
      cliques.push([...r]);
      return;
    }

    for (const node of [...p]) {
      const neighbors = new Set(adj[node]); // Neighbors of the current node

      _bronKerbosch(
        new Set([...r, node]), // Add the node to the current clique
        new Set([...p].filter((n) => neighbors.has(n))), // P ∩ N(node)
        new Set([...x].filter((n) => neighbors.has(n))) // X ∩ N(node)
      );

      // Remove the node from P and add it to X
      p.delete(node);
      x.add(node);
    }
  }

  const allNodes = new Set(Array.from({ length: n }, (_, i) => i)); // All nodes 0 to n-1
  _bronKerbosch(new Set(), allNodes, new Set());

  return cliques;
}

const input = _readFile();
const { nodeNameToId, nodeNames, adj } = _processInput(input);

console.log(findTriples(nodeNameToId, nodeNames, adj));
console.log(findPassword(nodeNames, adj));
