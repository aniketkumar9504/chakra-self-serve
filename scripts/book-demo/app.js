/* ============================================================================
   "Book a HackerRank demo" — clickable, front-end-only prototype.
   Screens: identify → loading → book (calendar) | intent fork → confirmation.
   All data is mocked in ./mock-services.js.
   ============================================================================ */
import {
  enrich, enrichCompany, route, getSlots, book, companyHint, PRODUCTS,
} from "./mock-services.js";

const app = document.getElementById("bd-app");

/* ---- app state ---- */
const params = new URLSearchParams(location.search);
const validProducts = ["chakra", "interview", "all"];
const urlProduct = validProducts.includes(params.get("product")) ? params.get("product") : null;

const state = {
  screen: "identify",
  email: "",
  emailError: "",
  profile: null,
  product: urlProduct || "all",
  productPreselected: !!urlProduct,
  editing: false,
  sizeValue: "",
  sizeError: "",
  rep: null,
  slots: null,
  selectedDayId: null,
  selectedTime: null,
  requestingTime: false,
  loadingText: "Getting things ready…",
  booking: null,
  protoState: null,
};

/* ---- prototype states (state switcher) ---- */
const PROTO_STATES = [
  { key: "1", name: "New enterprise lead", email: "priya@acme.com" },
  { key: "2", name: "Existing customer", email: "priya@globex.com" },
  { key: "3", name: "Small team", email: "dev@tinylabs.io" },
  { key: "4", name: "Enrichment gap", email: "sam@unknownco.com" },
  { key: "5", name: "Personal email, matched", email: "priya.s@gmail.com" },
  { key: "6", name: "Personal email, no company", email: "alex@gmail.com" },
];
const showProto =
  params.get("proto") === "1" ||
  location.hostname === "localhost" ||
  location.hostname === "127.0.0.1";

/* ---- helpers ---- */
const delay = (ms) => new Promise((r) => setTimeout(r, ms));
const esc = (s) =>
  String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
const emailValid = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e).trim());
const avatar = (initials, cls = "") =>
  `<span class="bd-avatar ${cls}" aria-hidden="true">${esc(initials)}</span>`;

const clockIcon =
  `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="6.25" stroke="currentColor" stroke-width="1.4"/>
    <path d="M8 4.75V8l2.25 1.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
const personIcon =
  `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="8" cy="5" r="2.5" stroke="currentColor" stroke-width="1.4"/>
    <path d="M3 13c0-2.2 2.2-3.75 5-3.75S13 10.8 13 13" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
  </svg>`;

/* Branded "try it yourself" cards — shown on identify and on the book screen. */
function tryItSection() {
  return `
  <section class="bd-tryit" aria-label="Try it yourself">
    <p class="bd-tryit__lead">Don't have 30 minutes? Try it yourself first</p>
    <div class="bd-tryit__cards">
      <a class="bd-trycard bd-trycard--chakra" href="start-free-trial.html">
        <span class="bd-trycard__icon"><img src="assets/products/chakra.svg" alt="" aria-hidden="true" /></span>
        <span class="bd-trycard__body">
          <span class="bd-trycard__title">Try Chakra now</span>
          <span class="bd-trycard__desc">Take a 5-min AI interview yourself</span>
        </span>
      </a>
      <a class="bd-trycard bd-trycard--interview" href="#" data-action="try">
        <span class="bd-trycard__icon"><img src="assets/products/interview.svg" alt="" aria-hidden="true" /></span>
        <span class="bd-trycard__body">
          <span class="bd-trycard__title">Try Interview now</span>
          <span class="bd-trycard__desc">Open a live coding pad</span>
        </span>
      </a>
    </div>
  </section>`;
}

function bannerFor(p) {
  if (!p) return "";
  if (p.isCustomer) return `${p.company} already uses HackerRank, so you'll meet your account team.`;
  if (p.tier === "smallteam") return "For smaller teams we suggest a quick 15-min call, or try it yourself below.";
  if (p.sizeMissing && !state.sizeValue) return "We couldn't find your company size, so that's the only thing we ask.";
  return "";
}

/* ============================================================================
   Render
   ============================================================================ */
function render() {
  app.innerHTML = SCREENS[state.screen] ? SCREENS[state.screen]() : "";
  renderProtoBar();
  afterMount();
}

const SCREENS = {
  identify: renderIdentify,
  loading: renderLoading,
  fork: renderFork,
  community: renderCommunity,
  book: renderBook,
  confirm: renderConfirm,
};

