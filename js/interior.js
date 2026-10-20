/* =========================================================
   interior.js
   Floor plans drawn as SVG from room boxes in metres.
   Click a room to see its mood, palette and shopping list.
   ========================================================= */

(function () {
  const $ = (id) => document.getElementById(id);
  const STATUSES = [
    { id: "idea", label: "Just an idea" },
    { id: "planning", label: "Planning" },
    { id: "buying", label: "Buying" },
    { id: "done", label: "Done" }
  ];
  const statusLabel = (id) => (STATUSES.find((s) => s.id === id) || STATUSES[0]).label;

  // Grid lines from the architect's drawings, in metres
  const GRID_X = { A: 0, B: 4.75, C: 6.05, D: 9.8 };
  const GRID_Y = { 1: 0, 2: 1.5, 3: 3.71, 4: 5.205, 5: 6.705, 6: 8.205, 7: 9.8 };
  const SIZE = 9.8;
  const flip = (y) => SIZE - y; // drawings measure up from line 1, SVG measures down from the top

  const prefs = Store.prefs();
  let floorId = prefs.floor || "ground";
  let roomId = prefs.room || null;

  const floorOf = (d) => d.floors.find((f) => f.id === floorId) || d.floors[0];
  const roomCost = (r) => r.items.reduce((s, i) => s + (Number(i.cost) || 0), 0);
  const roomProgress = (r) => (r.items.length ? r.items.filter((i) => i.done).length / r.items.length : 0);

  /* ---------- Totals across the whole house ---------- */
  function renderTotals(d) {
    const rooms = d.floors.flatMap((f) => f.rooms);
    const items = rooms.flatMap((r) => r.items);
    const budget = items.reduce((s, i) => s + (Number(i.cost) || 0), 0);
    const bought = items.filter((i) => i.done).reduce((s, i) => s + (Number(i.cost) || 0), 0);
    $("budget").textContent = fmt.kes(budget);
    $("budgetSub").textContent = `${fmt.kes(bought)} of it already bought`;
    $("budgetBar").style.width = (budget ? (bought / budget) * 100 : 0) + "%";
    $("roomsDone").textContent = `${rooms.filter((r) => r.status === "done").length} of ${rooms.length}`;
    const past = rooms.filter((r) => r.status !== "idea").length;
    $("roomsSub").textContent = `${past} room${past === 1 ? "" : "s"} past the idea stage`;
    $("itemsDone").textContent = `${items.filter((i) => i.done).length} of ${items.length}`;
    $("itemsSub").textContent = "Across every floor";
  }

  /* ---------- Floor tabs and legend ---------- */
  function renderTabs(d) {
    $("floorTabs").innerHTML = d.floors.map((f) =>
      `<button role="tab" aria-selected="${f.id === floorOf(d).id}" data-floor="${f.id}">${esc(f.name)}</button>`).join("");
    $("statusLegend").innerHTML = STATUSES.map((s) =>
      `<span class="status-${s.id}"><i class="dot" style="background:var(--st-deep)"></i>${s.label}</span>`).join("");
  }
  $("floorTabs").addEventListener("click", (e) => {
    const b = e.target.closest("[data-floor]");
    if (!b) return;
    floorId = b.dataset.floor;
    roomId = null;
    Store.setPref("floor", floorId);
    renderFloor(Store.get());
  });

  /* ---------- The plan drawing ---------- */
  function renderPlan(d) {
    const floor = floorOf(d);
    const pad = 0.9;
    let s = `<svg viewBox="${-pad} ${-pad} ${SIZE + pad * 2} ${SIZE + pad * 2}" role="img" aria-label="${esc(floor.name)} plan">`;

    // Grid lines and their bubbles, like the architect's drawing
    Object.entries(GRID_X).forEach(([k, x]) => {
      s += `<line class="grid-line" x1="${x}" x2="${x}" y1="${-pad + 0.35}" y2="${SIZE + pad - 0.35}"/>`;
      s += `<text class="grid-label" x="${x}" y="${-pad + 0.3}" text-anchor="middle">${k}</text>`;
    });
    Object.entries(GRID_Y).forEach(([k, y]) => {
      s += `<line class="grid-line" y1="${flip(y)}" y2="${flip(y)}" x1="${-pad + 0.35}" x2="${SIZE + pad - 0.35}"/>`;
      s += `<text class="grid-label" x="${-pad + 0.15}" y="${flip(y) + 0.1}">${k}</text>`;
    });

    floor.rooms.forEach((r) => {
      s += `<g class="room status-${r.status} ${r.id === roomId ? "sel" : ""}" data-room="${r.id}" tabindex="0" role="button" aria-label="${esc(r.name)}, ${statusLabel(r.status)}">`;
      r.rects.forEach(([x0, y0, x1, y1]) => {
        s += `<rect x="${x0}" y="${flip(y1)}" width="${x1 - x0}" height="${y1 - y0}"/>`;
      });
      // Label goes in the biggest box of the room
      const big = r.rects.reduce((a, b) => ((b[2] - b[0]) * (b[3] - b[1]) > (a[2] - a[0]) * (a[3] - a[1]) ? b : a));
      const w = big[2] - big[0], h = big[3] - big[1];
      const cx = big[0] + w / 2, cy = flip(big[1] + h / 2);
      const fs = Math.min(0.34, w / (r.name.length * 0.62));
      if (w < 1.6 && h > 3) {
        // Narrow tall rooms (lobby, passage) get a sideways label
        s += `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" transform="rotate(-90 ${cx} ${cy})" style="font-size:.3px">${esc(r.name)}</text>`;
      } else {
        s += `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" style="font-size:${fs}px">${esc(r.name)}</text>`;
      }
      s += `</g>`;
    });
    s += `</svg>`;
    $("plan").innerHTML = s;
  }

  function pickRoom(id) {
    roomId = id;
    Store.setPref("room", id);
    const d = Store.get();
    renderPlan(d);
    renderPanel(d);
    renderStrip(d);
  }
  $("plan").addEventListener("click", (e) => {
    const g = e.target.closest("[data-room]");
    if (g) pickRoom(g.dataset.room);
  });
  $("plan").addEventListener("keydown", (e) => {
    const g = e.target.closest("[data-room]");
    if (g && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); pickRoom(g.dataset.room); }
  });

  /* ---------- Room details ---------- */
  function renderPanel(d) {
    const floor = floorOf(d);
    const r = floor.rooms.find((x) => x.id === roomId) || floor.rooms[0];
    roomId = r.id;
    const cost = roomCost(r);
    const pct = Math.round(roomProgress(r) * 100);

    $("roomPanel").innerHTML = `
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:start">
        <div>
          <span class="eyebrow">${esc(floor.name)} · ${esc(r.size)}</span>
          <h2 style="margin-top:4px">${esc(r.name)}</h2>
        </div>
        <button class="pill st-pill status-${r.status}" id="cycleStatus" title="Tap to change status">
          <i class="dot" style="background:var(--st-deep)"></i>${statusLabel(r.status)}
        </button>
      </div>
      <p class="mood" id="mood" title="Click to edit">${esc(r.mood) || "Click to add a mood for this room."}</p>
      <div class="swatches">${r.palette.map((c) => `<div class="swatch" style="background:${esc(c)}"><small>${esc(c)}</small></div>`).join("")}</div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:34px">
        <strong>Shopping list</strong>
        <span class="muted num" style="font-size:13px">${pct}% done · ${fmt.kes(cost)}</span>
      </div>
      <div class="bar" style="margin-top:8px"><span style="width:${pct}%"></span></div>
      <ul class="items" style="margin-top:10px">
        ${r.items.map((it, i) => `
          <li class="${it.done ? "done" : ""}">
            <input type="checkbox" data-tick="${i}" ${it.done ? "checked" : ""} aria-label="Mark ${esc(it.name)} as bought">
            <span class="iname">${esc(it.name)}</span>
            <span class="icost">${fmt.kes(it.cost)}</span>
            <button class="icon-btn" data-rm="${i}" aria-label="Remove ${esc(it.name)}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg>
            </button>
          </li>`).join("") || `<li class="muted">Nothing on the list yet.</li>`}
      </ul>
      <form class="add-item" id="addItem">
        <input class="input" name="name" placeholder="Add an item" required>
        <input class="input" name="cost" type="number" min="0" step="100" placeholder="KES" inputmode="numeric">
        <button class="btn primary">Add</button>
      </form>`;
  }

  $("roomPanel").addEventListener("click", (e) => {
    const d = Store.get();
    const r = floorOf(d).rooms.find((x) => x.id === roomId);
    if (!r) return;
    if (e.target.closest("#cycleStatus")) {
      const i = STATUSES.findIndex((s) => s.id === r.status);
      r.status = STATUSES[(i + 1) % STATUSES.length].id;
      Store.save();
    }
    const rm = e.target.closest("[data-rm]");
    if (rm && confirm("Remove this item?")) {
      r.items.splice(Number(rm.dataset.rm), 1);
      Store.save();
    }
    if (e.target.closest("#mood")) {
      const next = prompt("Describe the mood for this room", r.mood);
      if (next !== null) { r.mood = next.trim(); Store.save(); }
    }
  });
  $("roomPanel").addEventListener("change", (e) => {
    if (!e.target.dataset.tick) return;
    const r = floorOf(Store.get()).rooms.find((x) => x.id === roomId);
    r.items[Number(e.target.dataset.tick)].done = e.target.checked;
    // When every item is bought, the room moves to done by itself
    if (r.items.length && r.items.every((i) => i.done)) r.status = "done";
    else if (r.status === "done") r.status = "buying";
    Store.save();
  });
  $("roomPanel").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const name = String(f.get("name") || "").trim();
    if (!name) return;
    const r = floorOf(Store.get()).rooms.find((x) => x.id === roomId);
    r.items.push({ name, cost: Math.round(Number(f.get("cost")) || 0), done: false });
    Store.save();
    setTimeout(() => $("roomPanel").querySelector("input[name=name]")?.focus(), 0);
  });

  /* ---------- Room chips under the plan ---------- */
  function renderStrip(d) {
    const floor = floorOf(d);
    $("stripTitle").textContent = `Rooms on the ${floor.name.toLowerCase()}`;
    $("roomStrip").innerHTML = floor.rooms.map((r) => `
      <button class="room-chip status-${r.status}" data-room="${r.id}" ${r.id === roomId ? 'style="border-color:var(--ink)"' : ""}>
        <span class="eyebrow" style="font-size:10px">${statusLabel(r.status)}</span>
        <strong>${esc(r.name)}</strong>
        <div class="mini">${r.palette.map((c) => `<i style="background:${esc(c)}"></i>`).join("")}</div>
        <div class="bar"><span style="width:${roomProgress(r) * 100}%"></span></div>
      </button>`).join("");
  }
  $("roomStrip").addEventListener("click", (e) => {
    const b = e.target.closest("[data-room]");
    if (!b) return;
    pickRoom(b.dataset.room);
    if (window.innerWidth < 900) $("roomPanel").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  /* ---------- Start ---------- */
  function renderFloor(d) {
    const f = floorOf(d);
    if (!f.rooms.some((r) => r.id === roomId)) roomId = f.rooms[0].id;
    renderTabs(d);
    renderPlan(d);
    renderPanel(d);
    renderStrip(d);
  }
  function renderAll(d) {
    renderTotals(d);
    renderFloor(d);
  }
  renderAll(Store.get());
  Store.onChange(renderAll);
})();
