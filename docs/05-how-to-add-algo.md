# How to Add a New Algorithm

Adding a new algorithm is straightforward. Here's the step-by-step.

## Quick Summary

1. Add to `js/core/config.js`
2. Create `partials/inputs/{algo}.html` (input form)
3. Create `js/algorithms/{algo}.js` (implementation)
4. Import in `js/main.js`
5. Register in `js/main.js`

## Step 1: Add to config.js

Add the algorithm name to `ALGO_ORDER` and metadata:

```javascript
// js/core/config.js

export const ALGO_ORDER = [
  // ... existing...
  "newalgo",  // Add here in order
];

export const ALGO_META = {
  // ... existing...
  newalgo: {
    title: "New Algorithm Name",
    tag: "Greedy",  // Category tag
    color: "#ff6600",  // Brand color (hex)
  },
};

export const COMPLEXITY_META = {
  // ... existing...
  newalgo: {
    time: "O(n log n)",
    space: "O(n)",
    category: "Greedy",
  },
};
```

## Step 2: Create Input Form

Create `partials/inputs/newalgo.html`:

```html
<div class="space-y-4">
  <div>
    <label class="block text-sm font-medium text-slate-700">
      Input
    </label>
    <textarea
      id="newalgo-input"
      class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
      rows="3"
      placeholder="Enter input..."></textarea>
  </div>
</div>
```

- Use an ID like `newalgo-input` so algorithm can read it
- Use semantic Tailwind classes

## Step 3: Create Algorithm Implementation

Create `js/algorithms/newalgo.js`:

```javascript
import { setText, setTrustedHTML, el } from "../core/dom.js";
import { state } from "../core/state.js";

export default {
  async setup(ctx) {
    // Called when algorithm page loads
    const inputEl = el("newalgo-input");
    if (!inputEl) return;
    
    // Parse input, draw initial state
    drawInitialState(inputEl.value);
  },

  run(ctx) {
    const input = el("newalgo-input")?.value || "";
    const data = parseInput(input);
    const steps = [];
    
    for (let i = 0; i < data.length; i++) {
      // Each step is a function that updates UI
      steps.push(() => {
        // Update some state
        ctx.state.currentStep = i;
        
        // Draw something on canvas
        drawStep(i);
        
        // Log something
        ctx.addLog(`Processing item ${i}`);
      });
    }
    
    return {
      steps,              // Step functions
      logs: ["Started", "Done"],
      result: "Result: 42",
    };
  },

  reset(ctx) {
    // Clear canvas, remove highlights
    clearCanvas();
  },

  action(ctx, node) {
    // Handle special actions (dropdowns, buttons)
    // Return true if handled
  },
};
```

### What Each Function Does

| Function | When Called | Purpose |
|----------|-----------|--------|
| `setup(ctx)` | Page loads | Read input, draw initial state |
| `run(ctx)` | Run clicked | Compute & return steps |
| `reset(ctx)` | Reset clicked | Clear state |
| `action(ctx, node)` | Special action | Handle custom UI |

### What run() Should Return

```javascript
run(ctx) {
  return {
    steps: [      // REQUIRED: Array of step functions
      () => { /* step 1 */ },
      () => { /* step 2 */ },
    ],
    logs: [     // OPTIONAL: Initial log messages
      "Starting...",
      "Processing...",
    ],
    result: "42",     // OPTIONAL: Final result
    resultHtml: "...",  // OPTIONAL: HTML result
  };
}
```

### Context API Available

```javascript
ctx.state        // State object (read/write)
ctx.addLog(msg) // Add log message
ctx.el(id)     // document.getElementById(id)
ctx.renderSidebar(algo, result)  // Update sidebar
ctx.getSpeedMs()   // Animation speed
ctx.isActive()  // Check if still current algo
```

## Step 4: Import in main.js

Add import at the top:

```javascript
// js/main.js
import * as complexity from "./algorithms/complexity.js";
import * as mst from "./algorithms/mst.js";
// ... existing imports ...
import * as newalgo from "./algorithms/newalgo.js";  // Add this
```

## Step 5: Register the Algorithm

Add to registry:

```javascript
setAlgoRunnerRegistry({
  complexity,
  mst,
  knapsack,
  // ... existing ...
  newalgo,  // Add this
});
```

## That's It!

The algorithm will now:
- Appear on the home page card
- Load its input form when clicked
- Run step-by-step when Run is clicked

## Example: Minimal Algorithm

Here's the simplest possible algorithm:

```javascript
// js/algorithms/mysimple.js
export default {
  run(ctx) {
    const steps = [
      () => ctx.addLog("Step 1: Starting"),
      () => ctx.addLog("Step 2: Doing work"),
      () => ctx.addLog("Step 3: Done!"),
    ];
    return { steps, result: "Completed!" };
  },
};
```

Just those ~10 lines and it's a working algorithm!

## Canvas Drawing (If Needed)

If your algorithm needs canvas visualization:

```javascript
function drawSomething(value, color = "blue") {
  const canvas = el("algo-canvas");
  const ctx = canvas?.getContext("2d");
  if (!ctx) return;
  
  ctx.fillStyle = color;
  ctx.fillRect(10, 10, 50, 50);
}
```

Check existing algorithms for canvas examples:
- `mst.js` - Graph drawing
- `subarray.js` - Array bar drawing