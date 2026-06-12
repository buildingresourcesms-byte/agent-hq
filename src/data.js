/* ============================================================
   AgentHQ — the real-estate agent's workspace (demo)
   All client, listing, and deal data below is FICTIONAL.
   ============================================================ */

/* ---------- date helpers (all dates relative to "today" so the
   demo always looks fresh) ---------- */
export const d = (n) => {
  const t = new Date()
  t.setDate(t.getDate() + n)
  return t.toISOString().slice(0, 10)
}

export const fmtDate = (iso) =>
  iso
    ? new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : '—'

export const fmtDateFull = (iso) =>
  iso
    ? new Date(iso + 'T12:00:00').toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    : '—'

export const daysUntil = (iso) => {
  if (!iso) return null
  const now = new Date()
  now.setHours(12, 0, 0, 0)
  return Math.round((new Date(iso + 'T12:00:00') - now) / 86400000)
}

export const relDate = (iso) => {
  if (!iso) return '—'
  const n = daysUntil(iso)
  if (n === 0) return 'Today'
  if (n === 1) return 'Tomorrow'
  if (n === -1) return 'Yesterday'
  return n > 0 ? `in ${n}d` : `${-n}d ago`
}

export const money = (n) => '$' + Math.round(n).toLocaleString('en-US')
export const moneyK = (n) => (n >= 1000000 ? `$${(n / 1000000).toFixed(2)}M` : `$${Math.round(n / 1000)}k`)

/* date helpers for the month grid (noon-anchored to dodge TZ edges) */
export const addDaysISO = (iso, n) => {
  const t = new Date(iso + 'T12:00:00')
  t.setDate(t.getDate() + n)
  return t.toISOString().slice(0, 10)
}
export const weekdayOf = (iso) => new Date(iso + 'T12:00:00').getDay()
export const monthLabel = (iso) =>
  new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

/* ---------- buyer pipeline stages ---------- */
export const STAGES = ['New', 'Touring', 'Offer Out', 'Under Contract', 'Closed', 'Lost']
export const ACTIVE_STAGES = STAGES.filter((s) => s !== 'Closed' && s !== 'Lost')