/* ---- Screen 1: Identify ---- */
function renderIdentify() {
  return `
  <main class="bd-screen bd-identify" aria-labelledby="bd-id-title">
    <div class="bd-hero">
      <div class="bd-hero__left">
        <h1 class="bd-hero__title" id="bd-id-title">Book a<br />HackerRank demo</h1>
        <ul class="bd-meta">
          <li class="bd-meta__item">${clockIcon}<span>30 minutes</span></li>
          <li class="bd-meta__item">${personIcon}<span>With a product expert</span></li>
        </ul>
      </div>

      <div class="bd-hero__right">
        ${renderProductChips()}
        <form class="bd-emailform" data-action="email-submit" novalidate>
          <label class="bd-label" for="bd-email">Work email</label>
          <input class="bd-input ${state.emailError ? "bd-input--error" : ""}" type="email"
                 id="bd-email" name="email" placeholder="name@company.com"
                 autocomplete="email" value="${esc(state.email)}"
                 aria-invalid="${state.emailError ? "true" : "false"}"
                 ${state.emailError ? 'aria-describedby="bd-email-err"' : ""} />
          ${state.emailError
            ? `<p class="bd-error" id="bd-email-err" role="alert">${esc(state.emailError)}</p>`
            : ""}
          <button class="bd-btn bd-btn--primary bd-btn--block" type="submit">Continue</button>
        </form>
      </div>
    </div>
    ${tryItSection()}
  </main>`;
}

/* ---- Screen 2: Loading ---- */
function renderLoading() {
  return `
  <main class="bd-screen bd-loading" aria-live="polite">
    <div class="bd-spinner" aria-hidden="true"></div>
    <p class="bd-loading__text">${esc(state.loadingText)}</p>
  </main>`;
}

/* ---- Screen 3b: Intent fork ---- */
function renderFork() {
  return `
  <main class="bd-screen bd-fork" aria-labelledby="bd-fork-title">
    <div class="bd-card bd-fork__card">
      <h1 class="bd-h1" id="bd-fork-title">What brings you to HackerRank?</h1>
      <p class="bd-sub">Pick the one that fits and we'll take you to the right place.</p>
      <div class="bd-fork__options" role="group" aria-labelledby="bd-fork-title">
        <button class="bd-optcard bd-optcard--primary" type="button" data-action="fork" data-path="hiring">
          <span class="bd-optcard__title">I'm hiring engineers</span>
          <span class="bd-optcard__desc">Book a demo with a product expert.</span>
        </button>
        <button class="bd-optcard" type="button" data-action="fork" data-path="practice">
          <span class="bd-optcard__title">I want to practice and prep for interviews</span>
          <span class="bd-optcard__desc">Join the HackerRank community.</span>
        </button>
      </div>

      <form class="bd-company ${state.forkHiring ? "" : "bd-hidden"}" data-action="company-submit" novalidate>
        <label class="bd-label" for="bd-company">What company are you with?</label>
        <input class="bd-input" type="text" id="bd-company" name="company" placeholder="Company name" />
        <button class="bd-btn bd-btn--primary bd-btn--block" type="submit">Continue</button>
      </form>
    </div>
  </main>`;
}

/* ---- Community signup (practice path) ---- */
function renderCommunity() {
  return `
  <main class="bd-screen bd-community" aria-labelledby="bd-comm-title">
    <div class="bd-card bd-community__card">
      <h1 class="bd-h1" id="bd-comm-title">Join the HackerRank community</h1>
      <p class="bd-sub">Practice, compete, and prep for interviews with millions of developers.</p>
      <form data-action="community-submit" novalidate>
        <label class="bd-label" for="bd-comm-email">Email</label>
        <input class="bd-input" type="email" id="bd-comm-email" value="${esc(state.email)}" readonly />
        <button class="bd-btn bd-btn--primary bd-btn--block" type="submit">Create your account</button>
      </form>
      <button class="bd-link bd-back" type="button" data-action="restart">Back to start</button>
    </div>
  </main>`;
}

