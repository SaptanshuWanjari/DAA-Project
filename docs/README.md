# DAA Visualizer - Documentation

The project visualizes 9 classic algorithms step-by-step.

## Start Here

**NEW?** Start with [01-how-loading-works.md](01-how-loading-works.md) to understand how the app loads and navigates.

**WANT TO RUN ALGORITHMS?** See [02-how-algorithms-run.md](02-how-algorithms-run.md) to understand execution.

**DEBUGGING?** Check [06-debugging.md](06-debugging.md) for common issues.

## All Docs

| Doc | What It Covers |
|-----|---------------|
| [01-how-loading-works.md](01-how-loading-works.md) | How index.html → home.html → algo-layout.html loads |
| [02-how-algorithms-run.md](02-how-algorithms-run.md) | Run/Step/Reset flow, step execution |
| [03-state-and-context.md](03-state-and-context.md) | Global state, runner context, guards |
| [04-file-structure.md](04-file-structure.md) | Every file explained |
| [05-how-to-add-algo.md](05-how-to-add-algo.md) | Add a new algorithm |
| [06-debugging.md](06-debugging.md) | Console logging, common issues |
| [07-quick-reference.md](07-quick-reference.md) | Cheat sheet - functions, IDs, etc |

## Quick Overview

1. **index.html** loads - has empty `#app`
2. **htmx** fetches `partials/home.html` → injects into `#app`
3. **main.js** detects page type → initializes
4. User clicks algorithm card → htmx fetches `partials/algo-layout.html?algo={slug}`
5. User enters input → clicks **Run** → algorithm executes step-by-step

## The 9 Algorithms

| # | Algorithm | Category |
|---|----------|----------|
| 1 | Complexity Analysis | Analysis |
| 2 | Minimum Spanning Tree | Greedy |
| 3 | Fractional Knapsack | Greedy |
| 4 | Activity Selection | Greedy |
| 5 | Maximum Subarray | Divide & Conquer |
| 6 | LCS | Dynamic Programming |
| 7 | Optimal BST | Dynamic Programming |
| 8 | Hamiltonian Cycle | Backtracking |
| 9 | Graph Coloring | Backtracking |

## File Structure

```
DAA-Project/
├── index.html              # Main shell
├── partials/
│   ├── home.html         # Home page
│   ├── algo-layout.html  # Algorithm workspace
│   └── inputs/         # Input forms
├── js/
│   ├── main.js         # Entry point
│   ├── core/         # Core modules
│   └── algorithms/    # 9 algorithm files
└── docs/              # This doc set
```

## Running Locally

Open `index.html` in a browser. No build step needed.

Or use a local server:
```bash
npx serve .
```