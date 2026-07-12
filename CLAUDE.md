# CLAUDE.md — purinstinct-roadmap

## What this is
Interactive 60-day roadmap (Jul 13 – Sep 13, 2026) for PürInstinct's $750K
seed sprint. Shown to partners/investors; also the founders' working tracker.

## Brand rules (non-negotiable)
- Colors: near-black `#0D0D0D` background, lime `#CCFF00` accent only.
  Track colors (Raise/Games/INSTINCT/Partners) are defined in `lib/roadmap.ts`.
- Type: Barlow Condensed Black Italic for headlines, Barlow for body
  (local fonts in `app/fonts/`, wired in `app/layout.tsx`).
- Sharp geometry: **no border-radius anywhere** (enforced globally in
  `app/globals.css`).
- **No animations / transitions.** This is deliberate — do not add them.

## Architecture
- `lib/roadmap.ts` — single source of truth for phases, milestones, tasks,
  checkpoints, track colors. Content edits happen here only. All display
  text is `Localized` (`{ en, fr }`); read it with `t(value, locale)`. Every
  new task/milestone/phase field needs both languages filled in.
- `lib/firebase.ts` — Firebase app/Firestore/Auth init from
  `NEXT_PUBLIC_FIREBASE_*` env vars (see `.env.local.example`). Silent
  anonymous auth gives every visitor a stable uid — no visible login.
- `lib/useProgress.ts` — Firestore-backed store, same shape as before
  (`{ [taskId]: { owner, done, notes } }`, task ids must stay stable), now
  shared live across every visitor instead of per-device localStorage.
  Also exposes `unlocked`/`unlock(name, password)` for the edit gate.
- `lib/useHistory.ts` — subscribes to the append-only `history` collection
  (who changed what, when) for the "Historique récent" panel.
- `components/RoadmapApp.tsx` — the whole UI (map left, sticky detail panel
  right; stacks on mobile), plus the unlock bar, history panel, and the
  EN/FR toggle (`COPY[locale]` holds UI chrome strings; choice persists in
  `localStorage`, defaults to EN).
- `firestore.rules` — anyone can read; editing (`tasks`/`history` writes)
  requires a `sessions/{uid}` doc, created only if the client's passcode hash
  matches `config/access` (set once by hand in the console — see below).

## Firebase setup (one-time, per environment)
1. console.firebase.google.com → Add project → enable **Firestore**
   (production mode) and **Authentication → Sign-in method → Anonymous**.
2. Project settings → Add app → Web → copy the config into `.env.local`
   (local) and into Vercel → Project → Settings → Environment Variables
   (production) — see `.env.local.example` for the exact keys.
3. Pick a shared edit password. Compute its hash without ever sending the
   plaintext anywhere: `printf '%s' 'the-password' | shasum -a 256`.
4. Firestore console → Data → create doc `config/access` with field
   `passcodeHash` = that hex string.
5. `npx firebase-tools login` (interactive) once, then set the real project
   id in `.firebaserc` and run `npx firebase-tools deploy --only firestore:rules`.
- To change the password later: repeat steps 3–4 with a new hash. Existing
  unlocked sessions keep working until someone clears that browser's storage.

## Conventions
- French proper nouns keep accents (François, Québec, PürInstinct).
- Owners are exactly: "Dominique" | "François" | "Open" (shown as "To assign").
- Run `npm run build` before pushing — TypeScript strict must pass.
