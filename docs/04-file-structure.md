# File Structure Deep Dive

## All Files Overview

```
DAA-Project/
├── index.html                      # Main HTML shell
├── partials/
│   ├── home.html                # Home page content (9 algorithm cards)
│   ├── algo-layout.html         # Algorithm workspace template
│   └── inputs/               # Input forms for each algorithm
│       ├── complexity.html
│       ├── mst.html
│       ├── knapsack.html
│       ├── activity.html
│       ├── subarray.html
│       ├── lcs.html
│       ├── obst.html
│       ├── hamiltonian.html
│       └── graphcoloring.html
├── js/
│   ├── main.js               # Entry point, event handling
│   ├── core/
│   │   ├── config.js        # Algorithm metadata
│   │   ├── state.js        # Global state
│   │   ├── runner.js       # Runs algorithms
│   │   ├── dom.js         # DOM helpers
│   │   └── sidebar.js     # Sidebar rendering
│   └── algorithms/         # Algorithm implementations
│       ├── complexity.js
│       ├── mst.js
│       ├── knapsack.js
│       ├── activity.js
│       ├── subarray.js
│       ├── lcs.js
│       ├── obst.js
│       ├── hamiltonian.js
│       └── graphcoloring.js
└── docs/                   # Documentation
```

## index.html

The main shell. Has:
- Header with title and navigation
- `#app` container that htmx loads content into
- Imports htmx and main.js

Key attributes on `#app`:
- `hx-get="partials/home.html"` - what to fetch
- `hx-trigger="load"` - when to fetch (on page load)
- `hx-target="#app"` - where to put it
- `hx-swap="innerHTML"` - how to insert

## partials/home.html

The home page content. Contains:
- Header section "DAA Lab Project"
- Stats row (9 algorithms, 4 categories)
- Grid of 9 algorithm cards

Each card has htmx attributes:
```html
<a href="#/algo/mst"
   hx-get="partials/algo-layout.html?algo=mst"
   hx-target="#app"
   hx-push-url="#/algo/mst">
```

## partials/algo-layout.html

The algorithm workspace template. Has placeholders:
- `#algo-page` - the main container
- `#algo-title` - algorithm title (set by main.js)
- `#algo-tag-badge` - tag like "Greedy" (set by main.js)
- `#input-section` - where input form loads
- `#workspace` - canvas/visualization area
- `#controls` - Run/Step/Reset buttons
- `#sidebar-content` - results, logs, complexity

## partials/inputs/{algo}.html

Each input form. Example (mst.html):
- Textarea for edge input (format: "A-B-5")
- Parse button
- Has id like `mst-edges`

## js/main.js - Entry Point

What it does:
1. **Registry setup** - Register all algorithm modules
```javascript
setAlgoRunnerRegistry({
  complexity,
  mst,
  knapsack,
  // ... etc
});
```

2. **Event listeners** - Handle htmx swaps and clicks
```javascript
document.body.addEventListener("htmx:afterSwap", onAfterSwap);
document.body.addEventListener("click", onDelegatedAction);
document.body.addEventListener("change", onDelegatedAction);
```

3. **Page initialization** - Detect and init pages
```javascript
function initPageFromApp(app, evt) {
  // Check if home or algo page, initialize accordingly
}
```

4. **Action handling** - Route Run/Step/Reset clicks
```javascript
function onDelegatedAction(evt) {
  // Check action type, call runner functions
}
```

## js/core/config.js

Algorithm metadata:

```javascript
export const ALGO_ORDER = [
  "complexity", "mst", "knapsack", "activity",
  "subarray", "lcs", "obst", "hamiltonian", "graphcoloring",
];

export const ALGO_META = {
  mst: {
    title: "Minimum Spanning Tree",
    tag: "Greedy",
    color: "#14b8a6",  // Teal
  },
  // ... etc
};

export const COMPLEXITY_META = {
  mst: {
    time: "O(E log V)",
    space: "O(V + E)",
    category: "Greedy",
  },
  // ... etc
};
```

## js/core/state.js

One object, single source of truth:

```javascript
export const state = {
  currentAlgo: null,
  setupVersion: 0,
  animTimer: null,
  stepQueue: [],
  stepIdx: 0,
  logs: [],
  mstTC: 0,
  gcPreset: 0,
};
```

## js/core/runner.js

Core execution engine:

- `runAlgo()` - Start automatic step execution
- `stepAlgo()` - Execute one step
- `resetAlgo()` - Clear state and reset
- `setupCurrentAlgo()` - Call algorithm's setup()
- `createAlgorithmContext()` - Create context for algorithms
- `getSpeedMs()` - Get animation speed
- `dispatchAlgoAction()` - Handle special actions

## js/core/dom.js

Simple DOM helpers:

```javascript
el(id)           // document.getElementById(id)
setText(id, txt)  // Set textContent
setTrustedHTML()  // Set innerHTML (only for trusted templates)
clearTimer()     // Clear interval
```

## js/core/sidebar.js

Renders the right sidebar:

- `renderSidebar(algo, result)` - Full sidebar HTML
- `renderStepLog()` - Log messages
- `addLog(msg)` - Add a log message
- `createTrustedSidebarResult(key)` - Error templates

## js/algorithms/{algo}.js

Each algorithm follows the same pattern:

```javascript
export default {
  async setup(ctx) { /* ... */ },
  run(ctx) { /* ... */ },
  reset(ctx) { /* ... */ },
  action(ctx, node) { /* ... */ },
};
```

### setup(ctx)
- Called when algorithm page loads
- Read input from form
- Draw initial state on canvas
- Return nothing (or nothing needed)

### run(ctx)
- Called when Run is clicked
- Compute algorithm
- Return step functions and results

### reset(ctx)
- Called when Reset is clicked
- Clear highlights, reset canvas
- Return nothing

### action(ctx, node)
- Called for special actions (dropdowns, etc.)
- Return true if handled