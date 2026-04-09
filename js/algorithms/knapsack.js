import { parseNumber, setupAlgoShell } from "./shared.js";

const INPUTS_FALLBACK = `
  <div class="grid gap-3 md:grid-cols-2">
    <label class="block">
      <span class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Capacity (kg)</span>
      <input id="ks-cap" type="number" min="1" value="50" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
    </label>
    <label class="block">
      <span class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Items (name,weight,value)</span>
      <textarea id="ks-items" rows="5" class="w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-brand-500">Gold,10,60
Silver,20,100
Bronze,30,120
Diamond,5,80
Platinum,15,90</textarea>
    </label>
  </div>
`;

const VIZ_HTML = '<div id="ks-viz" class="space-y-2"></div>';

export async function setup(ctx) {
  await setupAlgoShell(ctx, "knapsack", INPUTS_FALLBACK, VIZ_HTML);
}

function parseItems() {
  const raw = document.getElementById("ks-items")?.value || "";
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const parts = line.split(",").map((part) => part.trim());
      const name = parts[0] || `Item${index + 1}`;
      const w = Math.max(1, parseNumber(parts[1], 1));
      const v = Math.max(0, parseNumber(parts[2], 1));
      return { name, w, v, ratio: v / w };
    })
    .sort((a, b) => b.ratio - a.ratio);
}

function buildRows(items) {
  const viz = document.getElementById("ks-viz");
  if (!(viz instanceof HTMLElement)) {
    return;
  }

  viz.replaceChildren();
  items.forEach((item, idx) => {
    const row = document.createElement("div");
    row.id = `ks-${idx}`;
    row.className = "rounded-md border border-slate-200 bg-white p-3";

    const line = document.createElement("div");
    line.className = "mb-2 flex items-center justify-between gap-2";
    const left = document.createElement("div");
    left.className = "font-mono text-xs text-slate-700";
    left.textContent = `${item.name} (${item.w}kg, ${item.v})`;
    const right = document.createElement("div");
    right.className = "font-mono text-xs text-slate-500";
    right.textContent = `ratio ${item.ratio.toFixed(2)}`;
    line.append(left, right);

    const barWrap = document.createElement("div");
    barWrap.className = "h-2 rounded bg-slate-200";
    const bar = document.createElement("div");
    bar.id = `ks-bar-${idx}`;
    bar.className = "h-2 rounded bg-brand-500 transition-all";
    bar.style.width = "0%";
    barWrap.append(bar);
    row.append(line, barWrap);
    viz.append(row);
  });
}

export function run(ctx) {
  const cap = Math.max(1, parseNumber(document.getElementById("ks-cap")?.value, 50));
  const items = parseItems();
  buildRows(items);

  let remaining = cap;
  let totalValue = 0;

  const steps = items.map((item, idx) => () => {
    const row = document.getElementById(`ks-${idx}`);
    const bar = document.getElementById(`ks-bar-${idx}`);
    if (remaining <= 0) {
      ctx.addLog(`${item.name}: capacity full`);
      return;
    }

    if (item.w <= remaining) {
      remaining -= item.w;
      totalValue += item.v;
      if (row) {
        row.className = "rounded-md border border-teal-300 bg-teal-50 p-3";
      }
      if (bar) {
        bar.style.width = "100%";
        bar.className = "h-2 rounded bg-teal-500 transition-all";
      }
      ctx.addLog(`${item.name}: take all ${item.w}kg (+${item.v.toFixed(1)})`);
    } else {
      const fraction = remaining / item.w;
      totalValue += fraction * item.v;
      if (row) {
        row.className = "rounded-md border border-amber-300 bg-amber-50 p-3";
      }
      if (bar) {
        bar.style.width = `${(fraction * 100).toFixed(0)}%`;
        bar.className = "h-2 rounded bg-amber-500 transition-all";
      }
      ctx.addLog(`${item.name}: take ${(fraction * 100).toFixed(0)}% (+${(fraction * item.v).toFixed(1)})`);
      remaining = 0;
    }

    ctx.renderSidebar("knapsack", `Total value: ${totalValue.toFixed(1)} | Remaining: ${remaining.toFixed(1)}kg`);
  });

  return { steps };
}

export async function reset(ctx) {
  await setup(ctx);
}
