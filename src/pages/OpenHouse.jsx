import { useMemo, useState } from 'react'
import { DoorOpen, UserPlus, Check, ArrowLeft, Sparkles, Phone, Users } from 'lucide-react'
import { useApp } from '../store.jsx'
import { money, fmtDateFull } from '../data.js'
import { PageHeader, Card, Btn, Field, inputCls, EmptyState, Toggle, BrandedQR, cx } from '../ui.jsx'

/* visitor-facing sign-in sheet (what sits on the kitchen counter) */
function SignInKiosk({ listing, onBack }) {
  const { addVisitor, currentAgent } = useApp()
  const blank = { name: '', phone: '', email: '', hasAgent: false }
  const [form, setForm] = useState(blank)
  const [justSigned, setJustSigned] = useState(null)

  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.phone.trim()) return
    addVisitor(listing.id, { ...form, name: form.name.trim() })
    setJustSigned(form.name.trim().split(' ')[0])
    setForm(blank)
    setTimeout(() => setJustSigned(null), 2600)
  }

  return (
    <div className="mx-auto max-w-lg">
      <button onClick={onBack} className="mb-3 flex items-center gap-1.5 text-[13px] font-medium text-slate-500 transition-colors hover:text-forest-900 dark:hover:text-white">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to the kit
      </button>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_32px_-12px_rgba(17,36,28,0.2)] dark:border-white/10 dark:bg-forest-900">
        <div className="bg-gradient-to-br from-forest-800 to-forest-950 px-6 py-7 text-center">
          <DoorOpen className="mx-auto h-8 w-8 text-gold-300" strokeWidth={1.5} />
          <h2 className="mt-2 text-xl font-semibold text-white">Welcome in! 👋</h2>
          <p className="mt-1 text-[13px] text-forest-200">{listing.address}</p>
          <p className="text-xs text-forest-300">{money(listing.price)} · hosted by {currentAgent.name}</p>
        </div>
        {justSigned ? (
          <div className="grid place-items-center px-6 py-12 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-forest-50 dark:bg-forest-500/15">
              <Check className="h-6 w-6 text-forest-600" strokeWidth={2.5} />
            </span>
            <p className="mt-3 text-[15px] font-semibold text-forest-950 dark:text-white">Thanks, {justSigned}!</p>
            <p className="mt-1 text-[13px] text-slate-500">Enjoy the tour — ask me anything.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4 px-6 py-6">
            <Field label="Your name *">
              <input autoFocus required className={inputCls} placeholder="First & last" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Phone *">
                <input required className={inputCls} placeholder="(601) 555-0123" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
              </Field>
              <Field label="Email">
                <input type="email" className={inputCls} placeholder="optional" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
              </Field>
            </div>
            <label className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2.5 dark:bg-white/5">
              <span className="text-[13px] text-slate-600 dark:text-slate-300">Already working with an agent?</span>
              <Toggle on={form.hasAgent} onChange={(v) => setForm((f) => ({ ...f, hasAgent: v }))} />
            </label>
            <Btn type="submit" className="h-11 w-full text-[14px]" disabled={!form.name.trim() || !form.phone.trim()}>
              Sign in
            </Btn>
          </form>
        )}
      </div>
    </div>
  )
}

