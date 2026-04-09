# DAA_Project

## Run locally

Serve this static app from the repository root:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/index.html`.

## HTMX fragment structure

The app uses HTMX to swap HTML fragments into a single shell:

- `index.html` defines `#app` and triggers initial load (`partials/home.html`).
- `partials/home.html` contains algorithm cards that request `partials/algo-layout.html?algo=<slug>`.
- `partials/algo-layout.html` defines stable targets (`#algo-inputs`, `#viz-content`, `#sidebar-content`).
- `partials/inputs/*.html` are algorithm-specific input fragments loaded by algorithm setup logic.

Navigation and in-page fragment swaps rely on `hx-get`, `hx-target="#app"`, and `hx-push-url`.

## Where DAA logic lives

Core DAA algorithm logic is in `js/algorithms`:

- `js/algorithms/*.js`: individual algorithm implementations and setup/run/reset handlers.
- `js/algorithms/shared.js`: shared helpers used by algorithm modules.
- `js/core/runner.js`: execution lifecycle that runs algorithm modules.
