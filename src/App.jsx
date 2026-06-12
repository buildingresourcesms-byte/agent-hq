import { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  Users,
  Home,
  CalendarDays,
  DoorOpen,
  PiggyBank,
  Landmark,
  Settings as SettingsIcon,
  Menu,
  X,
  Bell,
  Search,
  CornerDownLeft,
  Plus,
  Check,
  CheckCircle2,
  ChevronsUpDown,
  AlarmClock,
  Sparkles,
  KeyRound,
  Sun,
  Moon,
  LogOut,
} from 'lucide-react'
import { AppProvider, useApp } from './store.jsx'
import { AGENTS, SOURCES, AREAS, daysUntil, timeOfDay, SKY, DISCLAIMER, fmtDate } from './data.js'
import { BrandMark, Btn, Modal, Field, Select, inputCls, cx } from './ui.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Clients from './pages/Clients.jsx'
import ClientFile from './pages/ClientFile.jsx'
import Listings from './pages/Listings.jsx'
import Calendar from './pages/Calendar.jsx'
import OpenHouse from './pages/OpenHouse.jsx'
import Commissions from './pages/Commissions.jsx'
import Financing from './pages/Financing.jsx'
import Settings from './pages/Settings.jsx'
import Landing from './pages/Landing.jsx'

const NAV_MAIN = [
  { page: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { page: 'clients', label: 'Clients', icon: Users },
  { page: 'listings', label: 'Listings', icon: Home },
  { page: 'calendar', label: 'Calendar', icon: CalendarDays },
  { page: 'openhouse', label: 'Open House Kit', icon: DoorOpen },
  { page: 'commissions', label: 'Commissions', icon: PiggyBank },
]
const NAV_SYSTEM = [{ page: 'settings', label: 'Settings', icon: SettingsIcon }]

/* ---------------- new client modal ---------------- */
function NewClientModal({ open, onClose }) {
  const { addClient } = useApp()
  const blank = { name: '', phone: '', email: '', type: 'buyer', budget: '', area: 'Madison', source: 'Referral', wishlist: '' }
  const [form, setForm] = useState(blank)
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }))

  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    addClient({ ...form, name: form.name.trim(), budget: Number(form.budget) || null })
    setForm(blank)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Add a client" sub="30 seconds now beats a lost napkin number later." wide>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Name *">
            <input
              autoFocus
              required
              className={inputCls}
              placeholder="e.g. The Hendersons"
              value={form.name}
              onChange={(e) => set('name')(e.target.value)}
            />
          </Field>
          <Field label="Phone">
            <input className={inputCls} placeholder="(601) 555-0123" value={form.phone} onChange={(e) => set('phone')(e.target.value)} />
          </Field>
          <Field label="Email" className="sm:col-span-2">
            <input type="email" className={inputCls} placeholder="name@email.com" value={form.email} onChange={(e) => set('email')(e.target.value)} />
          </Field>
          <Field label="Buyer or seller?">
            <Select value={form.type} onChange={set('type')} options={[{ value: 'buyer', label: 'Buyer' }, { value: 'seller', label: 'Seller' }]} />
          </Field>
          <Field label={form.type === 'seller' ? 'Hoped-for price' : 'Budget'}>
            <input type="number" min="0" step="5000" className={inputCls} placeholder="350000" value={form.budget} onChange={(e) => set('budget')(e.target.value)} />
          </Field>
          <Field label="Area">
            <Select value={form.area} onChange={set('area')} options={AREAS} />
          </Field>
          <Field label="How'd they find you?">
            <Select value={form.source} onChange={set('source')} options={SOURCES} />
          </Field>
          <Field label="Wish list" className="sm:col-span-2">
            <input className={inputCls} placeholder="3BR, fenced yard, good schools…" value={form.wishlist} onChange={(e) => set('wishlist')(e.target.value)} />
          </Field>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn type="submit">
            <Plus className="h-3.5 w-3.5" /> Add client
          </Btn>
        </div>
      </form>
    </Modal>
  )
}