/* ---- Screen 3a: Book ---- */
function renderBook() {
  const p = state.profile;
  const banner = bannerFor(p);
  return `
  <main class="bd-screen bd-book" aria-labelledby="bd-book-title">
    <h1 class="bd-h1 bd-book__title" id="bd-book-title">Book your demo</h1>
    ${banner ? `<div class="bd-banner" role="status">${esc(banner)}</div>` : ""}
    <div class="bd-book__cols">
      <section class="bd-panel" aria-labelledby="bd-details-h">
        <div class="bd-panel__head">
          <h2 class="bd-h2" id="bd-details-h">Your details</h2>
          <button class="bd-link" type="button" data-action="toggle-edit">${state.editing ? "Done" : "Edit details"}</button>
        </div>
        <div class="bd-person">
          ${avatar(p.initials)}
          <div><div class="bd-person__name">${esc(p.name)}</div>
          <div class="bd-person__email">${esc(p.email)}</div></div>
        </div>
        ${renderDetailRows(p)}
      </section>

      <section class="bd-panel bd-cal" aria-labelledby="bd-cal-h">
        <div class="bd-rep">
          ${avatar(state.rep.initials, "bd-avatar--rep")}
          <div>
            <div class="bd-rep__name" id="bd-cal-h">${esc(state.rep.name)}</div>
            <div class="bd-rep__meta">${esc(state.rep.title)} · ${state.rep.minutes} min</div>
          </div>
        </div>
        ${renderDays()}
        <div id="bd-times">${renderTimes()}</div>
        <div id="bd-confirm">${renderConfirmBtn()}</div>
        <p class="bd-cal__foot">Times in ${esc(p.timezone)} ·
          <button class="bd-link" type="button" data-action="request-time">None of these work? Request a time</button>
        </p>
        <form class="bd-request ${state.requestingTime ? "" : "bd-hidden"}" data-action="request-submit" novalidate>
          <label class="bd-label" for="bd-req">Preferred time</label>
          <input class="bd-input" type="text" id="bd-req" placeholder="e.g. Next Tuesday afternoon" />
          <button class="bd-btn bd-btn--outline" type="submit">Send request</button>
        </form>
      </section>
    </div>

    ${tryItSection()}
  </main>`;
}

function renderDetailRows(p) {
  const rows = [
    ["Company", p.company || "—"],
    ["Role", p.role || "—"],
    ["Location", p.location ? `${p.location} · ${p.timezone}` : p.timezone],
  ];
  if (state.editing) {
    return `<div class="bd-rows">
      ${rows.map(([k]) => `
        <label class="bd-row bd-row--edit"><span class="bd-row__k">${k}</span>
          <input class="bd-input bd-input--sm" data-field="${esc(k)}" value="${esc(rowValue(p, k))}" /></label>`).join("")}
      ${sizeRow(p, true)}
    </div>`;
  }
  return `<div class="bd-rows">
    <div class="bd-row"><span class="bd-row__k">Company</span><span class="bd-row__v">${esc(p.company || "—")}</span></div>
    <div class="bd-row"><span class="bd-row__k">Role</span><span class="bd-row__v">${esc(p.role || "—")}</span></div>
    ${sizeRow(p, false)}
    <div class="bd-row"><span class="bd-row__k">Location</span><span class="bd-row__v">${esc(p.location ? p.location + " · " + p.timezone : p.timezone)}</span></div>
  </div>`;
}
function rowValue(p, k) {
  return { Company: p.company, Role: p.role, Location: p.location }[k] || "";
}
/* Company size — a required select when enrichment couldn't find it (state 4). */
function sizeRow(p, editing) {
  if (p.sizeMissing) {
    const opts = ["1–50", "51–200", "201–1,000", "1,001–5,000", "5,001–10,000", "10,000+"];
    return `<div class="bd-row bd-row--select">
      <label class="bd-row__k" for="bd-size">Company size *</label>
      <div class="bd-selectwrap">
        <select class="bd-input bd-input--sm" id="bd-size" data-action="size">
          <option value="" ${state.sizeValue ? "" : "selected"} disabled hidden>Please select</option>
          ${opts.map((o) => `<option ${state.sizeValue === o ? "selected" : ""}>${o}</option>`).join("")}
        </select>
      </div>
      ${state.sizeError ? `<p class="bd-error" role="alert">${esc(state.sizeError)}</p>` : ""}
    </div>`;
  }
  const val = state.sizeValue || p.size || "—";
  if (editing) {
    return `<label class="bd-row bd-row--edit"><span class="bd-row__k">Company size</span>
      <input class="bd-input bd-input--sm" data-field="Company size" value="${esc(val)}" /></label>`;
  }
  return `<div class="bd-row"><span class="bd-row__k">Company size</span><span class="bd-row__v">${esc(val)}</span></div>`;
}

