/* =========================================================
   store.js
   Shared by every page. Loads the data, saves edits in the
   browser, and lets you download a new data file to commit.
   ========================================================= */

(function () {
  const KEY = "mjengo-data-v1";
  const PREFS = "mjengo-prefs-v1";

  // Deep copy so we never change the original published data by accident
  const clone = (obj) => JSON.parse(JSON.stringify(obj));
  const published = clone(window.SITE_DATA);

  function readLocal() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  let data = readLocal() || clone(published);
  const listeners = [];

  const Store = {
    get: () => data,

    // Call after changing data. Saves to the browser and refreshes the page parts.
    save() {
      try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* private mode, ignore */ }
      Store.refreshDirty();
      listeners.forEach((fn) => fn(data));
    },

    onChange: (fn) => listeners.push(fn),

    isDirty: () => JSON.stringify(data) !== JSON.stringify(published),

    discard() {
      try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
      data = clone(published);
      Store.refreshDirty();
      listeners.forEach((fn) => fn(data));
    },

    // Builds a fresh site-data.js and downloads it
    download() {
      const header =
        "// Mjengo Tracker data.\n" +
        "// Everything the site shows comes from this file.\n" +
        "// To publish changes, use \"Download data file\" on the site, replace this file and commit.\n" +
        "// Last exported " + new Date().toLocaleString("en-KE") + "\n\n";
      const text = header + "window.SITE_DATA = " + JSON.stringify(data, null, 2) + ";\n";
      const blob = new Blob([text], { type: "text/javascript" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "site-data.js";
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    },

    prefs() {
      try { return JSON.parse(localStorage.getItem(PREFS)) || {}; } catch (e) { return {}; }
    },
    setPref(k, v) {
      const p = Store.prefs();
      p[k] = v;
      try { localStorage.setItem(PREFS, JSON.stringify(p)); } catch (e) { /* ignore */ }
    },

    refreshDirty() {
      const bar = document.getElementById("dirtyBar");
      if (bar) bar.classList.toggle("show", Store.isDirty());
    },

    uid: () => "t" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
  };

  /* ---------- Small helpers used across pages ---------- */
  const kes = new Intl.NumberFormat("en-KE", { maximumFractionDigits: 0 });
  window.fmt = {
    kes: (n) => "KES " + kes.format(Math.round(n || 0)),
    short: (n) => {
      n = Math.round(n || 0);
      if (n >= 1e6) return "KES " + (n / 1e6).toFixed(n % 1e6 === 0 ? 0 : 2) + "M";
      if (n >= 1e3) return "KES " + (n / 1e3).toFixed(n % 1e3 === 0 ? 0 : 1) + "k";
      return "KES " + n;
    },
    date: (iso) => new Date(iso + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
    month: (iso) => new Date(iso + "T00:00:00").toLocaleDateString("en-GB", { month: "short" }),
    daysAgo: (iso) => {
      const d = Math.round((new Date().setHours(0, 0, 0, 0) - new Date(iso + "T00:00:00")) / 864e5);
      if (d <= 0) return "today";
      if (d === 1) return "yesterday";
      return d + " days ago";
    },
    today: () => {
      const d = new Date();
      return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    }
  };

  // Escape text before putting it inside innerHTML
  window.esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // Overall progress as a weighted average of the stages
  window.overallProgress = (stages) => {
    const totalW = stages.reduce((s, st) => s + st.weight, 0);
    return stages.reduce((s, st) => s + (st.progress * st.weight) / totalW, 0);
  };

  /* ---------- Unsaved changes bar, added to every page ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    const bar = document.createElement("div");
    bar.id = "dirtyBar";
    bar.className = "dirty-bar";
    bar.setAttribute("role", "status");
    bar.innerHTML =
      '<p>Your changes are saved on this device only. Download the data file and commit it to publish them.</p>' +
      '<button class="btn small ghost" data-act="discard">Discard</button>' +
      '<button class="btn small primary" data-act="download">Download data file</button>';
    bar.addEventListener("click", (e) => {
      const act = e.target.closest("button")?.dataset.act;
      if (act === "download") Store.download();
      if (act === "discard" && confirm("Throw away the changes on this device and go back to the published data?")) Store.discard();
    });
    document.body.appendChild(bar);
    Store.refreshDirty();

    const yr = document.getElementById("year");
    if (yr) yr.textContent = new Date().getFullYear();
  });

  window.Store = Store;
})();
