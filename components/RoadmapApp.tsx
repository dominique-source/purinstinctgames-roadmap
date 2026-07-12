"use client";

import { useEffect, useMemo, useState } from "react";
import {
  SPRINT,
  phases,
  checkpoints,
  allMilestones,
  trackColors,
  trackLabels,
  taskById,
  t,
  type Locale,
  type Milestone,
  type Owner,
} from "@/lib/roadmap";
import { useProgress, countDone, getSavedActorName } from "@/lib/useProgress";
import { useHistory, type HistoryEntry } from "@/lib/useHistory";

const OWNER_OPTIONS: Owner[] = ["Dominique", "François", "Open"];
const ACTOR_OPTIONS: Owner[] = ["Dominique", "François"];
const LOCALE_KEY = "purinstinct-roadmap-locale";

const COPY = {
  en: {
    tagline: "PürInstinct · Sport at its purest",
    intro: "Click any milestone on the map to open its task list — assign, complete, and leave notes.",
    tasksDone: "Tasks done",
    ownerOpen: (name: string) => `${name} — open`,
    locked: "Locked — unlock to edit",
    unlockedAs: (name: string | null) => (name ? `Unlocked — ${name}` : "Unlocked"),
    reset: "Reset",
    resetConfirm: "Reset all shared progress? This clears every checkbox, owner and note — history is kept.",
    wrongPassword: "Wrong password.",
    password: "Password",
    unlock: "Unlock",
    owner: "Owner",
    toAssign: "To assign",
    suggested: "suggested",
    notesPlaceholder: "Notes — decisions, contacts, blockers…",
    tasksComplete: (done: number, total: number) => `${done}/${total} tasks complete`,
    checkpoint: "Checkpoint",
    history: "Recent history",
    hide: "Hide",
    show: "Show",
    entries: "entries",
    noHistory: "No changes logged yet.",
    footer: "PürInstinct Worldwide Inc. · Confidential working document · Progress is shared live via Firebase — every change is logged in the history below.",
    setupRequired: "Setup required",
    setupHint: "Add the NEXT_PUBLIC_FIREBASE_* variables (see .env.local.example) and redeploy.",
  },
  fr: {
    tagline: "PürInstinct · Le sport à l'état pur",
    intro: "Clique sur un jalon de la carte pour ouvrir sa liste de tâches — assigne, complète et laisse des notes.",
    tasksDone: "Tâches complétées",
    ownerOpen: (name: string) => `${name} — en attente`,
    locked: "Verrouillé — déverrouille pour éditer",
    unlockedAs: (name: string | null) => (name ? `Déverrouillé — ${name}` : "Déverrouillé"),
    reset: "Réinitialiser",
    resetConfirm: "Réinitialiser toute la progression partagée? Toutes les cases, tous les responsables et notes sont effacés — l'historique est conservé.",
    wrongPassword: "Mauvais mot de passe.",
    password: "Mot de passe",
    unlock: "Déverrouiller",
    owner: "Responsable",
    toAssign: "À assigner",
    suggested: "suggéré",
    notesPlaceholder: "Notes — décisions, contacts, blocages…",
    tasksComplete: (done: number, total: number) => `${done}/${total} tâches complétées`,
    checkpoint: "Point de contrôle",
    history: "Historique récent",
    hide: "Masquer",
    show: "Afficher",
    entries: "entrées",
    noHistory: "Aucun changement enregistré pour l'instant.",
    footer: "PürInstinct Worldwide Inc. · Document de travail confidentiel · La progression est partagée en direct via Firebase — chaque changement est consigné dans l'historique ci-dessous.",
    setupRequired: "Configuration requise",
    setupHint: "Ajoute les variables NEXT_PUBLIC_FIREBASE_* (voir .env.local.example) et redéploie.",
  },
} as const;

