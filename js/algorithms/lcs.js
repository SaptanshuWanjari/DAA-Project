import { setupAlgoShell } from "./shared.js";

const INPUTS_FALLBACK = `
  <div class="grid gap-3 md:grid-cols-2">
    <label class="block">
      <span class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Sequence 1</span>
      <input id="lcs-s1" type="text" value="AGGTAB" class="w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
    </label>
    <label class="block">
      <span class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Sequence 2</span>
      <input id="lcs-s2" type="text" value="GXTXAYB" class="w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
    </label>
  </div>
`;

const VIZ_HTML = `
  <div class="space-y-3 overflow-x-auto">
    <table id="lcs-table" class="border-collapse"></table>
    <div id="lcs-s1-row" class="flex flex-wrap gap-1"></div>
    <div id="lcs-s2-row" class="flex flex-wrap gap-1"></div>
  </div>
`;

function tokenChip(value, id) {
  const chip = document.createElement("div");
  chip.id = id;
  chip.className =
    "flex h-8 w-8 items-center justify-center rounded border border-slate-300 font-mono text-xs text-slate-700";
  chip.textContent = value;
  return chip;
}

function buildTable(s1, s2) {
  const table = document.getElementById("lcs-table");
  if (!(table instanceof HTMLTableElement)) {
    return;
  }
  table.replaceChildren();

  const headerRow = document.createElement("tr");
  const h0 = document.createElement("th");
  h0.className = "h-8 w-8 border border-slate-300 bg-slate-100";
  const h1 = document.createElement("th");
  h1.className = "h-8 w-8 border border-slate-300 bg-slate-100";
  headerRow.append(h0, h1);
  [...s2].forEach((char) => {
    const th = document.createElement("th");
    th.className =
      "h-8 w-8 border border-slate-300 bg-slate-100 font-mono text-xs text-slate-600";
    th.textContent = char;
    headerRow.append(th);
  });
  table.append(headerRow);

  for (let i = 0; i <= s1.length; i += 1) {
    const row = document.createElement("tr");
    const left = document.createElement("th");
    left.className =
      "h-8 w-8 border border-slate-300 bg-slate-100 font-mono text-xs text-slate-600";
    left.textContent = i === 0 ? "" : s1[i - 1];
    row.append(left);

    for (let j = 0; j <= s2.length; j += 1) {
      const cell = document.createElement("td");
      cell.id = `lcs-${i}-${j}`;
      cell.className =
        "h-8 w-8 border border-slate-300 text-center font-mono text-xs text-slate-600";
      cell.textContent = "0";
      row.append(cell);
    }
    table.append(row);
  }
}

export async function setup(ctx) {
  await setupAlgoShell(ctx, "lcs", INPUTS_FALLBACK, VIZ_HTML);
}

export function run(ctx) {
  const s1 = (document.getElementById("lcs-s1")?.value || "")
    .trim()
    .toUpperCase();
  const s2 = (document.getElementById("lcs-s2")?.value || "")
    .trim()
    .toUpperCase();
  const m = s1.length;
  const n = s2.length;

  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  buildTable(s1, s2);

  const row1 = document.getElementById("lcs-s1-row");
  const row2 = document.getElementById("lcs-s2-row");
  if (row1) {
    row1.replaceChildren(
      ...[...s1].map((char, idx) => tokenChip(char, `lcs-c1-${idx}`)),
    );
  }
  if (row2) {
    row2.replaceChildren(
      ...[...s2].map((char, idx) => tokenChip(char, `lcs-c2-${idx}`)),
    );
  }

  const steps = [];
  for (let i = 1; i <= m; i += 1) {
    for (let j = 1; j <= n; j += 1) {
      const ii = i;
      const jj = j;
      steps.push(() => {
        if (s1[ii - 1] === s2[jj - 1]) {
          dp[ii][jj] = dp[ii - 1][jj - 1] + 1;
          ctx.addLog(`dp[${ii}][${jj}] match '${s1[ii - 1]}' => ${dp[ii][jj]}`);
        } else {
          dp[ii][jj] = Math.max(dp[ii - 1][jj], dp[ii][jj - 1]);
          ctx.addLog(
            `dp[${ii}][${jj}] = max(${dp[ii - 1][jj]}, ${dp[ii][jj - 1]})`,
          );
        }

        const cell = document.getElementById(`lcs-${ii}-${jj}`);
        if (cell) {
          cell.textContent = String(dp[ii][jj]);
          cell.className =
            "h-8 w-8 border border-slate-300 text-center font-mono text-xs " +
            (dp[ii][jj] > 0
              ? "bg-indigo-50 text-indigo-700"
              : "text-slate-600");
        }

        if (ii === m && jj === n) {
          let a = m;
          let b = n;
          let lcs = "";
          while (a > 0 && b > 0) {
            if (s1[a - 1] === s2[b - 1]) {
              lcs = s1[a - 1] + lcs;
              a -= 1;
              b -= 1;
            } else if (dp[a - 1][b] > dp[a][b - 1]) {
              a -= 1;
            } else {
              b -= 1;
            }
          }

          for (const char of lcs) {
            [...s1].forEach((token, idx) => {
              if (token === char) {
                document
                  .getElementById(`lcs-c1-${idx}`)
                  ?.classList.add(
                    "bg-indigo-100",
                    "border-indigo-400",
                    "text-indigo-700",
                  );
              }
            });
            [...s2].forEach((token, idx) => {
              if (token === char) {
                document
                  .getElementById(`lcs-c2-${idx}`)
                  ?.classList.add(
                    "bg-indigo-100",
                    "border-indigo-400",
                    "text-indigo-700",
                  );
              }
            });
          }

          ctx.addLog(`LCS = ${lcs || "(empty)"}`);
          ctx.renderSidebar("lcs", `Length: ${dp[m][n]} | LCS: ${lcs || "-"}`);
        }
      });
    }
  }

  return { steps };
}

export async function reset(ctx) {
  await setup(ctx);
}
