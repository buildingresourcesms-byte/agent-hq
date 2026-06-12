# AgentHQ — Build Prompt

Build **AgentHQ**: a standalone workspace for REAL ESTATE AGENTS that sells on its own,
and optionally **links** with its sister product, the MS Lending loan-officer workspace
(separate repo: `C:\Users\jstew\OneDrive\Desktop\FALCON\OneDrive\claude\ms-lending-demo`,
live at https://buildingresourcesms-byte.github.io/ms-lending-demo/).

**The business idea (this is the whole point):** neither side NEEDS the other's software.
An agent can run AgentHQ with any lender; a loan officer can run their workspace with any
agent. But when both sides have their program, a **"Connect to loan officer"** button links
them and everything flows automatically. Two products, two buyers, one optional handshake —
easier to sell to everyone.

---

## 1. Product shape — agent-FIRST, not lender-first

This is an agent's daily driver. The lender stuff is one integration among its features.

Pages (sidebar + mobile bottom nav, mirroring the LO app's layout quality):
1. **Dashboard** — greeting hero (time-of-day sky like the LO app), today's showings,
   hot buyers, closings this month, tasks due.
2. **Clients** — buyer/seller pipeline CRM. Buyer stages: `New → Touring → Offer Out →
   Under Contract → Closed`. Search/filter, client cards with budget, area, source.
3. **Listings** — her active listings: address, price, DOM, status (Active/Pending/Sold),
   showings count, open-house schedule.
4. **Calendar** — month grid (copy the LO app's calendar pattern): showings, open houses,
   closings, contract deadlines (inspection, financing, appraisal).
5. **Open House Kit** — pick a listing → sign-in page with QR code → captured visitors
   become leads in Clients.
6. **Commissions** — simple tracker: pending vs closed GCI for the year, per-deal split.
7. **Financing** (the integration tab — see §3).
8. Settings — profile, brokerage, notifications, the same theme picker concept.

## 2. Personas & seed data (MUST match the LO demo so linked demos line up)

Primary seat: **Holly Sandifer** — McIntosh & Co. Realtors, Madison MS,
(601) 555-0411, holly@mcintoshrealtors.com, rose accent, "HS".
Other sign-in seats: Bree Thompson (Magnolia Realty Group, Brandon), Carl Jenkins
(Crossgates Realty, Pearl & Flowood). ALL DATA FICTIONAL — keep a disclaimer everywhere
like the LO demo does.

Holly's buyer clients MUST include the shared deals (same names/amounts as the LO demo):
- **Devin & Alyssa Carter** — Under Contract, 412 Hartfield Place Madison, $432,000
- **Jordan & Maya Ellis** — Offer Out, 509 Lakeland Trace Flowood, $305,000
- **Tom & Erica Lawson** — Under Contract, 105 Ashbrooke Blvd Madison, $689,000
Plus 3–4 of her OWN clients who are NOT with MS Lending (cash buyer, other-lender buyer,
a seller listing) — these prove "you don't need the link to use AgentHQ."

Her lender contact: **Julene Stewart — Sr. Loan Officer, MS Lending, NMLS #1391365,
(601) 862-0542, julene@mslending.net** (real person — facts only, all deals fictional).

## 3. The Lender Link (the handshake)

A **"Connect to loan officer"** button (Financing tab + on each buyer's financing slot).

**Unlinked state (default for Bree/Carl seats, and for Holly's non-MS buyers):**
financing shows a graceful manual slot — "Financing: with their lender. Text for status,
or connect a loan officer for live updates." Log-status-manually input. Everything works.

**Linked state (Holly ↔ Julene, pre-seeded as connected):** each shared buyer gets a live
financing panel — stage (use the LO demo's portal stages: Application Started → Documents
Submitted → Loan Review → Underwriting → Final Approval → Closing), next step, est.
closing date — plus these features (port the patterns from the LO repo's git history,
they were built there first then rolled back):
- **Instant pre-approval letter generator** — LO-capped per buyer (Jordan $280,000 cap),
  letter matches offer price, "Ask for more room" escalation.
- **One-tap referral to Julene** — send a buyer in 30 seconds.
- **Reciprocity ledger** — "you sent her 3, she sent you 2 — she owes you a coffee ☕".
- **Co-branded apply link + QR** — apply.mslending.net/julene/holly.
- Auto-pushed milestone feed ("never have to ask 'any update?'").

## 4. REAL cross-app integration (no backend needed)

Deploy AgentHQ to the SAME GitHub Pages origin as the LO demo:
repo `agent-hq` under the `buildingresourcesms-byte` account, Pages from `main /docs`
→ **https://buildingresourcesms-byte.github.io/agent-hq/**

Same origin = shared `localStorage`. Implement a **Partner Link bridge**:
- Namespace: keys prefixed `plink:`
- `plink:link:julene-holly` → `{"status":"connected","since":"<iso>"}`
- `plink:referrals` → JSON array; AgentHQ APPENDS `{id, from:"holly", name, phone,
  loanType, purpose, sentAt}` when Holly sends a referral. (The LO app will read these.)
- `plink:status:<buyerKey>` → `{stage, estClosing, updatedAt}` written by the LO side,
  READ by AgentHQ for the live financing panels (fall back to seed data when absent).
- Listen to the `storage` event so an open AgentHQ tab updates live when the LO app
  (in another tab, same origin) writes.
- Write a `BRIDGE.md` documenting this schema exactly, so the LO repo can adopt it next.

## 5. Stack & conventions — mirror the sister repo exactly

React 19 + Vite + Tailwind CSS v4 (`@tailwindcss/vite`), lucide-react, react-qr-code.
100% front-end, mock data in `src/data.js`, context store in `src/store.jsx`, shared UI
primitives in `src/ui.jsx` (copy the Card/Btn/Badge/Modal/Toggle/SearchInput patterns from
the LO repo — same quality bar: focus-visible rings, reduced-motion support, dark mode via
`.dark` class, toasts, ⌘K command palette, mobile bottom nav, 44px touch targets).
`vite.config.js` must set `base: './'`.

**Design identity — its own brand, NOT a clone:** AgentHQ should feel like the agent's
program. Suggested: deep emerald/forest primary + warm gold accent, its own "HQ" logo
mark, same Inter typography. Keep the time-of-day sky hero and theme picker ideas if they
fit, but the default look must be distinct from the LO app's navy/sage.

## 6. Deliverables (same pipeline as the sister repo)

1. Working app, verified page-by-page (drive it in the preview browser; check console).
2. Mobile pass (375px): bottom nav, single-pane flows, thumb-sized targets.
3. `scripts/make-single-file.mjs` (copy from the LO repo) → `AgentHQ-Demo.html`; copy it to
   `C:\Users\jstew\OneDrive - Building Resources, LLC\JStew's files - Shared Folders\PROJECTS FOR CLAUDE\`.
4. Git repo → `gh repo create agent-hq --public --source . --push` (account is already
   authed) → enable Pages from main `/docs` (copy `dist` → `docs`) → verify the live URL
   returns 200 + assets → hand over **https://buildingresourcesms-byte.github.io/agent-hq/**.
5. README with the fictional-data disclaimer.

## 7. Tone

"Less SaaS, more the program agents have to have." Friendly, zero jargon, everything
one tap. The agent should feel like AgentHQ works for *her* — and the lender link is
her secret weapon, not the product's reason to exist.
