import { parseNumber, setupAlgoShell } from "./shared.js";

const INPUTS_FALLBACK = `
  <label class="block">
    <span class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Array (comma-separated integers)</span>
    <input id="sub-arr" type="text" value="-2,1,-3,4,-1,2,1,-5,4" class="w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
  </label>
`;

const VIZ_HTML = `
  <div class="space-y-3">
    <div id="sub-viz" class="flex flex-wrap gap-1"></div>
    <div id="sub-info" class="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-600"></div>
  </div>
`;

function parseArray() {
  return (document.getElementById("sub-arr")?.value || "")
    .split(",")
    .map((part) => parseNumber(part.trim(), 0));
}

function renderArray(values) {
  const viz = document.getElementById("sub-viz");
  if (!(viz instanceof HTMLElement)) {
    return;
  }
  viz.replaceChildren();
  values.forEach((value, idx) => {
    const cell = document.createElement("div");
    cell.id = `sub-${idx}`;
    cell.className =
      "flex h-10 w-10 items-center justify-center rounded border border-slate-300 font-mono text-xs " +
      (value < 0 ? "text-rose-600" : "text-slate-700");
    cell.textContent = String(value);
    viz.append(cell);
  });
}

function markRange(start, end) {
  const cells = document.querySelectorAll("#sub-viz > div");
  cells.forEach((cell, idx) => {
    cell.classList.remove(
      "ring-2",
      "ring-brand-500",
      "bg-brand-50",
      "bg-amber-50",
      "ring-amber-400",
    );
    if (idx >= start && idx <= end) {
      cell.classList.add("ring-2", "ring-brand-500", "bg-brand-50");
    }
  });
}

export async function setup(ctx) {
  await setupAlgoShell(ctx, "subarray", INPUTS_FALLBACK, VIZ_HTML);
}

export function run(ctx) {
  const array = parseArray();
  renderArray(array);

  let maxSum = Number.NEGATIVE_INFINITY;
  let bestStart = 0;
  let bestEnd = 0;
  let currentSum = 0;
  let currentStart = 0;

  const steps = array.map((value, idx) => () => {
    const current = document.getElementById(`sub-${idx}`);
    if (current) {
      current.classList.add("bg-amber-50", "ring-2", "ring-amber-400");
    }

    currentSum += value;
    if (currentSum > maxSum) {
      maxSum = currentSum;
      bestStart = currentStart;
      bestEnd = idx;
    }
    if (currentSum < 0) {
      currentSum = 0;
      currentStart = idx + 1;
    }

    markRange(bestStart, bestEnd);
    const info = document.getElementById("sub-info");
    if (info) {
      info.textContent = `Index ${idx} | Current sum ${currentSum} | Max ${maxSum}`;
    }

    ctx.addLog(`arr[${idx}] = ${value}, cur = ${currentSum}, max = ${maxSum}`);
    const bestSlice = array.slice(bestStart, bestEnd + 1).join(", ");
    ctx.renderSidebar(
      "subarray",
      `Max sum: ${maxSum} | Subarray: [${bestSlice}]`,
    );
  });

  return { steps };
}

export async function reset(ctx) {
  await setup(ctx);
}
