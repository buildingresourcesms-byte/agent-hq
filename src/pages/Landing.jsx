import { ArrowRight, Link2 } from 'lucide-react'
import { useApp } from '../store.jsx'
import { AGENTS, DISCLAIMER, timeOfDay, SKY } from '../data.js'
import { BrandMark, cx } from '../ui.jsx'

function SignInRow({ a, onClick, featured }) {
  return (
    <button
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-left transition-colors hover:border-white/20 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/50"
    >
      <span className={cx('grid h-10 w-10 shrink-0 place-items-center rounded-full text-xs font-semibold text-white ring-1 ring-black/[0.08]', a.color)}>
        {a.initials}
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-white">
          {a.name}
          {featured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gold-400/15 px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide text-gold-300 ring-1 ring-inset ring-gold-400/30">
              <Link2 className="h-2.5 w-2.5" /> lender linked
            </span>
          )}
        </p>
        <p className="truncate text-xs text-forest-300">{a.brokerage} · {a.market}</p>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-forest-400 transition-all group-hover:translate-x-0.5 group-hover:text-gold-300" />
    </button>
  )
}

export default function Landing() {
  const { signIn } = useApp()
  const accent = SKY[timeOfDay()].accent

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-gradient-to-br from-forest-950 via-forest-900 to-forest-800 px-4 py-10">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-72"
        style={{ background: `radial-gradient(80% 60% at 50% 0%, ${accent}, transparent 70%)` }}
      />
      <div className="relative w-full max-w-md">
        {/* brand */}
        <div className="text-center">
          <BrandMark className="mx-auto h-14 w-14" />
          <h1 className="font-display mt-4 text-2xl font-semibold text-white">AgentHQ</h1>
          <p className="text-sm text-forest-300">The workspace that works for you</p>
          <p className="mx-auto mt-3 max-w-xs text-[13px] leading-relaxed text-forest-200">
            Your clients, listings, showings, and commissions — one tap each. Link your favorite
            loan officer and financing updates show up by themselves.
          </p>
        </div>

        {/* sign-in card */}
        <div className="mt-7 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.5)]">
          <p className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-wider text-forest-400">Sign in as</p>
          <div className="space-y-2">
            {AGENTS.map((a) => (
              <SignInRow key={a.id} a={a} featured={a.linked} onClick={() => signIn(a.id)} />
            ))}
          </div>
          <p className="mt-3 px-1 text-[11px] leading-relaxed text-forest-400">
            Holly’s seat is linked with her loan officer’s MS Lending workspace. Bree and Carl run
            theirs standalone — everything still works.
          </p>
        </div>

        <p className="mx-auto mt-5 max-w-xs text-center text-[10px] leading-relaxed text-forest-500">{DISCLAIMER}</p>
      </div>
    </div>
  )
}