function renderProductChips() {
  const items = ["chakra", "interview", "all"];
  const chips = items.map((id) => {
    const pr = PRODUCTS[id];
    const on = state.product === id;
    return `<button class="bd-chip ${on ? "is-on" : ""}" type="button" role="radio"
      aria-checked="${on}" data-action="product" data-product="${id}">${esc(pr.label)}</button>`;
  }).join("");
  let desc = PRODUCTS[state.product].desc;
  if (state.productPreselected) {
    desc += ` Preselected because you came from the ${PRODUCTS[state.product].label} page.`;
  }
  return `<div class="bd-chips-wrap">
    <p class="bd-chips-lead">What should we show you?</p>
    <div class="bd-chips" role="radiogroup" aria-label="What should we show you?">${chips}</div>
    <p class="bd-chips-desc">${esc(desc)}</p>
  </div>`;
}

function renderDays() {
  const days = state.slots.days;
  return `<fieldset class="bd-days"><legend class="sr-only">Choose a day</legend>
    ${days.map((d) => `
      <label class="bd-day ${state.selectedDayId === d.id ? "is-on" : ""}">
        <input type="radio" name="bd-day" value="${d.id}" ${state.selectedDayId === d.id ? "checked" : ""} />
        <span class="bd-day__dow">${d.dow}</span>
        <span class="bd-day__dom">${d.dom}</span>
        <span class="bd-day__mon">${d.mon}</span>
      </label>`).join("")}
  </fieldset>`;
}

function renderTimes() {
  const day = state.slots.days.find((d) => d.id === state.selectedDayId) || state.slots.days[0];
  return `<fieldset class="bd-times"><legend class="sr-only">Choose a time</legend>
    ${day.slots.map((t) => `
      <label class="bd-time ${state.selectedTime === t ? "is-on" : ""}">
        <input type="radio" name="bd-time" value="${esc(t)}" ${state.selectedTime === t ? "checked" : ""} />
        <span>${esc(t)}</span>
      </label>`).join("")}
  </fieldset>`;
}

function renderConfirmBtn() {
  const day = state.slots.days.find((d) => d.id === state.selectedDayId);
  const ready = !!state.selectedTime;
  const label = ready ? `Confirm ${day.label} · ${state.selectedTime}` : "Select a time";
  return `<button class="bd-btn bd-btn--primary bd-btn--block" type="button"
    data-action="confirm" ${ready ? "" : "disabled"}>${esc(label)}</button>`;
}

/* ---- Screen 4: Confirmation ---- */
function renderConfirm() {
  const b = state.booking;
  return `
  <main class="bd-screen bd-confirm" aria-labelledby="bd-conf-title">
    <div class="bd-card bd-confirm__card">
      <span class="bd-check" aria-hidden="true">✓</span>
      <h1 class="bd-h1" id="bd-conf-title">You're booked</h1>
      <p class="bd-confirm__when">${esc(b.dayLabel)} · ${esc(b.time)} ${esc(b.timezone)} with ${esc(b.repName)}</p>

      <div class="bd-confirm__cal">
        <button class="bd-btn bd-btn--outline" type="button" data-action="noop">Add to Google Calendar</button>
        <button class="bd-btn bd-btn--outline" type="button" data-action="noop">Add to Outlook</button>
      </div>

      <label class="bd-label" for="bd-notes">Anything specific you want us to cover?</label>
      <textarea class="bd-input bd-textarea" id="bd-notes" rows="3" placeholder="Optional"></textarea>

      <div class="bd-invite">
        <label class="bd-label" for="bd-invite">Invite a teammate</label>
        <div class="bd-invite__row">
          <input class="bd-input" type="email" id="bd-invite" placeholder="teammate@company.com" />
          <button class="bd-btn bd-btn--outline" type="button" data-action="invite">Invite</button>
        </div>
        <p class="bd-invite__note" id="bd-invite-note" aria-live="polite"></p>
      </div>

      <p class="bd-help">Need to move it? Use the reschedule link in your invite.</p>
    </div>
  </main>`;
}

/* ============================================================================
   Prototype toolbar (state switcher)
   ============================================================================ */