/* ---------------- sidebar ---------------- */
function NavItem({ page, label, icon: Icon, active, onGo, dot }) {
  return (
    <button
      onClick={() => onGo(page)}
      className={cx(
        'flex h-8 w-full items-center gap-2.5 rounded-lg px-2.5 text-[13px] transition-colors',
        active ? 'bg-white/[0.08] font-medium text-white' : 'text-forest-300 hover:bg-white/[0.04] hover:text-white',
      )}
    >
      <Icon className="h-4 w-4" strokeWidth={1.75} />
      <span className="flex-1 text-left">{label}</span>
      {dot && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold-400" />}
    </button>
  )
}

/* ---------------- seat switcher (which agent is signed in) ---------------- */
function SeatSwitcher() {
  const { seat, signIn, signOut, currentAgent } = useApp()
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full left-0 z-20 mb-2 w-full overflow-hidden rounded-xl border border-white/10 bg-forest-900 p-1 shadow-[0_16px_44px_-8px_rgba(0,0,0,0.6)]">
            <p className="px-2.5 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-forest-400">Signed in as</p>
            {AGENTS.map((a) => (
              <button
                key={a.id}
                onClick={() => {
                  signIn(a.id)
                  setOpen(false)
                }}
                className={cx(
                  'flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-white/[0.06]',
                  seat === a.id && 'bg-white/[0.04]',
                )}
              >
                <span className={cx('grid h-7 w-7 shrink-0 place-items-center rounded-full text-[10px] font-semibold text-white', a.color)}>
                  {a.initials}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-medium text-white">{a.name}</span>
                  <span className="block truncate text-[10px] text-forest-400">{a.brokerage}</span>
                </span>
                {seat === a.id && <Check className="h-4 w-4 shrink-0 text-gold-400" />}
              </button>
            ))}
            <div className="my-1 border-t border-white/[0.08]" />
            <button
              onClick={() => {
                setOpen(false)
                signOut()
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-white/[0.06]"
            >
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/10">
                <LogOut className="h-3.5 w-3.5 text-forest-200" strokeWidth={2} />
              </span>
              <span className="block flex-1 truncate text-xs font-medium text-white">Sign out</span>
            </button>
          </div>
        </>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2.5 rounded-lg px-1.5 py-1.5 transition-colors hover:bg-white/[0.04]"
      >
        <span className={cx('grid h-7 w-7 shrink-0 place-items-center rounded-full text-[10px] font-semibold text-white', currentAgent.color)}>
          {currentAgent.initials}
        </span>
        <span className="min-w-0 flex-1 text-left">
          <span className="block truncate text-xs font-medium text-white">{currentAgent.name}</span>
          <span className="block truncate text-[10px] text-forest-400">{currentAgent.brokerage}</span>
        </span>
        <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-forest-400" />
      </button>
    </div>
  )
}

function Sidebar({ mobileOpen, onCloseMobile }) {
  const { view, go, isLinked } = useApp()
  const activePage = view.page === 'client' ? 'clients' : view.page
  const onGo = (page) => {
    go(page)
    onCloseMobile()
  }

  const nav = (
    <div className="relative isolate flex h-full flex-col">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-44"
        style={{ background: `radial-gradient(125% 70% at 50% 0%, ${SKY[timeOfDay()].accent}, transparent 72%)` }}
      />
      <div className="flex items-center gap-2.5 px-4 pb-5 pt-5">
        <BrandMark className="h-8 w-8" />
        <div className="min-w-0">
          <p className="text-[13px] font-semibold leading-4 text-white">AgentHQ</p>
          <p className="text-[11px] leading-4 text-forest-400">Your Workspace</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-3">
        {NAV_MAIN.map((item) => (
          <NavItem key={item.page} {...item} active={activePage === item.page} onGo={onGo} />
        ))}
        <p className="px-2.5 pb-1 pt-5 text-[10px] font-semibold uppercase tracking-wider text-forest-500">Lender link</p>
        <NavItem
          page="financing"
          label="Financing"
          icon={Landmark}
          active={activePage === 'financing'}
          onGo={onGo}
          dot={isLinked}
        />
      </nav>

      <div className="space-y-3 px-3 pb-4">
        {NAV_SYSTEM.map((item) => (
          <NavItem key={item.page} {...item} active={activePage === item.page} onGo={onGo} />
        ))}
        <div className="border-t border-white/[0.08] pt-2">
          <SeatSwitcher />
          <p className="mt-2 px-1 text-[10px] leading-relaxed text-forest-500">{DISCLAIMER}</p>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 border-r border-white/[0.06] bg-forest-950 lg:block">{nav}</aside>
      {/* mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="animate-fadein absolute inset-0 bg-forest-950/45" onClick={onCloseMobile} />
          <aside className="animate-slidein absolute inset-y-0 left-0 w-68 max-w-[80vw] bg-forest-950 shadow-2xl">
            <button
              onClick={onCloseMobile}
              aria-label="Close menu"
              className="absolute right-3 top-4 rounded-md p-1.5 text-forest-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-4.5 w-4.5" />
            </button>
            {nav}
          </aside>
        </div>
      )}
    </>
  )
}

/* ---------------- theme toggle ---------------- */
function ThemeToggle() {
  const { theme, toggleTheme } = useApp()
  const dark = theme === 'dark'
  return (
    <button
      onClick={toggleTheme}
      className="rounded-lg p-2 text-forest-200 transition-colors hover:bg-white/10 hover:text-white"
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Light mode' : 'Dark mode'}
    >
      {dark ? <Sun className="h-4 w-4" strokeWidth={1.75} /> : <Moon className="h-4 w-4" strokeWidth={1.75} />}
    </button>
  )
}

/* ---------------- ⌘K command palette ---------------- */
const PALETTE_PAGES = [
  ['dashboard', 'Dashboard'],
  ['clients', 'Clients'],
  ['listings', 'Listings'],
  ['calendar', 'Calendar'],
  ['openhouse', 'Open House Kit'],
  ['commissions', 'Commissions'],
  ['financing', 'Financing'],
  ['settings', 'Settings'],
]

function CommandPalette({ open, onClose }) {
  const { clients, listings, seat, openClient, go } = useApp()
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (open) {
      setQ('')
      setActive(0)
    }
  }, [open])

  if (!open) return null

  const query = q.trim().toLowerCase()
  const mine = clients.filter((c) => c.agentId === seat)
  const clientItems = (query ? mine.filter((c) => `${c.name} ${c.phone} ${c.email} ${c.area}`.toLowerCase().includes(query)) : mine)
    .slice(0, 6)
    .map((c) => ({ kind: 'Client', label: c.name, sub: `${c.stage} · ${c.area}`, onSelect: () => openClient(c.id) }))
  const listingItems = (query ? listings.filter((l) => l.agentId === seat && l.address.toLowerCase().includes(query)) : [])
    .slice(0, 4)
    .map((l) => ({ kind: 'Listing', label: l.short, sub: l.status, onSelect: () => go('listings') }))
  const pageItems = PALETTE_PAGES.filter(([, l]) => !query || l.toLowerCase().includes(query)).map(([p, l]) => ({
    kind: 'Go to',
    label: l,
    onSelect: () => go(p),
  }))
  const items = [...clientItems, ...listingItems, ...pageItems]
  const clampedActive = Math.min(active, Math.max(0, items.length - 1))

  const pick = (i) => {
    const it = items[i]
    if (it) {
      it.onSelect()
      onClose()
    }
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => Math.min(i + 1, items.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      pick(clampedActive)
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-[70] px-4 pt-[12vh]">
      <div className="animate-fadein fixed inset-0 bg-forest-950/40" onClick={onClose} />
      <div className="animate-modalin relative mx-auto w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_60px_-12px_rgba(17,36,28,0.35)] dark:border-white/10 dark:bg-forest-900">
        <div className="flex items-center gap-2.5 border-b border-slate-100 px-4 dark:border-white/10">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            autoFocus
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              setActive(0)
            }}
            onKeyDown={onKeyDown}
            placeholder="Search clients, listings, pages…"
            className="h-12 w-full bg-transparent text-[14px] text-slate-700 placeholder:text-slate-400 focus:outline-none dark:text-slate-200"
          />
          <kbd className="hidden rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 sm:block dark:border-white/10 dark:bg-white/5">
            Esc
          </kbd>
        </div>
        {items.length === 0 ? (
          <p className="px-4 py-8 text-center text-[13px] text-slate-400">No matches for “{q}”.</p>
        ) : (
          <ul className="max-h-80 overflow-y-auto p-1.5">
            {items.map((it, i) => (
              <li key={i}>
                <button
                  onMouseEnter={() => setActive(i)}
                  onClick={() => pick(i)}
                  className={cx(
                    'flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors',
                    i === clampedActive ? 'bg-forest-50 dark:bg-white/[0.06]' : 'hover:bg-slate-50 dark:hover:bg-white/5',
                  )}
                >
                  <span className="w-16 shrink-0 text-[10px] font-semibold uppercase tracking-wide text-slate-400">{it.kind}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium text-forest-950 dark:text-white">{it.label}</span>
                    {it.sub && <span className="block truncate text-xs text-slate-400">{it.sub}</span>}
                  </span>
                  {i === clampedActive && <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-slate-400" />}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

/* ---------------- notification bell ---------------- */
function NotificationBell() {
  const { metrics, milestones, isLinked, notifPrefs, openClient, go } = useApp()
  const [open, setOpen] = useState(false)

  const items = [
    ...(notifPrefs.showings
      ? metrics.todayShowings.map((s) => ({
          key: 'sh' + s.id,
          icon: KeyRound,
          tone: 'bg-sky-50 text-sky-600',
          text: `Showing today · ${s.time}`,
          sub: s.address,
          onClick: () => go('calendar'),
        }))
      : []),
    ...(notifPrefs.deadlines
      ? metrics.overdueTouches.map((c) => ({
          key: 'o' + c.id,
          icon: AlarmClock,
          tone: 'bg-rose-50 text-rose-600',
          text: 'Follow-up overdue',
          sub: `${c.name} · ${-daysUntil(c.nextTouch)}d`,
          onClick: () => openClient(c.id),
        }))
      : []),
    ...(notifPrefs.financing && isLinked
      ? milestones.slice(0, 3).map((m) => ({
          key: m.id,
          icon: Sparkles,
          tone: 'bg-forest-50 text-forest-600',
          text: m.text,
          sub: `${m.name} · ${fmtDate(m.date)}`,
          onClick: () => go('financing'),
        }))
      : []),
  ]
  const count = items.length

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-lg p-2 text-forest-200 transition-colors hover:bg-white/10 hover:text-white"
        aria-label={`Notifications${count ? ` (${count})` : ''}`}
      >
        <Bell className="h-4 w-4" strokeWidth={1.75} />
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-gold-500 px-1 text-[9px] font-bold text-white ring-2 ring-forest-950 tabular-nums">
            {count}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_16px_44px_-8px_rgba(17,36,28,0.25)] dark:border-white/10 dark:bg-forest-900">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5 dark:border-white/10">
              <p className="text-[13px] font-semibold text-forest-950 dark:text-white">Notifications</p>
              {count > 0 && <span className="text-[11px] text-slate-400 tabular-nums">{count} to see</span>}
            </div>
            {count === 0 ? (
              <div className="grid place-items-center px-6 py-8 text-center">
                <CheckCircle2 className="mb-2 h-6 w-6 text-forest-400" strokeWidth={1.5} />
                <p className="text-[13px] font-medium text-slate-600 dark:text-slate-300">You’re all caught up</p>
                <p className="mt-0.5 text-xs text-slate-400">No showings, overdue touches, or lender updates.</p>
              </div>
            ) : (
              <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto dark:divide-white/[0.06]">
                {items.map((n) => {
                  const Icon = n.icon
                  return (
                    <li key={n.key}>
                      <button
                        onClick={() => {
                          n.onClick()
                          setOpen(false)
                        }}
                        className="flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-white/5"
                      >
                        <span className={cx('mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full', n.tone)}>
                          <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-medium text-slate-700 dark:text-slate-200">{n.text}</span>
                          <span className="block truncate text-xs text-slate-400">{n.sub}</span>
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  )
}

/* ---------------- topbar ---------------- */
function Topbar({ onMenu, onNewClient, onOpenPalette }) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-forest-950 transition-colors duration-300">
      <div className="mx-auto flex h-[52px] max-w-6xl items-center gap-3 px-4 sm:px-6">
        <button onClick={onMenu} aria-label="Open menu" className="rounded-lg p-1.5 text-forest-200 transition-colors hover:bg-white/10 lg:hidden">
          <Menu className="h-4.5 w-4.5" />
        </button>
        <BrandMark className="h-7 w-7 shrink-0 lg:hidden" />
        <button
          onClick={onOpenPalette}
          className="hidden h-9 w-72 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.07] px-2.5 text-[13px] text-forest-200 transition-colors hover:border-white/25 hover:bg-white/10 sm:flex"
        >
          <Search className="h-3.5 w-3.5" />
          Search clients, listings, pages…
          <kbd className="ml-auto rounded border border-white/10 bg-white/10 px-1 text-[10px] font-medium text-forest-200">⌘K</kbd>
        </button>
        <button onClick={onOpenPalette} aria-label="Search" className="rounded-lg p-1.5 text-forest-200 transition-colors hover:bg-white/10 sm:hidden">
          <Search className="h-4.5 w-4.5" />
        </button>
        <div className="ml-auto flex items-center gap-1.5">
          <ThemeToggle />
          <NotificationBell />
          <Btn variant="gold" onClick={onNewClient}>
            <Plus className="h-3.5 w-3.5" /> <span className="hidden sm:inline">New Client</span>
          </Btn>
        </div>
      </div>
    </header>
  )
}

/* ---------------- closing-day confetti ---------------- */
const CONFETTI_COLORS = [
  'var(--color-forest-500)',
  'var(--color-gold-400)',
  'var(--color-forest-300)',
  '#f59e0b',
  '#38bdf8',
  '#f43f5e',
]

function Confetti() {
  const { celebrate } = useApp()
  const [burst, setBurst] = useState(null)

  useEffect(() => {
    if (!celebrate) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const pieces = Array.from({ length: 44 }, (_, i) => ({
      id: `${celebrate}-${i}`,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      dur: 1.8 + Math.random() * 1.4,
      size: 6 + Math.random() * 6,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      round: i % 3 === 0,
    }))
    setBurst(pieces)
    const t = setTimeout(() => setBurst(null), 3800)
    return () => clearTimeout(t)
  }, [celebrate])

  if (!burst) return null
  return (
    <div className="pointer-events-none fixed inset-0 z-[80] overflow-hidden" aria-hidden="true">
      {burst.map((p) => (
        <span
          key={p.id}
          className={cx('animate-confetti absolute top-0', p.round ? 'rounded-full' : 'rounded-[2px]')}
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * (p.round ? 1 : 0.6),
            backgroundColor: p.color,
            '--confetti-dur': `${p.dur}s`,
            '--confetti-delay': `${p.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

/* ---------------- toasts ---------------- */
function Toasts() {
  const { toasts } = useApp()
  return (
    <div className="pointer-events-none fixed bottom-20 right-4 z-[60] space-y-2 sm:bottom-5 sm:right-5">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="animate-slidein flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white py-2.5 pl-3 pr-4 text-[13px] font-medium text-slate-700 shadow-[0_8px_24px_-8px_rgba(17,36,28,0.18)] dark:border-white/10 dark:bg-forest-900 dark:text-slate-200"
        >
          <span className="shrink-0 text-sm leading-none" aria-hidden="true">{t.emoji}</span>
          {t.text}
        </div>
      ))}
    </div>
  )
}

/* ---------------- mobile bottom nav ---------------- */
function MobileNav({ onMenu }) {
  const { view, go } = useApp()
  const active = view.page === 'client' ? 'clients' : view.page
  const items = [
    { page: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { page: 'clients', label: 'Clients', icon: Users },
    { page: 'calendar', label: 'Calendar', icon: CalendarDays },
    { page: 'financing', label: 'Financing', icon: Landmark },
  ]
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-sm lg:hidden dark:border-white/10 dark:bg-forest-950/95"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto flex max-w-md items-stretch justify-around">
        {items.map((it) => {
          const Icon = it.icon
          const isActive = active === it.page
          return (
            <button
              key={it.page}
              onClick={() => go(it.page)}
              className={cx(
                'relative flex min-h-[3.25rem] flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors',
                isActive ? 'text-forest-800 dark:text-white' : 'text-slate-400',
              )}
            >
              {isActive && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-gold-500" />}
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.2 : 1.75} />
              {it.label}
            </button>
          )
        })}
        <button
          onClick={onMenu}
          className="flex min-h-[3.25rem] flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium text-slate-400"
        >
          <Menu className="h-5 w-5" strokeWidth={1.75} />
          More
        </button>
      </div>
    </nav>
  )
}

/* ---------------- shell ---------------- */
function Shell() {
  const { view } = useApp()
  const [menuOpen, setMenuOpen] = useState(false)
  const [clientOpen, setClientOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="min-h-screen">
      <Sidebar mobileOpen={menuOpen} onCloseMobile={() => setMenuOpen(false)} />
      <div className="lg:pl-60">
        <Topbar onMenu={() => setMenuOpen(true)} onNewClient={() => setClientOpen(true)} onOpenPalette={() => setPaletteOpen(true)} />
        <main className="mx-auto max-w-6xl px-4 pb-24 pt-6 sm:px-6 lg:pb-6">
          {view.page === 'dashboard' && <Dashboard />}
          {view.page === 'clients' && <Clients onNewClient={() => setClientOpen(true)} />}
          {view.page === 'client' && <ClientFile key={view.id} id={view.id} initialTab={view.tab} />}
          {view.page === 'listings' && <Listings />}
          {view.page === 'calendar' && <Calendar />}
          {view.page === 'openhouse' && <OpenHouse initialId={view.id} />}
          {view.page === 'commissions' && <Commissions />}
          {view.page === 'financing' && <Financing />}
          {view.page === 'settings' && <Settings />}
        </main>
        <footer className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
          <p className="border-t border-slate-200/70 pt-4 text-center text-[11px] text-slate-400 dark:border-white/10">
            AgentHQ — a concept workspace for real-estate agents. {DISCLAIMER}
          </p>
        </footer>
      </div>
      <MobileNav onMenu={() => setMenuOpen(true)} />
      <Confetti />
      <Toasts />
      <NewClientModal open={clientOpen} onClose={() => setClientOpen(false)} />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  )
}

function Root() {
  const { signedIn } = useApp()
  return signedIn ? <Shell /> : <Landing />
}

export default function App() {
  return (
    <AppProvider>
      <Root />
    </AppProvider>
  )
}
