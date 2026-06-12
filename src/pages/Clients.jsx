import { useMemo } from 'react'
import { Users, Plus, Phone, MapPin, ArrowRight, Home as HomeIcon } from 'lucide-react'
import { useApp } from '../store.jsx'
import { STAGES, money, relDate, daysUntil } from '../data.js'
import { PageHeader, Card, Btn, SearchInput, Select, FilterChip, StageBadge, FinancingBadge, EmptyState, cx } from '../ui.jsx'

export default function Clients({ onNewClient }) {
  const { clients, seat, crm, setCrm, openClient } = useApp()

  const mine = useMemo(() => clients.filter((c) => c.agentId === seat), [clients, seat])

  const filtered = useMemo(() => {
    const q = crm.q.trim().toLowerCase()
    return mine.filter((c) => {
      if (crm.stage !== 'All' && c.stage !== crm.stage) return false
      if (crm.type !== 'All' && (c.type ?? 'buyer') !== crm.type) return false
      if (crm.financing !== 'All' && (c.financing?.kind ?? 'none') !== crm.financing) return false
      if (q && !`${c.name} ${c.phone} ${c.email} ${c.area} ${c.property ?? ''}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [mine, crm])

  const counts = useMemo(() => {
    const m = { All: mine.length }
    STAGES.forEach((s) => (m[s] = mine.filter((c) => c.stage === s).length))
    return m
  }, [mine])

  return (
    <div>
      <PageHeader
        title="Clients"
        sub="Every buyer and seller, one pipeline — no sticky notes required."
        actions={
          <Btn onClick={onNewClient}>
            <Plus className="h-3.5 w-3.5" /> Add client
          </Btn>
        }
      />

      {/* search + filters */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <SearchInput value={crm.q} onChange={(v) => setCrm({ q: v })} placeholder="Search name, phone, area…" className="w-full sm:w-64" />
        <Select
          value={crm.type}
          onChange={(v) => setCrm({ type: v })}
          label="Buyers & sellers"
          options={[
            { value: 'buyer', label: 'Buyers' },
            { value: 'seller', label: 'Sellers' },
          ]}
          className="w-40"
        />
        <Select
          value={crm.financing}
          onChange={(v) => setCrm({ financing: v })}
          label="Any financing"
          options={[
            { value: 'linked', label: 'Linked lender' },
            { value: 'manual', label: 'Their own lender' },
            { value: 'cash', label: 'Cash' },
            { value: 'none', label: 'Not started' },
          ]}
          className="w-44"
        />
      </div>
      <div className="mb-4 flex flex-wrap gap-1.5">
        <FilterChip active={crm.stage === 'All'} onClick={() => setCrm({ stage: 'All' })}>
          All <span className="ml-1 opacity-60 tabular-nums">{counts.All}</span>
        </FilterChip>
        {STAGES.filter((s) => s !== 'Lost' || counts[s] > 0).map((s) => (
          <FilterChip key={s} active={crm.stage === s} onClick={() => setCrm({ stage: s })}>
            {s} <span className="ml-1 opacity-60 tabular-nums">{counts[s]}</span>
          </FilterChip>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState icon={Users} title="No clients match" sub="Try a different search or filter." />
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => {
            const touchOverdue = c.nextTouch && daysUntil(c.nextTouch) < 0 && c.stage !== 'Closed' && c.stage !== 'Lost'
            return (
              <button
                key={c.id}
                onClick={() => openClient(c.id)}
                className="group rounded-xl border border-slate-200/80 bg-white p-4 text-left shadow-[0_1px_2px_rgba(17,36,28,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-forest-300/70 hover:shadow-[0_10px_28px_-14px_rgba(17,36,28,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500/40 dark:border-white/10 dark:bg-forest-900 dark:hover:border-white/20"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 truncate text-[14px] font-semibold text-forest-950 dark:text-white">
                      {c.type === 'seller' && <HomeIcon className="h-3.5 w-3.5 shrink-0 text-gold-500" />}
                      {c.name}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-400">
                      <MapPin className="h-3 w-3 shrink-0" /> {c.area}
                      {c.budget ? ` · up to ${money(c.budget)}` : c.price ? ` · ${money(c.price)}` : ''}
                    </p>
                  </div>
                  <StageBadge stage={c.stage} />
                </div>

                {c.property && (
                  <p className="mt-2 truncate rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs text-slate-500 dark:bg-white/5 dark:text-slate-400">
                    🏠 {c.property}
                  </p>
                )}
                {!c.property && c.wishlist && (
                  <p className="mt-2 truncate rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs italic text-slate-500 dark:bg-white/5 dark:text-slate-400">
                    “{c.wishlist}”
                  </p>
                )}

                <div className="mt-3 flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <FinancingBadge kind={c.financing?.kind ?? 'none'} />
                    <span className="truncate text-[11px] text-slate-400">{c.source}</span>
                  </div>
                  <span
                    className={cx(
                      'shrink-0 text-[11px] tabular-nums',
                      touchOverdue ? 'font-medium text-rose-600' : 'text-slate-400',
                    )}
                  >
                    {c.stage === 'Closed' ? `closed ${relDate(c.closingDate)}` : c.nextTouch ? `touch ${relDate(c.nextTouch)}` : ''}
                  </span>
                </div>

                <span className="mt-3 flex items-center gap-1 text-xs font-medium text-forest-600 opacity-0 transition-opacity group-hover:opacity-100 dark:text-forest-300">
                  Open client <ArrowRight className="h-3 w-3" />
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
