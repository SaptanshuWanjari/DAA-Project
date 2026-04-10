import { getCanvasContext, parseNumber, setupAlgoShell } from "./shared.js";

const INPUTS_FALLBACK = `
  <div class="grid gap-3 md:grid-cols-2">
    <label class="block">
      <span class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Keys (comma-separated)</span>
      <input id="obst-keys" type="text" value="10,20,30,40" class="w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
    </label>
    <label class="block">
      <span class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Probabilities</span>
      <input id="obst-probs" type="text" value="0.1,0.3,0.4,0.2" class="w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
    </label>
  </div>
`;

const VIZ_HTML =
  '<canvas id="obst-canvas" class="w-full rounded-md border border-slate-200 bg-white" height="300"></canvas>';

function parseValues() {
  const keys = (document.getElementById("obst-keys")?.value || "")
    .split(",")
    .map((item) => parseNumber(item.trim(), NaN))
    .filter((value) => Number.isFinite(value));
  const probs = (document.getElementById("obst-probs")?.value || "")
    .split(",")
    .map((item) => parseNumber(item.trim(), 0))
    .slice(0, keys.length);

  while (probs.length < keys.length) {
    probs.push(1 / Math.max(1, keys.length));
  }

  return { keys, probs };
}

const MAX_RECURSION_DEPTH = 20;

function drawTree(keys, root) {
  const chart = getCanvasContext("obst-canvas", 300);
  if (!chart) {
    return;
  }

  if (!root || !keys || keys.length === 0) {
    return;
  }

  const { ctx, width, height } = chart;
  ctx.clearRect(0, 0, width, height);

  let depth = 0;

  function draw(lo, hi, x, y, dx) {
    depth += 1;
    if (depth > MAX_RECURSION_DEPTH || lo > hi) {
      return;
    }
    const r = root[lo]?.[hi];
    if (r == null || r === 0) {
      return;
    }
    const keyIndex = r - 1;
    if (keyIndex < 0 || keyIndex >= keys.length) {
      return;
    }

    if (lo <= r - 1 && lo < hi) {
      const lx = x - dx;
      const ly = y + 68;
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(lx, ly);
      ctx.stroke();
      draw(lo, r - 1, lx, ly, dx / 2);
    }

    if (r + 1 <= hi && r < hi) {
      const rx = x + dx;
      const ry = y + 68;
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(rx, ry);
      ctx.stroke();
      draw(r + 1, hi, rx, ry, dx / 2);
    }

    ctx.fillStyle = "#eef2ff";
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#6366f1";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 12px JetBrains Mono";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(keys[keyIndex]), x, y);
  }

  draw(1, keys.length, width / 2, Math.min(40, height - 40), width / 5);
}

export async function setup(ctx) {
  await setupAlgoShell(ctx, "obst", INPUTS_FALLBACK, VIZ_HTML);
}

export function run(ctx) {
  const { keys, probs } = parseValues();
  const n = keys.length;

  if (n === 0) {
    return {
      steps: [
        () => {
          ctx.addLog("No keys provided.");
          ctx.renderSidebar("obst", "Provide at least one key.");
        },
      ],
    };
  }

  const cost = Array.from({ length: n + 2 }, () => Array(n + 1).fill(0));
  const weight = Array.from({ length: n + 2 }, () => Array(n + 1).fill(0));
  const root = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0));

  for (let i = 1; i <= n; i += 1) {
    weight[i][i] = probs[i - 1];
    cost[i][i] = probs[i - 1];
    root[i][i] = i;
  }

  for (let len = 2; len <= n; len += 1) {
    for (let i = 1; i <= n - len + 1; i += 1) {
      const j = i + len - 1;
      weight[i][j] = weight[i][j - 1] + probs[j - 1];
      cost[i][j] = Number.POSITIVE_INFINITY;
      for (let r = i; r <= j; r += 1) {
        const candidate =
          (r > i ? cost[i][r - 1] : 0) +
          (r < j ? cost[r + 1][j] : 0) +
          weight[i][j];
        if (candidate < cost[i][j]) {
          cost[i][j] = candidate;
          root[i][j] = r;
        }
      }
    }
  }

  return {
    steps: [
      () => {
        drawTree(keys, root);
        const bestCost = cost[1][n];
        const bestRoot = keys[root[1][n] - 1];
        ctx.addLog(`Keys: [${keys.join(", ")}]`);
        ctx.addLog(`Optimal expected cost: ${bestCost.toFixed(3)}`);
        ctx.addLog(`Root key: ${bestRoot}`);
        ctx.renderSidebar(
          "obst",
          `Cost: ${bestCost.toFixed(3)} | Root: ${bestRoot}`,
        );
      },
    ],
  };
}

export async function reset(ctx) {
  await setup(ctx);
}
