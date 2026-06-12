import { useMemo, useState } from 'react'
import QRCode from 'react-qr-code'
import {
  Landmark,
  Link2,
  Send,
  Sparkles,
  Coffee,
  Copy,
  ArrowRight,
  Phone,
  Mail,
  FileText,
  PenLine,
  Zap,
  HeartHandshake,
} from 'lucide-react'
import { useApp } from '../store.jsx'
import { LOAN_STAGES, loanStageIndex, coBrandedLink, money, fmtDate, relDate } from '../data.js'
import { PageHeader, Card, Btn, Badge, Field, Select, inputCls, ProgressBar, EmptyState, FinancingBadge, cx } from '../ui.jsx'

/* ---------- one-tap referral (from the hub) ---------- */
function ReferCard() {
  const { clients, seat, sendReferral, julene } = useApp()
  const candidates = useMemo(
    () =>
      clients.filter(
        (c) => c.agentId === seat && c.type !== 'seller' && c.financing?.kind !== 'linked' && c.stage !== 'Closed' && c.stage !== 'Lost',
      ),
    [clients, seat],
  )
  const [pick, setPick] = useState(candidates[0]?.id ?? '')
  const [loanType, setLoanType] = useState('Conventional')
  const chosen = candidates.find((c) => c.id === pick)

  return (
    <Card title="Send a buyer in 30 seconds" sub={`One tap — ${julene.name.split(' ')[0]} calls them today.`}>
      {candidates.length === 0 ? (
        <p className="text-[13px] text-slate-500 dark:text-slate-400">Every active buyer is already with MS Lending. Nice. 🎉</p>
      ) : (
        <div className="space-y-3">
          <Field label="Which buyer?">
            <Select value={pick} onChange={setPick} options={candidates.map((c) => ({ value: c.id, label: `${c.name} — ${c.stage}` }))} />
          </Field>
          <Field label="Likely loan type">
            <Select value={loanType} onChange={setLoanType} options={['Conventional', 'FHA', 'VA', 'Jumbo']} />
          </Field>
          <Btn
            variant="gold"
            className="w-full"
            disabled={!chosen}
            onClick={() => chosen && sendReferral({ clientId: chosen.id, name: chosen.name, phone: chosen.phone, loanType, purpose: 'Purchase' })}
          >
            <Send className="h-3.5 w-3.5" /> Refer {chosen ? chosen.name.split(' ')[0] : ''} to {julene.name.split(' ')[0]}
          </Btn>
        </div>
      )}
    </Card>
  )
}

