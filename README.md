# AgentHQ — the real-estate agent's workspace

A standalone demo workspace for real-estate agents: clients, listings, calendar, open-house
lead capture, commissions — plus an **optional** lender link to its sister product, the
[MS Lending loan-officer workspace](https://buildingresourcesms-byte.github.io/ms-lending-demo/).

**Live demo:** https://buildingresourcesms-byte.github.io/agent-hq/

> **All data is fictional.** This is a demo prototype only — every client, deal, listing, and
> number is sample data. Not intended for real client data or compliance use.
> (Julene Stewart's contact facts are real, from mslending.net; all of her "deals" here are fictional.)

## The idea

Neither side needs the other's software. An agent runs AgentHQ with any lender; a loan officer
runs their workspace with any agent. But when both sides have their program, **"Connect to loan
officer"** links them and everything flows automatically:

- **Live financing panels** — each shared buyer's loan stage, next step, and est. closing date
- **Instant pre-approval letters** — LO-capped, letter always matches the offer price, with an
  "ask for more room" escalation
- **One-tap referrals** — send a buyer in 30 seconds
- **Reciprocity ledger** — referrals counted both directions ("she owes you a coffee ☕")
- **Co-branded apply link + QR** — `apply.mslending.net/julene/holly`
- **Milestone feed** — auto-pushed updates, so nobody ever texts "any update?"

Two products, two buyers, one optional handshake.

## Demo seats

| Seat | Brokerage | Lender link |
|------|-----------|-------------|
| **Holly Sandifer** | McIntosh & Co. Realtors, Madison | ✅ linked with Julene Stewart (MS Lending) |
| Bree Thompson | Magnolia Realty Group, Brandon | ⬜ standalone — everything manual, everything works |
| Carl Jenkins | Crossgates Realty, Pearl & Flowood | ⬜ standalone |

Holly's pipeline includes the three deals shared with the LO demo (the Carters, the Ellises,
the Lawsons) **and** clients with no MS Lending involvement (a cash buyer, an other-lender
buyer, sellers) — proof the app stands on its own.

## Real cross-app integration (no backend)

Both demos deploy to the same GitHub Pages origin and share `localStorage` through a small
`plink:` key schema — referrals written here appear in the LO app; loan-stage writes from the
LO app light up Holly's financing panels live (via the `storage` event). See [BRIDGE.md](BRIDGE.md).

## Stack

React 19 · Vite · Tailwind CSS v4 · lucide-react · react-qr-code — 100% front-end, mock data.

```bash
npm install
npm run dev          # local dev
npm run build        # production build (dist/)
node scripts/make-single-file.mjs   # → AgentHQ-Demo.html (double-click, no server)
```

GitHub Pages serves from `main /docs` (a copy of `dist/`).
