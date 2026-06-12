import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  Check,
  FileText,
  Send,
  Sparkles,
  Landmark,
  PenLine,
  CalendarDays,
  StickyNote,
  Banknote,
  MessageCircle,
} from 'lucide-react'
import { useApp } from '../store.jsx'
import { LOAN_STAGES, loanStageIndex, money, fmtDate, fmtDateFull, relDate, daysUntil, d } from '../data.js'
import { Card, Btn, StageBadge, FinancingBadge, Badge, Field, inputCls, ProgressBar, KV, EmptyState, Modal, cx } from '../ui.jsx'

/* ---------- instant pre-approval letter (LO-capped) ---------- */
function LetterModal({ client, cap, onClose }) {
  const { julene, currentAgent, askForMoreRoom, capRequests, toast } = useApp()
  const [offer, setOffer] = useState(client.price ?? client.budget ?? cap)
  const over = Number(offer) > cap
  const letterAmount = Math.min(Number(offer) || 0, cap)
  const reqState = capRequests[client.financing.buyerKey]

  return (
    <Modal open onClose={onClose} title="Instant pre-approval letter" sub={`Capped by ${julene.name.split(' ')[0]} at ${money(cap)} — the letter always matches the offer, never your buyer's ceiling.`} wide>
      <div className="grid gap-4 sm:grid-cols-[14rem_1fr]">
        <div className="space-y-3">
          <Field label="Offer price">
            <input type="number" min="0" step="1000" className={inputCls} value={offer} onChange={(e) => setOffer(e.target.value)} />
          </Field>
          {over ? (
            <div className="rounded-lg bg-amber-50 p-3 text-xs leading-relaxed text-amber-800 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-500/10">
              That’s over the {money(cap)} cap.{' '}
              {reqState === 'pending' ? (
                <span className="font-medium">Asked Julene — waiting…</span>
              ) : reqState === 'granted' ? (
                <span className="font-medium text-forest-700">She stretched the cap! Re-enter the offer.</span>
              ) : (
                <button onClick={() => askForMoreRoom(client.financing.buyerKey, client.name)} className="font-semibold underline underline-offset-2 hover:text-amber-900">
                  Ask for more room →
                </button>
              )}
            </div>
          ) : (
            <p className="rounded-lg bg-forest-50 p-3 text-xs leading-relaxed text-forest-700 ring-1 ring-inset ring-forest-600/20 dark:bg-forest-500/10 dark:text-forest-200">
              Letter will read <span className="font-semibold tabular-nums">{money(letterAmount)}</span> — exactly the offer, so the
              sellers never learn how high your buyers could really go.
            </p>
          )}
          <Btn className="w-full" disabled={over || !letterAmount} onClick={() => { toast(`Letter at ${money(letterAmount)} sent to your email & the listing agent`, '📄'); onClose() }}>
            <Send className="h-3.5 w-3.5" /> Generate & send
          </Btn>
        </div>

        {/* letter preview */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 text-[12px] leading-relaxed text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
          <p className="font-semibold text-forest-950 dark:text-white">MS Lending, LLC</p>
          <p className="text-[11px] text-slate-400">{julene.name} · {julene.role} · {julene.nmls}</p>
          <p className="mt-3">{fmtDateFull(d(0))}</p>
          <p className="mt-3">To whom it may concern,</p>
          <p className="mt-2">
            <span className="font-medium">{client.name}</span> {client.name.includes('&') ? 'are' : 'is'} pre-approved for a mortgage
            of <span className="font-semibold text-forest-950 tabular-nums dark:text-white">{money(letterAmount || 0)}</span> toward the purchase of{' '}
            {client.property ?? 'the subject property'}.
          </p>
          <p className="mt-2">Income, assets, and credit have been verified. Please contact me with any questions.</p>
          <p className="mt-3">Warm regards,</p>
          <p className="font-medium text-forest-950 dark:text-white">{julene.name}</p>
          <p className="text-[11px] text-slate-400">{julene.phone} · prepared for {currentAgent.name}</p>
        </div>
      </div>
    </Modal>
  )
}

/* ---------- one-tap referral ---------- */
function ReferModal({ client, onClose }) {
  const { sendReferral, julene } = useApp()
  const [loanType, setLoanType] = useState('Conventional')
  return (
    <Modal open onClose={onClose} title={`Send ${client.name.split(' ')[0]} to ${julene.name.split(' ')[0]}`} sub="30 seconds. She calls them today, you see every milestone here.">
      <div className="space-y-3">
        <div className="rounded-lg bg-slate-50 p-3 text-[13px] dark:bg-white/5">
          <p className="font-medium text-forest-950 dark:text-white">{client.name}</p>
          <p className="text-xs text-slate-400">{client.phone} · budget {client.budget ? money(client.budget) : '—'}</p>
        </div>
        <Field label="Likely loan type">
          <div className="flex flex-wrap gap-1.5">
            {['Conventional', 'FHA', 'VA', 'Jumbo'].map((t) => (
              <button
                key={t}
                onClick={() => setLoanType(t)}
                className={cx(
                  'h-8 rounded-lg border px-3 text-xs font-medium transition-colors',
                  loanType === t ? 'border-forest-900 bg-forest-900 text-white' : 'border-slate-300/70 bg-white text-slate-600 hover:bg-slate-50 dark:border-white/15 dark:bg-white/5 dark:text-slate-300',
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </Field>
        <div className="flex justify-end gap-2 pt-1">
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn
            variant="gold"
            onClick={() => {
              sendReferral({ clientId: client.id, name: client.name, phone: client.phone, loanType, purpose: 'Purchase' })
              onClose()
            }}
          >
            <Send className="h-3.5 w-3.5" /> Send referral
          </Btn>
        </div>
      </div>
    </Modal>
  )
}

/* ---------- the financing slot (the whole pitch in one panel) ---------- */
function FinancingPanel({ client }) {
  const { loanStatusFor, logFinancingNote, isLinked, julene, go } = useApp()
  const [note, setNote] = useState('')
  const [letterOpen, setLetterOpen] = useState(false)
  const [referOpen, setReferOpen] = useState(false)
  const fin = client.financing ?? { kind: 'none' }
  const status = loanStatusFor(client)

  /* LINKED — the live panel */
  if (fin.kind === 'linked' && status) {
    const idx = loanStageIndex(status.stage)
    const pct = ((idx + 1) / LOAN_STAGES.length) * 100
    return (
      <Card
        title="Financing — live from MS Lending"
        sub={`${julene.name} · ${julene.nmls}`}
        action={
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-forest-600 dark:text-forest-300">
            <span className={cx('h-1.5 w-1.5 rounded-full bg-forest-500', status.live && 'animate-livedot')} />
            {status.live ? 'live link' : 'linked'}
          </span>
        }
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[15px] font-semibold text-forest-950 dark:text-white">{status.stage}</p>
          <span className="text-xs text-slate-400 tabular-nums">est. closing {fmtDate(status.estClosing)}</span>
        </div>
        <ProgressBar pct={pct} className="mt-2 h-2" />
        <div className="mt-1.5 flex justify-between text-[10px] text-slate-400">
          <span>Application</span>
          <span>Closing 🔑</span>
        </div>
        <p className="mt-3 rounded-lg bg-forest-50 px-3 py-2 text-[13px] text-forest-800 ring-1 ring-inset ring-forest-600/15 dark:bg-forest-500/10 dark:text-forest-100">
          <span className="font-medium">Next step:</span> {LOAN_STAGES[idx]?.blurb} {status.nextStep && <span className="text-forest-600 dark:text-forest-300">({status.nextStep})</span>}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-4 border-t border-slate-100 pt-3 dark:border-white/10">
          <KV k="Pre-approved up to" v={money(status.preApprovedAt)} />
          <KV k="Lender" v={fin.lender} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Btn variant="soft" sm onClick={() => setLetterOpen(true)}>
            <FileText className="h-3.5 w-3.5" /> Pre-approval letter
          </Btn>
          <Btn variant="ghost" sm onClick={() => go('financing')}>
            All lender activity <ArrowRight className="h-3 w-3" />
          </Btn>
        </div>
        {letterOpen && <LetterModal client={client} cap={status.preApprovedAt} onClose={() => setLetterOpen(false)} />}
      </Card>
    )
  }

  /* CASH */
  if (fin.kind === 'cash') {
    return (
      <Card title="Financing — cash buyer" sub="No loan, no lender, no waiting.">
        <div className="flex items-center gap-3 rounded-lg bg-gold-50 px-3 py-2.5 text-[13px] text-gold-800 ring-1 ring-inset ring-gold-600/20 dark:bg-gold-500/10 dark:text-gold-200">
          <Banknote className="h-4 w-4 shrink-0" />
          Proof of funds on file. The cleanest kind of deal.
        </div>
        {(fin.notesLog ?? []).map((n, i) => (
          <p key={i} className="mt-2 text-xs text-slate-400">
            {fmtDate(n.date)} — {n.text}
          </p>
        ))}
      </Card>
    )
  }

  /* MANUAL / NONE — the graceful unlinked slot */
  const submitNote = (e) => {
    e.preventDefault()
    if (!note.trim()) return
    logFinancingNote(client.id, note.trim())
    setNote('')
  }
  return (
    <Card title={fin.kind === 'manual' ? `Financing — with ${fin.lender ?? 'their lender'}` : 'Financing — not started yet'} sub="Text for status, or connect a loan officer for live updates.">
      <form onSubmit={submitNote} className="flex gap-2">
        <input
          className={inputCls}
          placeholder="Log a status — e.g. “LO says appraisal back Friday”"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <Btn type="submit" variant="outline" disabled={!note.trim()}>
          <PenLine className="h-3.5 w-3.5" /> Log
        </Btn>
      </form>
      {(fin.notesLog ?? []).length > 0 && (
        <ul className="mt-3 space-y-1.5 border-t border-slate-100 pt-3 dark:border-white/10">
          {fin.notesLog.map((n, i) => (
            <li key={i} className="flex gap-2 text-xs text-slate-500 dark:text-slate-400">
              <MessageCircle className="mt-0.5 h-3 w-3 shrink-0 text-slate-300" />
              <span>
                <span className="text-slate-400 tabular-nums">{fmtDate(n.date)}</span> — {n.text}
              </span>
            </li>
          ))}
        </ul>
      )}
      {client.type !== 'seller' && (
        <div className="mt-4 rounded-xl border border-dashed border-forest-300/60 bg-forest-50/50 p-3 dark:border-forest-400/30 dark:bg-forest-500/5">
          <p className="text-xs leading-relaxed text-forest-800 dark:text-forest-200">
            {isLinked
              ? `Or send them to ${julene.name.split(' ')[0]} — she calls today, and every milestone shows up here on its own.`
              : 'Connect a loan officer once, and financing updates flow in by themselves — no more “any update?” texts.'}
          </p>
          {isLinked ? (
            <Btn variant="gold" sm className="mt-2" onClick={() => setReferOpen(true)}>
              <Send className="h-3 w-3" /> Refer to {julene.name.split(' ')[0]}
            </Btn>
          ) : (
            <Btn variant="soft" sm className="mt-2" onClick={() => go('financing')}>
              <Landmark className="h-3 w-3" /> Connect a loan officer
            </Btn>
          )}
        </div>
      )}
      {referOpen && <ReferModal client={client} onClose={() => setReferOpen(false)} />}
    </Card>
  )
}

/* ---------- page ---------- */
export default function ClientFile({ id, initialTab = 'Overview' }) {
  const { clients, listings, goClients, advanceStage, addNote, setNextTouch, nextActionLabel, openClient } = useApp()
  const client = clients.find((c) => c.id === id)
  const [noteText, setNoteText] = useState('')
  const [touchDate, setTouchDate] = useState('')

  const listing = useMemo(() => (client?.listingId ? listings.find((l) => l.id === client.listingId) : null), [client, listings])

  if (!client)
    return (
      <Card>
        <EmptyState icon={StickyNote} title="Client not found" sub="They may have been removed." />
      </Card>
    )

  const actionLabel = nextActionLabel(client)
  const timeline = [...client.timeline].sort((a, z) => (a.date < z.date ? 1 : -1))

  const submitNote = (e) => {
    e.preventDefault()
    if (!noteText.trim()) return
    addNote(client.id, noteText.trim())
    setNoteText('')
  }

  return (
    <div>
      <button onClick={() => goClients()} className="mb-3 flex items-center gap-1.5 text-[13px] font-medium text-slate-500 transition-colors hover:text-forest-900 dark:hover:text-white">
        <ArrowLeft className="h-3.5 w-3.5" /> All clients
      </button>

      {/* header */}
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-forest-950 dark:text-white">
            {client.name} <StageBadge stage={client.stage} />
          </h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {client.phone}</span>
            <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {client.email}</span>
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {client.area}</span>
          </p>
        </div>
        {actionLabel && (
          <Btn onClick={() => advanceStage(client.id)}>
            {actionLabel} <ArrowRight className="h-3.5 w-3.5" />
          </Btn>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {/* deal facts */}
          <Card title={client.type === 'seller' ? 'Their listing' : 'The deal'}>
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {client.type === 'seller' ? (
                <>
                  <KV k="Listing" v={listing?.short ?? '—'} />
                  <KV k="List price" v={listing ? money(listing.price) : client.price ? money(client.price) : '—'} />
                  <KV k="Status" v={listing?.status ?? '—'} />
                  <KV k="Closing" v={client.closingDate ? fmtDateFull(client.closingDate) : '—'} />
                </>
              ) : (
                <>
                  <KV k="Budget" v={client.budget ? money(client.budget) : '—'} />
                  <KV k={client.stage === 'Under Contract' || client.stage === 'Closed' ? 'Contract price' : 'Offer price'} v={client.price ? money(client.price) : '—'} />
                  <KV k="Showings so far" v={client.showingsDone ?? 0} />
                  <KV k="Closing" v={client.closingDate ? fmtDateFull(client.closingDate) : '—'} />
                </>
              )}
            </dl>
            {client.property && (
              <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-[13px] text-slate-600 dark:bg-white/5 dark:text-slate-300">🏠 {client.property}</p>
            )}
            {client.wishlist && !client.property && (
              <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-[13px] italic text-slate-500 dark:bg-white/5 dark:text-slate-400">“{client.wishlist}”</p>
            )}
          </Card>

          {/* contract deadlines */}
          {(client.deadlines ?? []).length > 0 && (
            <Card title="Contract deadlines" sub="Miss one of these and everybody has a bad week.">
              <ul className="space-y-2">
                {client.deadlines.map((dl, i) => {
                  const n = daysUntil(dl.date)
                  const urgent = n !== null && n <= 5
                  return (
                    <li key={i} className="flex items-center gap-3">
                      <span className={cx('grid h-7 w-7 shrink-0 place-items-center rounded-lg ring-1 ring-inset', urgent ? 'bg-rose-50 text-rose-600 ring-rose-600/20 dark:bg-rose-500/15' : 'bg-slate-50 text-slate-500 ring-slate-400/20 dark:bg-white/5')}>
                        <CalendarDays className="h-3.5 w-3.5" strokeWidth={1.75} />
                      </span>
                      <span className="flex-1 text-[13px] font-medium text-slate-700 dark:text-slate-200">{dl.label}</span>
                      <span className={cx('text-xs tabular-nums', urgent ? 'font-semibold text-rose-600' : 'text-slate-400')}>
                        {fmtDateFull(dl.date)} · {relDate(dl.date)}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </Card>
          )}

          {/* financing slot */}
          <FinancingPanel client={client} />

          {/* timeline */}
          <Card title="Timeline" pad={false}>
            <ul className="divide-y divide-slate-100 dark:divide-white/[0.06]">
              {timeline.map((e, i) => (
                <li key={i} className="flex items-start gap-3 px-5 py-2.5">
                  <span className="w-16 shrink-0 pt-0.5 text-[11px] text-slate-400 tabular-nums">{fmtDate(e.date)}</span>
                  <span className={cx('min-w-0 flex-1 text-[13px]', e.type === 'financing' ? 'text-forest-700 dark:text-forest-200' : 'text-slate-600 dark:text-slate-300')}>
                    {e.type === 'financing' && <Sparkles className="mr-1 inline h-3 w-3" />}
                    {e.text}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* right rail */}
        <div className="space-y-4">
          <Card title="Next touch" sub={client.nextTouch ? `${fmtDateFull(client.nextTouch)} · ${relDate(client.nextTouch)}` : 'Nothing scheduled'}>
            <div className="flex gap-2">
              <input type="date" className={inputCls} value={touchDate} onChange={(e) => setTouchDate(e.target.value)} />
              <Btn variant="outline" disabled={!touchDate} onClick={() => { setNextTouch(client.id, touchDate); setTouchDate('') }}>
                <Check className="h-3.5 w-3.5" /> Set
              </Btn>
            </div>
          </Card>

          <Card title="Notes" pad={false}>
            <form onSubmit={submitNote} className="border-b border-slate-100 p-4 dark:border-white/10">
              <textarea
                rows={2}
                className="w-full resize-none rounded-lg border border-slate-300/70 bg-white px-2.5 py-2 text-[13px] text-slate-700 transition-colors placeholder:text-slate-400 focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/15 dark:border-white/15 dark:bg-white/5 dark:text-slate-100"
                placeholder="Add a note…"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
              />
              <Btn type="submit" sm className="mt-2" disabled={!noteText.trim()}>
                <PenLine className="h-3 w-3" /> Save note
              </Btn>
            </form>
            {client.notes.length === 0 ? (
              <EmptyState icon={StickyNote} title="No notes yet" />
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                {client.notes.map((n) => (
                  <li key={n.id} className="px-4 py-3">
                    <p className="text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">{n.text}</p>
                    <p className="mt-1 text-[11px] text-slate-400 tabular-nums">{fmtDateFull(n.date)}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Source">
            <div className="flex items-center justify-between">
              <Badge cls="bg-slate-100 text-slate-600 ring-slate-400/30">{client.source}</Badge>
              <span className="text-xs text-slate-400">client since {fmtDate(client.createdAt)}</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
