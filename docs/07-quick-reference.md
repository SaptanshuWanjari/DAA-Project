# Quick Reference

## Key Files

| File | Purpose |
|------|---------|
| `index.html` | Main shell |
| `partials/home.html` | Home page |
| `partials/algo-layout.html` | Algorithm template |
| `partials/inputs/{algo}.html` | Input forms |
| `js/main.js` | Entry point |
| `js/core/state.js` | Global state |
| `js/core/runner.js` | Execution engine |
| `js/core/config.js` | Algorithm config |
| `js/algorithms/{algo}.js` | Algorithm code |

## Key IDs in HTML

| ID | Where | Purpose |
|----|-------|---------|
| `#app` | index.html | Content container |
| `#algo-title` | algo-layout.html | Algorithm title |
| `#algo-tag-badge` | algo-layout.html | Category tag |
| `#algo-inputs` | algo-layout.html | Input form location |
| `#viz-content` | algo-layout.html | Canvas area |
| `#sidebar-content` | algo-layout.html | Sidebar container |
| `#result-content` | sidebar.js | Result display |
| `#step-log` | sidebar.js | Log messages |
| `#speed-range` | algo-layout.html | Speed slider |

## Key Functions

### main.js
```javascript
runAlgo()           // Start automatic execution
stepAlgo()          // Execute one step
resetAlgo()         // Reset state
setupCurrentAlgo()   // Call algorithm setup()
```

### context (passed to algorithms)
```javascript
ctx.state           // Global state object
ctx.addLog(msg)     // Add log message
ctx.el(id)          // document.getElementById(id)
ctx.setTrustedHTML(id, html)  // Set innerHTML
ctx.renderSidebar(algo, result) // Update sidebar
ctx.getSpeedMs()    // Get animation speed
ctx.clearTimer()    // Stop animation
ctx.isActive()      // Check if still current algo
```

## State Fields

```javascript
state = {
  currentAlgo: "",    // "mst", "knapsack", etc.
  setupVersion: 0,    // Incremented each setup
  animTimer: null,     // setInterval ID
  stepQueue: [],       // Step functions
  stepIdx: 0,          // Current step
  logs: [],            // Log messages
  mstTC: 0,           // MST total cost
  gcPreset: 0,         // Graph coloring preset
}
```

## Algorithm Return Format

```javascript
return {
  steps: [           // REQUIRED: Array of step functions
    () => { /* step 1 */ },
    () => { /* step 2 */ },
  ],
  logs: ["Start", "End"],    // OPTIONAL: Initial logs
  result: "42",              // OPTIONAL: Text result
  resultHtml: "<b>42</b>",  // OPTIONAL: HTML result
}
```

## htmx Attributes

```html
hx-get="url"           // Fetch URL
hx-target="#id"        // Target element
hx-push-url="/path"     // Update browser URL
hx-trigger="load"      // Trigger on load
hx-swap="innerHTML"    // How to insert
```

## Action Attributes

```html
data-action="run"        // Run button
data-action="step"        // Step button  
data-action="reset"       // Reset button
data-action="mst-switch-case"  // Custom action
```

## Colors

| Algorithm | Color |
|-----------|-------|
| complexity | Purple #8b5cf6 |
| mst | Teal #14b8a6 |
| knapsack | Amber #f59e0b |
| activity | Rose #fb7185 |
| subarray | Lime #84cc16 |
| lcs | Indigo #6366f1 |
| obst | Emerald #10b981 |
| hamiltonian | Red #ef4444 |
| graphcoloring | Sky #0ea5e9 |

## URLs

- Home: `#/home` or `/`
- Algorithm: `#/algo/{slug}` e.g., `#/algo/mst`

## Flow Summary

```
User visits site
  → index.html loads
  → htmx fetches partials/home.html
  → main.js inits home page

User clicks algorithm card
  → htmx fetches partials/algo-layout.html?algo={slug}
  → main.js inits algorithm page
  → runner calls algorithm.setup()

User clicks Run
  → runner calls algorithm.run()
  → runner gets step functions
  → runner starts interval
  → each tick: execute next step()
  → step updates UI (canvas, highlights, logs)
```

## Minimum Algorithm Code

```javascript
// js/algorithms/mysimple.js
export default {
  run(ctx) {
    const steps = [
      () => ctx.addLog("Step 1"),
      () => ctx.addLog("Step 2"),
    ];
    return { steps, result: "Done!" };
  },
};
```