function renderProtoBar() {
  let bar = document.getElementById("bd-proto");
  if (!showProto) { if (bar) bar.remove(); return; }
  if (!bar) {
    bar = document.createElement("div");
    bar.id = "bd-proto";
    document.body.appendChild(bar);
  }
  const current = state.protoState;
  bar.innerHTML = `
    <span class="bd-proto__label">Prototype</span>
    <button class="bd-proto__nav" data-action="proto-prev" aria-label="Previous state">‹</button>
    <div class="bd-proto__seg" role="tablist" aria-label="Prototype states">
      ${PROTO_STATES.map((s) => `
        <button class="bd-proto__state ${current === s.key ? "is-on" : ""}"
          data-action="proto-state" data-key="${s.key}" title="${esc(s.name)}">${s.key}</button>`).join("")}
    </div>
    <button class="bd-proto__nav" data-action="proto-next" aria-label="Next state">›</button>
    <span class="bd-proto__name">${current ? esc(PROTO_STATES.find((s) => s.key === current).name) : "Live entry"}</span>
    <button class="bd-btn bd-btn--ghost bd-proto__restart" data-action="restart">Restart from identify</button>`;
}

/* ============================================================================
   Flow
   ============================================================================ */
function setScreen(screen) {
  state.screen = screen;
  render();
}

async function goFromEmail(email, { viaProto = false } = {}) {
  state.email = email;
  const hint = companyHint(email);
  state.loadingText = hint ? `Finding the right person for ${hint}…` : "Getting things ready…";
  setScreen("loading");
  const [profile] = await Promise.all([enrich(email), delay(800)]);
  state.profile = profile;
  if (profile.isPersonal && !profile.companyFound) {
    state.forkHiring = false;
    setScreen("fork");
  } else {
    await enterBook(profile);
  }
}

async function enterBook(profile) {
  state.profile = profile;
  state.editing = false;
  state.sizeValue = profile.size || "";
  state.sizeError = "";
  state.requestingTime = false;
  state.rep = route(profile, state.product);
  state.slots = await getSlots(state.rep.id);
  state.selectedDayId = state.slots.days[0].id; // preselect first day (→ 3-click booking)
  state.selectedTime = null;
  setScreen("book");
}

async function reRoute() {
  state.rep = route(state.profile, state.product);
  state.slots = await getSlots(state.rep.id);
  state.selectedDayId = state.slots.days[0].id;
  state.selectedTime = null;
  setScreen("book");
}

function doConfirm() {
  if (state.profile.sizeMissing && !state.sizeValue) {
    state.sizeError = "Select your company size to continue.";
    render();
    return;
  }
  const day = state.slots.days.find((d) => d.id === state.selectedDayId);
  const slot = {
    dayLabel: day.label, time: state.selectedTime,
    timezone: state.profile.timezone, repName: state.rep.name, product: state.product,
  };
  book(slot).then((res) => { state.booking = res.confirmation; setScreen("confirm"); });
}

/* Load a prototype state: jump straight past identify. */
function loadProtoState(key) {
  const s = PROTO_STATES.find((x) => x.key === key);
  if (!s) return;
  state.protoState = key;
  state.product = urlProduct || "all";
  state.productPreselected = !!urlProduct;
  goFromEmail(s.email, { viaProto: true });
}

function restart() {
  state.protoState = null;
  state.profile = null;
  state.email = "";
  state.emailError = "";
  state.product = urlProduct || "all";
  state.productPreselected = !!urlProduct;
  setScreen("identify");
}

/* ============================================================================
   Events (delegated)
   ============================================================================ */
app.addEventListener("submit", (e) => {
  const form = e.target.closest("[data-action]");
  if (!form) return;
  e.preventDefault();
  const action = form.dataset.action;
  if (action === "email-submit") {
    const val = document.getElementById("bd-email").value.trim();
    if (!emailValid(val)) {
      state.emailError = "Enter a valid email to continue.";
      render();
      document.getElementById("bd-email").focus();
      return;
    }
    state.emailError = "";
    state.protoState = null;
    goFromEmail(val);
  } else if (action === "company-submit") {
    const name = document.getElementById("bd-company").value.trim();
    enrichCompany(name).then((c) => enterBook({ ...state.profile, ...c }));
    state.loadingText = name ? `Finding the right person for ${name}…` : "Getting things ready…";
    setScreen("loading");
  } else if (action === "community-submit") {
    // mock: pretend the community account is created
    alert("Community account created (mock).");
  } else if (action === "request-submit") {
    const t = document.getElementById("bd-req").value.trim();
    if (!t) return;
    state.booking = {
      dayLabel: "Requested", time: t, timezone: state.profile.timezone,
      repName: state.rep.name, product: state.product,
    };
    setScreen("confirm");
  }
});

