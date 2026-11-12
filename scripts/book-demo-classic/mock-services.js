/* ============================================================================
   Mock services for the "Book a HackerRank demo" prototype.
   ----------------------------------------------------------------------------
   Everything the flow needs from a backend is faked here, behind clear function
   signatures, so it can later be swapped for real services:
     - enrich(email)          → identity + company (Clay / Apollo)
     - enrichCompany(name)    → company from a typed name (Clay / Apollo)
     - route(profile, product)→ which rep + meeting length (routing, e.g. Chili Piper)
     - getSlots(repId)        → calendar availability (scheduling)
     - book(slot)             → create the meeting
   All functions return Promises to mirror real async calls.
   ============================================================================ */

const PERSONAL_DOMAINS = new Set([
  "gmail.com", "outlook.com", "yahoo.com", "hotmail.com", "icloud.com",
  "proton.me", "protonmail.com", "aol.com", "live.com", "me.com", "gmx.com",
]);

/* Known company accounts, keyed by email domain. */
const COMPANIES = {
  "acme.com": {
    company: "Acme Corp", size: "1,001–5,000", role: "Talent acquisition lead",
    location: "Bengaluru", timezone: "IST", tier: "enterprise", customer: false,
  },
  "globex.com": {
    company: "Globex", size: "5,001–10,000", role: "Head of engineering",
    location: "New York", timezone: "ET", tier: "enterprise", customer: true,
  },
  "tinylabs.io": {
    company: "Tiny Labs", size: "11–100", role: "Engineering manager",
    location: "Austin", timezone: "CT", tier: "smallteam", customer: false,
  },
  "unknownco.com": {
    company: "Unknown Co", size: null, role: "Recruiter",
    location: "London", timezone: "GMT", tier: "enterprise", customer: false,
    sizeMissing: true,
  },
};

/* Personal emails that we can still match to an employer (enrichment win). */
const PERSONAL_MATCHES = {
  "priya.s@gmail.com": "acme.com",
};

/* Nicer display names for the demo identities; anything else is derived. */
const NAMES = {
  "priya": "Priya Sharma", "priya.s": "Priya Sharma", "sam": "Sam Carter",
  "dev": "Dev Patel", "alex": "Alex Kim",
};

/* Reps the router can hand out. minutes = meeting length. */
export const REPS = {
  chakra:    { id: "chakra",    name: "Ana Reyes",    title: "Chakra specialist",               initials: "AR", minutes: 30 },
  interview: { id: "interview", name: "Marcus Lee",   title: "Interview specialist",            initials: "ML", minutes: 30 },
  solutions: { id: "solutions", name: "Dana Okafor",  title: "Solutions consultant",            initials: "DO", minutes: 30 },
  csm:       { id: "csm",       name: "Jordan Blake", title: "Your account manager",            initials: "JB", minutes: 30 },
  growth:    { id: "growth",    name: "Sam Rivera",   title: "Product specialist, growth teams", initials: "SR", minutes: 15 },
};

export const PRODUCTS = {
  chakra:    { id: "chakra",    label: "Chakra",       desc: "AI pre-screen interviews." },
  interview: { id: "interview", label: "Interview",    desc: "Live pair-programming interviews with your team." },
  all:       { id: "all",       label: "All products", desc: "A tour of the full platform." },
};

