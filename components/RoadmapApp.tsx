"use client";

import { useMemo, useState } from "react";
import {
  SPRINT,
  phases,
  checkpoints,
  allMilestones,
  trackColors,
  taskById,
  type Milestone,
  type Owner,
} from "@/lib/roadmap";
import { useProgress, countDone, getSavedActorName } from "@/lib/useProgress";
import { useHistory, type HistoryEntry } from "@/lib/useHistory";

const OWNER_OPTIONS: Owner[] = ["Dominique", "François", "Open"];
const ACTOR_OPTIONS: Owner[] = ["Dominique", "François"];

export default function RoadmapApp() {
  const {
    ready,
    progress,
    get,
    update,
    reset,
    unlocked,
    unlocking,
    unlock,
    authError,
  } = useProgress();
  const [selectedId, setSelectedId] = useState<string>(allMilestones[0].id);

  const selected = useMemo(
    () => allMilestones.find((m) => m.id === selectedId) ?? allMilestones[0],
    [selectedId]
  );

  const totalTasks = useMemo(
    () => allMilestones.reduce((n, m) => n + m.tasks.length, 0),
    []
  );
  const totalDone = useMemo(
    () =>
      countDone(
        progress,
        allMilestones.flatMap((m) => m.tasks.map((t) => t.id))
      ),
    [progress]
  );

  const ownerCount = (owner: Owner) =>
    allMilestones
      .flatMap((m) => m.tasks)
      .filter((t) => {
        const st = progress[t.id];
        const effective = st?.owner ?? t.suggestedOwner;
        return effective === owner && !(st?.done ?? false);
      }).length;

  if (authError) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <p className="font-display text-2xl font-black italic uppercase text-lime">
          Setup required
        </p>
        <p className="mt-3 text-sm text-mist">{authError}</p>
        <p className="mt-2 text-xs text-dim">
          Add the NEXT_PUBLIC_FIREBASE_* variables (see .env.local.example) and redeploy.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-24 sm:px-8">
      {/* ============================== HEADER ============================== */}
      <header className="border-b border-line pb-6 pt-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-display text-sm font-semibold uppercase tracking-[0.25em] text-lime">
              PürInstinct · Sport at its purest
            </p>
            <h1 className="font-display text-5xl font-black italic uppercase leading-none sm:text-6xl">
              60-Day <span className="text-lime">Blueprint</span>
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-mist">
              {SPRINT.subtitle} · {SPRINT.range}. Click any milestone on the map
              to open its task list — assign, complete, and leave notes.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <Stat label="Tasks done" value={`${totalDone}/${totalTasks}`} />
            <Stat label="Dominique open" value={String(ready ? ownerCount("Dominique") : "–")} />
            <Stat label="François open" value={String(ready ? ownerCount("François") : "–")} />
          </div>
        </div>

        {/* overall progress bar */}
        <div className="mt-5 h-2 w-full bg-panel">
          <div
            className="h-2 bg-lime"
            style={{ width: `${totalTasks ? Math.round((totalDone / totalTasks) * 100) : 0}%` }}
          />
        </div>

        {/* track legend */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-4 text-xs uppercase tracking-widest text-dim">
            {Object.entries(trackColors).map(([track, color]) => (
              <span key={track} className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5" style={{ background: color }} />
                {track}
              </span>
            ))}
          </div>
          <AccessBar unlocked={unlocked} unlocking={unlocking} unlock={unlock} reset={reset} />
        </div>
      </header>

      {/* ============================== BODY ============================== */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(380px,460px)]">
        {/* ------------------------------ MAP ------------------------------ */}
        <section aria-label="Roadmap map">
          {phases.map((phase) => {
            const checkpoint = checkpoints.find((c) => c.afterPhase === phase.id);
            return (
              <div key={phase.id} className="relative pl-6">
                {/* spine */}
                <span className="absolute left-0 top-0 h-full w-[3px] bg-line" aria-hidden />
                <span className="absolute left-[-4.5px] top-1 h-3 w-3 bg-lime" aria-hidden />

                <div className="pb-2 pt-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h2 className="font-display text-3xl font-black italic uppercase">
                      {phase.name}
                    </h2>
                    <span className="font-display text-sm font-semibold uppercase tracking-widest text-dim">
                      {phase.dates}
                    </span>
                  </div>
                  <p className="mt-1 max-w-3xl text-sm text-dim">{phase.intent}</p>
                </div>

                <div className="grid gap-3 pb-8 pt-3 sm:grid-cols-2 xl:grid-cols-3">
                  {phase.milestones.map((m) => (
                    <MilestoneCard
                      key={m.id}
                      milestone={m}
                      active={m.id === selectedId}
                      done={countDone(progress, m.tasks.map((t) => t.id))}
                      onSelect={() => setSelectedId(m.id)}
                    />
                  ))}
                </div>

                {checkpoint && (
                  <div className="mb-10 border border-lime bg-panel p-4">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="font-display text-xl font-black italic uppercase text-lime">
                        Checkpoint {checkpoint.code}
                      </p>
                      <p className="font-display text-sm font-semibold uppercase tracking-widest text-mist">
                        {checkpoint.day}
                      </p>
                    </div>
                    <ul className="mt-2 grid gap-1 text-sm text-mist sm:grid-cols-3">
                      {checkpoint.criteria.map((c) => (
                        <li key={c} className="flex gap-2">
                          <span className="text-lime">/</span>
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}

          <HistoryPanel />
        </section>

        {/* --------------------------- DETAIL PANEL --------------------------- */}
        <aside className="lg:sticky lg:top-6 lg:h-fit" aria-label="Milestone detail">
          <MilestoneDetail
            milestone={selected}
            getState={get}
            update={update}
            unlocked={unlocked}
          />
        </aside>
      </div>

      <footer className="mt-16 border-t border-line pt-4 text-xs text-dim">
        PürInstinct Worldwide Inc. · Confidential working document · Progress is
        shared live via Firebase — every change is logged in the history below.
      </footer>
    </div>
  );
}

/* ================================ pieces ================================ */

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-right">
      <p className="font-display text-3xl font-black leading-none text-lime">{value}</p>
      <p className="text-[11px] uppercase tracking-widest text-dim">{label}</p>
    </div>
  );
}

function AccessBar({
  unlocked,
  unlocking,
  unlock,
  reset,
}: {
  unlocked: boolean;
  unlocking: boolean;
  unlock: (name: string, password: string) => Promise<boolean>;
  reset: () => Promise<void>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState<Owner>(
    (getSavedActorName() as Owner) ?? "Dominique"
  );
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (unlocked) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-xs uppercase tracking-widest text-lime">
          Unlocked{getSavedActorName() ? ` — ${getSavedActorName()}` : ""}
        </span>
        <button
          onClick={() => {
            if (window.confirm("Reset all shared progress? This clears every checkbox, owner and note — history is kept.")) {
              reset();
            }
          }}
          className="border border-line px-3 py-2 text-xs uppercase tracking-widest text-dim hover:border-lime hover:text-lime"
        >
          Reset
        </button>
      </div>
    );
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="border border-line px-3 py-2 text-xs uppercase tracking-widest text-dim hover:border-lime hover:text-lime"
      >
        Locked — unlock to edit
      </button>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        const ok = await unlock(name, password);
        if (ok) {
          setShowForm(false);
          setPassword("");
        } else {
          setError("Wrong password.");
        }
      }}
      className="flex flex-wrap items-center gap-2"
    >
      {ACTOR_OPTIONS.map((o) => (
        <button
          type="button"
          key={o}
          onClick={() => setName(o)}
          aria-pressed={name === o}
          className={`border px-2 py-2 text-xs font-semibold uppercase tracking-wider ${
            name === o
              ? "border-lime bg-lime text-ink"
              : "border-line text-dim hover:border-mist hover:text-mist"
          }`}
        >
          {o}
        </button>
      ))}
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        autoFocus
        className="border border-line bg-ink px-2 py-2 text-xs text-mist placeholder:text-dim"
      />
      <button
        type="submit"
        disabled={unlocking || !password}
        className="border border-lime bg-lime px-3 py-2 text-xs font-semibold uppercase tracking-widest text-ink disabled:opacity-50"
      >
        {unlocking ? "…" : "Unlock"}
      </button>
      {error && <span className="text-xs text-[#FF7A59]">{error}</span>}
    </form>
  );
}

function MilestoneCard({
  milestone,
  active,
  done,
  onSelect,
}: {
  milestone: Milestone;
  active: boolean;
  done: number;
  onSelect: () => void;
}) {
  const total = milestone.tasks.length;
  const complete = done === total;
  return (
    <button
      onClick={onSelect}
      aria-pressed={active}
      className={`group relative border p-4 text-left ${
        active
          ? "border-lime bg-panel2"
          : "border-line bg-panel hover:border-mist"
      }`}
    >
      <span
        className="absolute left-0 top-0 h-full w-[4px]"
        style={{ background: trackColors[milestone.track] }}
        aria-hidden
      />
      <div className="flex items-baseline justify-between gap-2 pl-2">
        <span className="font-display text-sm font-semibold uppercase tracking-widest text-dim">
          {milestone.code} · {milestone.track}
        </span>
        <span
          className={`font-display text-sm font-black ${
            complete ? "text-lime" : "text-mist"
          }`}
        >
          {done}/{total}
        </span>
      </div>
      <h3 className="mt-1 pl-2 font-display text-2xl font-black italic uppercase leading-tight">
        {milestone.title}
      </h3>
      <p className="mt-1 pl-2 text-xs uppercase tracking-widest text-dim">
        {milestone.window}
      </p>
      <div className="ml-2 mt-3 h-1.5 bg-ink">
        <div
          className="h-1.5"
          style={{
            width: `${total ? (done / total) * 100 : 0}%`,
            background: trackColors[milestone.track],
          }}
        />
      </div>
    </button>
  );
}

function MilestoneDetail({
  milestone,
  getState,
  update,
  unlocked,
}: {
  milestone: Milestone;
  getState: ReturnType<typeof useProgress>["get"];
  update: ReturnType<typeof useProgress>["update"];
  unlocked: boolean;
}) {
  const done = milestone.tasks.filter((t) => getState(t.id).done).length;
  return (
    <div className="border border-line bg-panel">
      <div
        className="border-b border-line p-5"
        style={{ borderTop: `4px solid ${trackColors[milestone.track]}` }}
      >
        <p className="font-display text-sm font-semibold uppercase tracking-widest text-dim">
          {milestone.code} · {milestone.track} · {milestone.window}
        </p>
        <h2 className="mt-1 font-display text-3xl font-black italic uppercase leading-none">
          {milestone.title}
        </h2>
        <p className="mt-2 text-sm text-mist">{milestone.goal}</p>
        <p className="mt-3 font-display text-lg font-black text-lime">
          {done}/{milestone.tasks.length} tasks complete
        </p>
      </div>

      <ul>
        {milestone.tasks.map((task) => {
          const st = getState(task.id);
          const owner = st.owner ?? task.suggestedOwner;
          return (
            <li key={task.id} className="border-b border-line p-5 last:border-b-0">
              <div className="flex items-start gap-3">
                <input
                  id={`done-${task.id}`}
                  type="checkbox"
                  checked={st.done}
                  disabled={!unlocked}
                  onChange={(e) => update(task.id, { done: e.target.checked })}
                  className="mt-1 h-5 w-5 shrink-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label={`Mark "${task.title}" complete`}
                />
                <div className="min-w-0 flex-1">
                  <label
                    htmlFor={`done-${task.id}`}
                    className={`block cursor-pointer font-medium leading-snug ${
                      st.done ? "text-dim line-through" : "text-white"
                    }`}
                  >
                    {task.title}
                  </label>
                  {task.detail && (
                    <p className="mt-1 text-sm text-dim">{task.detail}</p>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] uppercase tracking-widest text-dim">
                      Owner
                    </span>
                    {OWNER_OPTIONS.map((o) => (
                      <button
                        key={o}
                        disabled={!unlocked}
                        onClick={() => update(task.id, { owner: o })}
                        aria-pressed={owner === o}
                        className={`border px-3 py-1 text-xs font-semibold uppercase tracking-wider disabled:cursor-not-allowed disabled:opacity-40 ${
                          owner === o
                            ? o === "Open"
                              ? "border-mist bg-mist text-ink"
                              : "border-lime bg-lime text-ink"
                            : "border-line text-dim hover:border-mist hover:text-mist"
                        }`}
                      >
                        {o === "Open" ? "To assign" : o}
                      </button>
                    ))}
                    {st.owner === null && (
                      <span className="text-[11px] italic text-dim">
                        suggested
                      </span>
                    )}
                  </div>

                  <textarea
                    value={st.notes}
                    disabled={!unlocked}
                    onChange={(e) => update(task.id, { notes: e.target.value })}
                    placeholder="Notes — decisions, contacts, blockers…"
                    rows={st.notes ? Math.min(6, st.notes.split("\n").length + 1) : 2}
                    className="mt-3 w-full border border-line bg-ink p-2 text-sm text-mist placeholder:text-dim disabled:cursor-not-allowed disabled:opacity-40"
                  />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function timeAgo(date: Date | null): string {
  if (!date) return "";
  const seconds = Math.max(0, Math.round((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

function describeEntry(entry: HistoryEntry): string {
  if (entry.field === "reset") return "reset the entire board";
  const task = entry.taskId ? taskById(entry.taskId) : undefined;
  const label = task?.title ?? entry.taskId ?? "a task";
  switch (entry.field) {
    case "done":
      return entry.value ? `marked "${label}" done` : `reopened "${label}"`;
    case "owner":
      return `assigned "${label}" to ${entry.value ?? "To assign"}`;
    case "notes":
      return `edited notes on "${label}"`;
    default:
      return `updated "${label}"`;
  }
}

function HistoryPanel() {
  const entries = useHistory(50);
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-10 border border-line bg-panel">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between p-4 text-left"
      >
        <span className="font-display text-xl font-black italic uppercase">
          Historique récent
        </span>
        <span className="text-xs uppercase tracking-widest text-dim">
          {open ? "Hide" : "Show"} · {entries.length} entries
        </span>
      </button>
      {open && (
        <ul className="max-h-[420px] overflow-y-auto border-t border-line">
          {entries.length === 0 && (
            <li className="p-4 text-sm text-dim">No changes logged yet.</li>
          )}
          {entries.map((entry) => (
            <li key={entry.id} className="flex items-baseline justify-between gap-4 border-b border-line p-3 text-sm last:border-b-0">
              <span className="text-mist">
                <span className="font-semibold text-lime">{entry.actorName}</span>{" "}
                {describeEntry(entry)}
              </span>
              <span className="shrink-0 text-xs text-dim">{timeAgo(entry.at)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
