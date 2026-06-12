import { Sun, Moon, Check, Link2, Unlink } from 'lucide-react'
import { useApp } from '../store.jsx'
import { fmtDate } from '../data.js'
import { PageHeader, Card, Toggle, Badge, KV, Btn, cx } from '../ui.jsx'

/* the selectable palettes (match index.css data-theme blocks) */
const PALETTES = [
  { id: 'evergreen', label: 'Evergreen', emoji: '🌲', chip: ['#1c362b', '#d4a437', '#f5f6f2'] },
  { id: 'rosewood', label: 'Rosewood', emoji: '🌹', chip: ['#402227', '#d23f62', '#f8f3f2'] },
  { id: 'delta', label: 'Delta', emoji: '🌾', chip: ['#3a2418', '#cf6a1f', '#f6eedd'] },
  { id: 'gulf', label: 'Gulf', emoji: '🌊', chip: ['#11303f', '#d14e34', '#e7f2f5'] },
  { id: 'midnight', label: 'Midnight', emoji: '🌃', chip: ['#20263d', '#348e98', '#eef1f8'] },
]

const NOTIF_LABELS = {
  showings: ['Showings', 'Remind me about today’s appointments'],
  deadlines: ['Contract deadlines & follow-ups', 'Flag anything overdue'],
  financing: ['Lender milestones', 'When a linked loan moves stages'],
  openHouse: ['Open-house leads', 'When a visitor signs in without an agent'],
  digest: ['Morning digest', 'One summary text at 8am'],
}

export default function Settings() {
  const { currentAgent, theme, toggleTheme, palette, setPalette, notifPrefs, setNotifPref, isLinked, lenderLink, julene, toast } = useApp()
  const dark = theme === 'dark'

  return (
    <div>
      <PageHeader title="Settings" sub="Your profile, your look, your pings." />

      <div className="grid gap-4 lg:grid-cols-2">
        {/* profile */}
        <Card title="Profile" sub="What clients and partners see.">
          <div className="flex items-center gap-3">
            <span className={cx('grid h-12 w-12 shrink-0 place-items-center rounded-full text-sm font-semibold text-white', currentAgent.color)}>
              {currentAgent.initials}
            </span>
            <div>
              <p className="text-[15px] font-semibold text-forest-950 dark:text-white">{currentAgent.name}</p>
              <p className="text-xs text-slate-400">REALTOR® · {currentAgent.market}</p>
            </div>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 dark:border-white/10">
            <KV k="Brokerage" v={currentAgent.brokerage} />
            <KV k="Market" v={currentAgent.market} />
            <KV k="Phone" v={currentAgent.phone} />
            <KV k="Email" v={currentAgent.email} />
            <KV k="Commission split" v={`${currentAgent.splitPct} / ${100 - currentAgent.splitPct}`} />
          </dl>
        </Card>

        {/* lender link */}
        <Card title="Lender link" sub="The optional handshake.">
          {isLinked ? (
            <>
              <div className="flex items-center gap-3">
                <span className={cx('grid h-10 w-10 shrink-0 place-items-center rounded-full text-[11px] font-semibold text-white', julene.color)}>{julene.initials}</span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-[13px] font-semibold text-forest-950 dark:text-white">
                    {julene.name}
                    <Badge cls="bg-forest-50 text-forest-700 ring-forest-600/20">
                      <Link2 className="h-2.5 w-2.5" /> connected
                    </Badge>
                  </p>
                  <p className="truncate text-xs text-slate-400">{julene.org} · since {fmtDate(lenderLink.since)}</p>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-400">
                Live financing panels, the milestone feed, instant letters, and the co-branded apply
                link all ride on this connection. Unlinking keeps your data — everything just goes manual.
              </p>
              <Btn variant="outline" sm className="mt-3" onClick={() => toast('This demo keeps Holly linked — try Bree’s seat for the unlinked life', '🔗')}>
                <Unlink className="h-3 w-3" /> Unlink
              </Btn>
            </>
          ) : (
            <p className="text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
              No loan officer linked. Head to <span className="font-medium">Financing</span> to send
              the invite — or don’t. AgentHQ works either way.
            </p>
          )}
        </Card>

        {/* appearance */}
        <Card title="Appearance" sub="Pick a palette — the whole app re-tints.">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {PALETTES.map((p) => (
              <button
                key={p.id}
                onClick={() => setPalette(p.id)}
                className={cx(
                  'rounded-xl border p-3 text-left transition-all duration-150 active:scale-[0.98]',
                  palette === p.id
                    ? 'border-forest-600 ring-2 ring-forest-500/30'
                    : 'border-slate-200/80 hover:border-slate-300 dark:border-white/10 dark:hover:border-white/25',
                )}
              >
                <span className="flex items-center justify-between">
                  <span className="text-base">{p.emoji}</span>
                  {palette === p.id && <Check className="h-3.5 w-3.5 text-forest-600 dark:text-forest-300" strokeWidth={3} />}
                </span>
                <span className="mt-1.5 flex gap-1">
                  {p.chip.map((c, i) => (
                    <span key={i} className="h-4 flex-1 rounded ring-1 ring-inset ring-black/10" style={{ backgroundColor: c }} />
                  ))}
                </span>
                <span className="mt-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">{p.label}</span>
              </button>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-white/10">
            <div className="flex items-center gap-2">
              {dark ? <Moon className="h-4 w-4 text-slate-400" /> : <Sun className="h-4 w-4 text-gold-500" />}
              <span className="text-[13px] text-slate-600 dark:text-slate-300">Dark mode</span>
            </div>
            <Toggle on={dark} onChange={toggleTheme} />
          </div>
        </Card>

        {/* notifications */}
        <Card title="Notifications" sub="What's worth a ping.">
          <ul className="space-y-3">
            {Object.entries(NOTIF_LABELS).map(([key, [label, sub]]) => (
              <li key={key} className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[13px] font-medium text-slate-700 dark:text-slate-200">{label}</p>
                  <p className="text-xs text-slate-400">{sub}</p>
                </div>
                <Toggle on={notifPrefs[key]} onChange={(v) => setNotifPref(key, v)} />
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}