/* ---- helpers ---- */
function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function nameFromLocal(local) {
  if (NAMES[local]) return NAMES[local];
  // "priya.s" / "jane_doe" → "Priya S" / "Jane Doe"
  return local
    .split(/[.\-_]+/)
    .filter(Boolean)
    .map(capitalize)
    .join(" ");
}
function initialsFrom(name) {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/* Build a profile object from a company record + identity. */
function profileFrom(email, companyRec, extra = {}) {
  const local = email.split("@")[0].toLowerCase();
  const name = nameFromLocal(local);
  return {
    email,
    name,
    initials: initialsFrom(name),
    company: companyRec ? companyRec.company : null,
    companyFound: !!companyRec,
    role: companyRec ? companyRec.role : null,
    size: companyRec ? companyRec.size : null,
    sizeMissing: companyRec ? !!companyRec.sizeMissing : false,
    location: companyRec ? companyRec.location : null,
    timezone: companyRec ? companyRec.timezone : "IST",
    tier: companyRec ? companyRec.tier : "unknown",
    isCustomer: companyRec ? !!companyRec.customer : false,
    isPersonal: false,
    ...extra,
  };
}

/* ---- enrichment ---- */
export function enrich(email) {
  email = String(email).trim().toLowerCase();
  const domain = email.split("@")[1] || "";

  // Personal email matched to an employer (state 5).
  if (PERSONAL_MATCHES[email]) {
    const rec = COMPANIES[PERSONAL_MATCHES[email]];
    return delay(650).then(() =>
      profileFrom(email, rec, { isPersonal: true, employerMatched: true })
    );
  }
  // Personal email, no company (state 6 → intent fork).
  if (PERSONAL_DOMAINS.has(domain)) {
    return delay(650).then(() => profileFrom(email, null, { isPersonal: true }));
  }
  // Known company (states 1–4).
  if (COMPANIES[domain]) {
    return delay(650).then(() => profileFrom(email, COMPANIES[domain]));
  }
  // Any other business domain → generic enterprise so the flow still works.
  const guessed = capitalize((domain.split(".")[0] || "your company").replace(/[-_]/g, " "));
  return delay(650).then(() =>
    profileFrom(email, {
      company: guessed, size: "201–1,000", role: "Talent acquisition",
      location: "San Francisco", timezone: "PT", tier: "enterprise", customer: false,
    })
  );
}

/* Enrich from a typed company name (intent-fork hiring path → small team). */
export function enrichCompany(name) {
  name = String(name).trim();
  return delay(600).then(() => ({
    company: name || "Your company",
    companyFound: true,
    role: null,
    size: "11–100",
    sizeMissing: false,
    location: null,
    timezone: "IST",
    tier: "smallteam",
    isCustomer: false,
    isPersonal: true,
    hiringPath: true,
  }));
}

/* Synchronous best-guess of the company label, for the loading message. */
export function companyHint(email) {
  email = String(email).trim().toLowerCase();
  const domain = email.split("@")[1] || "";
  if (PERSONAL_MATCHES[email]) return COMPANIES[PERSONAL_MATCHES[email]].company;
  if (PERSONAL_DOMAINS.has(domain)) return null;
  if (COMPANIES[domain]) return COMPANIES[domain].company;
  if (domain) return capitalize((domain.split(".")[0] || "").replace(/[-_]/g, " "));
  return null;
}

/* ---- routing ---- */
export function route(profile, product) {
  let repId;
  if (profile.isCustomer) repId = "csm";
  else if (profile.tier === "smallteam") repId = "growth";
  else if (product === "chakra") repId = "chakra";
  else if (product === "interview") repId = "interview";
  else repId = "solutions";
  return { ...REPS[repId] };
}

/* ---- calendar availability ---- */
const SLOTS_30 = [
  ["9:00 AM", "9:30 AM", "10:30 AM", "11:00 AM", "1:00 PM", "2:30 PM", "4:00 PM"],
  ["9:30 AM", "10:00 AM", "11:30 AM", "1:30 PM", "3:00 PM", "4:30 PM"],
  ["9:00 AM", "10:00 AM", "10:30 AM", "12:00 PM", "2:00 PM", "3:30 PM"],
  ["9:30 AM", "11:00 AM", "11:30 AM", "1:00 PM", "2:30 PM", "4:00 PM", "5:00 PM"],
  ["10:00 AM", "10:30 AM", "1:30 PM", "2:00 PM", "3:00 PM", "4:30 PM"],
];
const SLOTS_15 = [
  ["9:00 AM", "9:15 AM", "9:45 AM", "10:15 AM", "11:00 AM", "11:30 AM", "1:00 PM", "1:30 PM", "2:15 PM", "3:00 PM", "4:00 PM"],
  ["9:30 AM", "10:00 AM", "10:15 AM", "11:00 AM", "11:45 AM", "1:15 PM", "2:00 PM", "2:30 PM", "3:30 PM", "4:15 PM"],
  ["9:00 AM", "9:45 AM", "10:30 AM", "11:15 AM", "12:00 PM", "1:00 PM", "1:45 PM", "2:30 PM", "3:15 PM", "4:30 PM"],
  ["9:15 AM", "9:45 AM", "10:00 AM", "10:45 AM", "11:30 AM", "1:30 PM", "2:00 PM", "3:00 PM", "3:45 PM", "4:30 PM"],
  ["9:00 AM", "9:30 AM", "10:15 AM", "11:00 AM", "11:45 AM", "1:15 PM", "2:15 PM", "3:00 PM", "4:00 PM"],
];
const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/* Next 5 business days from today, each with a non-empty set of slots. */
export function getSlots(repId) {
  const minutes = (REPS[repId] || REPS.solutions).minutes;
  const templates = minutes === 15 ? SLOTS_15 : SLOTS_30;
  const days = [];
  const d = new Date();
  let i = 0;
  while (days.length < 5) {
    const day = new Date(d.getFullYear(), d.getMonth(), d.getDate() + i);
    const dow = day.getDay();
    if (dow !== 0 && dow !== 6) {
      days.push({
        id: `d${days.length}`,
        label: `${DOW[dow]} ${day.getDate()} ${MON[day.getMonth()]}`,
        dow: DOW[dow],
        dom: day.getDate(),
        mon: MON[day.getMonth()],
        slots: templates[days.length % templates.length],
      });
    }
    i++;
  }
  return delay(500).then(() => ({ minutes, days }));
}

/* ---- booking ---- */
export function book(slot) {
  // slot: { dayLabel, time, timezone, repName, product }
  return delay(500).then(() => ({ ok: true, confirmation: { ...slot } }));
}

export { PERSONAL_DOMAINS };