app.addEventListener("input", (e) => {
  if (e.target.id === "bd-email" && state.emailError) {
    state.emailError = "";
    const err = document.getElementById("bd-email-err");
    if (err) err.remove();
    e.target.classList.remove("bd-input--error");
    e.target.setAttribute("aria-invalid", "false");
  }
});

app.addEventListener("change", (e) => {
  const t = e.target;
  if (t.name === "bd-day") {
    state.selectedDayId = t.value;
    state.selectedTime = null;
    document.getElementById("bd-times").innerHTML = renderTimes();
    document.getElementById("bd-confirm").innerHTML = renderConfirmBtn();
    // reflect selected day styling
    document.querySelectorAll(".bd-day").forEach((el) =>
      el.classList.toggle("is-on", el.querySelector("input").checked));
  } else if (t.name === "bd-time") {
    state.selectedTime = t.value;
    document.getElementById("bd-confirm").innerHTML = renderConfirmBtn();
    document.querySelectorAll(".bd-time").forEach((el) =>
      el.classList.toggle("is-on", el.querySelector("input").checked));
  } else if (t.dataset.action === "size") {
    state.sizeValue = t.value;
    state.sizeError = "";
    render();
  } else if (t.dataset.field) {
    // live edit of detail rows
    const map = { Company: "company", Role: "role", Location: "location", "Company size": "size" };
    const key = map[t.dataset.field];
    if (key === "size") state.sizeValue = t.value;
    else state.profile[key] = t.value;
  }
});

app.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const action = btn.dataset.action;
  if (action === "product") {
    state.product = btn.dataset.product;
    state.productPreselected = false;
    // On identify the product is just chosen; on the book screen it re-routes.
    if (state.screen === "book") reRoute();
    else render();
  } else if (action === "toggle-edit") {
    state.editing = !state.editing;
    render();
  } else if (action === "request-time") {
    state.requestingTime = !state.requestingTime;
    render();
    if (state.requestingTime) document.getElementById("bd-req").focus();
  } else if (action === "confirm") {
    doConfirm();
  } else if (action === "fork") {
    if (btn.dataset.path === "hiring") {
      state.forkHiring = true;
      render();
      document.getElementById("bd-company").focus();
    } else {
      setScreen("community");
    }
  } else if (action === "invite") {
    const val = document.getElementById("bd-invite").value.trim();
    const note = document.getElementById("bd-invite-note");
    if (emailValid(val)) note.textContent = `Invite sent to ${val}.`;
    else note.textContent = "Enter a valid email to invite a teammate.";
  } else if (action === "restart") {
    restart();
  } else if (action === "try" || action === "noop") {
    if (btn.getAttribute("href") === "#") e.preventDefault();
  }
});

/* Prototype toolbar (delegated on document, since it's outside #bd-app) */
document.addEventListener("click", (e) => {
  const btn = e.target.closest("#bd-proto [data-action]");
  if (!btn) return;
  const action = btn.dataset.action;
  if (action === "proto-state") loadProtoState(btn.dataset.key);
  else if (action === "restart") restart();
  else if (action === "proto-prev" || action === "proto-next") {
    const idx = PROTO_STATES.findIndex((s) => s.key === state.protoState);
    const next = action === "proto-next"
      ? (idx + 1) % PROTO_STATES.length
      : (idx - 1 + PROTO_STATES.length) % PROTO_STATES.length;
    loadProtoState(PROTO_STATES[Math.max(0, next)].key);
  }
});

/* Keyboard shortcuts for the prototype: [ prev, ] next */
document.addEventListener("keydown", (e) => {
  if (!showProto) return;
  if (e.target.matches("input, textarea, select")) return;
  if (e.key === "[" || e.key === "]") {
    const idx = PROTO_STATES.findIndex((s) => s.key === state.protoState);
    const start = idx === -1 ? (e.key === "]" ? -1 : 0) : idx;
    const next = e.key === "]"
      ? (start + 1) % PROTO_STATES.length
      : (start - 1 + PROTO_STATES.length) % PROTO_STATES.length;
    loadProtoState(PROTO_STATES[(next + PROTO_STATES.length) % PROTO_STATES.length].key);
  }
});

/* ---- focus management ---- */
function afterMount() {
  const h1 = app.querySelector(".bd-h1");
  if (h1 && state.screen !== "book") h1.setAttribute("tabindex", "-1");
}

/* ---- boot ---- */
render();
