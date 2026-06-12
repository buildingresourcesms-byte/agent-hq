/* ============================================================
   PARTNER LINK BRIDGE — the real cross-app integration.

   AgentHQ and the MS Lending workspace deploy to the SAME GitHub
   Pages origin, so they share localStorage. No backend: each app
   reads/writes namespaced `plink:` keys and listens to the
   `storage` event, so two open tabs update each other live.

   Schema (documented in BRIDGE.md):
     plink:link:julene-holly   {"status":"connected","since":"<iso>"}
     plink:referrals           [{id, from:"holly", name, phone, loanType, purpose, sentAt}]
     plink:status:<buyerKey>   {stage, estClosing, updatedAt}   ← written by the LO app
   ============================================================ */

const LINK_KEY = 'plink:link:julene-holly'
const REFERRALS_KEY = 'plink:referrals'
const STATUS_PREFIX = 'plink:status:'

const read = (key) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const write = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

/* ---------- the link itself ---------- */
export const readLink = () => read(LINK_KEY)

export const writeLink = () =>
  write(LINK_KEY, { status: 'connected', since: new Date().toISOString() })

/* Holly ↔ Julene ships pre-connected: seed the key on first run so
   the LO app (same origin) sees the handshake too. */
export const seedLink = () => {
  if (!readLink()) writeLink()
}

/* ---------- referrals: AgentHQ APPENDS, the LO app reads ---------- */
export const appendReferral = ({ name, phone, loanType, purpose }) => {
  const list = read(REFERRALS_KEY) ?? []
  const ref = {
    id: 'ref-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    from: 'holly',
    name,
    phone,
    loanType,
    purpose,
    sentAt: new Date().toISOString(),
  }
  write(REFERRALS_KEY, [...list, ref])
  return ref
}

export const readReferrals = () => read(REFERRALS_KEY) ?? []

/* ---------- live loan status: LO app writes, AgentHQ reads ---------- */
export const readLoanStatus = (buyerKey) => read(STATUS_PREFIX + buyerKey)

/* subscribe to cross-tab writes; returns an unsubscribe fn */
export const onBridgeChange = (handler) => {
  const listener = (e) => {
    if (e.key && e.key.startsWith('plink:')) handler(e.key, e.newValue ? JSON.parse(e.newValue) : null)
  }
  window.addEventListener('storage', listener)
  return () => window.removeEventListener('storage', listener)
}
