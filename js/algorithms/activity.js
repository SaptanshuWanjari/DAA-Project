import { parseNumber, setupAlgoShell } from "./shared.js";

const INPUTS_FALLBACK = `
  <label class="block">
    <span class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Activities (name,start,end)</span>
    <textarea id="act-items" rows="6" class="w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-brand-500">A1,1,3
A2,0,2
A3,3,5
A4,5,9
A5,6,8
A6,8,12
A7,2,4</textarea>
  </label>
`;

const VIZ_HTML = '<div id="act-timeline" class="relative h-56 overflow-x-auto rounded-md border border-slate-200 bg-white"></div>';

function parseActivities() {
  const lines = (document.getElementById("act-items")?.value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const parsed = lines.map((line, idx) => {
    const parts = line.split(",").map((part) => part.trim());
    const name = parts[0] || `A${idx + 1}`;
    const s = parseNumber(parts[1], 0);
    const e = parseNumber(parts[2], s + 1);
    return { name, s, e: Math.max(e, s + 1) };
  });
  parsed.sort((a, b) => a.e - b.e);
  return parsed;
}

function buildTimeline(activities) {
  const timeline = document.getElementById("act-timeline");
  if (!(timeline instanceof HTMLElement)) {
    return;
  }
  timeline.replaceChildren();

  const maxEnd = Math.max(...activities.map((a) => a.e), 1);
  const axis = document.createElement("div");
  axis.className = "absolute bottom-8 left-4 right-4 h-px bg-slate-300";
  timeline.append(axis);

  for (let t = 0; t <= maxEnd; t += Math.max(1, Math.ceil(maxEnd / 8))) {
    const marker = document.createElement("div");
    marker.className = "absolute bottom-2 text-[10px] font-mono text-slate-500";
    marker.style.left = `calc(4% + ${(t / maxEnd) * 92}%)`;
    marker.textContent = String(t);
    timeline.append(marker);
  }

  const colors = ["#6366f1", "#14b8a6", "#ef4444", "#eab308", "#84cc16", "#f97316", "#06b6d4"];
  activities.forEach((activity, idx) => {
    const bar = document.createElement("div");
    bar.id = `act-${idx}`;
    bar.className = "absolute rounded px-2 py-1 text-[11px] font-mono font-semibold";
    const color = colors[idx % colors.length];
    bar.style.left = `calc(4% + ${(activity.s / maxEnd) * 92}%)`;
    bar.style.width = `${((activity.e - activity.s) / maxEnd) * 92}%`;
    bar.style.top = `${16 + (idx % 5) * 34}px`;
    bar.style.border = `1px solid ${color}`;
    bar.style.background = `${color}22`;
    bar.style.color = color;
    bar.textContent = activity.name;
    timeline.append(bar);
  });
}

export async function setup(ctx) {
  await setupAlgoShell(ctx, "activity", INPUTS_FALLBACK, VIZ_HTML);
}

export function run(ctx) {
  const activities = parseActivities();
  buildTimeline(activities);
  const selected = [];
  let lastEnd = -1;

  const steps = activities.map((activity, idx) => () => {
    const bar = document.getElementById(`act-${idx}`);
    if (activity.s >= lastEnd) {
      selected.push(activity);
      lastEnd = activity.e;
      if (bar) {
        bar.style.borderWidth = "2px";
        bar.style.opacity = "1";
      }
      ctx.addLog(`${activity.name} [${activity.s}-${activity.e}] selected`);
    } else {
      if (bar) {
        bar.style.opacity = "0.25";
      }
      ctx.addLog(`${activity.name} [${activity.s}-${activity.e}] skipped`);
    }
    ctx.renderSidebar("activity", `Selected: ${selected.length} | ${selected.map((entry) => entry.name).join(", ") || "-"}`);
  });

  return { steps };
}

export async function reset(ctx) {
  await setup(ctx);
}