export default function OpenHouse({ initialId }) {
  const { listings, seat, visitors, openClient, clients } = useApp()
  const mine = useMemo(() => listings.filter((l) => l.agentId === seat && l.status === 'Active'), [listings, seat])
  const [picked, setPicked] = useState(initialId && mine.some((l) => l.id === initialId) ? initialId : mine[0]?.id)
  const [kiosk, setKiosk] = useState(false)

  const listing = mine.find((l) => l.id === picked)
  const signedIn = listing ? visitors[listing.id] ?? [] : []
  const leads = signedIn.filter((v) => !v.hasAgent)

  if (!listing)
    return (
      <div>
        <PageHeader title="Open House Kit" sub="Pick a listing, put the QR by the door, and every visitor becomes a lead." />
        <Card>
          <EmptyState icon={DoorOpen} title="No active listings" sub="Win a listing first — then this page earns its keep." />
        </Card>
      </div>
    )

  if (kiosk) return <SignInKiosk listing={listing} onBack={() => setKiosk(false)} />

  const signInUrl = `agenthq.app/openhouse/${listing.id}`

  return (
    <div>
      <PageHeader
        title="Open House Kit"
        sub="Pick a listing, put the QR by the door, and every visitor becomes a lead — automatically."
      />

      {/* listing picker */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {mine.map((l) => (
          <button
            key={l.id}
            onClick={() => setPicked(l.id)}
            className={cx(
              'h-9 rounded-lg border px-3 text-[13px] font-medium transition-all duration-150 active:scale-[0.97]',
              picked === l.id
                ? 'border-forest-900 bg-forest-900 text-white shadow-[0_1px_2px_rgba(17,36,28,0.18)]'
                : 'border-slate-300/70 bg-white text-slate-600 hover:border-slate-400/70 hover:bg-slate-50 dark:border-white/15 dark:bg-white/5 dark:text-slate-300',
            )}
          >
            {l.short}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[20rem_1fr]">
        {/* the kit */}
        <Card title="The sign-in QR" sub="Print it, prop it by the cookies.">
          <BrandedQR value={`https://${signInUrl}`} />
          <p className="mt-2 text-center text-[11px] text-slate-400 tabular-nums">{signInUrl}</p>
          {listing.openHouse && (
            <p className="mt-3 rounded-lg bg-gold-50 px-3 py-2 text-center text-xs font-medium text-gold-800 ring-1 ring-inset ring-gold-600/20 dark:bg-gold-500/10 dark:text-gold-200">
              {fmtDateFull(listing.openHouse.date)} · {listing.openHouse.time}
            </p>
          )}
          <Btn className="mt-3 w-full" onClick={() => setKiosk(true)}>
            <DoorOpen className="h-3.5 w-3.5" /> Launch sign-in mode
          </Btn>
          <p className="mt-2 text-center text-[11px] leading-relaxed text-slate-400">
            Sign-in mode is the full-screen sheet visitors see after scanning — or just hand them the tablet.
          </p>
        </Card>

        {/* visitors -> leads */}
        <Card
          title={`Visitors — ${listing.short}`}
          sub={signedIn.length ? `${signedIn.length} signed in · ${leads.length} became leads` : 'Nobody yet — doors open soon'}
          pad={false}
        >
          {signedIn.length === 0 ? (
            <EmptyState
              icon={Users}
              title="The sheet is empty (for now)"
              sub="Launch sign-in mode and try it — every visitor without an agent lands in your Clients pipeline."
            />
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-white/[0.06]">
              {signedIn.map((v, i) => {
                const lead = clients.find((c) => c.name === v.name && c.source === 'Open House')
                return (
                  <li key={i} className="flex items-center gap-3 px-5 py-3">
                    <span className={cx('grid h-8 w-8 shrink-0 place-items-center rounded-full', v.hasAgent ? 'bg-slate-100 text-slate-400 dark:bg-white/10' : 'bg-forest-50 text-forest-600 dark:bg-forest-500/15')}>
                      <UserPlus className="h-4 w-4" strokeWidth={1.75} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-forest-950 dark:text-white">{v.name}</p>
                      <p className="flex items-center gap-1 truncate text-xs text-slate-400">
                        <Phone className="h-3 w-3" /> {v.phone} · signed in {v.at}
                      </p>
                    </div>
                    {v.hasAgent ? (
                      <span className="text-[11px] text-slate-400">has an agent</span>
                    ) : lead ? (
                      <button onClick={() => openClient(lead.id)} className="flex items-center gap-1 rounded-md bg-forest-50 px-2 py-1 text-[11px] font-medium text-forest-700 ring-1 ring-inset ring-forest-600/20 transition-colors hover:bg-forest-100 dark:bg-forest-500/15 dark:text-forest-200">
                        <Sparkles className="h-3 w-3" /> In your pipeline →
                      </button>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}