export const STAGE_STYLES = {
  'New':            { badge: 'bg-sky-50 text-sky-700 ring-sky-600/20',          dot: 'bg-sky-500',    bar: '#38bdf8' },
  'Touring':        { badge: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20', dot: 'bg-indigo-500', bar: '#6366f1' },
  'Offer Out':      { badge: 'bg-amber-50 text-amber-800 ring-amber-600/25',    dot: 'bg-amber-500',  bar: '#f59e0b' },
  'Under Contract': { badge: 'bg-violet-50 text-violet-700 ring-violet-600/20', dot: 'bg-violet-500', bar: '#8b5cf6' },
  'Closed':         { badge: 'bg-forest-100 text-forest-800 ring-forest-600/20', dot: 'bg-forest-600', bar: '#33684c' },
  'Lost':           { badge: 'bg-slate-100 text-slate-500 ring-slate-400/30',   dot: 'bg-slate-400',  bar: '#94a3b8' },
}

/* what moving forward means from each stage (button label) */
export const NEXT_ACTION_LABEL = {
  'New': 'Start touring',
  'Touring': 'Write the offer',
  'Offer Out': 'Mark under contract',
  'Under Contract': 'Mark closed 🔑',
}

/* the "current next step" shown on each client */
export const NEXT_STEP = {
  'New': 'Call to learn their wish list & set up the search',
  'Touring': 'Line up the next round of showings',
  'Offer Out': 'Chase the listing agent for an answer',
  'Under Contract': 'Watch the contract deadlines & keep everyone moving',
  'Closed': 'Drop off the keys gift & ask for a referral',
  'Lost': 'Add to the nurture list for a future check-in',
}

/* ---------- listing statuses ---------- */
export const LISTING_STATUSES = ['Active', 'Pending', 'Sold']
export const LISTING_STYLES = {
  Active:  { badge: 'bg-forest-50 text-forest-700 ring-forest-600/20', dot: 'bg-forest-500' },
  Pending: { badge: 'bg-amber-50 text-amber-800 ring-amber-600/25',    dot: 'bg-amber-500' },
  Sold:    { badge: 'bg-slate-100 text-slate-600 ring-slate-400/30',   dot: 'bg-slate-400' },
}

/* ---------- financing — how each buyer is paying ----------
   The point of AgentHQ: every buyer has a financing slot that works
   WITHOUT any lender link (cash, "their lender", manual notes) — and
   lights up live when the buyer's lender runs the MS Lending workspace. */
export const FINANCING_KINDS = {
  linked: { label: 'Linked lender', cls: 'bg-forest-50 text-forest-700 ring-forest-600/20' },
  manual: { label: 'Their own lender', cls: 'bg-slate-100 text-slate-600 ring-slate-400/30' },
  cash:   { label: 'Cash buyer', cls: 'bg-gold-50 text-gold-700 ring-gold-600/25' },
  none:   { label: 'Not started', cls: 'bg-slate-50 text-slate-500 ring-slate-400/30' },
}

/* loan milestones — MUST mirror the MS Lending portal stages exactly
   so a linked demo lines up on both screens */
export const LOAN_STAGES = [
  { label: 'Application Started', blurb: 'They applied — the lender has their basic info.' },
  { label: 'Documents Submitted', blurb: 'Paperwork is in. The lender is gathering what the loan needs.' },
  { label: 'Loan Review', blurb: 'The loan officer is personally reviewing the file.' },
  { label: 'Underwriting', blurb: 'The lender is double-checking the final details.' },
  { label: 'Final Approval', blurb: 'Approved! Closing is being scheduled.' },
  { label: 'Closing', blurb: 'Sign the papers, hand over the keys.' },
]
export const loanStageIndex = (label) => Math.max(0, LOAN_STAGES.findIndex((s) => s.label === label))

/* ---------- the agents (sign-in seats) ---------- */
export const AGENTS = [
  {
    id: 'holly',
    name: 'Holly Sandifer',
    brokerage: 'McIntosh & Co. Realtors',
    market: 'Madison',
    phone: '(601) 555-0411',
    email: 'holly@mcintoshrealtors.com',
    color: 'bg-rose-500',
    initials: 'HS',
    splitPct: 70, // agent's share of each commission
    linked: true, // pre-seeded Partner Link with Julene
  },
  {
    id: 'bree',
    name: 'Bree Thompson',
    brokerage: 'Magnolia Realty Group',
    market: 'Brandon',
    phone: '(601) 555-0428',
    email: 'bree@magnoliarealty.com',
    color: 'bg-indigo-500',
    initials: 'BT',
    splitPct: 65,
    linked: false,
  },
  {
    id: 'carl',
    name: 'Carl Jenkins',
    brokerage: 'Crossgates Realty',
    market: 'Pearl & Flowood',
    phone: '(601) 555-0436',
    email: 'carl@crossgatesrealty.com',
    color: 'bg-amber-600',
    initials: 'CJ',
    splitPct: 75,
    linked: false,
  },
]
export const agentById = (id) => AGENTS.find((a) => a.id === id) ?? AGENTS[0]

/* ---------- the lender contact (real person — facts only; all deals fictional) ---------- */
export const JULENE = {
  id: 'julene',
  name: 'Julene Stewart',
  role: 'Sr. Loan Officer',
  org: 'MS Lending',
  nmls: 'NMLS #1391365',
  phone: '(601) 862-0542',
  email: 'julene@mslending.net',
  color: 'bg-violet-600',
  initials: 'JS',
}

/* co-branded apply link — the agent shares it, the lender gets the lead,
   the agent gets the credit */
export const APPLY_BASE = 'apply.mslending.net'
export const coBrandedLink = (agent) => `${APPLY_BASE}/julene/${agent.id}`

export const SOURCES = ['Open House', 'Referral', 'Past Client', 'Zillow', 'Sign Call', 'Facebook', 'Sphere']
export const AREAS = ['Madison', 'Gluckstadt', 'Ridgeland', 'Flowood', 'Brandon', 'Pearl', 'Clinton', 'Jackson']

/* ============================================================
   CLIENTS — buyers & sellers. Holly's book includes the three
   shared MS Lending deals (same names & numbers as the LO demo)
   PLUS clients who have nothing to do with MS Lending: a cash
   buyer, an other-lender buyer, and sellers. That mix is the
   product story — AgentHQ works with or without the link.
   ============================================================ */
const C = (c) => ({
  type: 'buyer',
  coName: null,
  notes: [],
  timeline: [],
  financing: { kind: 'none' },
  ...c,
})

export const SEED_CLIENTS = [
  /* ----- Holly: the three shared MS Lending deals ----- */
  C({
    id: 'c1',
    agentId: 'holly',
    name: 'Devin & Alyssa Carter',
    phone: '(601) 555-0127',
    email: 'devin.alyssa.carter@example.com',
    stage: 'Under Contract',
    budget: 450000,
    area: 'Madison',
    source: 'Past Client',
    wishlist: '4BR, good schools, big backyard for the dog',
    property: '412 Hartfield Place, Madison, MS 39110',
    price: 432000,
    offerDate: d(-10),
    contractDate: d(-6),
    closingDate: d(34),
    deadlines: [
      { label: 'Inspection', date: d(4), done: false },
      { label: 'Appraisal', date: d(12), done: false },
      { label: 'Financing contingency', date: d(20), done: false },
    ],
    financing: {
      kind: 'linked',
      buyerKey: 'carter',
      lender: 'MS Lending · Julene Stewart',
      loanStage: 'Documents Submitted',
      estClosing: d(34),
      nextStep: 'Lender is collecting the last two bank statements',
      preApprovedAt: 400000,
    },
    showingsDone: 9,
    createdAt: d(-26),
    stageEnteredAt: d(-6),
    nextTouch: d(2),
    notes: [
      { id: 'n1', date: d(-4), text: 'Alyssa is gathering May pay stubs for Julene. Their lease ends July 31 — this one has to keep moving.' },
      { id: 'n2', date: d(-6), text: 'UNDER CONTRACT at $432k! Inspection scheduled. They cried in the driveway. 🥹' },
    ],
    timeline: [
      { date: d(-26), type: 'created', text: 'Back again! Bought their starter home with me in 2019.' },
      { date: d(-22), type: 'showing', text: 'Toured 4 homes in Madison — loved Hartfield Place' },
      { date: d(-12), type: 'financing', text: 'Sent to Julene at MS Lending — pre-qualified at $400k same day' },
      { date: d(-10), type: 'offer', text: 'Offer submitted: $432,000 on 412 Hartfield Place' },
      { date: d(-6), type: 'stage', text: 'Offer accepted — under contract 🎉' },
      { date: d(-2), type: 'financing', text: 'Auto-update from MS Lending: Documents Submitted' },
    ],
  }),
  C({
    id: 'c2',
    agentId: 'holly',
    name: 'Jordan & Maya Ellis',
    phone: '(601) 555-0165',
    email: 'the.ellis.family@example.com',
    stage: 'Offer Out',
    budget: 310000,
    area: 'Flowood',
    source: 'Referral',
    wishlist: '3BR, office for Maya’s design studio, near Lakeland',
    property: '509 Lakeland Trace, Flowood, MS 39232',
    price: 305000,
    offerDate: d(-1),
    deadlines: [],
    financing: {
      kind: 'linked',
      buyerKey: 'ellis',
      lender: 'MS Lending · Julene Stewart',
      loanStage: 'Loan Review',
      estClosing: d(40),
      nextStep: 'Pre-approved at $280k — letter ready for the offer',
      preApprovedAt: 280000,
    },
    showingsDone: 12,
    createdAt: d(-30),
    stageEnteredAt: d(-1),
    nextTouch: d(1),
    notes: [
      { id: 'n1', date: d(-1), text: 'Offer in at $305k with a $280k loan + savings for the rest. Listing agent says answer by Friday. 🤞' },
    ],
    timeline: [
      { date: d(-30), type: 'created', text: 'Referred by the Carters — first house together' },
      { date: d(-16), type: 'financing', text: 'Connected to Julene — pre-approval started' },
      { date: d(-9), type: 'showing', text: 'Third tour day — Lakeland Trace is THE one' },
      { date: d(-2), type: 'financing', text: 'Auto-update from MS Lending: pre-approved at $280,000' },
      { date: d(-1), type: 'offer', text: 'Offer submitted: $305,000 on 509 Lakeland Trace' },
    ],
  }),
  C({
    id: 'c3',
    agentId: 'holly',
    name: 'Tom & Erica Lawson',
    phone: '(601) 555-0157',
    email: 'lawsons@example.com',
    stage: 'Under Contract',
    budget: 700000,
    area: 'Madison',
    source: 'Sphere',
    wishlist: 'Forever home — pool, 3-car garage, Ashbrooke',
    property: '105 Ashbrooke Blvd, Madison, MS 39110',
    price: 689000,
    offerDate: d(-9),
    contractDate: d(-5),
    closingDate: d(37),
    deadlines: [
      { label: 'Inspection', date: d(2), done: false },
      { label: 'Appraisal', date: d(14), done: false },
      { label: 'Financing contingency', date: d(24), done: false },
    ],
    financing: {
      kind: 'linked',
      buyerKey: 'lawson',
      lender: 'MS Lending · Julene Stewart',
      loanStage: 'Loan Review',
      estClosing: d(37),
      nextStep: 'Julene is reviewing the dental-practice income (jumbo file)',
      preApprovedAt: 720000,
    },
    showingsDone: 6,
    createdAt: d(-20),
    stageEnteredAt: d(-5),
    nextTouch: d(2),
    notes: [
      { id: 'n1', date: d(-1), text: 'Jumbo loan — Julene has two years of practice returns in review. Strong file, no sweat.' },
    ],
    timeline: [
      { date: d(-20), type: 'created', text: 'The Lawsons from church — selling their Gluckstadt place too' },
      { date: d(-13), type: 'showing', text: 'Private showing at Ashbrooke — Erica started planning furniture' },
      { date: d(-9), type: 'offer', text: 'Offer submitted: $689,000 on 105 Ashbrooke Blvd' },
      { date: d(-5), type: 'stage', text: 'Offer accepted — under contract 🎉' },
      { date: d(-1), type: 'financing', text: 'Auto-update from MS Lending: Loan Review' },
    ],
  }),

  /* ----- Holly: clients with NO MS Lending link (the proof you
         don't need the handshake to run your day on AgentHQ) ----- */
  C({
    id: 'c4',
    agentId: 'holly',
    name: 'Marcus & Tina Boyd',
    phone: '(601) 555-0233',
    email: 'boyd.family@example.com',
    stage: 'Touring',
    budget: 350000,
    area: 'Ridgeland',
    source: 'Open House',
    wishlist: 'One story, low maintenance, near the Trace',
    financing: { kind: 'cash', notesLog: [{ date: d(-7), text: 'Proof of funds on file — selling their farm acreage' }] },
    showingsDone: 4,
    createdAt: d(-14),
    stageEnteredAt: d(-7),
    nextTouch: d(0),
    nextShowing: { date: d(0), time: '4:30 PM', address: '311 Bridgewater Row, Ridgeland' },
    notes: [{ id: 'n1', date: d(-3), text: 'Cash buyers, zero hurry, very picky about lot privacy. Saturday tour list ready.' }],
    timeline: [
      { date: d(-14), type: 'created', text: 'Walked into the Bellegrove open house — cash, no agent. Mine now. 😄' },
      { date: d(-7), type: 'showing', text: 'First tour day — 3 homes in Ridgeland' },
    ],
  }),
  C({
    id: 'c5',
    agentId: 'holly',
    name: 'Priya Natarajan',
    phone: '(601) 555-0288',
    email: 'priya.n@example.com',
    stage: 'Touring',
    budget: 265000,
    area: 'Clinton',
    source: 'Zillow',
    wishlist: 'First home — 3BR, fenced yard, move-in ready',
    financing: {
      kind: 'manual',
      lender: 'Trustmark Bank',
      notesLog: [
        { date: d(-2), text: 'Texted her LO — pre-approval letter expected this week' },
        { date: d(-9), text: 'Started application with her credit union' },
      ],
    },
    showingsDone: 5,
    createdAt: d(-17),
    stageEnteredAt: d(-11),
    nextTouch: d(1),
    nextShowing: { date: d(1), time: '5:15 PM', address: '76 Easthaven Dr, Clinton' },
    notes: [{ id: 'n1', date: d(-2), text: 'Using her own bank — totally fine. Logging status by text until there’s something better.' }],
    timeline: [
      { date: d(-17), type: 'created', text: 'Zillow lead — answered in 4 minutes, booked a call' },
      { date: d(-11), type: 'showing', text: 'First showings in Clinton' },
    ],
  }),
  C({
    id: 'c6',
    agentId: 'holly',
    type: 'seller',
    name: 'Sandra & Mike Greer',
    phone: '(601) 555-0244',
    email: 'greers@example.com',
    stage: 'Under Contract',
    area: 'Madison',
    source: 'Past Client',
    listingId: 'l2',
    price: 289900,
    closingDate: d(21),
    deadlines: [{ label: 'Buyer financing contingency', date: d(10), done: false }],
    financing: { kind: 'none' },
    createdAt: d(-48),
    stageEnteredAt: d(-9),
    nextTouch: d(3),
    notes: [{ id: 'n1', date: d(-9), text: 'Buyer’s lender (not mine) says clear so far. Movers booked for the 20th.' }],
    timeline: [
      { date: d(-48), type: 'created', text: 'Listed Petit Bois — staged it ourselves in a weekend' },
      { date: d(-9), type: 'stage', text: 'Accepted $289,900 — pending' },
    ],
  }),
  C({
    id: 'c7',
    agentId: 'holly',
    name: 'Grace Okafor',
    phone: '(601) 555-0271',
    email: 'grace.okafor@example.com',
    stage: 'Closed',
    budget: 240000,
    area: 'Flowood',
    source: 'Referral',
    property: '88 Whisper Lake Cv, Flowood, MS 39232',
    price: 236000,
    closingDate: d(-22),
    financing: { kind: 'manual', lender: 'Regions Mortgage' },
    showingsDone: 8,
    createdAt: d(-90),
    stageEnteredAt: d(-22),
    notes: [],
    timeline: [
      { date: d(-90), type: 'created', text: 'Referred by her sister' },
      { date: d(-22), type: 'stage', text: 'CLOSED — keys handed over 🔑' },
    ],
  }),
  C({
    id: 'c8',
    agentId: 'holly',
    name: 'Dale & Romie Pittman',
    phone: '(601) 555-0299',
    email: 'pittmans@example.com',
    stage: 'New',
    budget: 380000,
    area: 'Gluckstadt',
    source: 'Sign Call',
    wishlist: 'Downsizing — new build, no stairs',
    financing: { kind: 'none' },
    showingsDone: 0,
    createdAt: d(-1),
    stageEnteredAt: d(-1),
    nextTouch: d(0),
    notes: [],
    timeline: [{ date: d(-1), type: 'created', text: 'Called the sign at Carter Grove — want to see new builds' }],
  }),

  /* ----- Bree's seat (unlinked — everything manual, everything works) ----- */
  C({
    id: 'c9',
    agentId: 'bree',
    name: 'Austin & Kelsey Ward',
    phone: '(601) 555-0312',
    email: 'wards@example.com',
    stage: 'Under Contract',
    budget: 285000,
    area: 'Brandon',
    source: 'Facebook',
    property: '604 Greenfield Way, Brandon, MS 39042',
    price: 271500,
    contractDate: d(-8),
    closingDate: d(26),
    deadlines: [{ label: 'Appraisal', date: d(8), done: false }],
    financing: {
      kind: 'manual',
      lender: 'Community Bank',
      notesLog: [{ date: d(-3), text: 'LO emailed — appraisal ordered, no conditions yet' }],
    },
    showingsDone: 7,
    createdAt: d(-35),
    stageEnteredAt: d(-8),
    nextTouch: d(2),
    notes: [],
    timeline: [{ date: d(-8), type: 'stage', text: 'Under contract at $271,500' }],
  }),
  C({
    id: 'c10',
    agentId: 'bree',
    name: 'Donnell Harris',
    phone: '(601) 555-0327',
    email: 'donnell.h@example.com',
    stage: 'Touring',
    budget: 215000,
    area: 'Brandon',
    source: 'Open House',
    wishlist: 'Starter home near the reservoir',
    financing: { kind: 'none' },
    showingsDone: 2,
    createdAt: d(-9),
    stageEnteredAt: d(-5),
    nextTouch: d(1),
    nextShowing: { date: d(2), time: '11:00 AM', address: '215 Audubon Pt, Brandon' },
    notes: [],
    timeline: [{ date: d(-9), type: 'created', text: 'Open-house sign-in lead' }],
  }),

  /* ----- Carl's seat (unlinked) ----- */
  C({
    id: 'c11',
    agentId: 'carl',
    name: 'Felicia & Ray Moton',
    phone: '(601) 555-0354',
    email: 'motons@example.com',
    stage: 'Offer Out',
    budget: 198000,
    area: 'Pearl',
    source: 'Past Client',
    property: '37 Brookwood Dr, Pearl, MS 39208',
    price: 192000,
    offerDate: d(-2),
    financing: {
      kind: 'manual',
      lender: 'Their credit union',
      notesLog: [{ date: d(-2), text: 'Pre-approval letter in hand for $200k' }],
    },
    showingsDone: 6,
    createdAt: d(-21),
    stageEnteredAt: d(-2),
    nextTouch: d(1),
    notes: [],
    timeline: [{ date: d(-2), type: 'offer', text: 'Offer in at $192,000' }],
  }),
  C({
    id: 'c12',
    agentId: 'carl',
    type: 'seller',
    name: 'Beverly Stamps',
    phone: '(601) 555-0361',
    email: 'bev.stamps@example.com',
    stage: 'Touring',
    area: 'Flowood',
    source: 'Referral',
    listingId: 'l5',
    price: 244500,
    financing: { kind: 'none' },
    createdAt: d(-12),
    stageEnteredAt: d(-12),
    nextTouch: d(2),
    notes: [],
    timeline: [{ date: d(-12), type: 'created', text: 'Listing appointment won — live on MLS Friday' }],
  }),
]

/* ============================================================
   LISTINGS
   ============================================================ */
export const SEED_LISTINGS = [
  {
    id: 'l1',
    agentId: 'holly',
    address: '218 Bellegrove Circle, Madison, MS 39110',
    short: '218 Bellegrove Cir',
    price: 415000,
    status: 'Active',
    beds: 4,
    baths: 3,
    sqft: 2680,
    listedAt: d(-12),
    showings: 14,
    sellerId: null,
    openHouse: { date: d(2), time: '1:00 – 3:00 PM' },
    heat: 'hot', // showing traffic
  },
  {
    id: 'l2',
    agentId: 'holly',
    address: '84 Petit Bois Lane, Ridgeland, MS 39157',
    short: '84 Petit Bois Ln',
    price: 289900,
    status: 'Pending',
    beds: 3,
    baths: 2,
    sqft: 1840,
    listedAt: d(-48),
    showings: 22,
    sellerId: 'c6',
    closingDate: d(21),
    heat: 'steady',
  },
  {
    id: 'l3',
    agentId: 'holly',
    address: '1106 Carter Grove, Gluckstadt, MS 39110',
    short: '1106 Carter Grove',
    price: 362500,
    status: 'Active',
    beds: 4,
    baths: 2.5,
    sqft: 2310,
    listedAt: d(-5),
    showings: 6,
    sellerId: null,
    openHouse: { date: d(3), time: '2:00 – 4:00 PM' },
    heat: 'new',
  },
  {
    id: 'l4',
    agentId: 'holly',
    address: '42 Windrose Court, Madison, MS 39110',
    short: '42 Windrose Ct',
    price: 512000,
    status: 'Sold',
    beds: 5,
    baths: 4,
    sqft: 3420,
    listedAt: d(-96),
    soldAt: d(-38),
    showings: 31,
    sellerId: null,
    heat: 'done',
  },
  {
    id: 'l5',
    agentId: 'carl',
    address: '90 Luckney Station Rd, Flowood, MS 39232',
    short: '90 Luckney Station',
    price: 244500,
    status: 'Active',
    beds: 3,
    baths: 2,
    sqft: 1710,
    listedAt: d(-3),
    showings: 4,
    sellerId: 'c12',
    openHouse: { date: d(4), time: '1:00 – 3:00 PM' },
    heat: 'new',
  },
]

export const daysOnMarket = (l) => Math.max(0, -daysUntil(l.listedAt))

/* ============================================================
   COMMISSIONS — simple GCI math the agent actually cares about.
   side: 'buyer' | 'listing'; rate is the agent's side of the deal.
   ============================================================ */
export const SEED_COMMISSIONS = [
  /* closed YTD (Holly) */
  { id: 'm1', agentId: 'holly', deal: 'Grace Okafor — 88 Whisper Lake Cv', side: 'buyer', price: 236000, rate: 3, status: 'Closed', closedAt: d(-22), clientId: 'c7' },
  { id: 'm2', agentId: 'holly', deal: '42 Windrose Ct — sellers', side: 'listing', price: 512000, rate: 3, status: 'Closed', closedAt: d(-38), clientId: null },
  { id: 'm3', agentId: 'holly', deal: 'The Hendersons — 12 Bridgers Ave', side: 'buyer', price: 198500, rate: 3, status: 'Closed', closedAt: d(-74), clientId: null },
  /* pending (under contract) */
  { id: 'm4', agentId: 'holly', deal: 'Devin & Alyssa Carter — 412 Hartfield Pl', side: 'buyer', price: 432000, rate: 3, status: 'Pending', closesAt: d(34), clientId: 'c1' },
  { id: 'm5', agentId: 'holly', deal: 'Tom & Erica Lawson — 105 Ashbrooke Blvd', side: 'buyer', price: 689000, rate: 3, status: 'Pending', closesAt: d(37), clientId: 'c3' },
  { id: 'm6', agentId: 'holly', deal: 'The Greers — 84 Petit Bois Ln', side: 'listing', price: 289900, rate: 3, status: 'Pending', closesAt: d(21), clientId: 'c6' },
  /* other seats */
  { id: 'm7', agentId: 'bree', deal: 'Austin & Kelsey Ward — 604 Greenfield Way', side: 'buyer', price: 271500, rate: 3, status: 'Pending', closesAt: d(26), clientId: 'c9' },
  { id: 'm8', agentId: 'carl', deal: 'The Nguyens — 14 Park Trace', side: 'buyer', price: 167000, rate: 3, status: 'Closed', closedAt: d(-51), clientId: null },
]

export const gci = (m) => (m.price * m.rate) / 100
export const agentCut = (m, agent) => gci(m) * ((agent?.splitPct ?? 70) / 100)

/* ============================================================
   TASKS
   ============================================================ */
export const TASK_STATUSES = ['To Do', 'Done']
export const PRIORITY_STYLES = {
  High: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  Medium: 'bg-amber-50 text-amber-800 ring-amber-600/25',
  Low: 'bg-slate-100 text-slate-500 ring-slate-400/30',
}

export const SEED_TASKS = [
  { id: 't1', agentId: 'holly', title: 'Confirm Carter inspection — Thursday 9am', clientId: 'c1', due: d(1), priority: 'High', status: 'To Do' },
  { id: 't2', agentId: 'holly', title: 'Chase listing agent on the Ellis offer', clientId: 'c2', due: d(0), priority: 'High', status: 'To Do' },
  { id: 't3', agentId: 'holly', title: 'Order open-house signs for Bellegrove', clientId: null, due: d(0), priority: 'Medium', status: 'To Do' },
  { id: 't4', agentId: 'holly', title: 'Saturday tour list for the Boyds (5 homes)', clientId: 'c4', due: d(1), priority: 'Medium', status: 'To Do' },
  { id: 't5', agentId: 'holly', title: 'Call Priya — pre-approval letter in yet?', clientId: 'c5', due: d(1), priority: 'Medium', status: 'To Do' },
  { id: 't6', agentId: 'holly', title: 'Greers: confirm movers + utilities switch', clientId: 'c6', due: d(3), priority: 'Low', status: 'To Do' },
  { id: 't7', agentId: 'holly', title: 'Drop comps to the Pittmans (Gluckstadt new builds)', clientId: 'c8', due: d(2), priority: 'Medium', status: 'To Do' },
  { id: 't8', agentId: 'holly', title: 'Mail closing gift — Grace Okafor', clientId: 'c7', due: d(-1), priority: 'Low', status: 'To Do' },
  { id: 't9', agentId: 'bree', title: 'Check appraisal status with Community Bank', clientId: 'c9', due: d(1), priority: 'High', status: 'To Do' },
  { id: 't10', agentId: 'carl', title: 'Photos + MLS copy for Luckney Station', clientId: 'c12', due: d(0), priority: 'High', status: 'To Do' },
]

/* ============================================================
   SHOWINGS — today's & upcoming appointments (calendar fuel)
   ============================================================ */
export const SEED_SHOWINGS = [
  { id: 's1', agentId: 'holly', clientId: 'c4', date: d(0), time: '4:30 PM', address: '311 Bridgewater Row, Ridgeland' },
  { id: 's2', agentId: 'holly', clientId: 'c5', date: d(1), time: '5:15 PM', address: '76 Easthaven Dr, Clinton' },
  { id: 's3', agentId: 'holly', clientId: 'c4', date: d(1), time: '10:00 AM', address: '405 Camden Park, Madison' },
  { id: 's4', agentId: 'holly', clientId: 'c8', date: d(2), time: '3:00 PM', address: 'Carter Grove model homes, Gluckstadt' },
  { id: 's5', agentId: 'bree', clientId: 'c10', date: d(2), time: '11:00 AM', address: '215 Audubon Pt, Brandon' },
]

/* ============================================================
   CALENDAR — one place turns clients + listings + tasks +
   showings into dated events so every view agrees.
   ============================================================ */
export const CAL_TYPES = {
  showing:  { label: 'Showing',   chip: 'bg-sky-500',    soft: 'bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/15' },
  open:     { label: 'Open house', chip: 'bg-gold-500',  soft: 'bg-gold-50 text-gold-700 ring-gold-600/25 dark:bg-gold-500/15' },
  closing:  { label: 'Closing',   chip: 'bg-forest-500', soft: 'bg-forest-50 text-forest-700 ring-forest-600/20 dark:bg-forest-500/15' },
  deadline: { label: 'Contract deadline', chip: 'bg-rose-500', soft: 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/15' },
  task:     { label: 'Task due',  chip: 'bg-violet-500', soft: 'bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-500/15' },
}

export const calendarEvents = (clients, listings, tasks, showings, agentId) => {
  const mine = (xs) => xs.filter((x) => x.agentId === agentId)
  const events = []
  mine(showings).forEach((s) => {
    const c = clients.find((x) => x.id === s.clientId)
    events.push({ id: 'sh' + s.id, date: s.date, type: 'showing', title: c ? c.name : 'Showing', sub: `${s.time} · ${s.address}`, clientId: s.clientId })
  })
  mine(listings).forEach((l) => {
    if (l.openHouse)
      events.push({ id: 'oh' + l.id, date: l.openHouse.date, type: 'open', title: `Open house · ${l.short}`, sub: `${l.openHouse.time} · ${money(l.price)}`, listingId: l.id })
  })
  mine(clients).forEach((c) => {
    if (c.stage === 'Lost') return
    if (c.closingDate && c.stage !== 'Closed')
      events.push({ id: 'cl' + c.id, date: c.closingDate, type: 'closing', title: `Closing · ${c.name}`, sub: c.property ?? (c.price ? money(c.price) : 'Closing day'), clientId: c.id })
    ;(c.deadlines ?? []).forEach((dl, i) => {
      if (!dl.done)
        events.push({ id: 'dl' + c.id + i, date: dl.date, type: 'deadline', title: `${dl.label} · ${c.name.split(' ')[0]}`, sub: c.property ?? 'Contract deadline', clientId: c.id })
    })
  })
  mine(tasks).forEach((t) => {
    if (t.status === 'Done') return
    const c = clients.find((x) => x.id === t.clientId)
    events.push({ id: 'tk' + t.id, date: t.due, type: 'task', title: t.title, sub: c ? c.name : 'General', clientId: t.clientId, isTask: true, taskId: t.id })
  })
  return events.sort((a, z) => (a.date < z.date ? -1 : a.date > z.date ? 1 : 0))
}

/* ============================================================
   RECIPROCITY LEDGER — both directions of the relationship.
   sent: buyers Holly referred to Julene. received: buyers
   Julene introduced to Holly. Whoever's behind owes coffee. ☕
   ============================================================ */
export const SEED_REFERRALS_SENT = [
  { id: 'r1', name: 'Jordan & Maya Ellis', date: d(-16), note: 'Pre-approval needed fast — offer weekend' },
  { id: 'r2', name: 'Devin & Alyssa Carter', date: d(-12), note: 'Repeat buyers, conventional' },
  { id: 'r3', name: 'Tom & Erica Lawson', date: d(-20), note: 'Jumbo — practice income' },
]
export const SEED_REFERRALS_RECEIVED = [
  { id: 'g1', name: 'Monica H.', date: d(-21), note: 'Pre-approved buyer who needed an agent in Madison' },
  { id: 'g2', name: 'Greg T.', date: d(-9), note: 'Relocation buyer — touring this weekend' },
]

/* milestone feed — what the link pushes so Holly never has to ask
   "any update?" (seed; live plink: writes prepend to this) */
export const SEED_MILESTONES = [
  { id: 'f1', buyerKey: 'ellis', name: 'Jordan & Maya Ellis', date: d(-2), text: 'Pre-approved at $280,000 — letter on file', stage: 'Loan Review' },
  { id: 'f2', buyerKey: 'carter', name: 'Devin & Alyssa Carter', date: d(-2), text: 'Documents Submitted — 2 bank statements to go', stage: 'Documents Submitted' },
  { id: 'f3', buyerKey: 'lawson', name: 'Tom & Erica Lawson', date: d(-1), text: 'File moved to Loan Review (jumbo income check)', stage: 'Loan Review' },
  { id: 'f4', buyerKey: 'carter', name: 'Devin & Alyssa Carter', date: d(-5), text: 'Application started', stage: 'Application Started' },
]

export const DISCLAIMER =
  'Demo prototype only. All clients, deals, and listings are fictional sample data.'

/* ---------- time-of-day theming (dashboard hero, sidebar, login) ---------- */
export const timeOfDay = () => {
  const h = new Date().getHours()
  return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'
}

export const SKY = {
  morning: {
    grad: 'from-amber-50 via-rose-50 to-sky-100',
    text: 'text-forest-950',
    muted: 'text-forest-800/60',
    orbBg: 'radial-gradient(circle at 35% 30%, #fef3c7, #fbbf24 70%)',
    glow: 'bg-amber-300/40',
    shadow: '0 0 55px 8px rgba(251,191,36,0.45)',
    accent: 'rgba(251,191,36,0.16)',
    moon: false,
  },
  afternoon: {
    grad: 'from-orange-100 via-rose-100 to-indigo-100',
    text: 'text-forest-950',
    muted: 'text-forest-800/60',
    orbBg: 'radial-gradient(circle at 35% 30%, #fed7aa, #fb7185 72%)',
    glow: 'bg-orange-300/40',
    shadow: '0 0 55px 8px rgba(251,146,60,0.4)',
    accent: 'rgba(251,146,60,0.16)',
    moon: false,
  },
  evening: {
    grad: 'from-indigo-950 via-forest-950 to-slate-900',
    text: 'text-white',
    muted: 'text-forest-200/70',
    orbBg: 'radial-gradient(circle at 35% 30%, #f8fafc, #cbd5e1 80%)',
    glow: 'bg-slate-200/20',
    shadow: '0 0 45px 6px rgba(226,232,240,0.3)',
    accent: 'rgba(212,164,55,0.20)',
    moon: true,
  },
}
