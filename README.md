# PürInstinct — 60-Day Blueprint (Roadmap)

Interactive roadmap for the July 13 – September 13, 2026 sprint:
**close CAD $750K** and launch **PürInstinct Games + INSTINCT in parallel**.

- 4 phases · 12 clickable milestones · 4 checkpoints (C1–C4)
- Every milestone opens a task list: assign **Dominique / François / To assign**,
  mark **complete**, and write **notes**
- Progress is shared live via Firebase — everyone sees the same board, no
  device silos. Anyone can view; editing requires the shared passcode.
  Every change (who, what, when) is kept in an append-only history log.
- Brand system: `#0D0D0D` / `#CCFF00`, Barlow Condensed Black Italic, sharp
  geometry, **no animations** — built to be shown to a partner so they see
  exactly where they fit on the map.

## Firebase setup

See the "Firebase setup" section in `CLAUDE.md` for the one-time steps
(create project, enable Firestore + Anonymous Auth, set env vars, hash the
shared password, deploy `firestore.rules`). Copy `.env.local.example` to
`.env.local` and fill it in before running locally.

## Run locally

```bash
npm install
npm run dev
# → http://localhost:3000
```

## Deploy — GitHub + Vercel (5 minutes)

```bash
# 1. Create the repo (GitHub CLI) — or create it in the GitHub UI
gh repo create dominique-source/purinstinct-roadmap --private --source=. --push

# …or manually:
git init && git add -A && git commit -m "PurInstinct 60-day roadmap"
git branch -M main
git remote add origin git@github.com:dominique-source/purinstinct-roadmap.git
git push -u origin main

# 2. Deploy on Vercel
#    vercel.com → Add New → Project → import the repo → Deploy
#    (zero config needed — Next.js is auto-detected)
#    or with the CLI:
npx vercel --prod
```

## Edit the roadmap content

All content lives in **`lib/roadmap.ts`** — phases, milestones, tasks,
suggested owners and checkpoints. Add or edit tasks there; give each task a
unique `id` (existing progress is keyed by `id`, so renaming an id resets that
task's state).

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · local Barlow fonts.
