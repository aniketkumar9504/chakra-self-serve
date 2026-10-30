/* ============================================================================
   "Book a HackerRank demo" — clickable, front-end-only prototype.
   Screens: identify → loading → book (calendar) | intent fork → confirmation.
   All data is mocked in ./mock-services.js.
   ============================================================================ */
import {
  enrich, enrichCompany, route, getSlots, book, companyHint, PRODUCTS,
  COUNTRIES, countryByCode, PERSONAL_DOMAINS,
} from "./mock-services.js?v=50";

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
  product: urlProduct || "chakra", // Chakra is preselected by default
  productPreselected: !!urlProduct,
  dropdownOpen: false,
  editing: false,
  sizeValue: "",
  sizeError: "",
  countryValue: "",
  countryError: "",
  countryOpen: false,
  countryQuery: "",
  countryActive: 0,
  validating: false,       // email → backend lookup in progress
  validated: false,        // lookup done, size/location revealed
  validatedEmail: "",      // which email the current reveal belongs to
  emailPersonal: false,    // a personal/consumer email was entered
  contactSent: false,      // contact-us form submitted
  contactError: "",
  contactName: "",
  contactMsg: "",
  rep: null,
  slots: null,
  selectedDayId: null,
  selectedTime: null,
  requestingTime: false,
  loadingText: "Getting things ready…",
  booking: null,
  protoState: null,
  protoMenuOpen: false,
};

