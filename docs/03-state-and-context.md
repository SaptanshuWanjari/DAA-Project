# State and Context Explained

## The Two State Concepts

There's **global state** and **runner context**. Both are related but serve different purposes.

## Global State (state.js)

This is the single source of truth for the whole app:

```javascript
// js/core/state.js
export const state = {
  currentAlgo: null,     // "mst", "knapsack", etc.
  setupVersion: 0,      // Incremented on each setup (used to detect stale setups)
  animTimer: null,       // setInterval ID (null when not running)
  stepQueue: [],         // Array of step functions waiting to execute
  stepIdx: 0,           // Current position in stepQueue
  logs: [],              // All log messages accumulated
  mstTC: 0,             // MST-specific: total cost
  gcPreset: 0,          // Graph Coloring-specific: preset index
};
```

**Why setupVersion?**
When you click an algorithm, `setup()` runs async. If the user quickly clicks a different algorithm, both `setup()` calls might complete. The version check ensures only the latest one applies:

```javascript
// Simplified version check
export async function setupCurrentAlgo() {
  const setupAlgo = state.currentAlgo;  // e.g., "mst"
  invalidateSetupLifecycle();          // state.setupVersion++
  const setupVersion = state.setupVersion;
  
  await handler.setup(ctx);
  
  // Only apply if still on the same algorithm
  return shouldApply();  // checks: state.currentAlgo === setupAlgo && state.setupVersion === setupVersion
}
```

## Runner Context (runner.js)

This is what gets passed to algorithms. It's a **restricted, guarded version** of the state:

```javascript
function createAlgorithmContext(options = {}) {
  const shouldApply = options.shouldApply || (() => true);
  
  return {
    state,             // Same state object (not copied!)
    addLog: createGuardedMethod(addLog, shouldApply),
    renderSidebar: createGuardedMethod(renderSidebar, shouldApply),
    getSpeedMs,
    clearTimer,
    el(id),
    setTrustedHTML: createGuardedMethod(setTrustedHTML, shouldApply),
    isActive: shouldApply,
  };
}
```

**Why guards?**
If the algorithm changes mid-execution, the guards ensure old steps don't override the new state:

```javascript
function createGuardedMethod(method, shouldApply) {
  return (...args) => {
    if (!shouldApply()) {
      return undefined;  // Do nothing if algo changed
    }
    return method(...args);
  };
}
```

## How Algorithms Use State

Algorithms can both **read** and **write** state:

### Reading (in setup() or run())
```javascript
async setup(ctx) {
  // Read current algo
  const algo = ctx.state.currentAlgo;  // "mst"
  
  // Read previous logs
  const logs = ctx.state.logs;
  
  // Read mst-specific value
  const tc = ctx.state.mstTC;
}
```

### Writing (in step functions)
```javascript
// Inside run() returning steps
steps.push(() => {
  ctx.state.mstTC += edge.weight;
  ctx.addLog(`Added edge, total: ${ctx.state.mstTC}`);
});
```

Or in setup():
```javascript
async setup(ctx) {
  ctx.state.stepQueue = [];  // Reset queue
  ctx.state.stepIdx = 0;
}
```

## What Each State Field Means

| Field | Purpose | Who Modifies |
|-------|---------|-------------|
| `currentAlgo` | Which algo is active | main.js when algo page loads |
| `setupVersion` | Detects stale setups | runner.js when setup() is called |
| `animTimer` | Interval timer ID | runner.js when Run/Step/Reset |
| `stepQueue` | Steps to execute | Algorithm's run() |
| `stepIdx` | Current step | runner.js in runNextQueuedStep() |
| `logs` | Messages for sidebar | Algorithm steps via addLog |
| `mstTC` | MST total cost | MST algorithm |
| `gcPreset` | Graph Coloring preset | GC algorithm |

## Accessing State in Steps

Since `ctx.state` points to the same object, steps can communicate:

```javascript
// mst.js - setup
async setup(ctx) {
  const edges = parseInput(ctx.el('mst-edges').value);
  ctx.state.mstTC = 0;
  ctx.state.selectedEdges = [];
}

// mst.js - run
run(ctx) {
  const steps = [];
  
  for (let i = 0; i < edges.length; i++) {
    steps.push(() => {
      // Can read what's in state from setup
      const currentTC = ctx.state.mstTC;
      const edge = edges[i];
      
      ctx.state.mstTC += edge.weight;
      ctx.state.selectedEdges.push(edge.id);
      
      drawEdge(edge.id, 'highlighted');
      ctx.addLog(`Added edge ${edge.id}, cost: ${ctx.state.mstTC}`);
    });
  }
  
  return { steps, result: ctx.state.mstTC };
}
```

## Resetting State

When you click **Reset** or switch algorithms:

```javascript
function resetTransientState() {
  clearTimer(state);
  invalidateSetupLifecycle();  // state.setupVersion++
  state.stepQueue = [];
  state.stepIdx = 0;
  state.logs = [];
  state.mstTC = 0;
  state.gcPreset = 0;
}
```

This clears everything so the new algorithm starts fresh.