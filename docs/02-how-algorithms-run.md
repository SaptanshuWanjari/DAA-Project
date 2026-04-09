# How Algorithms Run

## The Big Picture

When you're on an algorithm page and click **Run**, here's what happens:

1. main.js catches the click event
2. Calls runner.js functions (runAlgo / stepAlgo)
3. Runner calls the algorithm's `run()` function
4. Algorithm returns a list of "step" functions
5. Runner stores them in `state.stepQueue`
6. Runner starts a timer that executes each step with delay
7. Each step updates the UI (highlights, draws on canvas, etc.)

## The State Object

Everything that's memory-resident lives in `state`:

```javascript
// js/core/state.js
export const state = {
  currentAlgo: null,      // "mst", "knapsack", etc.
  setupVersion: 0,       // Incremented each setup, used to check if still valid
  animTimer: null,        // The setInterval timer ID
  stepQueue: [],         // Array of step functions to execute
  stepIdx: 0,            // Which step we're on (0 = first)
  logs: [],              // Log messages to show in sidebar
  mstTC: 0,            // Used by MST algorithm
  gcPreset: 0,          // Used by Graph Coloring algorithm
};
```

## The Runner Context

Each algorithm receives a **context object** when it runs. Think of it as the API the algorithm can use:

```javascript
// What's passed to every algorithm
ctx = {
  state,              // The state object above
  addLog(msg),       // Add a message to the step log
  renderSidebar(algo, result),  // Update sidebar with results
  getSpeedMs(),      // Get current animation speed (from slider)
  clearTimer(),      // Stop the animation
  el(id),            // Shortcut: document.getElementById(id)
  setTrustedHTML(id, html),  // Set innerHTML (safe for templates)
  isActive(),        // Returns false if algo changed, true if still current
}
```

## Algorithm Module Structure

Each algorithm (e.g., `mst.js`) exports an object with these functions:

```javascript
// js/algorithms/mst.js
export default {
  // Called when algorithm page loads
  // Use to: read input, draw initial state, set up canvas
  async setup(ctx) {
    const input = ctx.el('mst-edges').value;
    // Parse input, draw graph on canvas
  },

  // Called when Run is clicked
  // Use to: compute algorithm and return step functions
  run(ctx) {
    const steps = [];
    
    steps.push(() => {
      // First step: highlight edge 1
    });
    steps.push(() => {
      // Second step: highlight edge 2
    });
    // ... more steps
    
    return {
      steps,           // Array of functions to execute one by one
      logs: ['Starting...', 'Edge selected...'],
      result: 'Total weight: 10',
    };
  },

  // Called when Reset is clicked
  // Use to: clear highlights, reset canvas
  reset(ctx) {
    // Clear canvas, remove highlights
  },

  // Called for special buttons/inputs
  // Use for: MST preset switch, etc.
  action(ctx, node) {
    // Handle special actions
  },
};
```

## How Run/Step/Reset Work

### Click Run
```javascript
// js/main.js
if (action === 'run') {
  runAlgo();  // Start the automatic step-by-step run
}

// js/core/runner.js
export function runAlgo() {
  clearTimer(state);          // Stop any existing timer
  initializeQueueIfNeeded(); // Call algorithm's run() if queue empty
  
  if (state.stepQueue.length === 0) return;
  
  // Start interval timer
  state.animTimer = window.setInterval(() => {
    runNextQueuedStep();
  }, getSpeedMs());
}
```

### Click Step
```javascript
// Same as Run but only executes ONE step
export function stepAlgo() {
  clearTimer(state);          // Stop interval (if running)
  initializeQueueIfNeeded(); 
  runNextQueuedStep();         // Execute just one step
}
```

### Click Reset
```javascript
export function resetAlgo() {
  clearTimer(state);          // Stop interval
  invalidateSetupLifecycle(); // Increment setupVersion
  state.stepQueue = [];       // Clear queue
  state.stepIdx = 0;          // Reset index
  state.logs = [];            // Clear logs
  
  // Call algorithm's reset() if it has one
  const resetHandler = getResetHandler(handler);
  if (resetHandler) {
    resetHandler(ctx);
  }
}
```

## Step Execution

```javascript
function runNextQueuedStep() {
  if (state.stepIdx >= state.stepQueue.length) {
    clearTimer(state);  // All done!
    return false;
  }
  
  const step = state.stepQueue[state.stepIdx];
  state.stepIdx += 1;
  
  if (typeof step === 'function') {
    step();  // Execute this step (updates UI)
  }
  
  if (state.stepIdx >= state.stepQueue.length) {
    clearTimer(state);  // Queue empty, stop timer
  }
  
  return true;
}
```

## How Each Step Updates UI

The step function does the actual work. Example from MST:

```javascript
// Inside algorithm's run() function
steps.push(() => {
  const edge = edges[i];
  ctx.state.currentEdge = edge.id;
  
  // Draw edge in different color
  drawEdgeOnCanvas(edge, 'highlighted');
  
  // Add log message
  ctx.addLog(`Selected edge ${edge.id} with weight ${edge.weight}`);
  
  // Update state for next step
  ctx.state.selectedEdges.push(edge);
});
```

## Summary

```
User clicks Run
    ↓
main.js catches event
    ↓
runner.runAlgo()
    ↓
If queue empty: call algorithm.run(ctx) to build step queue
    ↓
Start setInterval
    ↓
Each tick: execute next step() function from queue
    ↓
step() updates canvas, highlights, logs, etc.
    ↓
When queue empty: stop timer, algorithm done
```

## Speed Control

The speed slider (default 700ms) controls how fast steps execute:

```javascript
function getSpeedMs() {
  const control = document.getElementById('speed-range');
  return control?.value || 700;
}
```

Lower value = faster animation. Minimum is 50ms.