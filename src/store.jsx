import { createContext, useContext, useMemo, useState, useCallback, useRef, useEffect } from 'react'
import {
  SEED_CLIENTS,
  SEED_LISTINGS,
  SEED_TASKS,
  SEED_SHOWINGS,
  SEED_COMMISSIONS,
  SEED_REFERRALS_SENT,
  SEED_REFERRALS_RECEIVED,
  SEED_MILESTONES,
  STAGES,
  NEXT_ACTION_LABEL,
  agentById,
  JULENE,
  gci,
  agentCut,
  d,
  daysUntil,
} from './data.js'
import { seedLink, readLink, appendReferral, readLoanStatus, onBridgeChange } from './bridge.js'

const Ctx = createContext(null)
export const useApp = () => useContext(Ctx)

const DEFAULT_CRM = { q: '', stage: 'All', type: 'All', financing: 'All' }
const SHARED_BUYER_KEYS = ['carter', 'ellis', 'lawson']

export function AppProvider({ children }) {
  const [view, setView] = useState({ page: 'dashboard' })
  const [clients, setClients] = useState(SEED_CLIENTS)
  const [listings, setListings] = useState(SEED_LISTINGS)
  const [tasks, setTasks] = useState(SEED_TASKS)
  const [showings, setShowings] = useState(SEED_SHOWINGS)
  const [commissions, setCommissions] = useState(SEED_COMMISSIONS)
  const [toasts, setToasts] = useState([])
  const [crm, setCrmState] = useState(DEFAULT_CRM)
  const [seat, setSeatState] = useState('holly')
  const [signedIn, setSignedIn] = useState(false)
  const [celebrate, setCelebrate] = useState(0)
  const [notifPrefs, setNotifPrefs] = useState({
    showings: true,
    deadlines: true,
    financing: true,
    openHouse: true,
    digest: true,
  })
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('ahq-dark') === '1' ? 'dark' : 'light'
    } catch {
      return 'light'
    }
  })
  const [palette, setPaletteState] = useState(() => {
    try {
      return localStorage.getItem('ahq-palette') ?? 'evergreen'
    } catch {
      return 'evergreen'
    }
  })
  const idSeq = useRef(100)

  /* ---------- Partner Link: seat-level link state ----------
     Holly ships connected to Julene (and seeds the shared
     localStorage key so the LO app sees the same handshake).
     Bree & Carl start unlinked — their app works fine anyway. */
  const [lenderLinks, setLenderLinks] = useState({
    holly: { status: 'connected', since: d(-30) },
    bree: { status: 'none' },
    carl: { status: 'none' },
  })

  /* live loan statuses written by the LO app (plink:status:<buyerKey>);
     fall back to seed data when absent */
  const [liveStatuses, setLiveStatuses] = useState({})

  useEffect(() => {
    seedLink()
    const initial = {}
    SHARED_BUYER_KEYS.forEach((k) => {
      const s = readLoanStatus(k)
      if (s) initial[k] = s
    })
    setLiveStatuses(initial)
    const existing = readLink()
    if (existing?.status === 'connected')
      setLenderLinks((m) => ({ ...m, holly: { status: 'connected', since: existing.since?.slice(0, 10) ?? d(-30) } }))

    /* an open LO tab (same origin) updates this tab live */
    return onBridgeChange((key, value) => {
      if (key.startsWith('plink:status:')) {
        const buyerKey = key.slice('plink:status:'.length)
        setLiveStatuses((m) => ({ ...m, [buyerKey]: value }))
        if (value?.stage) {
          const c = SEED_CLIENTS.find((x) => x.financing?.buyerKey === buyerKey)
          toast(`${c ? c.name : 'A buyer'} — lender update: ${value.stage}`, '🔗')
        }
      }
      if (key === 'plink:link:julene-holly' && value?.status === 'connected')
        setLenderLinks((m) => ({ ...m, holly: { status: 'connected', since: value.since?.slice(0, 10) ?? d(0) } }))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ---------- toasts ---------- */
  const toast = useCallback((text, emoji = '✓') => {
    const id = ++idSeq.current
    setToasts((t) => [...t, { id, text, emoji }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600)
  }, [])

  const setNotifPref = useCallback((key, val) => setNotifPrefs((p) => ({ ...p, [key]: val })), [])

  /* ---------- auth & theme ---------- */
  const signIn = useCallback((agentId) => {
    if (agentId) setSeatState(agentId)
    setSignedIn(true)
    setView({ page: 'dashboard' })
  }, [])
  const signOut = useCallback(() => setSignedIn(false), [])

  const toggleTheme = useCallback(
    () =>
      setTheme((t) => {
        const next = t === 'light' ? 'dark' : 'light'
        try {
          localStorage.setItem('ahq-dark', next === 'dark' ? '1' : '0')
        } catch {
          /* storage unavailable; theme still toggles for this session */
        }
        return next
      }),
    [],
  )

  const setPalette = useCallback((id) => {
    setPaletteState(id)
    try {
      localStorage.setItem('ahq-palette', id)
    } catch {
      /* storage may be unavailable (private mode) */
    }
  }, [])

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
  }, [theme])

  useEffect(() => {
    const root = document.documentElement
    if (palette === 'evergreen') delete root.dataset.theme
    else root.dataset.theme = palette
  }, [palette])

  const currentAgent = agentById(seat)
  const lenderLink = lenderLinks[seat] ?? { status: 'none' }
  const isLinked = lenderLink.status === 'connected'

  /* ---------- navigation ---------- */
  const go = useCallback((page, extra = {}) => {
    setView({ page, ...extra })
    window.scrollTo({ top: 0 })
  }, [])

  const openClient = useCallback((id, tab = 'Overview') => go('client', { id, tab }), [go])

  const goClients = useCallback(
    (preset = {}) => {
      setCrmState({ ...DEFAULT_CRM, ...preset })
      go('clients')
    },
    [go],
  )

  const setCrm = useCallback((patch) => setCrmState((c) => ({ ...c, ...patch })), [])

  /* ---------- client mutations ---------- */
  const patchClient = useCallback((id, fn) => {
    setClients((list) => list.map((c) => (c.id === id ? fn(c) : c)))
  }, [])

  const logEvent = (c, type, text) => ({
    ...c,
    timeline: [...c.timeline, { date: d(0), type, text }],
  })

  const advanceStage = useCallback(
    (id) => {
      setClients((list) =>
        list.map((c) => {
          if (c.id !== id) return c
          const i = STAGES.indexOf(c.stage)
          const next = STAGES[i + 1]
          if (!next || c.stage === 'Closed' || c.stage === 'Lost') return c
          let nc = { ...c, stage: next, stageEnteredAt: d(0) }
          if (next === 'Under Contract' && !nc.contractDate) nc.contractDate = d(0)
          if (next === 'Closed' && !nc.closingDate) nc.closingDate = d(0)
          nc = logEvent(nc, 'stage', next === 'Closed' ? 'CLOSED — keys handed over 🔑' : `Moved to ${next}`)
          toast(next === 'Closed' ? `${c.name} — closed! 🔑🎉` : `${c.name} → ${next}`, next === 'Closed' ? '🎉' : '⚡')
          if (next === 'Closed') setCelebrate((n) => n + 1)
          return nc
        }),
      )
    },
    [toast],
  )

  const addClient = useCallback(
    (form, { navigate = true, silent = false } = {}) => {
      const id = 'c' + ++idSeq.current
      const nc = {
        type: 'buyer',
        coName: null,
        financing: { kind: 'none' },
        showingsDone: 0,
        ...form,
        id,
        agentId: form.agentId ?? seat,
        stage: form.stage ?? 'New',
        createdAt: d(0),
        stageEnteredAt: d(0),
        nextTouch: d(1),
        notes: [],
        timeline: [
          {
            date: d(0),
            type: 'created',
            text: form.viaOpenHouse
              ? `Signed in at the ${form.openHouseShort} open house`
              : `Lead created from ${form.source ?? 'manual entry'}`,
          },
        ],
      }
      setClients((list) => [nc, ...list])
      if (!silent)
        toast(form.viaOpenHouse ? `${form.name} captured — now in your pipeline` : `${form.name} added`, form.viaOpenHouse ? '🏠' : '✓')
      if (navigate) openClient(id)
      return id
    },
    [openClient, seat, toast],
  )

  const addNote = useCallback(
    (cid, text) => {
      patchClient(cid, (c) =>
        logEvent(
          { ...c, notes: [{ id: 'n' + ++idSeq.current, date: d(0), text }, ...c.notes] },
          'note',
          `Note added — “${text.length > 48 ? text.slice(0, 48) + '…' : text}”`,
        ),
      )
      toast('Note saved', '📝')
    },
    [patchClient, toast],
  )

  const setNextTouch = useCallback(
    (cid, iso) => {
      patchClient(cid, (c) => ({ ...c, nextTouch: iso }))
      toast('Follow-up scheduled', '📅')
    },
    [patchClient, toast],
  )

  /* manual financing log — the graceful no-link path */
  const logFinancingNote = useCallback(
    (cid, text) => {
      patchClient(cid, (c) =>
        logEvent(
          {
            ...c,
            financing: {
              ...c.financing,
              kind: c.financing.kind === 'none' ? 'manual' : c.financing.kind,
              notesLog: [{ date: d(0), text }, ...(c.financing.notesLog ?? [])],
            },
          },
          'financing',
          `Financing status logged — “${text}”`,
        ),
      )
      toast('Financing status logged', '🏦')
    },
    [patchClient, toast],
  )

  /* ---------- the handshake ---------- */
  const connectLender = useCallback(() => {
    setLenderLinks((m) => ({ ...m, [seat]: { status: 'invited' } }))
    toast(`Link invite sent to ${JULENE.name} at ${JULENE.org}`, '📨')
    setTimeout(() => {
      setLenderLinks((m) => ({ ...m, [seat]: { status: 'connected', since: d(0) } }))
      toast(`${JULENE.name.split(' ')[0]} accepted — you're linked 🎉`, '🔗')
    }, 1800)
  }, [seat, toast])

  /* ---------- referrals (one-tap, 30 seconds) ---------- */
  const [referralsSent, setReferralsSent] = useState(SEED_REFERRALS_SENT)
  const referralsReceived = SEED_REFERRALS_RECEIVED

  const sendReferral = useCallback(
    ({ clientId, name, phone, loanType = 'Conventional', purpose = 'Purchase' }) => {
      appendReferral({ name, phone, loanType, purpose }) // the LO app reads this
      setReferralsSent((list) => [{ id: 'r' + ++idSeq.current, name, date: d(0), note: `${loanType} · ${purpose}` }, ...list])
      if (clientId)
        patchClient(clientId, (c) =>
          logEvent(
            { ...c, financing: { ...c.financing, kind: c.financing.kind === 'none' ? 'manual' : c.financing.kind, lender: `MS Lending · ${JULENE.name} (referred)` } },
            'financing',
            `Referred to ${JULENE.name} at MS Lending`,
          ),
        )
      toast(`${name} sent to ${JULENE.name.split(' ')[0]} — she'll take it from here`, '🤝')
    },
    [patchClient, toast],
  )

  /* ---------- pre-approval letters (LO-capped) ---------- */
  const [letterCaps, setLetterCaps] = useState({ ellis: 280000, carter: 400000, lawson: 720000 })
  const [capRequests, setCapRequests] = useState({}) // buyerKey -> 'pending' | 'granted'

  const askForMoreRoom = useCallback(
    (buyerKey, clientName) => {
      setCapRequests((m) => ({ ...m, [buyerKey]: 'pending' }))
      toast(`Asked ${JULENE.name.split(' ')[0]} for more room on ${clientName}`, '📨')
      setTimeout(() => {
        setLetterCaps((m) => ({ ...m, [buyerKey]: (m[buyerKey] ?? 0) + 10000 }))
        setCapRequests((m) => ({ ...m, [buyerKey]: 'granted' }))
        toast(`Julene: “I can stretch them $10k with the higher down payment.” ✅`, '💬')
      }, 2400)
    },
    [toast],
  )

  /* ---------- milestone feed (seed + anything live) ---------- */
  const milestones = useMemo(() => {
    const live = Object.entries(liveStatuses)
      .filter(([, v]) => v?.stage)
      .map(([buyerKey, v]) => {
        const c = clients.find((x) => x.financing?.buyerKey === buyerKey)
        return {
          id: 'live-' + buyerKey,
          buyerKey,
          name: c?.name ?? buyerKey,
          date: v.updatedAt?.slice(0, 10) ?? d(0),
          text: `Live from MS Lending: ${v.stage}`,
          stage: v.stage,
          live: true,
        }
      })
    return [...live, ...SEED_MILESTONES].sort((a, z) => (a.date < z.date ? 1 : -1))
  }, [liveStatuses, clients])

  /* effective loan stage for a linked buyer (live beats seed) */
  const loanStatusFor = useCallback(
    (client) => {
      const f = client?.financing
      if (!f || f.kind !== 'linked') return null
      const live = liveStatuses[f.buyerKey]
      return {
        stage: live?.stage ?? f.loanStage,
        estClosing: live?.estClosing ?? f.estClosing,
        live: Boolean(live),
        nextStep: f.nextStep,
        preApprovedAt: letterCaps[f.buyerKey] ?? f.preApprovedAt,
      }
    },
    [liveStatuses, letterCaps],
  )

  /* ---------- tasks ---------- */
  const completeTask = useCallback(
    (id) => {
      setTasks((list) => list.map((t) => (t.id === id ? { ...t, status: 'Done' } : t)))
      toast('Task done', '✅')
    },
    [toast],
  )

  const addTask = useCallback(
    (form) => {
      setTasks((list) => [{ id: 't' + ++idSeq.current, status: 'To Do', agentId: seat, ...form }, ...list])
      toast('Task added', '➕')
    },
    [seat, toast],
  )

  const retargetTask = useCallback(
    (id, due) => {
      setTasks((list) => list.map((t) => (t.id === id ? { ...t, due } : t)))
      toast('Task rescheduled', '📅')
    },
    [toast],
  )

  const addShowing = useCallback(
    (form) => {
      setShowings((list) => [...list, { id: 's' + ++idSeq.current, agentId: seat, ...form }])
      toast('Showing scheduled', '📅')
    },
    [seat, toast],
  )

  /* ---------- open-house visitors ---------- */
  const [visitors, setVisitors] = useState({}) // listingId -> [{name, phone, hasAgent, financing}]
  const addVisitor = useCallback(
    (listingId, v) => {
      setVisitors((m) => ({ ...m, [listingId]: [...(m[listingId] ?? []), { ...v, at: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) }] }))
      const listing = listings.find((l) => l.id === listingId)
      if (!v.hasAgent) {
        addClient(
          {
            name: v.name,
            phone: v.phone,
            email: v.email ?? '',
            source: 'Open House',
            area: listing?.address.split(', ')[1] ?? 'Madison',
            budget: null,
            viaOpenHouse: true,
            openHouseShort: listing?.short ?? 'open house',
          },
          { navigate: false },
        )
      } else {
        toast(`${v.name} signed in (already has an agent)`, '✍️')
      }
    },
    [listings, addClient, toast],
  )

  /* ---------- metrics (scoped to the active seat) ---------- */
  const metrics = useMemo(() => {
    const mine = clients.filter((c) => c.agentId === seat)
    const myTasks = tasks.filter((t) => t.agentId === seat)
    const myShowings = showings.filter((s) => s.agentId === seat)
    const myListings = listings.filter((l) => l.agentId === seat)
    const myComms = commissions.filter((m) => m.agentId === seat)
    const active = mine.filter((c) => c.stage !== 'Closed' && c.stage !== 'Lost')
    const buyers = active.filter((c) => c.type !== 'seller')
    const hot = buyers.filter((c) => c.stage === 'Offer Out' || c.stage === 'Under Contract')
    const todayShowings = myShowings.filter((s) => s.date === d(0))
    const closingsSoon = active.filter((c) => c.closingDate && daysUntil(c.closingDate) >= 0 && daysUntil(c.closingDate) <= 31)
    const tasksDue = myTasks.filter((t) => t.status !== 'Done' && daysUntil(t.due) <= 0)
    const overdueTouches = active.filter((c) => c.nextTouch && daysUntil(c.nextTouch) < 0)
    const pendingGci = myComms.filter((m) => m.status === 'Pending').reduce((s, m) => s + agentCut(m, currentAgent), 0)
    const closedGci = myComms.filter((m) => m.status === 'Closed').reduce((s, m) => s + agentCut(m, currentAgent), 0)
    const activity = mine
      .flatMap((c) => c.timeline.map((e) => ({ ...e, client: c.name, clientId: c.id })))
      .sort((a, z) => (a.date < z.date ? 1 : -1))
      .slice(0, 8)
    return { mine, active, buyers, hot, todayShowings, closingsSoon, tasksDue, overdueTouches, pendingGci, closedGci, myListings, activity }
  }, [clients, tasks, showings, listings, commissions, seat, currentAgent])

  const value = {
    view,
    go,
    openClient,
    goClients,
    crm,
    setCrm,
    clients,
    listings,
    tasks,
    showings,
    commissions,
    toasts,
    toast,
    metrics,
    advanceStage,
    addClient,
    addNote,
    setNextTouch,
    logFinancingNote,
    completeTask,
    addTask,
    retargetTask,
    addShowing,
    visitors,
    addVisitor,
    seat,
    currentAgent,
    signedIn,
    signIn,
    signOut,
    theme,
    toggleTheme,
    palette,
    setPalette,
    notifPrefs,
    setNotifPref,
    celebrate,
    /* lender link */
    lenderLink,
    isLinked,
    connectLender,
    referralsSent,
    referralsReceived,
    sendReferral,
    milestones,
    loanStatusFor,
    letterCaps,
    capRequests,
    askForMoreRoom,
    julene: JULENE,
    nextActionLabel: (c) => NEXT_ACTION_LABEL[c.stage],
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
