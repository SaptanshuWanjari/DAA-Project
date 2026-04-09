# Debugging Guide

## Console Logging

The app uses `addLog()` to show messages in the sidebar. Use it like console.log:

```javascript
ctx.addLog("Processing item: " + i);
ctx.addLog("Current value: " + JSON.stringify(data));
```

## Browser DevTools

### Check State
Open DevTools (F12) and type in console:

```javascript
// Access state from anywhere
window.__daaState  // Not directly exposed

// But you can check DOM:
document.getElementById('algo-page').dataset.algo  // Current algorithm
```

### Check Logs
The sidebar shows logs. Each step can add messages:

```javascript
// In your algorithm
steps.push(() => {
  ctx.addLog(`Step ${ctx.state.stepIdx}: Doing something`);
});
```

## Common Issues

### 1. Algorithm not running

Symptoms: Click Run but nothing happens.

Debug:
- Check browser console for errors
- Verify input form has correct ID
- Check algorithm is registered in main.js

### 2. Steps not executing

Symptoms: Run clicks, but animation doesn't start.

Debug:
- Verify `run()` returns `{ steps: [...] }`
- Check steps array is not empty
- Check `stepQueue` is being populated

```javascript
// Add this in runner.js temporarily to debug:
console.log('stepQueue:', state.stepQueue.length);
```

### 3. Canvas not drawing

Symptoms: Setup runs but canvas is empty.

Debug:
- Check canvas ID matches
- Check canvas element exists in input form HTML
- Verify getCanvasContext() returns context

```javascript
// Add in your setup():
const chart = getCanvasContext("algo-canvas");
console.log('canvas:', chart);  // Should not be null
```

### 4. Old results showing

Symptoms: Results from previous algorithm appear.

Debug:
- Check Reset clears everything
- Verify state.logs is emptied in reset()
- Check state.stepQueue is cleared

### 5. Input not reading

Symptoms: Algorithm runs but with empty data.

Debug:
- Check input element ID matches
- Verify input form loaded in #algo-inputs

```javascript
// Debug input value
const input = document.getElementById('algo-input');
console.log('input:', input?.value);
```

## Testing Your Algorithm

### Quick Test
Add a minimal run() and test:

```javascript
export function run(ctx) {
  return {
    steps: [
      () => ctx.addLog("Step 1 executed!"),
      () => ctx.addLog("Step 2 executed!"),
    ],
    result: "Done!",
  };
}
```

Click Run — you should see logs.

### Step-by-Step Test
Use "Step" button instead of "Run" to see one step at a time.

### Reset Test
Click Reset after running — everything should clear.

## DevTools Console Snippets

### See current state
```javascript
// In browser console - after setting state globally
// (add this temporarily to main.js)
window.__debugState = state;

// Then you can check:
console.log(window.__debugState);
```

### Force-run algorithm
```javascript
// Trigger run manually
import { runAlgo } from './core/runner.js';
runAlgo();
```

## Visual Debugging

### Highlight elements
```javascript
// In step function
steps.push(() => {
  const el = document.getElementById('some-element');
  el?.style?.setProperty('background-color', 'yellow');
});
```

### Draw on canvas
```javascript
const chart = getCanvasContext("algo-canvas");
if (chart) {
  chart.ctx.fillStyle = "red";
  chart.ctx.fillRect(10, 10, 50, 50);
}
```

## Error Patterns

### "Runner module is not available"
- Algorithm not registered in main.js
- Check setAlgoRunnerRegistry() call

### "Unable to initialize this algorithm"
- setup() threw an error
- Check async setup completed
- Check input form loaded

### "Cannot read property of null"
- Input element not found
- Canvas element not found
- Check IDs match what's in HTML