function ownerLabel(owner: Owner, locale: Locale): string {
  return owner === "Open" ? COPY[locale].toAssign : owner;
}

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
  const [locale, setLocale] = useState<Locale>("en");
  const c = COPY[locale];

  useEffect(() => {
    const saved = window.localStorage.getItem(LOCALE_KEY);
    if (saved === "en" || saved === "fr") setLocale(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    window.localStorage.setItem(LOCALE_KEY, locale);
  }, [locale]);

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
          {c.setupRequired}
        </p>
        <p className="mt-3 text-sm text-mist">{authError}</p>
        <p className="mt-2 text-xs text-dim">{c.setupHint}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-24 sm:px-8">
      {/* ============================== HEADER ============================== */}
      <header className="border-b border-line pb-6 pt-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-4">
              <p className="font-display text-sm font-semibold uppercase tracking-[0.25em] text-lime">
                {c.tagline}
              </p>
              <LocaleToggle locale={locale} setLocale={setLocale} />
            </div>
            <h1 className="font-display text-5xl font-black italic uppercase leading-none sm:text-6xl">
              {locale === "en" ? (
                <>60-Day <span className="text-lime">Blueprint</span></>
              ) : (
                <>Plan des <span className="text-lime">60 jours</span></>
              )}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-mist">
              {t(SPRINT.subtitle, locale)} · {t(SPRINT.range, locale)}. {c.intro}
            </p>
          </div>
          <div className="flex items-center gap-6">
            <Stat label={c.tasksDone} value={`${totalDone}/${totalTasks}`} />
            <Stat label={c.ownerOpen("Dominique")} value={String(ready ? ownerCount("Dominique") : "–")} />
            <Stat label={c.ownerOpen("François")} value={String(ready ? ownerCount("François") : "–")} />
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
                {t(trackLabels[track as Milestone["track"]], locale)}
              </span>
            ))}
          </div>
          <AccessBar
            locale={locale}
            unlocked={unlocked}
            unlocking={unlocking}
            unlock={unlock}
            reset={reset}
          />
        </div>
      </header>

      {/* ============================== BODY ============================== */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(380px,460px)]">
        {/* ------------------------------ MAP ------------------------------ */}
        <section aria-label="Roadmap map">
          {phases.map((phase) => {
            const checkpoint = checkpoints.find((c2) => c2.afterPhase === phase.id);
            return (
              <div key={phase.id} className="relative pl-6">
                {/* spine */}
                <span className="absolute left-0 top-0 h-full w-[3px] bg-line" aria-hidden />
                <span className="absolute left-[-4.5px] top-1 h-3 w-3 bg-lime" aria-hidden />

                <div className="pb-2 pt-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h2 className="font-display text-3xl font-black italic uppercase">
                      {t(phase.name, locale)}
                    </h2>
                    <span className="font-display text-sm font-semibold uppercase tracking-widest text-dim">
                      {t(phase.dates, locale)}
                    </span>
                  </div>
                  <p className="mt-1 max-w-3xl text-sm text-dim">{t(phase.intent, locale)}</p>
                </div>

                <div className="grid gap-3 pb-8 pt-3 sm:grid-cols-2 xl:grid-cols-3">
                  {phase.milestones.map((m) => (
                    <MilestoneCard
                      key={m.id}
                      milestone={m}
                      locale={locale}
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
                        {c.checkpoint} {checkpoint.code}
                      </p>
                      <p className="font-display text-sm font-semibold uppercase tracking-widest text-mist">
                        {t(checkpoint.day, locale)}
                      </p>
                    </div>
                    <ul className="mt-2 grid gap-1 text-sm text-mist sm:grid-cols-3">
                      {checkpoint.criteria.map((crit) => (
                        <li key={t(crit, "en")} className="flex gap-2">
                          <span className="text-lime">/</span>
                          {t(crit, locale)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}

          <HistoryPanel locale={locale} />
        </section>

        {/* --------------------------- DETAIL PANEL --------------------------- */}
        <aside className="lg:sticky lg:top-6 lg:h-fit" aria-label="Milestone detail">
          <MilestoneDetail
            milestone={selected}
            locale={locale}
            getState={get}
            update={update}
            unlocked={unlocked}
          />
        </aside>
      </div>

      <footer className="mt-16 border-t border-line pt-4 text-xs text-dim">
        {c.footer}
      </footer>
    </div>
  );
}

/* ================================ pieces ================================ */

function LocaleToggle({
  locale,
  setLocale,
}: {
  locale: Locale;
  setLocale: (l: Locale) => void;
}) {
  return (
    <div className="flex border border-line text-xs font-semibold uppercase tracking-widest">
      {(["en", "fr"] as Locale[]).map((l) => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          aria-pressed={locale === l}
          className={`px-2 py-1 ${
            locale === l ? "bg-lime text-ink" : "text-dim hover:text-mist"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-right">
      <p className="font-display text-3xl font-black leading-none text-lime">{value}</p>
      <p className="text-[11px] uppercase tracking-widest text-dim">{label}</p>
    </div>
  );
}

function AccessBar({
  locale,
  unlocked,
  unlocking,
  unlock,
  reset,
}: {
  locale: Locale;
  unlocked: boolean;
  unlocking: boolean;
  unlock: (name: string, password: string) => Promise<boolean>;
  reset: () => Promise<void>;
}) {
  const c = COPY[locale];
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
          {c.unlockedAs(getSavedActorName())}
        </span>
        <button
          onClick={() => {
            if (window.confirm(c.resetConfirm)) reset();
          }}
          className="border border-line px-3 py-2 text-xs uppercase tracking-widest text-dim hover:border-lime hover:text-lime"
        >
          {c.reset}
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
        {c.locked}
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
          setError(c.wrongPassword);
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
        placeholder={c.password}
        autoFocus
        className="border border-line bg-ink px-2 py-2 text-xs text-mist placeholder:text-dim"
      />
      <button
        type="submit"
        disabled={unlocking || !password}
        className="border border-lime bg-lime px-3 py-2 text-xs font-semibold uppercase tracking-widest text-ink disabled:opacity-50"
      >
        {unlocking ? "…" : c.unlock}
      </button>
      {error && <span className="text-xs text-[#FF7A59]">{error}</span>}
    </form>
  );
}

function MilestoneCard({
  milestone,
  locale,
  active,
  done,
  onSelect,
}: {
  milestone: Milestone;
  locale: Locale;
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
          {milestone.code} · {t(trackLabels[milestone.track], locale)}
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
        {t(milestone.title, locale)}
      </h3>
      <p className="mt-1 pl-2 text-xs uppercase tracking-widest text-dim">
        {t(milestone.window, locale)}
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
  locale,
  getState,
  update,
  unlocked,
}: {
  milestone: Milestone;
  locale: Locale;
  getState: ReturnType<typeof useProgress>["get"];
  update: ReturnType<typeof useProgress>["update"];
  unlocked: boolean;
}) {
  const c = COPY[locale];
  const done = milestone.tasks.filter((t) => getState(t.id).done).length;
  return (
    <div className="border border-line bg-panel">
      <div
        className="border-b border-line p-5"
        style={{ borderTop: `4px solid ${trackColors[milestone.track]}` }}
      >
        <p className="font-display text-sm font-semibold uppercase tracking-widest text-dim">
          {milestone.code} · {t(trackLabels[milestone.track], locale)} · {t(milestone.window, locale)}
        </p>
        <h2 className="mt-1 font-display text-3xl font-black italic uppercase leading-none">
          {t(milestone.title, locale)}
        </h2>
        <p className="mt-2 text-sm text-mist">{t(milestone.goal, locale)}</p>
        <p className="mt-3 font-display text-lg font-black text-lime">
          {c.tasksComplete(done, milestone.tasks.length)}
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
                  aria-label={`Mark "${t(task.title, locale)}" complete`}
                />
                <div className="min-w-0 flex-1">
                  <label
                    htmlFor={`done-${task.id}`}
                    className={`block cursor-pointer font-medium leading-snug ${
                      st.done ? "text-dim line-through" : "text-white"
                    }`}
                  >
                    {t(task.title, locale)}
                  </label>
                  {task.detail && (
                    <p className="mt-1 text-sm text-dim">{t(task.detail, locale)}</p>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] uppercase tracking-widest text-dim">
                      {c.owner}
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
                        {ownerLabel(o, locale)}
                      </button>
                    ))}
                    {st.owner === null && (
                      <span className="text-[11px] italic text-dim">
                        {c.suggested}
                      </span>
                    )}
                  </div>

                  <textarea
                    value={st.notes}
                    disabled={!unlocked}
                    onChange={(e) => update(task.id, { notes: e.target.value })}
                    placeholder={c.notesPlaceholder}
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

function timeAgo(date: Date | null, locale: Locale): string {
  if (!date) return "";
  const seconds = Math.max(0, Math.round((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return locale === "en" ? "just now" : "à l'instant";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return locale === "en" ? `${minutes}m ago` : `il y a ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return locale === "en" ? `${hours}h ago` : `il y a ${hours} h`;
  const days = Math.round(hours / 24);
  return locale === "en" ? `${days}d ago` : `il y a ${days} j`;
}

function describeEntry(entry: HistoryEntry, locale: Locale): string {
  if (entry.field === "reset") {
    return locale === "en" ? "reset the entire board" : "a réinitialisé tout le tableau";
  }
  const task = entry.taskId ? taskById(entry.taskId) : undefined;
  const label = task ? t(task.title, locale) : entry.taskId ?? (locale === "en" ? "a task" : "une tâche");
  switch (entry.field) {
    case "done":
      return entry.value
        ? (locale === "en" ? `marked "${label}" done` : `a marqué « ${label} » complétée`)
        : (locale === "en" ? `reopened "${label}"` : `a rouvert « ${label} »`);
    case "owner": {
      const ownerValue = (entry.value as Owner | null) ?? "Open";
      const shown = ownerLabel(ownerValue, locale);
      return locale === "en" ? `assigned "${label}" to ${shown}` : `a assigné « ${label} » à ${shown}`;
    }
    case "notes":
      return locale === "en" ? `edited notes on "${label}"` : `a modifié les notes de « ${label} »`;
    default:
      return locale === "en" ? `updated "${label}"` : `a modifié « ${label} »`;
  }
}

function HistoryPanel({ locale }: { locale: Locale }) {
  const c = COPY[locale];
  const entries = useHistory(50);
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-10 border border-line bg-panel">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between p-4 text-left"
      >
        <span className="font-display text-xl font-black italic uppercase">
          {c.history}
        </span>
        <span className="text-xs uppercase tracking-widest text-dim">
          {open ? c.hide : c.show} · {entries.length} {c.entries}
        </span>
      </button>
      {open && (
        <ul className="max-h-[420px] overflow-y-auto border-t border-line">
          {entries.length === 0 && (
            <li className="p-4 text-sm text-dim">{c.noHistory}</li>
          )}
          {entries.map((entry) => (
            <li key={entry.id} className="flex items-baseline justify-between gap-4 border-b border-line p-3 text-sm last:border-b-0">
              <span className="text-mist">
                <span className="font-semibold text-lime">{entry.actorName}</span>{" "}
                {describeEntry(entry, locale)}
              </span>
              <span className="shrink-0 text-xs text-dim">{timeAgo(entry.at, locale)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
