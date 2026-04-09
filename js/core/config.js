export const ALGO_ORDER = [
  "complexity",
  "mst",
  "knapsack",
  "activity",
  "subarray",
  "lcs",
  "obst",
  "hamiltonian",
  "graphcoloring",
];

export const ALGO_META = {
  complexity: { title: "Complexity Analysis", tag: "Analysis", color: "#8b5cf6" },
  mst: { title: "Minimum Spanning Tree", tag: "Greedy", color: "#14b8a6" },
  knapsack: { title: "Fractional Knapsack", tag: "Greedy", color: "#f59e0b" },
  activity: { title: "Activity Selection", tag: "Greedy", color: "#fb7185" },
  subarray: { title: "Maximum Subarray", tag: "Divide & Conquer", color: "#84cc16" },
  lcs: { title: "Longest Common Subsequence", tag: "Dynamic Programming", color: "#6366f1" },
  obst: { title: "Optimal BST", tag: "Dynamic Programming", color: "#10b981" },
  hamiltonian: { title: "Hamiltonian Cycle", tag: "Backtracking", color: "#ef4444" },
  graphcoloring: { title: "Graph Coloring", tag: "Backtracking", color: "#0ea5e9" },
};

export const COMPLEXITY_META = {
  complexity: { time: "O(1) to O(n^2)", space: "O(1)", category: "Analysis" },
  mst: { time: "O(E log V)", space: "O(V + E)", category: "Greedy" },
  knapsack: { time: "O(n log n)", space: "O(1)", category: "Greedy" },
  activity: { time: "O(n log n)", space: "O(1)", category: "Greedy" },
  subarray: { time: "O(n log n)", space: "O(log n)", category: "Divide & Conquer" },
  lcs: { time: "O(m * n)", space: "O(m * n)", category: "Dynamic Programming" },
  obst: { time: "O(n^3)", space: "O(n^2)", category: "Dynamic Programming" },
  hamiltonian: { time: "O(n!)", space: "O(n)", category: "Backtracking" },
  graphcoloring: { time: "O(m^V)", space: "O(V)", category: "Backtracking" },
};
