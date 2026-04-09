# HTMX Static Refactor Architecture

## Module map

The active app is split into static HTML fragments and ES modules:

- `index.html`
  - boots the shell UI (`#app`) and loads initial content with HTMX (`partials/home.html`)
  - includes HTMX and the main JS entrypoint (`js/main.js`)
- `partials/home.html`
  - homepage fragment rendered into `#app`
  - algorithm cards use HTMX (`hx-get`) to load `partials/algo-layout.html?algo=<slug>`
- `partials/algo-layout.html`
  - algorithm workspace fragment rendered into `#app`
  - defines stable mount points: `#algo-inputs`, `#viz-content`, `#sidebar-content`
- `partials/inputs/*.html`
  - per-algorithm input templates loaded by algorithm modules (via `fetch` in `js/algorithms/shared.js`)

JavaScript modules:

- `js/main.js`
  - app orchestrator; listens for HTMX swaps and delegated UI actions
  - initializes home/algorithm pages, sets metadata badge/title, and wires run/step/reset
  - registers all algorithm modules into runner registry
- `js/core/config.js`
  - algorithm order and metadata (`ALGO_ORDER`, `ALGO_META`, `COMPLEXITY_META`)
- `js/core/state.js`
  - shared runtime state (`currentAlgo`, queue, logs, setup lifecycle)
- `js/core/runner.js`
  - generic algorithm lifecycle (`setup`, `run`, `step`, `reset`, `action`)
  - provides context utilities and queue-based animation execution
- `js/core/sidebar.js`
  - result panel and step log rendering; trusted-result templates
- `js/core/dom.js`
  - low-level DOM helpers and timer cleanup
- `js/algorithms/shared.js`
  - shared algorithm helpers (partial loader, canvas setup, parsing)
- `js/algorithms/*.js`
  - one module per algorithm implementation (Complexity, MST, Knapsack, etc.)

## Fragment flow (HTMX load/swap)

1. On initial page load, `index.html` has:
   - `#app` with `hx-get="partials/home.html"` and `hx-trigger="load"`
2. HTMX injects `partials/home.html` into `#app` (`hx-swap="innerHTML"`).
3. User clicks an algorithm card in `partials/home.html`:
   - card requests `partials/algo-layout.html?algo=<slug>`
   - target is still `#app`; URL hash is pushed (for deep link and navigation)
4. After every `#app` swap, `js/main.js` handles `htmx:afterSwap`:
   - detects whether the current fragment is home or algorithm page
   - resolves algorithm slug (query/hash/dataset)
   - calls `initAlgorithmPage` for algorithm routes
5. `initAlgorithmPage` calls `setupCurrentAlgo()` through runner:
   - algorithm `setup(ctx)` loads input partial (`partials/inputs/<slug>.html`)
   - inserts visualization shell and default sidebar
6. Run/Step/Reset and algorithm-specific controls are handled by delegated `data-action` events in `js/main.js`, then dispatched to `js/core/runner.js`.

## Algorithm module contract

Each file under `js/algorithms/<slug>.js` can export either:

- a `run(ctx)` function only, or
- a full module object using named exports:
  - `setup(ctx)` optional; prepare DOM/input shell
  - `run(ctx)` optional; return outcome with steps/log/result payload
  - `reset(ctx)` optional; restore initial state
  - `action(ctx, actionNode)` optional; handle custom `data-action` controls

`ctx` is provided by `createAlgorithmContext()` in `js/core/runner.js` and includes:

- `state`, `addLog()`, `renderSidebar()`, `getSpeedMs()`
- DOM/timer helpers: `clearTimer()`, `el()`, `setTrustedHTML()`
- `isActive()` guard for async setup lifecycle safety

`run(ctx)` can return an outcome object:

- `steps: Array<() => void>` to animate via Run/Step queue
- `logs: Array<unknown>` for sidebar step logs
- one result field: `resultText`, `resultHtml`, or `trustedResult`

## How to add a new algorithm

1. **Create the module**
   - Add `js/algorithms/<slug>.js`
   - Export at least `run(ctx)`; optionally `setup/reset/action`
   - Reuse `setupAlgoShell()` and other helpers from `js/algorithms/shared.js` where possible

2. **Add input fragment**
   - Add `partials/inputs/<slug>.html`
   - Keep all interactions event-delegation friendly via `data-action` (no inline handlers)

3. **Register metadata**
   - Update `js/core/config.js`:
     - append `<slug>` to `ALGO_ORDER`
     - add entries in `ALGO_META` and `COMPLEXITY_META`

4. **Register in main entrypoint**
   - Import the module in `js/main.js`
   - Add it to `setAlgoRunnerRegistry({ ... })`

5. **Expose in home navigation**
   - Add a card in `partials/home.html` with:
     - `href="#/algo/<slug>"`
     - `hx-get="partials/algo-layout.html?algo=<slug>"`
     - `hx-target="#app"` and `hx-push-url="#/algo/<slug>"`

6. **Verify behavior**
   - Load home -> algorithm fragment transition
   - Confirm setup renders input + visualization
   - Confirm Run/Step/Reset and any custom `data-action` controls work
   - Confirm no inline handlers and JS syntax checks pass
