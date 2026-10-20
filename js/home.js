/* =========================================================
   home.js
   The house reveal. The render is cut into horizontal slices,
   one per stage. Each slice fades from a faint sketch to full
   colour as its progress goes from 0 to 100.
   ========================================================= */

(function () {
  const IMG = "assets/img/house-front.jpg";
  const reveal = document.getElementById("reveal");
  const slider = document.getElementById("timeMachine");
  const backBtn = document.getElementById("backToToday");
  const badge = document.getElementById("previewBadge");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const clamp = (n, a = 0, b = 1) => Math.min(b, Math.max(a, n));
  let layers = {};      // stage id -> { floor, tag }
  let garden, scaffold;

  /* ---------- Build the picture once ---------- */
  function buildReveal(d) {
    reveal.querySelectorAll(".ghost,.garden,.floor,.floor-tag,.scaffold").forEach((n) => n.remove());
    layers = {};
    const trim = d.houseTrim;

    const ghost = new Image();
    ghost.src = IMG; ghost.alt = ""; ghost.className = "ghost";
    reveal.appendChild(ghost);

    d.stages.forEach((st) => {
      const floor = document.createElement("div");
      floor.className = "floor";
      // inset(top right bottom left) keeps only this stage's slice of the house
      floor.style.clipPath = `inset(${st.band[0]}% ${trim.right}% ${100 - st.band[1]}% ${trim.left}%)`;
      const img = new Image();
      img.src = IMG; img.alt = "";
      floor.appendChild(img);
      reveal.appendChild(floor);

      const tag = document.createElement("span");
      tag.className = "floor-tag";
      tag.style.top = (st.band[0] + st.band[1]) / 2 + "%";
      tag.innerHTML = `<span class="dot"></span><span>${esc(st.short)}</span><span class="t-pct num"></span>`;
      reveal.appendChild(tag);

      layers[st.id] = { floor, tag, st };
    });

    garden = new Image();
    garden.src = IMG; garden.alt = ""; garden.className = "garden";
    reveal.appendChild(garden);

    scaffold = document.createElement("div");
    scaffold.className = "scaffold";
    reveal.appendChild(scaffold);
  }

  /* ---------- Paint the picture for a set of progress values ---------- */
  // values: { stageId: 0..100 }
  function paint(d, values) {
    const trim = d.houseTrim;
    let active = null;

    d.stages.forEach((st) => {
      const L = layers[st.id];
      if (!L) return;
      const p = clamp(values[st.id] / 100);

      // Translucent and soft when just started, crisp when finished
      L.floor.style.opacity = p === 0 ? 0 : (0.12 + 0.88 * p).toFixed(3);
      L.floor.style.filter = p >= 1 ? "none" : `blur(${((1 - p) * 2.5).toFixed(2)}px) saturate(${(0.35 + 0.65 * p).toFixed(2)})`;

      L.tag.classList.toggle("done", p >= 1);
      L.tag.classList.toggle("active", p > 0 && p < 1);
      L.tag.querySelector(".t-pct").textContent = Math.round(p * 100) + "%";

      if (!active && p < 1) active = st;
    });

    // Dashed scaffold around the floor being worked on
    if (active) {
      scaffold.style.display = "block";
      scaffold.style.top = active.band[0] + "%";
      scaffold.style.height = active.band[1] - active.band[0] + "%";
      scaffold.style.left = trim.left + "%";
      scaffold.style.right = trim.right + "%";
    } else {
      scaffold.style.display = "none";
    }

    // The garden and trees only come in when everything is done
    const all = d.stages.every((st) => values[st.id] >= 100);
    garden.style.opacity = all ? 1 : 0;
  }

  // Spread an overall percent across stages in building order (used by the slider)
  function spread(d, overall) {
    const totalW = d.stages.reduce((s, st) => s + st.weight, 0);
    let start = 0;
    const out = {};
    d.stages.forEach((st) => {
      const share = (st.weight / totalW) * 100;
      out[st.id] = clamp((overall - start) / share) * 100;
      start += share;
    });
    return out;
  }

  const actual = (d) => Object.fromEntries(d.stages.map((st) => [st.id, st.progress]));

  /* ---------- Text, tiles and diary ---------- */
  function renderText(d) {
    const pct = overallProgress(d.stages);
    document.getElementById("projectName").textContent = d.project.name;
    document.getElementById("tagline").textContent = d.project.tagline;
    document.getElementById("eyebrow").textContent = "Building diary · " + d.project.location;
    document.getElementById("builder").textContent = d.project.builder;
    document.getElementById("overallBar").style.width = pct + "%";

    const current = d.stages.find((st) => st.progress < 100);
    const now = document.getElementById("nowText");
    if (!current) now.textContent = "Karibu nyumbani! The house is complete.";
    else if (current.progress === 0) now.textContent = `Next up is the ${current.name.toLowerCase()}.`;
    else now.textContent = `Working on the ${current.name.toLowerCase()}, now ${current.progress}% done.`;

    const last = [...d.updates].sort((a, b) => b.date.localeCompare(a.date))[0];
    document.getElementById("lastUpdate").textContent = last ? `Last site update ${fmt.daysAgo(last.date)}, ${fmt.date(last.date)}` : "";
  }

  function countUp(el, to, ms) {
    if (reduceMotion) { el.textContent = Math.round(to) + "%"; return; }
    const t0 = performance.now();
    const step = (t) => {
      const k = clamp((t - t0) / ms);
      el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))) + "%";
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  const tileColours = ["sage", "sand", "clay", "mist"];
  function renderTiles(d) {
    const current = d.stages.find((st) => st.progress < 100);
    document.getElementById("stageTiles").innerHTML = d.stages.map((st, i) => {
      const state = st.progress >= 100 ? "Done" : st === current && st.progress > 0 ? "In progress" : st === current ? "Up next" : "Waiting";
      return `
        <article class="tile ${tileColours[i % 4]} stage-tile">
          <span class="state">${state}</span>
          <h3 style="margin-top:6px"><span>${esc(st.name)}</span><span class="pct">${st.progress}%</span></h3>
          <div class="bar"><span style="width:${st.progress}%"></span></div>
          <p>${esc(st.note) || "&nbsp;"}</p>
        </article>`;
    }).join("");
  }

  function renderDiary(d) {
    const names = Object.fromEntries(d.stages.map((s) => [s.id, s.name]));
    const list = [...d.updates].map((u, i) => ({ ...u, i })).sort((a, b) => b.date.localeCompare(a.date));
    document.getElementById("diary").innerHTML = list.length
      ? list.map((u) => `
        <li>
          <time datetime="${u.date}">${fmt.date(u.date)}</time>
          <div><span class="pill" style="background:var(--sand);color:var(--sand-deep);margin-right:8px">${esc(names[u.stage] || "General")}</span>${esc(u.text)}</div>
          <button class="icon-btn" data-del="${u.i}" aria-label="Delete entry" title="Delete entry">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
        </li>`).join("")
      : `<li><span class="muted">No entries yet.</span></li>`;
  }

  document.getElementById("diary").addEventListener("click", (e) => {
    const b = e.target.closest("[data-del]");
    if (!b || !confirm("Delete this diary entry?")) return;
    Store.get().updates.splice(Number(b.dataset.del), 1);
    Store.save();
  });

  /* ---------- Opening animation: floors rise one after another ---------- */
  function playIntro(d) {
    const target = actual(d);
    if (reduceMotion) { paint(d, target); return; }
    const totalW = d.stages.reduce((s, st) => s + st.weight, 0);
    const DURATION = 2400;
    const t0 = performance.now();
    const frame = (t) => {
      const k = clamp((t - t0) / DURATION);
      let start = 0;
      const vals = {};
      d.stages.forEach((st) => {
        const share = st.weight / totalW;
        const local = clamp((k - start) / share);
        vals[st.id] = target[st.id] * (1 - Math.pow(1 - local, 2));
        start += share;
      });
      paint(d, vals);
      if (k < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  /* ---------- Peek ahead slider ---------- */
  function resetSlider(d) {
    slider.value = overallProgress(d.stages);
    backBtn.disabled = true;
    badge.classList.remove("show");
  }
  slider.addEventListener("input", () => {
    const d = Store.get();
    const v = Number(slider.value);
    paint(d, spread(d, v));
    backBtn.disabled = false;
    badge.textContent = v >= 100 ? "Preview: the finished house" : `Preview at ${Math.round(v)}%`;
    badge.classList.add("show");
  });
  backBtn.addEventListener("click", () => {
    const d = Store.get();
    paint(d, actual(d));
    resetSlider(d);
  });

  /* ---------- Update progress dialog ---------- */
  const editDialog = document.getElementById("editDialog");
  document.getElementById("openEdit").addEventListener("click", () => {
    const d = Store.get();
    document.getElementById("editBody").innerHTML = d.stages.map((st) => `
      <div>
        <div class="stage-row">
          <strong>${esc(st.name)}</strong>
          <input type="range" min="0" max="100" step="5" value="${st.progress}" data-stage="${st.id}" aria-label="${esc(st.name)} progress">
          <span class="num" data-out="${st.id}" style="text-align:right;font-weight:700">${st.progress}%</span>
        </div>
        <input class="input" style="margin-top:8px;font-size:14px" data-note="${st.id}" value="${esc(st.note)}" placeholder="Short note, for example walls at window level">
      </div>`).join("");
    editDialog.showModal();
  });
  document.getElementById("editBody").addEventListener("input", (e) => {
    if (e.target.dataset.stage) {
      document.querySelector(`[data-out="${e.target.dataset.stage}"]`).textContent = e.target.value + "%";
      // live preview on the picture while dragging
      const d = Store.get();
      const vals = actual(d);
      editDialog.querySelectorAll("[data-stage]").forEach((r) => { vals[r.dataset.stage] = Number(r.value); });
      paint(d, vals);
    }
  });
  editDialog.addEventListener("close", () => {
    const d = Store.get();
    if (editDialog.returnValue === "save") {
      editDialog.querySelectorAll("[data-stage]").forEach((r) => {
        d.stages.find((s) => s.id === r.dataset.stage).progress = Number(r.value);
      });
      editDialog.querySelectorAll("[data-note]").forEach((n) => {
        d.stages.find((s) => s.id === n.dataset.note).note = n.value.trim();
      });
      Store.save();
    } else {
      paint(d, actual(d));
    }
  });

  /* ---------- Diary dialog ---------- */
  const diaryDialog = document.getElementById("diaryDialog");
  const diaryForm = document.getElementById("diaryForm");
  document.getElementById("openDiary").addEventListener("click", () => {
    const d = Store.get();
    const current = d.stages.find((st) => st.progress < 100) || d.stages[d.stages.length - 1];
    document.getElementById("diaryStage").innerHTML = d.stages.map((s) => `<option value="${s.id}" ${s === current ? "selected" : ""}>${esc(s.name)}</option>`).join("");
    diaryForm.reset();
    diaryForm.date.value = fmt.today();
    document.getElementById("diaryStage").value = current.id;
    diaryDialog.showModal();
  });
  diaryDialog.addEventListener("close", () => {
    if (diaryDialog.returnValue !== "save") return;
    const f = new FormData(diaryForm);
    const text = String(f.get("text") || "").trim();
    if (!text) return;
    Store.get().updates.push({ date: f.get("date"), stage: f.get("stage"), text });
    Store.save();
  });

  /* ---------- Start ---------- */
  function renderAll(d, intro) {
    renderText(d);
    renderTiles(d);
    renderDiary(d);
    resetSlider(d);
    const pct = overallProgress(d.stages);
    if (intro) {
      countUp(document.getElementById("overallPct"), pct, 2400);
      playIntro(d);
    } else {
      document.getElementById("overallPct").textContent = Math.round(pct) + "%";
      paint(d, actual(d));
    }
  }

  buildReveal(Store.get());
  renderAll(Store.get(), true);
  Store.onChange((d) => renderAll(d, false));
})();