/* ---- prototype states (state switcher) ---- */
const PROTO_STATES = [
  { key: "1", name: "New enterprise lead", email: "priya@acme.com" },
  { key: "2", name: "Existing customer", email: "priya@globex.com" },
  { key: "3", name: "Small team", email: "dev@tinylabs.io" },
  { key: "4", name: "Unknown business domain", email: "pat@newco.com" },
  { key: "5", name: "Personal email (blocked)", email: "alex@gmail.com" },
  { key: "6", name: "Location gap", email: "priya@northwind.com" },
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
const personalEmail = (e) => {
  const d = String(e).trim().toLowerCase().split("@")[1];
  return !!d && PERSONAL_DOMAINS.has(d);
};
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

/* Company-size options for the identify form. */
const SIZE_OPTIONS = ["1–50", "51–200", "201–1,000", "1,001–5,000", "5,001–10,000", "10,000+"];

/* Chevron for the native <select> fields (native arrow is stripped in CSS). */
const selectChev =
  `<svg class="bd-selectwrap__chev" width="14" height="9" viewBox="0 0 14 9" aria-hidden="true"><path d="M1 1.5 7 7.5 13 1.5" stroke="currentColor" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const searchIcon =
  `<svg class="bd-combo__searchicon" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="4.5" stroke="currentColor" stroke-width="1.5"/><path d="M11 11l3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;

/* One-line product descriptions. */
const PRODUCT_DESC = {
  chakra: "AI interviewer that actually works",
  interview: "Pair programming for the agentic era",
  all: "Chakra, Screen & Interview demos",
};

/* Left-panel showcase media per product. Swap any of these for a real GIF/MP4
   (e.g. assets/products/chakra.gif) and the panel plays it with no other change.
   Only chakra/interview previews exist today; "all" reuses the Chakra preview. */
const PRODUCT_MEDIA = {
  chakra: "assets/products/chakra-preview.png",
  interview: "assets/products/interview-preview.png",
  all: "assets/products/chakra-preview.png",
};
const PRODUCT_LABEL = { chakra: "Chakra", interview: "Interview", all: "All products" };
const PRODUCT_ICON = { chakra: "chakra.svg", interview: "interview.svg", all: "allproducts.svg" };
const PRODUCT_ORDER = ["chakra", "interview", "all"];

/* Book-screen labels that reflect the product chosen on the identify screen. */
const BOOK_TITLE = { chakra: "Chakra", interview: "Interview", all: "HackerRank" };
const PRODUCT_EXPERTISE = {
  chakra: "Chakra specialist",
  interview: "Interview specialist",
  all: "Solutions consultant",
};

/* Branded "try it yourself" cards — shown on identify and on the book screen. */
function tryItSection() {
  // Just a text link (no card). Points to the relevant product's try experience.
  const href = state.product === "interview" ? "#" : "start-free-trial.html";
  const noNav = href === "#" ? ' data-action="try"' : "";
  return `<p class="bd-tryit-link">Don't have 30 minutes?
    <a class="bd-link" href="${href}"${noNav}>Try it yourself &rarr;</a></p>`;
}

/* The product-expertise label only applies to product/solutions reps. Customer
   (CSM) and small-team (growth) reps keep their own title. */
function repTitle() {
  if (state.rep.id === "csm" || state.rep.id === "growth") return state.rep.title;
  return PRODUCT_EXPERTISE[state.product] || state.rep.title;
}

function bannerFor(p) {
  if (!p) return "";
  if (p.isCustomer) return `${p.company} already uses HackerRank, so you'll meet your account team.`;
  if (p.tier === "smallteam") return "For smaller teams we suggest a quick 15-min call, or try it yourself below.";
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
  location: renderLocation,
  fork: renderFork,
  community: renderCommunity,
  book: renderBook,
  confirm: renderConfirm,
  contact: renderContact,
};

/* Shared two-column stage: a static headline on the left, screen content on the
   right. Used by identify → loading → book so the left stays put while the
   right swaps from the form to the calendar. */
function stageLayout(right) {
  return `
  <main class="bd-screen bd-stage" aria-labelledby="bd-id-title">
    <div class="bd-stage__left">
      <h1 class="bd-hero__title" id="bd-id-title">See HackerRank<br />in action</h1>
      <ul class="bd-meta">
        <li class="bd-meta__item">${clockIcon}<span>30 minutes</span></li>
        <li class="bd-meta__item">${personIcon}<span>With a product expert</span></li>
      </ul>
    </div>
    <div class="bd-stage__right">${right}</div>
  </main>`;
}

/* ---- Screen 1: Identify ---- */
function renderIdentify() {
  const p = state.profile;
  const revealNote = state.validated
    ? (p && p.companyFound
        ? `We found <strong>${esc(p.company)}</strong>. Confirm the details below.`
        : `We couldn't find your company — add a couple of details.`)
    : "";
  // Personal email is a hard validation error: red field + clear message.
  const emailErrMsg = state.emailError
    || (state.emailPersonal ? "Please use your business email to book a demo." : "");
  return stageLayout(`
      <form class="bd-emailform" data-action="email-submit" novalidate>
        <div class="bd-formrow">
          <span class="bd-label" id="bd-product-label">What should we show you?</span>
          ${renderProductTabs()}
        </div>

        <div class="bd-formrow">
          <div class="bd-label-row">
            ${state.validated
              ? `<span class="bd-label">Business email</span>`
              : `<label class="bd-label" for="bd-email">Business email</label>`}
            ${state.validated
              ? `<button type="button" class="bd-link bd-edit-email" data-action="edit-email">Edit</button>`
              : ""}
          </div>
          ${state.validated
            ? `<input class="bd-input is-locked" type="email" value="${esc(state.email)}"
                 readonly aria-label="Business email" />`
            : `<input class="bd-input ${emailErrMsg ? "bd-input--error" : ""}" type="email"
                 id="bd-email" name="email" placeholder="name@company.com"
                 autocomplete="email" value="${esc(state.email)}"
                 aria-invalid="${emailErrMsg ? "true" : "false"}"
                 ${emailErrMsg ? 'aria-describedby="bd-email-err"' : ""} />`}
          ${emailErrMsg
            ? `<p class="bd-error" id="bd-email-err" role="alert">${esc(emailErrMsg)}</p>`
            : ""}
          ${state.emailPersonal
            ? `<p class="bd-personal__alt">Are you a developer?
                 <a class="bd-link" href="#" data-action="community">Join our community &rarr;</a></p>`
            : ""}
          ${state.validating
            ? `<p class="bd-validating" role="status"><span class="bd-validating__spin" aria-hidden="true"></span>Looking up your company…</p>`
            : ""}
        </div>

        ${state.validated ? `
        <div class="bd-reveal">
          <p class="bd-reveal__note">${revealNote}</p>
          <div class="bd-formrow">
            <span class="bd-label" id="bd-size-label">Company size</span>
            ${renderSizeSelect()}
            ${state.sizeError ? `<p class="bd-error" id="bd-size-err" role="alert">${esc(state.sizeError)}</p>` : ""}
          </div>
          <div class="bd-formrow">
            <label class="bd-label" for="bd-country-trigger">Company location</label>
            ${renderCountryCombo()}
            ${state.countryError ? `<p class="bd-error" id="bd-country-err" role="alert">${esc(state.countryError)}</p>` : ""}
          </div>
        </div>` : ""}

        <button class="bd-btn bd-btn--primary bd-btn--block" type="submit">${
          state.validated && state.sizeValue && state.countryValue ? "Select a slot" : "Continue"
        }</button>
      </form>`);
}

/* Product switcher — simple text segmented pills (no logos). */
function renderProductTabs() {
  return `<div class="bd-prodtabs" role="tablist" aria-labelledby="bd-product-label">
    ${PRODUCT_ORDER.map((id) => `
      <button type="button" role="tab" class="bd-prodtab ${state.product === id ? "is-on" : ""}"
        aria-selected="${state.product === id}" data-action="product" data-product="${id}">${esc(PRODUCT_LABEL[id])}</button>`).join("")}
  </div>`;
}

/* Company size — compact dropdown (matches the location field). */
function renderSizeSelect() {
  return `<div class="bd-selectwrap">
    <select class="bd-input" id="bd-size-sel" data-action="size-pick" aria-labelledby="bd-size-label">
      <option value="" ${state.sizeValue ? "" : "selected"} disabled hidden>Select company size</option>
      ${SIZE_OPTIONS.map((o) => `<option ${state.sizeValue === o ? "selected" : ""}>${esc(o)}</option>`).join("")}
    </select>
    ${selectChev}
  </div>`;
}

/* Company location — searchable, keyboard-navigable combobox with flags. */
function filteredCountries() {
  const q = state.countryQuery.trim().toLowerCase();
  if (!q) return COUNTRIES;
  return COUNTRIES.filter(
    (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase() === q || c.region.toLowerCase().includes(q)
  );
}
function countryOptionsHTML() {
  const list = filteredCountries();
  if (!list.length) return `<li class="bd-combo__empty" role="presentation">No matches</li>`;
  return list.map((c, i) => `
    <li id="bd-co-${c.code}" role="option" aria-selected="${state.countryValue === c.code}"
        class="bd-combo__opt ${i === state.countryActive ? "is-active" : ""} ${state.countryValue === c.code ? "is-sel" : ""}"
        data-action="country-pick" data-code="${c.code}">
      <span class="bd-combo__flag" aria-hidden="true">${c.flag}</span>
      <span class="bd-combo__name">${esc(c.name)}</span>
      <span class="bd-combo__meta">${esc(c.region)} · ${esc(c.tz)}</span>
    </li>`).join("");
}
function renderCountryCombo() {
  const sel = countryByCode(state.countryValue);
  const triggerInner = sel
    ? `<span class="bd-combo__flag" aria-hidden="true">${sel.flag}</span><span class="bd-combo__name">${esc(sel.name)}</span>`
    : `<span class="bd-combo__placeholder">Select a country</span>`;
  const active = filteredCountries()[state.countryActive];
  return `<div class="bd-combo ${state.countryOpen ? "is-open" : ""} ${state.countryError ? "has-error" : ""}" data-combo>
    <button type="button" class="bd-combo__trigger" id="bd-country-trigger" data-action="country-toggle"
      role="combobox" aria-haspopup="listbox" aria-expanded="${state.countryOpen}" aria-controls="bd-combo-list"
      ${state.countryError ? 'aria-invalid="true"' : ""}>
      ${triggerInner}
      ${selectChev}
    </button>
    <div class="bd-combo__panel" ${state.countryOpen ? "" : "hidden"}>
      <div class="bd-combo__searchwrap">
        ${searchIcon}
        <input class="bd-combo__search" type="text" id="bd-country-search" placeholder="Search ${COUNTRIES.length}+ countries"
          autocomplete="off" spellcheck="false" aria-controls="bd-combo-list"
          aria-activedescendant="${active ? "bd-co-" + active.code : ""}"
          data-action="country-search" value="${esc(state.countryQuery)}" />
      </div>
      <ul class="bd-combo__list" id="bd-combo-list" role="listbox" aria-label="Countries">${countryOptionsHTML()}</ul>
    </div>
  </div>`;
}

/* Re-render only the option list (keeps the search input focused + caret). */
function updateCountryList() {
  const ul = document.getElementById("bd-combo-list");
  if (!ul) return;
  ul.innerHTML = countryOptionsHTML();
  const active = filteredCountries()[state.countryActive];
  const search = document.getElementById("bd-country-search");
  if (search) search.setAttribute("aria-activedescendant", active ? "bd-co-" + active.code : "");
  const activeEl = active ? document.getElementById("bd-co-" + active.code) : null;
  if (activeEl) activeEl.scrollIntoView({ block: "nearest" });
}

/* ---- Screen 2: Loading ---- */
function renderLoading() {
  // Keep the static left headline; show the spinner in the right column.
  return stageLayout(`
    <div class="bd-loading__inner" aria-live="polite">
      <div class="bd-spinner" aria-hidden="true"></div>
      <p class="bd-loading__text">${esc(state.loadingText)}</p>
    </div>`);
}

/* ---- Screen 2b: Location (only when enrichment can't prefill it) ---- */
function renderLocation() {
  const company = state.profile && state.profile.company;
  const opts = COUNTRIES.map((c) =>
    `<option value="${c.code}" ${state.countryValue === c.code ? "selected" : ""}>${esc(c.name)}</option>`
  ).join("");
  return `
  <main class="bd-screen bd-identify" aria-labelledby="bd-loc-title">
    <div class="bd-stack">
      <header class="bd-stack__head">
        <h1 class="bd-hero__title" id="bd-loc-title">Where's your<br />team based?</h1>
        <ul class="bd-meta">
          <li class="bd-meta__item">${personIcon}<span>So we match you with the right regional expert</span></li>
        </ul>
      </header>

      <form class="bd-emailform" data-action="location-submit" novalidate>
        <label class="bd-label" for="bd-country">${company ? esc(company) + " is based in" : "Company location"}</label>
        <div class="bd-selectwrap">
          <select class="bd-input ${state.countryError ? "bd-input--error" : ""}" id="bd-country"
                  data-action="country" aria-invalid="${state.countryError ? "true" : "false"}"
                  ${state.countryError ? 'aria-describedby="bd-country-err"' : ""}>
            <option value="" ${state.countryValue ? "" : "selected"} disabled hidden>Select a country</option>
            ${opts}
          </select>
          <svg class="bd-selectwrap__chev" width="14" height="9" viewBox="0 0 14 9" aria-hidden="true"><path d="M1 1.5 7 7.5 13 1.5" stroke="currentColor" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        ${state.countryError
          ? `<p class="bd-error" id="bd-country-err" role="alert">${esc(state.countryError)}</p>`
          : ""}
        <button class="bd-btn bd-btn--primary bd-btn--block" type="submit">Continue</button>
      </form>
    </div>
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

/* ---- Contact us ---- */
function renderContact() {
  if (state.contactSent) {
    return `
    <main class="bd-screen bd-confirm" aria-labelledby="bd-contact-done">
      <div class="bd-card bd-confirm__card">
        <span class="bd-check" aria-hidden="true">✓</span>
        <h1 class="bd-h1" id="bd-contact-done">Thanks — we'll be in touch</h1>
        <p class="bd-confirm__when">We've got your question and will reply${state.email ? ` to ${esc(state.email)}` : ""} shortly.</p>
        <button class="bd-link bd-back" type="button" data-action="restart">Back to start</button>
      </div>
    </main>`;
  }
  return `
  <main class="bd-screen bd-contact" aria-labelledby="bd-contact-title">
    <div class="bd-card bd-contact__card">
      <h2 class="bd-h2" id="bd-contact-title">Have a question?</h2>
      <p class="bd-sub">Tell us what you need and we'll get back to you.</p>
      <form data-action="contact-submit" novalidate>
        <label class="bd-label" for="bd-contact-email">Work email</label>
        <input class="bd-input" type="email" id="bd-contact-email" autocomplete="email"
               placeholder="name@company.com" value="${esc(state.email)}" />

        <div class="bd-formrow">
          <label class="bd-label" for="bd-contact-msg">Your question</label>
          <textarea class="bd-input bd-textarea" id="bd-contact-msg" rows="3"
                    placeholder="What would you like to know?">${esc(state.contactMsg)}</textarea>
        </div>

        ${state.contactError ? `<p class="bd-error" role="alert">${esc(state.contactError)}</p>` : ""}
        <button class="bd-btn bd-btn--primary bd-btn--block" type="submit">Send</button>
      </form>
      <button class="bd-link bd-back" type="button" data-action="restart">Back to start</button>
    </div>
  </main>`;
}

/* ---- Screen 3a: Book ---- */
function renderBook() {
  const p = state.profile;
  const banner = bannerFor(p);
  // Same stage: static headline left, calendar on the right (replaces the form).
  return stageLayout(`
      <h2 class="bd-h2 bd-book__title" id="bd-book-title">Book your ${esc(BOOK_TITLE[state.product] || "HackerRank")} demo</h2>
      ${banner ? `<div class="bd-banner" role="status">${esc(banner)}</div>` : ""}
      <section class="bd-panel bd-cal" aria-labelledby="bd-cal-h">
        <div class="bd-rep">
          ${avatar(state.rep.initials, "bd-avatar--rep")}
          <div>
            <div class="bd-rep__name" id="bd-cal-h">${esc(state.rep.name)}</div>
            <div class="bd-rep__meta">${esc(repTitle())} · ${state.rep.minutes} min</div>
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
      </section>`);
}

/* Rich custom dropdown: product logo + name + description, in the trigger and
   in each option. */
function renderProductDropdown() {
  const items = [
    ["chakra", "chakra.svg", "Chakra"],
    ["interview", "interview.svg", "Interview"],
    ["all", "allproducts.svg", "All products"],
  ];
  const row = (id, icon, label) => `
      <span class="bd-cdrop__icon"><img src="assets/products/${icon}" alt="" aria-hidden="true" /></span>
      <span class="bd-cdrop__text">
        <span class="bd-cdrop__name">${esc(label)}</span>
        <span class="bd-cdrop__desc">${esc(PRODUCT_DESC[id])}</span>
      </span>`;
  const cur = items.find(([id]) => id === state.product) || items[2];
  const options = items.map(([id, icon, label]) => `
    <button type="button" class="bd-cdrop__opt ${state.product === id ? "is-on" : ""}" role="option"
      aria-selected="${state.product === id}" data-action="product" data-product="${id}">${row(id, icon, label)}
    </button>`).join("");
  return `<div class="bd-cdrop ${state.dropdownOpen ? "is-open" : ""}">
    <span class="bd-label" id="bd-product-label">What should we show you?</span>
    <button type="button" class="bd-cdrop__trigger" data-action="dropdown-toggle"
      aria-haspopup="listbox" aria-expanded="${state.dropdownOpen}" aria-labelledby="bd-product-label">
      ${row(cur[0], cur[1], cur[2])}
      <svg class="bd-cdrop__chev" width="14" height="9" viewBox="0 0 14 9" aria-hidden="true"><path d="M1 1.5 7 7.5 13 1.5" stroke="currentColor" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
    <div class="bd-cdrop__panel" role="listbox" aria-labelledby="bd-product-label" ${state.dropdownOpen ? "" : "hidden"}>${options}</div>
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
  // Reserve height for the busiest day so switching days never shifts the
  // Confirm button (tile ~58px + 10px row gap, 3 columns).
  const maxSlots = Math.max(...state.slots.days.map((d) => d.slots.length));
  const rows = Math.ceil(maxSlots / 3);
  const minH = rows * 58 + (rows - 1) * 10;
  return `<fieldset class="bd-times" style="min-height:${minH}px"><legend class="sr-only">Choose a time</legend>
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
  bar.classList.toggle("is-open", state.protoMenuOpen);
  const current = state.protoState;
  const currentName = current ? esc(PROTO_STATES.find((s) => s.key === current).name) : "Live entry";
  bar.innerHTML = `
    <button class="bd-proto__toggle" data-action="proto-menu-toggle"
      aria-haspopup="true" aria-expanded="${state.protoMenuOpen}" aria-label="Prototype controls">
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
        <path d="M2.5 5h13M2.5 9h13M2.5 13h13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
      </svg>
    </button>
    <div class="bd-proto__panel" role="menu" ${state.protoMenuOpen ? "" : "hidden"}>
      <div class="bd-proto__panelhead">
        <span class="bd-proto__label">Prototype</span>
        <span class="bd-proto__name">${currentName}</span>
      </div>
      <div class="bd-proto__row">
        <button class="bd-proto__nav" data-action="proto-prev" aria-label="Previous state">‹</button>
        <div class="bd-proto__seg" role="tablist" aria-label="Prototype states">
          ${PROTO_STATES.map((s) => `
            <button class="bd-proto__state ${current === s.key ? "is-on" : ""}"
              data-action="proto-state" data-key="${s.key}" title="${esc(s.name)}">${s.key}</button>`).join("")}
        </div>
        <button class="bd-proto__nav" data-action="proto-next" aria-label="Next state">›</button>
      </div>
      <button class="bd-btn bd-btn--ghost bd-proto__restart" data-action="restart">Restart from identify</button>
    </div>`;
}

/* ============================================================================
   Flow
   ============================================================================ */
function setScreen(screen) {
  state.screen = screen;
  render();
}

/* Fast "backend" lookup fired when a valid email is entered: enrich, prefill
   size + location, then reveal those fields. */
function startValidation(email) {
  state.email = email;
  state.validatedEmail = email; // claim it now so repeated blurs don't refire
  state.validating = true;
  state.validated = false;
  render();
  enrich(email).then((profile) => {
    if (state.validatedEmail !== email || state.screen !== "identify") return; // stale / navigated
    state.profile = profile;
    state.sizeValue = profile.size || "";
    state.countryValue = profile.countryCode || "";
    state.sizeError = "";
    state.countryError = "";
    state.validating = false;
    state.validated = true;
    render();
  });
}

async function goFromEmail(email, { viaProto = false } = {}) {
  state.email = email;
  const hint = companyHint(email);
  state.loadingText = hint ? `Finding the right person for ${hint}…` : "Getting things ready…";
  setScreen("loading");
  // Reuse the profile from the identify-screen validation when it's the same
  // email (no second lookup); otherwise enrich now.
  let profile;
  if (!viaProto && state.validated && state.validatedEmail === email && state.profile) {
    profile = state.profile;
    await delay(450);
  } else {
    [profile] = await Promise.all([enrich(email), delay(700)]);
  }
  proceed(applyFormData(profile));
}

/* Small teams (self-serve-ish) route to the growth specialist; larger orgs to a
   product/solutions expert. Derived from the size picked on the identify form. */
function tierFromSize(size) {
  return size === "1–50" || size === "51–200" ? "smallteam" : "enterprise";
}

/* Overlay the identify form's size + location onto the enriched profile, so the
   values the user just entered win over anything enrichment guessed. */
function applyFormData(profile) {
  const p = { ...profile };
  if (state.sizeValue) {
    p.size = state.sizeValue;
    p.sizeMissing = false;
    if (!p.isCustomer) p.tier = tierFromSize(state.sizeValue);
  }
  const c = countryByCode(state.countryValue);
  if (c) { p.location = c.name; p.timezone = c.tz; p.region = c.region; }
  return p;
}

/* Decide where to go once we have a profile: fork (no company) →
   location step (company but no location — the hard gate) → book. */
function proceed(profile) {
  state.profile = profile;
  if (profile.isPersonal && !profile.companyFound) {
    state.forkHiring = false;
    setScreen("fork");
  } else if (!profile.location) {
    state.countryValue = "";
    state.countryError = "";
    setScreen("location");
  } else {
    enterBook(profile);
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
  const day = state.slots.days.find((d) => d.id === state.selectedDayId);
  const slot = {
    dayLabel: day.label, time: state.selectedTime,
    timezone: state.profile.timezone, repName: state.rep.name, product: state.product,
  };
  book(slot).then((res) => { state.booking = res.confirmation; setScreen("confirm"); });
}

/* Load a prototype state, mirroring the real flow for that email. */
function loadProtoState(key) {
  const s = PROTO_STATES.find((x) => x.key === key);
  if (!s) return;
  state.protoState = key;
  state.product = urlProduct || "chakra";
  state.productPreselected = !!urlProduct;
  // Clear form/validation state; enrichment supplies size/location downstream.
  state.sizeValue = "";
  state.countryValue = "";
  state.sizeError = "";
  state.countryError = "";
  state.emailError = "";
  state.countryOpen = false;
  state.countryQuery = "";
  state.countryActive = 0;
  state.validating = false;
  state.validated = false;
  state.validatedEmail = "";
  state.emailPersonal = false;
  // Personal emails are blocked on identify (business email required), so land
  // there with the prompt shown rather than jumping into the booking flow.
  if (personalEmail(s.email)) {
    state.email = s.email;
    state.emailPersonal = true;
    setScreen("identify");
    return;
  }
  state.email = "";
  goFromEmail(s.email, { viaProto: true });
}

function restart() {
  state.protoState = null;
  state.profile = null;
  state.email = "";
  state.emailError = "";
  state.sizeValue = "";
  state.sizeError = "";
  state.countryValue = "";
  state.countryError = "";
  state.countryOpen = false;
  state.countryQuery = "";
  state.countryActive = 0;
  state.validating = false;
  state.validated = false;
  state.validatedEmail = "";
  state.emailPersonal = false;
  state.contactSent = false;
  state.contactError = "";
  state.contactName = "";
  state.contactMsg = "";
  state.product = urlProduct || "chakra";
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
    // Once validated the input is replaced by compact text, so fall back to state.
    const input = document.getElementById("bd-email");
    const val = input ? input.value.trim() : state.email.trim();
    state.email = val;
    if (!emailValid(val)) {
      state.emailError = "Enter a valid business email to continue.";
      render();
      document.getElementById("bd-email").focus();
      return;
    }
    state.emailError = "";
    // Personal/consumer email → ask for a business email (+ offer community).
    if (personalEmail(val)) {
      state.emailPersonal = true;
      state.validating = false;
      state.validated = false;
      state.validatedEmail = "";
      render();
      document.getElementById("bd-email").focus();
      return;
    }
    state.emailPersonal = false;
    // Email valid but we haven't looked it up yet → run the validation step
    // (reveals size + location). The user confirms, then continues.
    if (!state.validated || state.validatedEmail !== val) {
      startValidation(val);
      return;
    }
    state.sizeError = state.sizeValue ? "" : "Select your company size.";
    state.countryError = state.countryValue ? "" : "Select your company location.";
    if (state.sizeError || state.countryError) {
      render();
      const el = state.sizeError ? app.querySelector(".bd-chip") : document.getElementById("bd-country-trigger");
      if (el) el.focus();
      return;
    }
    state.protoState = null;
    goFromEmail(val);
  } else if (action === "location-submit") {
    const code = document.getElementById("bd-country").value;
    const country = countryByCode(code);
    if (!country) {
      state.countryError = "Select your company location to continue.";
      render();
      document.getElementById("bd-country").focus();
      return;
    }
    state.countryError = "";
    const profile = {
      ...state.profile,
      location: country.name, timezone: country.tz, region: country.region,
    };
    state.loadingText = `Finding the right person for ${profile.company || "you"}…`;
    setScreen("loading");
    enterBook(profile);
  } else if (action === "company-submit") {
    const name = document.getElementById("bd-company").value.trim();
    enrichCompany(name).then((c) => proceed(applyFormData({ ...state.profile, ...c })));
    state.loadingText = name ? `Finding the right person for ${name}…` : "Getting things ready…";
    setScreen("loading");
  } else if (action === "contact-submit") {
    // Persist fields first so an error re-render doesn't wipe them.
    state.email = document.getElementById("bd-contact-email").value.trim();
    state.contactMsg = document.getElementById("bd-contact-msg").value.trim();
    if (!emailValid(state.email)) { state.contactError = "Enter a valid email so we can reply."; render(); return; }
    if (!state.contactMsg) { state.contactError = "Add your question before sending."; render(); return; }
    state.contactError = "";
    state.contactSent = true;
    render();
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
  if (e.target.id === "bd-email") {
    state.email = e.target.value; // keep so a re-render (e.g. product change) doesn't clear it
    if (state.emailError || state.emailPersonal) {
      // Clear the error / business-email prompt as they edit (re-checked on blur).
      state.emailError = "";
      state.emailPersonal = false;
      const err = document.getElementById("bd-email-err");
      if (err) err.remove();
      const alt = app.querySelector(".bd-personal__alt");
      if (alt) alt.remove();
      e.target.classList.remove("bd-input--error");
      e.target.setAttribute("aria-invalid", "false");
    }
  } else if (e.target.id === "bd-country-search") {
    // Filter the list in place so the search input keeps focus + caret.
    state.countryQuery = e.target.value;
    state.countryActive = 0;
    updateCountryList();
  }
});

/* Fire the validation lookup when the email field loses focus with a valid
   value (and auto-hide the revealed fields if the email was cleared/changed). */
app.addEventListener("focusout", (e) => {
  if (e.target.id !== "bd-email") return;
  const val = e.target.value.trim();
  state.email = val; // persist so any re-render keeps what they typed
  if (emailValid(val) && personalEmail(val)) {
    // Personal email → show the business-email prompt + community option.
    if (!state.emailPersonal) {
      state.emailPersonal = true;
      state.validating = false;
      state.validated = false;
      state.validatedEmail = "";
      render();
    }
  } else if (emailValid(val)) {
    if (state.emailPersonal) { state.emailPersonal = false; render(); }
    if (!state.validating && state.validatedEmail !== val) startValidation(val);
  } else if (state.validated || state.validating || state.emailPersonal) {
    state.validating = false;
    state.validated = false;
    state.validatedEmail = "";
    state.emailPersonal = false;
    render();
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
  } else if (t.dataset.action === "product-select") {
    state.product = t.value;
    state.productPreselected = false;
    if (state.screen === "book") reRoute();
    else render();
  } else if (t.dataset.action === "size-pick") {
    state.sizeValue = t.value;
    state.sizeError = "";
    render();
  }
});

app.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const action = btn.dataset.action;
  if (action === "dropdown-toggle") {
    state.dropdownOpen = !state.dropdownOpen;
    render();
  } else if (action === "product") {
    state.product = btn.dataset.product;
    state.productPreselected = false;
    state.dropdownOpen = false;
    // On identify the product is just chosen; on the book screen it re-routes.
    if (state.screen === "book") reRoute();
    else render();
  } else if (action === "country-toggle") {
    state.countryOpen = !state.countryOpen;
    if (state.countryOpen) { state.countryQuery = ""; state.countryActive = 0; state.countryError = ""; }
    render();
  } else if (action === "country-pick") {
    state.countryValue = btn.dataset.code;
    state.countryOpen = false;
    state.countryError = "";
    render();
    const trigger = document.getElementById("bd-country-trigger");
    if (trigger) trigger.focus();
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
  } else if (action === "edit-email") {
    // Unlock the email field and hide the revealed fields until re-validated.
    state.validated = false;
    state.validatedEmail = "";
    state.emailPersonal = false;
    render();
    const el = document.getElementById("bd-email");
    if (el) { el.focus(); const n = el.value.length; el.setSelectionRange(n, n); }
  } else if (action === "community") {
    e.preventDefault();
    setScreen("community");
  } else if (action === "contact") {
    e.preventDefault();
    state.contactSent = false;
    state.contactError = "";
    setScreen("contact");
  } else if (action === "try" || action === "noop") {
    if (btn.getAttribute("href") === "#") e.preventDefault();
  }
});

/* Header CTAs ("Try it yourself" / "Contact us") live outside #bd-app. */
document.addEventListener("click", (e) => {
  const contact = e.target.closest(".bd-header [data-action='contact']");
  if (contact) {
    e.preventDefault();
    state.contactSent = false;
    state.contactError = "";
    setScreen("contact");
    return;
  }
  const tryIt = e.target.closest(".bd-header [data-action='try-header']");
  if (tryIt) {
    e.preventDefault();
    // Product-aware, mirroring the old in-body link (Interview is a placeholder).
    if (state.product !== "interview") location.href = "start-free-trial.html";
  }
});

/* Close the product dropdown on an outside click or Escape. */
document.addEventListener("click", (e) => {
  if (!state.dropdownOpen) return;
  if (e.target.closest(".bd-cdrop")) return; // click inside the dropdown
  state.dropdownOpen = false;
  render();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && state.dropdownOpen) {
    state.dropdownOpen = false;
    render();
  }
});

/* Close the country combobox on an outside click. */
document.addEventListener("click", (e) => {
  if (!state.countryOpen) return;
  if (e.target.closest("[data-combo]")) return; // inside the combo
  state.countryOpen = false;
  render();
});

/* Country combobox keyboard navigation (search input + trigger). */
app.addEventListener("keydown", (e) => {
  const t = e.target;
  // Open with ArrowDown/Enter when focused on the closed trigger.
  if (t.id === "bd-country-trigger" && !state.countryOpen && (e.key === "ArrowDown" || e.key === "Enter")) {
    e.preventDefault();
    state.countryOpen = true;
    state.countryQuery = "";
    state.countryActive = 0;
    state.countryError = "";
    render();
    return;
  }
  if (t.id !== "bd-country-search" || !state.countryOpen) return;
  const list = filteredCountries();
  if (e.key === "ArrowDown") {
    e.preventDefault();
    state.countryActive = Math.min(state.countryActive + 1, list.length - 1);
    updateCountryList();
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    state.countryActive = Math.max(state.countryActive - 1, 0);
    updateCountryList();
  } else if (e.key === "Enter") {
    e.preventDefault(); // don't submit the form
    const pick = list[state.countryActive];
    if (pick) {
      state.countryValue = pick.code;
      state.countryOpen = false;
      state.countryError = "";
      render();
      const trigger = document.getElementById("bd-country-trigger");
      if (trigger) trigger.focus();
    }
  } else if (e.key === "Escape") {
    e.preventDefault();
    e.stopPropagation();
    state.countryOpen = false;
    render();
    const trigger = document.getElementById("bd-country-trigger");
    if (trigger) trigger.focus();
  }
});

/* Prototype toolbar (delegated on document, since it's outside #bd-app) */
document.addEventListener("click", (e) => {
  const btn = e.target.closest("#bd-proto [data-action]");
  if (!btn) return;
  // A re-render here detaches this node, so keep the outside-click closer
  // (registered on document too) from mistaking it for an outside click.
  e.stopImmediatePropagation();
  const action = btn.dataset.action;
  if (action === "proto-menu-toggle") { state.protoMenuOpen = !state.protoMenuOpen; renderProtoBar(); }
  else if (action === "proto-state") loadProtoState(btn.dataset.key);
  else if (action === "restart") restart();
  else if (action === "proto-prev" || action === "proto-next") {
    const idx = PROTO_STATES.findIndex((s) => s.key === state.protoState);
    const next = action === "proto-next"
      ? (idx + 1) % PROTO_STATES.length
      : (idx - 1 + PROTO_STATES.length) % PROTO_STATES.length;
    loadProtoState(PROTO_STATES[Math.max(0, next)].key);
  }
});

/* Close the prototype menu on an outside click or Escape. */
document.addEventListener("click", (e) => {
  if (!state.protoMenuOpen) return;
  if (e.target.closest("#bd-proto")) return; // click inside the menu or its toggle
  state.protoMenuOpen = false;
  renderProtoBar();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && state.protoMenuOpen) {
    state.protoMenuOpen = false;
    renderProtoBar();
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
  if (state.countryOpen) {
    const search = document.getElementById("bd-country-search");
    if (search && document.activeElement !== search) {
      search.focus();
      const n = search.value.length;
      search.setSelectionRange(n, n);
    }
  }
}

/* ---- boot ---- */
render();
