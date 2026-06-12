import { useMemo } from 'react'
import { PiggyBank, TrendingUp, Hourglass, Landmark } from 'lucide-react'
import { useApp } from '../store.jsx'
import { gci, agentCut, money, fmtDate, relDate } from '../data.js'
import { PageHeader, Card, Stat, Badge, EmptyState, cx } from '../ui.jsx'

export default function Commissions() {
  const { commissions, seat, currentAgent, openClient } = useApp()
  const mine = useMemo(() => commissions.filter((m) => m.agentId === seat), [commissions, seat])
  const pending = mine.filter((m) => m.status === 'Pending').sort((a, z) => (a.closesAt < z.closesAt ? -1 : 1))
  const closed = mine.filter((m) => m.status === 'Closed').sort((a, z) => (a.closedAt < z.closedAt ? 1 : -1))

  const closedCut = closed.reduce((s, m) => s + agentCut(m, currentAgent), 0)
  const pendingCut = pending.reduce((s, m) => s + agentCut(m, currentAgent), 0)
  const closedVolume = closed.reduce((s, m) => s + m.price, 0)

  const year = new Date().getFullYear()

  const Row = ({ m }) => (
    <li>
      <button
        onClick={() => m.clientId && openClient(m.clientId)}
        className={cx(
          'flex w-full items-center gap-3 px-5 py-3 text-left transition-colors',
          m.clientId ? 'hover:bg-slate-50 dark:hover:bg-white/[0.04]' : 'cursor-default',
        )}
      >
        <span className={cx('grid h-8 w-8 shrink-0 place-items-center rounded-lg ring-1 ring-inset', m.side === 'listing' ? 'bg-gold-50 text-gold-700 ring-gold-600/20 dark:bg-gold-500/15' : 'bg-forest-50 text-forest-600 ring-forest-600/20 dark:bg-forest-500/15')}>
          <Landmark className="h-4 w-4" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-forest-950 dark:text-white">{m.deal}</p>
          <p className="truncate text-xs text-slate-400">
            {m.side === 'listing' ? 'Listing side' : 'Buyer side'} · {money(m.price)} at {m.rate}%
            {m.status === 'Pending' ? ` · closes ${fmtDate(m.closesAt)} (${relDate(m.closesAt)})` : ` · closed ${fmtDate(m.closedAt)}`}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[13px] font-semibold text-forest-950 tabular-nums dark:text-white">{money(agentCut(m, currentAgent))}</p>
          <p className="text-[10px] text-slate-400 tabular-nums">of {money(gci(m))} GCI</p>
        </div>
      </button>
    </li>
  )

  return (
    <div>
      <PageHeader
        title="Commissions"
        sub={`Your ${currentAgent.splitPct}/${100 - currentAgent.splitPct} split with ${currentAgent.brokerage}, ${year} so far.`}
      />

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat icon={PiggyBank} label={`Closed ${year} (your cut)`} value={money(closedCut)} accent="forest" foot={`${closed.length} deals · ${money(closedVolume)} volume`} />
        <Stat icon={Hourglass} label="Pending (under contract)" value={money(pendingCut)} accent="gold" foot={`${pending.length} deals on the way`} />
        <Stat icon={TrendingUp} label="If everything closes" value={money(closedCut + pendingCut)} accent="sky" foot="closed + pending" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Pending" sub="Money that's under contract" pad={false} action={<Badge cls="bg-gold-50 text-gold-700 ring-gold-600/25">{pending.length}</Badge>}>
          {pending.length === 0 ? (
            <EmptyState icon={Hourglass} title="Nothing pending" sub="Get an offer accepted and it lands here." />
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-white/[0.06]">
              {pending.map((m) => (
                <Row key={m.id} m={m} />
              ))}
            </ul>
          )}
        </Card>

        <Card title={`Closed ${year}`} sub="Already in the bank" pad={false} action={<Badge cls="bg-forest-50 text-forest-700 ring-forest-600/20">{closed.length}</Badge>}>
          {closed.length === 0 ? (
            <EmptyState icon={PiggyBank} title="No closings yet this year" sub="The pending column fixes that." />
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-white/[0.06]">
              {closed.map((m) => (
                <Row key={m.id} m={m} />
              ))}
            </ul>
          )}
        </Card>
      </div>

      <p className="mt-4 text-center text-[11px] text-slate-400">
        GCI = gross commission income (price × your side’s rate). Your cut applies the {currentAgent.splitPct}% split. Demo math — not tax advice. 😄
      </p>
    </div>
  )
}
