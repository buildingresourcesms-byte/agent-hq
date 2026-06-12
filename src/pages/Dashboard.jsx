import {
  Users,
  Flame,
  KeyRound,
  ListChecks,
  PiggyBank,
  Home,
  ArrowRight,
  CalendarDays,
  Landmark,
  Sparkles,
  MapPin,
  Check,
} from 'lucide-react'
import { useApp } from '../store.jsx'
import {
  ACTIVE_STAGES,
  STAGE_STYLES,
  SKY,
  timeOfDay,
  money,
  moneyK,
  fmtDate,
  relDate,
  daysUntil,
  calendarEvents,
  CAL_TYPES,
  d,
  addDaysISO,
} from '../data.js'
import { Card, Stat, Btn, StageBadge, EmptyState, cx } from '../ui.jsx'

const STARS = [
  ['14%', '24%'],
  ['22%', '58%'],
  ['30%', '34%'],
  ['18%', '78%'],
  ['40%', '66%'],
  ['52%', '20%'],
]

export default function Dashboard() {
  const { metrics, clients, listings, tasks, showings, seat, currentAgent, goClients, go, openClient, completeTask, isLinked, milestones, loanStatusFor } = useApp()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const sky = SKY[timeOfDay()]
  const firstName = currentAgent.name.split(' ')[0]
  const todayLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  const pipeline = ACTIVE_STAGES.map((s) => ({
    label: s,
    count: metrics.buyers.filter((c) => c.stage === s).length,
    color: STAGE_STYLES[s].bar,
  }))
  const maxCount = Math.max(1, ...pipeline.map((p) => p.count))

  /* week-at-a-glance strip */
  const today = d(0)
  const week = Array.from({ length: 7 }, (_, i) => addDaysISO(today, i))
  const weekEvents = calendarEvents(clients, listings, tasks, showings, seat)
  const eventsOn = (iso) => weekEvents.filter((e) => e.date === iso)

  const linkedBuyers = metrics.mine.filter((c) => c.financing?.kind === 'linked' && c.stage !== 'Closed')

  return (
    <div className="space-y-5">
      {/* ---------- greeting hero (time-of-day sky) ---------- */}
      <div className={cx('relative overflow-hidden rounded-2xl bg-gradient-to-br p-5 ring-1 ring-black/[0.04] sm:p-6', sky.grad)}>
        <div className="pointer-events-none absolute inset-0">
          {sky.moon &&
            STARS.map(([top, left], i) => (
              <span key={i} className="animate-twinkle absolute h-1 w-1 rounded-full bg-white" style={{ top, left, animationDelay: `${i * 0.45}s` }} />
            ))}
          <div className="animate-sunrise absolute -right-4 -top-10">
            <div className="relative">
              <div className={cx('absolute -inset-10 rounded-full blur-2xl', sky.glow)} />
              <div className="animate-floaty h-28 w-28 rounded-full sm:h-32 sm:w-32" style={{ background: sky.orbBg, boxShadow: sky.shadow }} />
            </div>
          </div>
        </div>

        <div className="relative z-10 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className={cx('text-xs', sky.muted)}>{todayLabel}</p>
            <h1 className={cx('mt-0.5 text-2xl font-semibold tracking-tight', sky.text)}>
              {greeting}, {firstName}
            </h1>
            <p className={cx('mt-1 text-[13px]', sky.muted)}>
              {metrics.todayShowings.length
                ? `${metrics.todayShowings.length} showing${metrics.todayShowings.length > 1 ? 's' : ''} today · ${metrics.tasksDue.length} task${metrics.tasksDue.length === 1 ? '' : 's'} due`
                : `No showings today · ${metrics.tasksDue.length} task${metrics.tasksDue.length === 1 ? '' : 's'} due`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Btn variant="outline" onClick={() => goClients()}>View pipeline</Btn>
            <Btn onClick={() => go('calendar')}>
              Today’s schedule
              <span className="rounded bg-white/15 px-1.5 text-xs tabular-nums">{eventsOn(today).length}</span>
            </Btn>
          </div>
        </div>
      </div>

      {/* ---------- stat cards ---------- */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Stat icon={KeyRound} label="Showings today" value={metrics.todayShowings.length} accent="sky" onClick={() => go('calendar')} />
        <Stat icon={Flame} label="Hot buyers" value={metrics.hot.length} accent="rose" onClick={() => goClients({ stage: 'Offer Out' })} />
        <Stat icon={Landmark} label="Closings this month" value={metrics.closingsSoon.length} accent="forest" onClick={() => go('calendar')} />
        <Stat icon={ListChecks} label="Tasks due" value={metrics.tasksDue.length} accent="violet" onClick={() => go('calendar')} />
        <Stat icon={Home} label="Active listings" value={metrics.myListings.filter((l) => l.status !== 'Sold').length} accent="gold" onClick={() => go('listings')} />
        <Stat icon={PiggyBank} label="Pending GCI" value={moneyK(metrics.pendingGci)} accent="amber" onClick={() => go('commissions')} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* ---------- today + week strip ---------- */}
        <Card title="This week" sub="Tap a day to open the calendar" className="lg:col-span-2" pad={false}>
          <div className="grid grid-cols-7 divide-x divide-slate-100 dark:divide-white/[0.06]">
            {week.map((iso) => {
              const evts = eventsOn(iso)
              const isToday = iso === today
              return (
                <button
                  key={iso}
                  onClick={() => go('calendar')}
                  className={cx('flex min-h-[5.5rem] flex-col items-center gap-1 px-1 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.04]', isToday && 'bg-forest-50/60 dark:bg-white/[0.06]')}
                >
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    {new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                  <span className={cx('grid h-6 w-6 place-items-center rounded-full text-xs tabular-nums', isToday ? 'bg-forest-900 font-bold text-white dark:bg-white dark:text-forest-950' : 'font-medium text-slate-600 dark:text-slate-300')}>
                    {Number(iso.slice(8, 10))}
                  </span>
                  <span className="flex flex-wrap items-center justify-center gap-0.5 px-1">
                    {evts.slice(0, 4).map((e) => (
                      <span key={e.id} className={cx('h-1.5 w-1.5 rounded-full', CAL_TYPES[e.type].chip)} />
                    ))}
                  </span>
                </button>
              )
            })}
          </div>
          <div className="border-t border-slate-100 dark:border-white/10">
            {metrics.todayShowings.length === 0 ? (
              <EmptyState icon={CalendarDays} title="No showings on the books today" sub="Enjoy it — or go make some calls. 😄" />
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                {metrics.todayShowings.map((s) => {
                  const c = clients.find((x) => x.id === s.clientId)
                  return (
                    <li key={s.id} className="flex items-center gap-3 px-5 py-3">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-sky-50 text-sky-600 ring-1 ring-inset ring-sky-600/20 dark:bg-sky-500/15">
                        <KeyRound className="h-4 w-4" strokeWidth={1.75} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium text-forest-950 dark:text-white">
                          {s.time} — {c?.name ?? 'Showing'}
                        </p>
                        <p className="flex items-center gap-1 truncate text-xs text-slate-400">
                          <MapPin className="h-3 w-3" /> {s.address}
                        </p>
                      </div>
                      {c && (
                        <button onClick={() => openClient(c.id)} className="text-xs font-medium text-forest-600 transition-colors hover:text-forest-900 dark:text-slate-300 dark:hover:text-white">
                          Open <ArrowRight className="inline h-3 w-3" />
                        </button>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </Card>

        {/* ---------- tasks due ---------- */}
        <Card title="Tasks due" sub={`${metrics.tasksDue.length} need you today`} pad={false}>
          {metrics.tasksDue.length === 0 ? (
            <EmptyState icon={Check} title="All clear" sub="Nothing due today." />
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-white/[0.06]">
              {metrics.tasksDue.slice(0, 6).map((t) => {
                const c = clients.find((x) => x.id === t.clientId)
                const overdue = daysUntil(t.due) < 0
                return (
                  <li key={t.id} className="flex items-start gap-2.5 px-4 py-2.5">
                    <button
                      onClick={() => completeTask(t.id)}
                      aria-label={`Mark "${t.title}" done`}
                      className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border border-slate-300 text-transparent transition-colors hover:border-forest-500 hover:text-forest-500 dark:border-white/20"
                    >
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium leading-snug text-slate-700 dark:text-slate-200">{t.title}</p>
                      <p className="mt-0.5 truncate text-xs text-slate-400">
                        {c ? c.name + ' · ' : ''}
                        <span className={overdue ? 'font-medium text-rose-600' : ''}>{relDate(t.due)}</span>
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
          <div className="border-t border-slate-100 px-4 py-2.5 dark:border-white/10">
            <button onClick={() => go('calendar')} className="text-xs font-medium text-forest-600 transition-colors hover:text-forest-900 dark:text-slate-300 dark:hover:text-white">
              See the whole calendar →
            </button>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* ---------- hot buyers ---------- */}
        <Card title="Hot buyers" sub="Offers out & under contract" className="lg:col-span-2" pad={false}>
          {metrics.hot.length === 0 ? (
            <EmptyState icon={Flame} title="No hot deals right now" sub="Tour more, offer more. 🔑" />
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-white/[0.06]">
              {metrics.hot.map((c) => {
                const fin = loanStatusFor(c)
                return (
                  <li key={c.id}>
                    <button onClick={() => openClient(c.id)} className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.04]">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-forest-100 text-[11px] font-semibold text-forest-800 dark:bg-white/10 dark:text-white">
                        {c.name.split(' ').map((w) => w[0]).filter((ch) => /[A-Z]/.test(ch)).slice(0, 2).join('')}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium text-forest-950 dark:text-white">{c.name}</p>
                        <p className="truncate text-xs text-slate-400">
                          {c.property ?? `${c.area} · budget ${c.budget ? money(c.budget) : '—'}`}
                          {c.closingDate && ` · closes ${fmtDate(c.closingDate)}`}
                        </p>
                      </div>
                      {fin && (
                        <span className="hidden items-center gap-1 rounded-md bg-forest-50 px-2 py-0.5 text-[11px] font-medium text-forest-700 ring-1 ring-inset ring-forest-600/20 sm:flex dark:bg-forest-500/15 dark:text-forest-200">
                          <Sparkles className="h-3 w-3" /> {fin.stage}
                        </span>
                      )}
                      <StageBadge stage={c.stage} />
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>

        {/* ---------- pipeline + lender pulse ---------- */}
        <div className="space-y-4">
          <Card title="Buyer pipeline" sub={`${metrics.buyers.length} active buyers`}>
            <div className="space-y-2.5">
              {pipeline.map((p) => (
                <button key={p.label} onClick={() => goClients({ stage: p.label })} className="group flex w-full items-center gap-2 text-left">
                  <span className="w-[7.5rem] shrink-0 truncate text-xs text-slate-500 transition-colors group-hover:text-forest-900 dark:text-slate-400 dark:group-hover:text-white">
                    {p.label}
                  </span>
                  <span className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                    <span className="block h-full rounded-full transition-all duration-300" style={{ width: `${(p.count / maxCount) * 100}%`, backgroundColor: p.color }} />
                  </span>
                  <span className="w-5 text-right text-xs font-semibold text-forest-950 tabular-nums dark:text-white">{p.count}</span>
                </button>
              ))}
            </div>
          </Card>

          {isLinked ? (
            <Card
              title="Financing pulse"
              sub="Live from your lender link"
              pad={false}
              action={
                <span className="flex items-center gap-1.5 text-[11px] font-medium text-forest-600 dark:text-forest-300">
                  <span className="animate-livedot h-1.5 w-1.5 rounded-full bg-forest-500" /> linked
                </span>
              }
            >
              <ul className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                {linkedBuyers.slice(0, 3).map((c) => {
                  const fin = loanStatusFor(c)
                  return (
                    <li key={c.id}>
                      <button onClick={() => openClient(c.id, 'Financing')} className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.04]">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-medium text-forest-950 dark:text-white">{c.name}</p>
                          <p className="truncate text-xs text-slate-400">{fin?.stage} · est. {fmtDate(fin?.estClosing)}</p>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                      </button>
                    </li>
                  )
                })}
              </ul>
              <div className="border-t border-slate-100 px-4 py-2.5 dark:border-white/10">
                <button onClick={() => go('financing')} className="text-xs font-medium text-forest-600 transition-colors hover:text-forest-900 dark:text-slate-300 dark:hover:text-white">
                  Open Financing →
                </button>
              </div>
            </Card>
          ) : (
            <Card title="Financing" sub="No lender linked — that's fine">
              <p className="text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
                Your buyers’ financing lives on each client card. Want live updates instead of
                “any update?” texts? Link a loan officer once and it flows by itself.
              </p>
              <Btn variant="soft" className="mt-3 w-full" onClick={() => go('financing')}>
                <Landmark className="h-3.5 w-3.5" /> See how the link works
              </Btn>
            </Card>
          )}
        </div>
      </div>

      {/* ---------- recent activity ---------- */}
      <Card title="Recent activity" sub="Across all your clients" pad={false}>
        <ul className="divide-y divide-slate-100 dark:divide-white/[0.06]">
          {metrics.activity.map((e, i) => (
            <li key={i}>
              <button onClick={() => openClient(e.clientId)} className="flex w-full items-center gap-3 px-5 py-2.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.04]">
                <span className="w-16 shrink-0 text-[11px] text-slate-400 tabular-nums">{fmtDate(e.date)}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] text-slate-600 dark:text-slate-300">{e.text}</span>
                  <span className="block truncate text-xs text-slate-400">{e.client}</span>
                </span>
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />
              </button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
