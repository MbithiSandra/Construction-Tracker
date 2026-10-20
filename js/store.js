/* =========================================================
   store.js
   Loads the data from Firebase and saves every change back
   straight away. Family members log in by tapping their name.
   ========================================================= */

(function () {
  const CACHE = "mjengo-cache-v2";
  const PREFS = "mjengo-prefs-v1";
  const FAMILY = window.FAMILY || [];
  const clone = (o) => JSON.parse(JSON.stringify(o));

  // Hide the page straight away. It only opens after Firebase confirms who you are.
  if (window.FAMILY_ONLY) document.body.classList.add("locked");

  let data;
  try { data = JSON.parse(localStorage.getItem(CACHE)); } catch (e) { data = null; }
  if (!data) data = clone(window.SITE_DATA);

  const listeners = [];
  let user = null, auth = null, docRef = null, unsub = null;

  const notify = () => listeners.forEach((fn) => fn(data));
  const cache = () => { try { localStorage.setItem(CACHE, JSON.stringify(data)); } catch (e) {} };
  const memberOf = (u) => u && FAMILY.find((f) => f.email.toLowerCase() === (u.email || "").toLowerCase());

  /* ---------- Firebase ---------- */
  if (window.firebase && window.FIREBASE_CONFIG) {
    firebase.initializeApp(window.FIREBASE_CONFIG);
    auth = firebase.auth();
    // Firestore does not allow arrays inside arrays, so the site is stored as one JSON text field
    docRef = firebase.firestore().collection("site").doc("data");

    auth.onAuthStateChanged((u) => {
      user = u;
      updateUserUI();
      if (u || !window.FAMILY_ONLY) listen();
      if (u) docRef.get().then((snap) => { if (!snap.exists) push(); });
      // Not logged in on a private site: stop listening, wipe this device's copy, show the login box
      if (!u && window.FAMILY_ONLY) {
        if (unsub) { unsub(); unsub = null; }
        try { localStorage.removeItem(CACHE); } catch (e) {}
        openLogin();
      }
    });
  }

  // Live updates: when anyone in the family saves, every open screen changes by itself
  function listen() {
    if (unsub) unsub();
    unsub = docRef.onSnapshot((snap) => {
      if (!snap.exists) return;
      try { data = JSON.parse(snap.data().json); cache(); notify(); }
      catch (e) { console.error("Bad data in Firebase", e); }
    }, (err) => console.error("Firebase read failed", err));
  }

  function push() {
    if (!docRef || !user) return;
    flash("Saving…");
    const who = memberOf(user);
    docRef.set({
      json: JSON.stringify(data),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedBy: who ? who.name : user.email
    }).then(() => flash("Saved"))
      .catch(() => flash("Could not save. Check your internet and try again."));
  }

  const Store = {
    get: () => data,
    save() {
      cache();
      notify();
      if (user) push();
      else { flash("Log in to save your changes."); openLogin(); }
    },
    onChange: (fn) => listeners.push(fn),
    user: () => memberOf(user),
    prefs() { try { return JSON.parse(localStorage.getItem(PREFS)) || {}; } catch (e) { return {}; } },
    setPref(k, v) {
      const p = Store.prefs(); p[k] = v;
      try { localStorage.setItem(PREFS, JSON.stringify(p)); } catch (e) {}
    },
    uid: () => "t" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
  };

  /* ---------- Helpers used across pages ---------- */
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
      return d <= 0 ? "today" : d === 1 ? "yesterday" : d + " days ago";
    },
    today: () => {
      const d = new Date();
      return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    }
  };
  window.esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  window.overallProgress = (stages) => {
    const totalW = stages.reduce((s, st) => s + st.weight, 0);
    return stages.reduce((s, st) => s + (st.progress * st.weight) / totalW, 0);
  };

  /* ---------- Login box ---------- */
  let dlg, bar, msg, chip, lock, hideTimer;

  function buildLogin() {
    dlg = document.createElement("dialog");
    dlg.innerHTML = `
      <form id="loginForm">
        <div class="dialog-head"><h3>Who's updating?</h3>
          <button type="button" class="icon-btn" data-close aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
        </div>
        <div class="dialog-body">
          <div class="who">
            ${FAMILY.map((f, i) => `
              <label><input type="radio" name="who" value="${f.key}" ${i === 0 ? "checked" : ""}>
                <span><i class="face">${esc(f.name[0])}</i>${esc(f.name)}</span></label>`).join("")}
          </div>
          <label class="field">Password
            <input class="input" type="password" name="pass" autocomplete="current-password" required>
          </label>
          <p class="login-error" id="loginError"></p>
        </div>
        <div class="dialog-foot"><button class="btn primary" type="submit" style="width:100%;justify-content:center">Log in</button></div>
      </form>`;
    document.body.appendChild(dlg);

    // Remember who last logged in on this phone so Dad's name is already picked
    const last = Store.prefs().lastUser;
    if (last) { const r = dlg.querySelector(`input[value="${last}"]`); if (r) r.checked = true; }

    dlg.querySelector("[data-close]").addEventListener("click", () => dlg.close());
    dlg.querySelector("form").addEventListener("submit", (e) => {
      e.preventDefault();
      const f = new FormData(e.target);
      const member = FAMILY.find((m) => m.key === f.get("who"));
      const err = dlg.querySelector("#loginError");
      err.textContent = "";
      if (!auth) { err.textContent = "Firebase is not set up yet."; return; }
      auth.signInWithEmailAndPassword(member.email, f.get("pass"))
        .then(() => {
          Store.setPref("lastUser", member.key);
          e.target.reset();
          dlg.close();
          flash("Karibu " + member.name + ". Your changes now save for everyone.");
        })
        .catch(() => { err.textContent = "That password is not right. Try again."; });
    });
  }

  function openLogin() { if (dlg && !dlg.open) dlg.showModal(); }

  // Name chip in the top bar: shows who is logged in, tap to log out
  function updateUserUI() {
    const m = memberOf(user);
    if (chip) {
      chip.innerHTML = m
        ? `<i class="face">${esc(m.name[0])}</i>${esc(m.name)}`
        : `<i class="face" style="background:var(--sand);color:var(--sand-deep)">?</i>Log in`;
      chip.title = m ? "Tap to log out" : "Family log in";
    }
    if (window.FAMILY_ONLY) {
      document.body.classList.toggle("locked", !user);
      if (lock) lock.style.display = user ? "none" : "block";
    }
  }

  /* ---------- Status messages at the bottom ---------- */
  function flash(text) {
    if (!bar) return;
    msg.textContent = text;
    bar.classList.add("show");
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => bar.classList.remove("show"), text.startsWith("Could not") ? 6000 : 2500);
  }

  document.addEventListener("DOMContentLoaded", () => {
    buildLogin();

    bar = document.createElement("div");
    bar.className = "dirty-bar";
    bar.setAttribute("role", "status");
    bar.innerHTML = "<p></p>";
    msg = bar.querySelector("p");
    document.body.appendChild(bar);

    chip = document.createElement("button");
    chip.className = "user-chip";
    chip.addEventListener("click", () => {
      if (!user) return openLogin();
      if (confirm("Log out on this device?")) auth.signOut();
    });
    const nav = document.querySelector(".topbar .wrap");
    if (nav) nav.appendChild(chip);

    if (window.FAMILY_ONLY) {
      lock = document.createElement("div");
      lock.className = "lock-screen card";
            lock.innerHTML = `
        <span class="brand-mark" style="margin:0 auto 14px;width:52px;height:52px;border-radius:15px">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3 21V10l9-7 9 7v11h-6v-6H9v6z"/></svg>
        </span>
        <h2>Family only</h2>
        <p class="muted">Log in to see how the house is coming along.</p>
        <button class="btn primary" type="button">Log in</button>`;
      lock.querySelector("button").addEventListener("click", openLogin);
      document.querySelector(".topbar").after(lock);
    }
    updateUserUI();

    const yr = document.getElementById("year");
    if (yr) yr.textContent = new Date().getFullYear();
  });

  window.Store = Store;
})();