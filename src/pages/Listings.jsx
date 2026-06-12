import { useMemo, useState } from 'react'
import { Home, BedDouble, Bath, Ruler, Eye, CalendarDays, DoorOpen, Flame, Sparkles } from 'lucide-react'
import { useApp } from '../store.jsx'
import { LISTING_STATUSES, daysOnMarket, money, fmtDateFull, relDate } from '../data.js'
import { PageHeader, Card, Btn, ListingBadge, FilterChip, EmptyState, cx } from '../ui.jsx'

const HEAT = {
  hot: { label: 'Hot — heavy showing traffic', icon: Flame, cls: 'text-rose-600 bg-rose-50 ring-rose-600/20' },
  new: { label: 'Fresh on market', icon: Sparkles, cls: 'text-sky-600 bg-sky-50 ring-sky-600/20' },
}

export default function Listings() {
  const { listings, clients, seat, go, openClient, toast } = useApp()
  const [filter, setFilter] = useState('All')

  const mine = useMemo(() => listings.filter((l) => l.agentId === seat), [listings, seat])
  const filtered = filter === 'All' ? mine : mine.filter((l) => l.status === filter)
  const counts = useMemo(() => {
    const m = { All: mine.length }
    LISTING_STATUSES.forEach((s) => (m[s] = mine.filter((l) => l.status === s).length))
    return m
  }, [mine])

  const totalVolume = mine.filter((l) => l.status !== 'Sold').reduce((s, l) => s + l.price, 0)

  return (
    <div>
      <PageHeader
        title="Listings"
        sub={`${counts.Active ?? 0} active · ${money(totalVolume)} on the market`}
        actions={
          <Btn variant="outline" onClick={() => toast('Listing intake form — coming in the full build', '🏠')}>
            <Home className="h-3.5 w-3.5" /> New listing
          </Btn>
        }
      />

      <div className="mb-4 flex flex-wrap gap-1.5">
        <FilterChip active={filter === 'All'} onClick={() => setFilter('All')}>
          All <span className="ml-1 opacity-60 tabular-nums">{counts.All}</span>
        </FilterChip>
        {LISTING_STATUSES.map((s) => (
          <FilterChip key={s} active={filter === s} onClick={() => setFilter(s)}>
            {s} <span className="ml-1 opacity-60 tabular-nums">{counts[s]}</span>
          </FilterChip>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState icon={Home} title="No listings here" sub="Win the next listing appointment. 💪" />
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((l) => {
            const seller = l.sellerId ? clients.find((c) => c.id === l.sellerId) : null
            const dom = daysOnMarket(l)
            const heat = HEAT[l.heat]
            return (
              <Card key={l.id} pad={false} className="overflow-hidden">
                {/* house "photo" placeholder — gradient roofline */}
                <div className="relative flex h-28 items-end overflow-hidden bg-gradient-to-br from-forest-700 via-forest-800 to-forest-950 px-5 pb-3">
                  <Home className="absolute -right-3 -top-4 h-28 w-28 text-white/[0.06]" strokeWidth={1} />
                  <div className="relative">
                    <p className="text-lg font-semibold tracking-tight text-white tabular-nums">{money(l.price)}</p>
                    <p className="text-[13px] text-forest-200">{l.address}</p>
                  </div>
                  <span className="absolute right-4 top-3">
                    <ListingBadge status={l.status} />
                  </span>
                </div>

                <div className="px-5 py-4">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1"><BedDouble className="h-3.5 w-3.5" /> {l.beds} bd</span>
                    <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" /> {l.baths} ba</span>
                    <span className="flex items-center gap-1"><Ruler className="h-3.5 w-3.5" /> {l.sqft.toLocaleString()} sqft</span>
                    <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {l.showings} showings</span>
                    <span className="tabular-nums">{l.status === 'Sold' ? `sold ${relDate(l.soldAt)}` : `${dom} DOM`}</span>
                  </div>

                  {heat && l.status === 'Active' && (
                    <p className={cx('mt-3 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium ring-1 ring-inset', heat.cls)}>
                      <heat.icon className="h-3 w-3" /> {heat.label}
                    </p>
                  )}

                  {l.openHouse && l.status === 'Active' && (
                    <div className="mt-3 flex items-center justify-between gap-2 rounded-lg bg-gold-50 px-3 py-2 ring-1 ring-inset ring-gold-600/20 dark:bg-gold-500/10">
                      <p className="flex items-center gap-1.5 text-[12px] font-medium text-gold-800 dark:text-gold-200">
                        <DoorOpen className="h-3.5 w-3.5" />
                        Open house {fmtDateFull(l.openHouse.date)} · {l.openHouse.time}
                      </p>
                      <Btn variant="gold" sm onClick={() => go('openhouse', { id: l.id })}>
                        Open the kit
                      </Btn>
                    </div>
                  )}

                  {l.closingDate && l.status === 'Pending' && (
                    <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <CalendarDays className="h-3.5 w-3.5" /> Closing {fmtDateFull(l.closingDate)} ({relDate(l.closingDate)})
                    </p>
                  )}

                  {seller && (
                    <button
                      onClick={() => openClient(seller.id)}
                      className="mt-3 block w-full rounded-lg border border-slate-200/80 px-3 py-2 text-left text-xs text-slate-500 transition-colors hover:border-forest-300 hover:text-forest-900 dark:border-white/10 dark:text-slate-400 dark:hover:text-white"
                    >
                      Sellers: <span className="font-medium">{seller.name}</span> →
                    </button>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
