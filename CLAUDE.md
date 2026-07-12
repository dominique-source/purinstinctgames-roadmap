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
  checkpoints, track colors. Content edits happen here only.
- `lib/useProgress.ts` — localStorage store (`purinstinct-roadmap-v1`):
  `{ [taskId]: { owner, done, notes } }`. Task ids must stay stable.
- `components/RoadmapApp.tsx` — the whole UI (map left, sticky detail panel
  right; stacks on mobile).
- No backend. If shared state is ever needed, replace `useProgress` with an
  API-backed store; keep the same interface.

## Conventions
- French proper nouns keep accents (François, Québec, PürInstinct).
- Owners are exactly: "Dominique" | "François" | "Open" (shown as "To assign").
- Run `npm run build` before pushing — TypeScript strict must pass.
