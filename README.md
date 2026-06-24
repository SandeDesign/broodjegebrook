# Eufraat — eigen bestelplatform

Volledig eigen online bestel-platform voor restaurant **Eufraat** in Geleen.
Vervangt de afhankelijkheid van Bistroo / Thuisbezorgd (geen commissie meer, eigen klantenrelatie, eigen acties).

## Stack

- **Klantsite** (`apps/web`) — Next.js 15 + Tailwind + shadcn/ui → `eufraat.nl`
- **Staff/keuken-app** (`apps/app`) — Next.js 15 PWA → `app.eufraat.nl`
- **Backend** — Firebase: Firestore + Cloud Functions + Auth + Storage + FCM
- **Gedeelde packages** — Zod-schemas, Firebase-client/hooks, UI-componenten
- **Monorepo** — pnpm workspaces + Turborepo

## Repo

```
apps/
  web/   ← klantwebsite
  app/   ← in-store / staff PWA
packages/
  schemas/   ← Zod (Order, MenuItem, Customer) — gedeeld web + app + functions
  firebase/  ← typed Firestore converters, hooks
  ui/        ← gedeelde React-componenten
  config/    ← Tailwind preset, ESLint, TS config
firebase/
  functions/ ← Cloud Functions
  firestore.rules
  storage.rules
```

## Lokaal draaien

```bash
pnpm install
pnpm emulators    # Firebase emulators
pnpm dev          # web + app in parallel
pnpm seed         # menu zaaien (eenmalig)
```

`apps/web` → http://localhost:3000  ·  `apps/app` → http://localhost:3001

## Status

Fase 1 (MVP): scaffolding + datamodel + bestelflow + orderscherm. Zie [`/root/.claude/plans/ik-wil-graag-op-rosy-kahan.md`](.) voor de roadmap.

## Restaurant

Eufraat · Rijksweg Centrum 38, 6161 EG Geleen · +31 46 410 67 45