/* ---------- the unlinked pitch (Bree & Carl's default) ---------- */
function UnlinkedHub() {
  const { connectLender, lenderLink, clients, seat, julene, openClient } = useApp()
  const myBuyers = clients.filter((c) => c.agentId === seat && c.type !== 'seller' && c.stage !== 'Closed' && c.stage !== 'Lost')
  const inviting = lenderLink.status === 'invited'

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-4">
        <Card pad={false} className="overflow-hidden">
          <div className="relative bg-gradient-to-br from-forest-800 via-forest-900 to-forest-950 px-6 py-8">
            <Link2 className="absolute -right-4 -top-6 h-32 w-32 text-white/[0.05]" strokeWidth={1} />
            <Badge cls="bg-gold-400/15 text-gold-300 ring-gold-400/30">Optional — your app works without it</Badge>
            <h2 className="mt-3 text-xl font-semibold tracking-tight text-white">Stop texting “any update?”</h2>
            <p className="mt-2 max-w-md text-[13px] leading-relaxed text-forest-200">
              Your buyers’ financing already lives on each client card — log it however you like.
              But when your favorite loan officer runs the MS Lending workspace, one link makes
              every milestone show up here <span className="font-medium text-white">by itself</span>.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Btn variant="gold" onClick={connectLender} disabled={inviting}>
                {inviting ? 'Invite sent — waiting…' : <><Link2 className="h-3.5 w-3.5" /> Connect to loan officer</>}
              </Btn>
              <span className="text-xs text-forest-300">Free. Two taps. Either side can unlink anytime.</span>
            </div>
          </div>
          <div className="grid gap-px bg-slate-100 sm:grid-cols-3 dark:bg-white/10">
            {[
              { icon: Zap, title: 'Live milestones', sub: 'Every stage pushed to you automatically' },
              { icon: FileText, title: 'Instant letters', sub: 'Pre-approval letters that match the offer' },
              { icon: HeartHandshake, title: 'A fair ledger', sub: 'Referrals counted in both directions' },
            ].map((f) => (
              <div key={f.title} className="bg-white px-5 py-4 dark:bg-forest-900">
                <f.icon className="h-4 w-4 text-forest-600 dark:text-forest-300" strokeWidth={1.75} />
                <p className="mt-1.5 text-[13px] font-semibold text-forest-950 dark:text-white">{f.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-400">{f.sub}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Your buyers' financing today" sub="Manual works fine — that's the point." pad={false}>
          {myBuyers.length === 0 ? (
            <EmptyState icon={Landmark} title="No active buyers" />
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-white/[0.06]">
              {myBuyers.map((c) => (
                <li key={c.id}>
                  <button onClick={() => openClient(c.id)} className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.04]">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-forest-950 dark:text-white">{c.name}</p>
                      <p className="truncate text-xs text-slate-400">
                        {c.financing?.kind === 'manual'
                          ? `${c.financing.lender} — ${c.financing.notesLog?.[0]?.text ?? 'no status logged yet'}`
                          : c.financing?.kind === 'cash'
                            ? 'Cash buyer — proof of funds on file'
                            : 'Financing not started — log it on their card'}
                      </p>
                    </div>
                    <FinancingBadge kind={c.financing?.kind ?? 'none'} />
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card title="Who you'd be linking" sub="Their lender keeps their own workspace.">
        <div className="flex items-center gap-3">
          <span className={cx('grid h-11 w-11 shrink-0 place-items-center rounded-full text-xs font-semibold text-white', julene.color)}>{julene.initials}</span>
          <div className="min-w-0">
            <p className="truncate text-[14px] font-semibold text-forest-950 dark:text-white">{julene.name}</p>
            <p className="truncate text-xs text-slate-400">{julene.role} · {julene.org} · {julene.nmls}</p>
          </div>
        </div>
        <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-white/10 dark:text-slate-400">
          <p className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {julene.phone}</p>
          <p className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> {julene.email}</p>
        </div>
        <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-relaxed text-slate-500 dark:bg-white/5 dark:text-slate-400">
          She runs the MS Lending loan workspace — AgentHQ’s sister program. Neither of you needs
          the other’s software. Linked, they talk to each other so you two don’t have to.
        </p>
      </Card>
    </div>
  )
}

/* ---------- the linked hub (Holly's seat) ---------- */
function LinkedHub() {
  const { clients, seat, julene, lenderLink, currentAgent, milestones, referralsSent, referralsReceived, loanStatusFor, openClient, toast } = useApp()
  const linked = clients.filter((c) => c.agentId === seat && c.financing?.kind === 'linked' && c.stage !== 'Closed')
  const link = coBrandedLink(currentAgent)
  const sent = referralsSent.length
  const received = referralsReceived.length
  const owes = sent > received ? julene.name.split(' ')[0] : sent < received ? 'you' : 'nobody'

  return (
    <div className="space-y-4">
      {/* linked banner */}
      <Card pad={false} className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-4 bg-gradient-to-r from-forest-900 to-forest-800 px-5 py-4">
          <span className={cx('grid h-11 w-11 shrink-0 place-items-center rounded-full text-xs font-semibold text-white ring-2 ring-gold-400/40', julene.color)}>
            {julene.initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="flex flex-wrap items-center gap-2 text-[14px] font-semibold text-white">
              Linked with {julene.name}
              <Badge cls="bg-gold-400/15 text-gold-300 ring-gold-400/30">
                <span className="animate-livedot mr-0.5 inline-block h-1.5 w-1.5 rounded-full bg-gold-300" /> live since {fmtDate(lenderLink.since)}
              </Badge>
            </p>
            <p className="truncate text-xs text-forest-300">{julene.role} · {julene.org} · {julene.nmls} · {julene.phone}</p>
          </div>
          <p className="text-xs italic text-forest-300">You never have to ask “any update?” again.</p>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* live panels */}
        <div className="space-y-4 lg:col-span-2">
          <Card title="Buyers financing with MS Lending" sub="Live — exactly what Julene's workspace shows her" pad={false}>
            <ul className="divide-y divide-slate-100 dark:divide-white/[0.06]">
              {linked.map((c) => {
                const fin = loanStatusFor(c)
                const idx = loanStageIndex(fin.stage)
                return (
                  <li key={c.id} className="px-5 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <button onClick={() => openClient(c.id)} className="truncate text-[13px] font-semibold text-forest-950 transition-colors hover:text-forest-700 dark:text-white">
                        {c.name} <ArrowRight className="inline h-3 w-3 text-slate-300" />
                      </button>
                      <span className="text-xs text-slate-400 tabular-nums">est. closing {fmtDate(fin.estClosing)} ({relDate(fin.estClosing)})</span>
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <ProgressBar pct={((idx + 1) / LOAN_STAGES.length) * 100} className="h-2 flex-1" />
                      <span className="shrink-0 rounded-md bg-forest-50 px-2 py-0.5 text-[11px] font-medium text-forest-700 ring-1 ring-inset ring-forest-600/20 dark:bg-forest-500/15 dark:text-forest-200">
                        {fin.stage}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-slate-400">
                      <span className="font-medium text-slate-500 dark:text-slate-300">Next:</span> {fin.nextStep ?? LOAN_STAGES[idx]?.blurb}
                    </p>
                  </li>
                )
              })}
            </ul>
          </Card>

          {/* milestone feed */}
          <Card
            title="Milestone feed"
            sub="Auto-pushed from the MS Lending workspace"
            pad={false}
            action={
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-forest-600 dark:text-forest-300">
                <span className="animate-livedot h-1.5 w-1.5 rounded-full bg-forest-500" /> auto-updates
              </span>
            }
          >
            <ul className="divide-y divide-slate-100 dark:divide-white/[0.06]">
              {milestones.slice(0, 6).map((m) => (
                <li key={m.id} className="flex items-start gap-3 px-5 py-2.5">
                  <span className={cx('mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full', m.live ? 'bg-gold-50 text-gold-600 dark:bg-gold-500/15' : 'bg-forest-50 text-forest-600 dark:bg-forest-500/15')}>
                    <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] text-slate-600 dark:text-slate-300">{m.text}</p>
                    <p className="truncate text-xs text-slate-400">{m.name} · {fmtDate(m.date)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* right rail */}
        <div className="space-y-4">
          <ReferCard />

          {/* reciprocity ledger */}
          <Card title="The ledger" sub="Referrals go both ways here.">
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="rounded-xl bg-forest-50 px-3 py-3 dark:bg-forest-500/10">
                <p className="text-xl font-semibold text-forest-800 tabular-nums dark:text-forest-200">{sent}</p>
                <p className="text-[11px] text-forest-600 dark:text-forest-300">you sent her</p>
              </div>
              <div className="rounded-xl bg-gold-50 px-3 py-3 dark:bg-gold-500/10">
                <p className="text-xl font-semibold text-gold-800 tabular-nums dark:text-gold-200">{received}</p>
                <p className="text-[11px] text-gold-700 dark:text-gold-300">she sent you</p>
              </div>
            </div>
            <p className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-slate-50 px-3 py-2 text-center text-xs font-medium text-slate-600 dark:bg-white/5 dark:text-slate-300">
              <Coffee className="h-3.5 w-3.5 text-gold-600" />
              {owes === 'nobody' ? 'Dead even — split the coffee.' : `${owes === 'you' ? 'You owe Julene' : 'Julene owes you'} a coffee ☕`}
            </p>
            <ul className="mt-3 space-y-1.5 border-t border-slate-100 pt-3 dark:border-white/10">
              {referralsReceived.map((r) => (
                <li key={r.id} className="text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-medium text-slate-600 dark:text-slate-300">{r.name}</span> — {r.note}
                  <span className="text-slate-400"> · {fmtDate(r.date)}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* co-branded apply link */}
          <Card title="Co-branded apply link" sub="Your name on her application.">
            <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200 dark:ring-white/20">
              <QRCode value={`https://${link}`} className="h-auto w-full" style={{ maxWidth: '100%' }} />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <code className="min-w-0 flex-1 truncate rounded-lg bg-slate-50 px-2.5 py-1.5 text-[11px] text-slate-600 dark:bg-white/5 dark:text-slate-300">{link}</code>
              <Btn
                variant="outline"
                sm
                onClick={() => {
                  try {
                    navigator.clipboard?.writeText(`https://${link}`)
                  } catch { /* clipboard unavailable in some contexts */ }
                  toast('Link copied — paste it anywhere', '🔗')
                }}
              >
                <Copy className="h-3 w-3" /> Copy
              </Btn>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
              Buyers who apply through it route to Julene and credit back to you — keep it in your
              listing flyers and Instagram bio.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function Financing() {
  const { isLinked, julene } = useApp()
  return (
    <div>
      <PageHeader
        title="Financing"
        sub={
          isLinked
            ? `Your lender link with ${julene.name} — live, two-way, zero nagging.`
            : 'Track every buyer’s financing your way — and see what one link could do.'
        }
      />
      {isLinked ? <LinkedHub /> : <UnlinkedHub />}
    </div>
  )
}
