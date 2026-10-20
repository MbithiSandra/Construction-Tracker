/* =========================================================
   funding.js
   Log of every amount sent home, split by bank, cash and
   M-Pesa, plus the money wall and the monthly chart.
   ========================================================= */

(function () {
  const SOURCES = ["Bank", "Cash", "M-Pesa"];
  const COLOURS = { Bank: "var(--bank)", Cash: "var(--cash)", "M-Pesa": "var(--mpesa)" };
  const $ = (id) => document.getElementById(id);
  let filter = "All";
  let editingId = null;
  let firstWall = true;

  const sorted = (list) => [...list].sort((a, b) => a.date.localeCompare(b.date));
  const monthKey = (iso) => iso.slice(0, 7);

  /* ---------- Summary numbers ---------- */
  function renderSummary(d) {
    const t = d.transfers;
    const total = t.reduce((s, x) => s + x.amount, 0);
    const bySrc = Object.fromEntries(SOURCES.map((s) => [s, t.filter((x) => x.source === s).reduce((a, x) => a + x.amount, 0)]));

    $("totalSent").textContent = fmt.kes(total);
    $("totalSub").textContent = t.length ? `${t.length} transfer${t.length === 1 ? "" : "s"} since ${fmt.date(sorted(t)[0].date)}` : "Nothing sent yet.";

    $("splitBar").innerHTML = SOURCES.map((s) => `<span style="flex-grow:${bySrc[s] || 0};background:${COLOURS[s]}"></span>`).join("");
    $("srcRows").innerHTML = SOURCES.map((s) => {
      const share = total ? Math.round((bySrc[s] / total) * 100) : 0;
      return `<div class="src-row"><span><i class="dot" style="background:${COLOURS[s]};margin-right:8px;box-shadow:0 0 0 2px rgba(243,238,226,.25)"></i>${s} <span class="muted">· ${share}%</span></span><span class="money">${fmt.kes(bySrc[s])}</span></div>`;
    }).join("");

    const byDate = sorted(t);
    const last = byDate[byDate.length - 1];
    $("lastAmt").textContent = last ? fmt.kes(last.amount) : "None yet";
    $("lastSub").textContent = last ? `${last.source}, ${fmt.daysAgo(last.date)}` : "";

    const big = [...t].sort((a, b) => b.amount - a.amount)[0];
    $("bigAmt").textContent = big ? fmt.kes(big.amount) : "None yet";
    $("bigSub").textContent = big ? `${big.source} for ${big.for.toLowerCase()}, ${fmt.date(big.date)}` : "";

    const thisMonth = fmt.today().slice(0, 7);
    const monthList = t.filter((x) => monthKey(x.date) === thisMonth);
    $("monthAmt").textContent = fmt.kes(monthList.reduce((s, x) => s + x.amount, 0));
    $("monthSub").textContent = `${monthList.length} transfer${monthList.length === 1 ? "" : "s"} in ${new Date().toLocaleDateString("en-GB", { month: "long" })}`;

    const months = monthRange(d).length || 1;
    $("avgAmt").textContent = fmt.kes(total / months);
    $("avgSub").textContent = `Over ${months} month${months === 1 ? "" : "s"}`;

    $("exampleNotice").style.display = t.some((x) => x.example) ? "flex" : "none";
  }

  // List of YYYY-MM from the first transfer (or project start) to this month
  function monthRange(d) {
    const first = sorted(d.transfers)[0]?.date || d.project.startDate || fmt.today();
    const start = new Date(first.slice(0, 7) + "-01T00:00:00");
    const end = new Date(fmt.today().slice(0, 7) + "-01T00:00:00");
    const out = [];
    for (let m = new Date(start); m <= end; m.setMonth(m.getMonth() + 1)) {
      out.push(m.getFullYear() + "-" + String(m.getMonth() + 1).padStart(2, "0"));
    }
    return out;
  }

  /* ---------- The money wall ---------- */
  function renderWall(d) {
    const wall = $("wall");
    const t = sorted(d.transfers);
    const total = t.reduce((s, x) => s + x.amount, 0);

    // If there are too many bricks, make each brick worth more so the wall stays a sensible size
    const MAX = 420;
    let value = d.brickValue || 5000;
    if (total / value > MAX) value = value * Math.ceil(total / value / MAX);
    $("brickKey").textContent = `1 brick = ${fmt.kes(value)}`;

    const bricks = [];
    t.forEach((x) => {
      const n = Math.max(1, Math.round(x.amount / value));
      for (let i = 0; i < n; i++) bricks.push(x);
    });

    // Work out how many bricks fit in one row
    const width = wall.clientWidth || 600;
    const bw = width < 420 ? 22 : 30;
    const gap = 4;
    const perRow = Math.max(6, Math.floor((width - (bw + gap) / 2) / (bw + gap)));
    wall.style.setProperty("--brick-w", bw + "px");

    const rows = [];
    for (let i = 0; i < bricks.length; i += perRow) rows.push(bricks.slice(i, i + perRow));

    const animate = firstWall && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const step = Math.min(14, 1600 / Math.max(1, bricks.length));
    let k = 0;
    wall.innerHTML = rows.length
      ? rows.map((row, r) => `<div class="wall-row ${r % 2 ? "offset" : ""}">${row.map((x) => {
          const delay = animate ? `animation-delay:${Math.round(k++ * step)}ms` : "animation-duration:0s";
          return `<span class="brick ${x.source}" data-id="${x.id}" style="${delay}"></span>`;
        }).join("")}</div>`).join("")
      : `<p class="muted" style="margin:30px 0;text-align:center">No bricks yet. Add your first transfer to lay the first brick.</p>`;
    firstWall = false;
  }

  // Tooltip and highlight for a brick
  const tip = $("wallTip");
  function showTip(e) {
    const b = e.target.closest(".brick");
    document.querySelectorAll(".brick.hl").forEach((n) => n.classList.remove("hl"));
    if (!b) { tip.style.display = "none"; return; }
    const x = Store.get().transfers.find((t) => t.id === b.dataset.id);
    if (!x) return;
    document.querySelectorAll(`.brick[data-id="${x.id}"]`).forEach((n) => n.classList.add("hl"));
    const hidden = document.body.classList.contains("blurred");
    tip.innerHTML = `<strong>${hidden ? "Amount hidden" : fmt.kes(x.amount)}</strong><br>${esc(x.source)} for ${esc(x.for.toLowerCase())}<br><span style="opacity:.7">${fmt.date(x.date)}</span>`;
    tip.style.display = "block";
    const px = (e.touches ? e.touches[0].clientX : e.clientX) + 14;
    const py = (e.touches ? e.touches[0].clientY : e.clientY) + 14;
    tip.style.left = Math.min(px, window.innerWidth - 250) + "px";
    tip.style.top = py + "px";
  }
  $("wall").addEventListener("mousemove", showTip);
  $("wall").addEventListener("click", showTip);
  $("wall").addEventListener("mouseleave", () => {
    tip.style.display = "none";
    document.querySelectorAll(".brick.hl").forEach((n) => n.classList.remove("hl"));
  });

  /* ---------- Monthly stacked bar chart (plain SVG) ---------- */
  function renderChart(d) {
    const months = monthRange(d).slice(-12);
    const data = months.map((m) => {
      const row = { m };
      SOURCES.forEach((s) => {
        row[s] = d.transfers.filter((x) => monthKey(x.date) === m && x.source === s).reduce((a, x) => a + x.amount, 0);
      });
      row.total = SOURCES.reduce((a, s) => a + row[s], 0);
      return row;
    });

    const W = 520, H = 240, padL = 52, padB = 26, padT = 10;
    const max = Math.max(1, ...data.map((r) => r.total));
    const nice = niceMax(max);
    const innerW = W - padL - 6, innerH = H - padB - padT;
    const slot = innerW / data.length;
    const bw = Math.min(38, slot * 0.6);
    const y = (v) => padT + innerH - (v / nice) * innerH;

    let svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Money sent per month, split by bank, cash and M-Pesa">`;
    for (let i = 0; i <= 4; i++) {
      const v = (nice / 4) * i;
      svg += `<line x1="${padL}" x2="${W - 6}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)" stroke-width="1"/>`;
      svg += `<text x="${padL - 8}" y="${y(v) + 4}" text-anchor="end" class="money">${fmt.short(v).replace("KES ", "")}</text>`;
    }
    data.forEach((r, i) => {
      const cx = padL + slot * i + slot / 2;
      let acc = 0;
      SOURCES.forEach((s) => {
        if (!r[s]) return;
        const y1 = y(acc + r[s]), y0 = y(acc);
        svg += `<rect x="${cx - bw / 2}" y="${y1}" width="${bw}" height="${Math.max(0, y0 - y1 - 1.5)}" rx="4" fill="${COLOURS[s]}"><title>${s}: ${fmt.kes(r[s])}</title></rect>`;
        acc += r[s];
      });
      svg += `<text x="${cx}" y="${H - 8}" text-anchor="middle">${fmt.month(r.m + "-01")}</text>`;
    });
    svg += `</svg>`;
    $("monthChart").innerHTML = svg;
  }

  // Pick a round top for the chart so the four grid lines land on tidy numbers
  function niceMax(v) {
    const step = v / 4;
    const p = Math.pow(10, Math.floor(Math.log10(step)));
    for (const m of [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (m * p >= step) return m * p * 4;
    return 40 * p;
  }

  /* ---------- Table ---------- */
  function renderTable(d) {
    const rows = sorted(d.transfers).reverse().filter((x) => filter === "All" || x.source === filter);
    $("logBody").innerHTML = rows.length
      ? rows.map((x) => `
        <tr class="${x.example ? "example" : ""}">
          <td style="white-space:nowrap">${fmt.date(x.date)}</td>
          <td><span class="src ${x.source}">${esc(x.source)}</span></td>
          <td>${esc(x.for)}</td>
          <td class="muted">${esc(x.note)}${x.example ? ' <span class="pill" style="background:var(--sand);color:var(--sand-deep)">Example</span>' : ""}</td>
          <td class="amt money">${fmt.kes(x.amount)}</td>
          <td style="white-space:nowrap;text-align:right">
            <button class="icon-btn" data-edit="${x.id}" aria-label="Edit transfer" title="Edit">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg>
            </button>
            <button class="icon-btn" data-del="${x.id}" aria-label="Delete transfer" title="Delete">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg>
            </button>
          </td>
        </tr>`).join("")
      : `<tr><td colspan="6" class="muted" style="text-align:center;padding:30px">No transfers here yet.</td></tr>`;
  }

  $("logBody").addEventListener("click", (e) => {
    const del = e.target.closest("[data-del]");
    const edit = e.target.closest("[data-edit]");
    const d = Store.get();
    if (del && confirm("Delete this transfer?")) {
      d.transfers = d.transfers.filter((x) => x.id !== del.dataset.del);
      Store.save();
    }
    if (edit) openDialog(d.transfers.find((x) => x.id === edit.dataset.edit));
  });

  $("filters").addEventListener("click", (e) => {
    const c = e.target.closest("[data-f]");
    if (!c) return;
    filter = c.dataset.f;
    document.querySelectorAll("#filters .chip").forEach((b) => b.setAttribute("aria-pressed", String(b === c)));
    renderTable(Store.get());
  });

  /* ---------- Add and edit dialog ---------- */
  const dlg = $("addDialog");
  const form = $("addForm");
  function openDialog(existing) {
    const d = Store.get();
    $("forSelect").innerHTML = d.spendCategories.map((c) => `<option>${esc(c)}</option>`).join("");
    form.reset();
    editingId = existing ? existing.id : null;
    $("addTitle").textContent = existing ? "Edit transfer" : "Add a transfer";
    form.date.value = existing ? existing.date : fmt.today();
    form.amount.value = existing ? existing.amount : "";
    form.querySelector(`input[name="source"][value="${existing ? existing.source : "Bank"}"]`).checked = true;
    form.for.value = existing ? existing.for : "General";
    form.note.value = existing && !existing.example ? existing.note : "";
    dlg.showModal();
  }
  $("openAdd").addEventListener("click", () => openDialog(null));

  dlg.addEventListener("close", () => {
    if (dlg.returnValue !== "save") return;
    const f = new FormData(form);
    const amount = Math.round(Number(f.get("amount")));
    if (!amount || amount < 1) return;
    const entry = {
      id: editingId || Store.uid(),
      date: f.get("date"),
      amount,
      source: f.get("source"),
      for: f.get("for"),
      note: String(f.get("note") || "").trim()
    };
    const d = Store.get();
    if (editingId) {
      const i = d.transfers.findIndex((x) => x.id === editingId);
      d.transfers[i] = entry;
    } else {
      d.transfers.push(entry);
      firstWall = true; // let the new bricks drop in
    }
    Store.save();
  });

  $("clearExamples").addEventListener("click", () => {
    const d = Store.get();
    d.transfers = d.transfers.filter((x) => !x.example);
    Store.save();
  });

  /* ---------- Hide amounts (handy when showing the screen to someone) ---------- */
  function applyHide(on) {
    document.body.classList.toggle("blurred", on);
    $("toggleHide").textContent = on ? "Show amounts" : "Hide amounts";
    $("toggleHide").setAttribute("aria-pressed", String(on));
  }
  $("toggleHide").addEventListener("click", () => {
    const on = !document.body.classList.contains("blurred");
    Store.setPref("hideAmounts", on);
    applyHide(on);
  });

  /* ---------- CSV export for Excel or Google Sheets ---------- */
  $("exportCsv").addEventListener("click", () => {
    const rows = [["Date", "Amount (KES)", "Sent by", "For", "Note"]].concat(
      sorted(Store.get().transfers).map((x) => [x.date, x.amount, x.source, x.for, x.note])
    );
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "mjengo-transfers.csv";
    a.click();
  });

  /* ---------- Start ---------- */
  function renderAll(d) {
    renderSummary(d);
    renderWall(d);
    renderChart(d);
    renderTable(d);
  }
  applyHide(!!Store.prefs().hideAmounts);
  renderAll(Store.get());
  Store.onChange(renderAll);

  let rt;
  window.addEventListener("resize", () => {
    clearTimeout(rt);
    rt = setTimeout(() => renderWall(Store.get()), 150);
  });
})();
