"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  SPRINT,
  phases,
  checkpoints,
  allMilestones,
  trackColors,
  trackLabels,
  t,
  type Locale,
  type Localized,
  type Milestone,
  type Task,
  type Criterion,
  type Owner,
} from "@/lib/roadmap";
import { useProgress, countDone, getSavedActorName, type ProgressMap, type TaskStatus } from "@/lib/useProgress";
import { useHistory, type HistoryEntry } from "@/lib/useHistory";
import { useCustomContent } from "@/lib/useCustomContent";
import { useContacts, type Contact, type ContactStatus } from "@/lib/useContacts";

const OWNER_OPTIONS: Owner[] = ["Dominique", "François", "Open"];
const ACTOR_OPTIONS: Owner[] = ["Dominique", "François"];
const TRACK_OPTIONS: Milestone["track"][] = ["Raise", "Games", "INSTINCT", "Partners"];
const STATUS_OPTIONS: TaskStatus[] = ["todo", "in_progress", "done"];
const CONTACT_STATUS_OPTIONS: ContactStatus[] = ["not_contacted", "intro_done", "in_discussion", "pending"];
const LOCALE_KEY = "purinstinct-roadmap-locale";

type RenderTask = Task & { isCustom?: boolean };
type RenderMilestone = Omit<Milestone, "tasks"> & { tasks: RenderTask[]; isCustom?: boolean };
type RenderCriterion = Criterion & { isCustom?: boolean };
type RenderCheckpoint = Omit<(typeof checkpoints)[number], "criteria"> & { criteria: RenderCriterion[] };

function wrap(s: string): Localized {
  return { en: s, fr: s };
}

const COPY = {
  en: {
    tagline: "PürInstinct · Sport at its purest",
    intro: "Click any milestone on the map to open its task list — assign, complete, and leave notes.",
    tasksDone: "Tasks done",
    ownerOpen: (name: string) => `${name} — open`,
    locked: "Locked — unlock to edit",
    unlockedAs: (name: string | null) => (name ? `Unlocked — ${name}` : "Unlocked"),
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
    addMilestone: "+ Add milestone",
    addTask: "+ Add task",
    milestoneTitlePlaceholder: "Milestone title",
    goalPlaceholder: "Goal (optional)",
    windowPlaceholder: "Timing (e.g. Jul 20–25)",
    track: "Track",
    save: "Save",
    cancel: "Cancel",
    taskTitlePlaceholder: "Task title",
    taskDetailPlaceholder: "Detail (optional)",
    deleteConfirmMilestone: "Delete this milestone and its tasks?",
    deleteConfirmTask: "Delete this task?",
    deleteConfirmPhase: "Delete this entire phase, with all its milestones, tasks and checkpoint?",
    deletePhase: "Delete phase",
    addCriterion: "+ Add criterion",
    criterionPlaceholder: "Criterion",
    deleteConfirmCriterion: "Delete this criterion?",
    statusTodo: "Not started",
    statusInProgress: "In development",
    statusDone: "Done",
    filterTasks: "Filter tasks",
    filterByOwner: "Owner",
    filterByStatus: "Status",
    noMatchingTasks: "No tasks match these filters.",
    matchingTasks: (n: number) => `${n} matching tasks`,
    contacts: "Contacts",
    noContacts: "No contacts yet.",
    addContactsPlaceholder: "One name per line…",
    addContactsButton: "+ Add contacts",
    contactNotContacted: "Not contacted",
    contactIntroDone: "Intro done",
    contactInDiscussion: "In discussion",
    contactYes: "Yes",
    contactNo: "No",
    contactPending: "Pending",
    removeContact: "Remove contact",
  },
  fr: {
    tagline: "PürInstinct · Le sport à l'état pur",
    intro: "Clique sur un jalon de la carte pour ouvrir sa liste de tâches — assigne, complète et laisse des notes.",
    tasksDone: "Tâches complétées",
    ownerOpen: (name: string) => `${name} — en attente`,
    locked: "Verrouillé — déverrouille pour éditer",
    unlockedAs: (name: string | null) => (name ? `Déverrouillé — ${name}` : "Déverrouillé"),
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
    addMilestone: "+ Ajouter un onglet",
    addTask: "+ Ajouter une tâche",
    milestoneTitlePlaceholder: "Titre de l'onglet",
    goalPlaceholder: "Objectif (optionnel)",
    windowPlaceholder: "Échéance (ex. 20–25 juil.)",
    track: "Catégorie",
    save: "Enregistrer",
    cancel: "Annuler",
    taskTitlePlaceholder: "Titre de la tâche",
    taskDetailPlaceholder: "Détail (optionnel)",
    deleteConfirmMilestone: "Supprimer cet onglet et ses tâches?",
    deleteConfirmTask: "Supprimer cette tâche?",
    deleteConfirmPhase: "Supprimer cette phase au complet, avec tous ses onglets, tâches et checkpoint?",
    deletePhase: "Supprimer la phase",
    addCriterion: "+ Ajouter un critère",
    criterionPlaceholder: "Critère",
    deleteConfirmCriterion: "Supprimer ce critère?",
    statusTodo: "Non commencée",
    statusInProgress: "En développement",
    statusDone: "Complétée",
    filterTasks: "Filtrer les tâches",
    filterByOwner: "Responsable",
    filterByStatus: "Statut",
    noMatchingTasks: "Aucune tâche ne correspond à ces filtres.",
    matchingTasks: (n: number) => `${n} tâches correspondantes`,
    contacts: "Contacts",
    noContacts: "Aucun contact pour l'instant.",
    addContactsPlaceholder: "Un nom par ligne…",
    addContactsButton: "+ Ajouter des contacts",
    contactNotContacted: "Non contacté",
    contactIntroDone: "Intro faite",
    contactInDiscussion: "En discussion",
    contactYes: "Oui",
    contactNo: "Non",
    contactPending: "En attente",
    removeContact: "Retirer le contact",
  },
} as const;

function ownerLabel(owner: Owner, locale: Locale): string {
  return owner === "Open" ? COPY[locale].toAssign : owner;
}

function statusLabel(status: TaskStatus, locale: Locale): string {
  const c = COPY[locale];
  return status === "todo" ? c.statusTodo : status === "in_progress" ? c.statusInProgress : c.statusDone;
}

function contactStatusLabel(status: ContactStatus, locale: Locale): string {
  const c = COPY[locale];
  switch (status) {
    case "not_contacted": return c.contactNotContacted;
    case "intro_done": return c.contactIntroDone;
    case "in_discussion": return c.contactInDiscussion;
    case "yes": return c.contactYes;
    case "no": return c.contactNo;
    case "pending": return c.contactPending;
  }
}

export default function RoadmapApp() {
  const {
    ready,
    progress,
    get,
    update,
    unlocked,
    unlocking,
    unlock,
    authError,
  } = useProgress();
  const {
    customMilestones,
    customTasks,
    customCriteria,
    taskEdits,
    addMilestone,
    addTask,
    addCriterion,
    removeMilestone,
    removeTask,
    removeCriterion,
    updateCustomTask,
    editStaticTask,
    deleteStaticTask,
    milestoneEdits,
    criterionEdits,
    phaseEdits,
    deleteStaticMilestone,
    deleteStaticCriterion,
    deleteStaticPhase,
  } = useCustomContent();
  const { contacts, addContacts, updateContactStatus, removeContact } = useContacts();
  const [selectedId, setSelectedId] = useState<string>(allMilestones[0].id);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [locale, setLocale] = useState<Locale>("en");
  const c = COPY[locale];
  const asideRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(LOCALE_KEY);
    if (saved === "en" || saved === "fr") setLocale(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    window.localStorage.setItem(LOCALE_KEY, locale);
  }, [locale]);

  const mergedPhases = useMemo(() => {
    let extraCode = allMilestones.length;
    return phases
      .filter((phase) => !phaseEdits[phase.id]?.deleted)
      .map((phase, phaseIndex) => {
      const tasksFor = (milestoneId: string): RenderTask[] =>
        customTasks
          .filter((ct) => ct.milestoneId === milestoneId)
          .map((ct) => ({
            id: ct.id,
            title: wrap(ct.title),
            detail: ct.detail ? wrap(ct.detail) : undefined,
            suggestedOwner: ct.suggestedOwner,
            isCustom: true,
          }));

      const staticMilestones: RenderMilestone[] = phase.milestones
        .filter((m) => !milestoneEdits[m.id]?.deleted)
        .map((m) => ({
        ...m,
        tasks: [
          ...m.tasks
            .filter((task) => !taskEdits[task.id]?.deleted)
            .map((task) => {
              const edit = taskEdits[task.id];
              if (!edit) return task;
              return {
                ...task,
                title: edit.title ? wrap(edit.title) : task.title,
                detail: edit.detail !== undefined ? (edit.detail ? wrap(edit.detail) : undefined) : task.detail,
              };
            }),
          ...tasksFor(m.id),
        ],
      }));

      const extraMilestones: RenderMilestone[] = customMilestones
        .filter((cm) => cm.phaseId === phase.id)
        .map((cm) => {
          extraCode += 1;
          return {
            id: cm.id,
            code: `M${extraCode}`,
            title: wrap(cm.title),
            goal: wrap(cm.goal),
            window: wrap(cm.window),
            track: cm.track,
            tasks: tasksFor(cm.id),
            isCustom: true,
          };
        });

      // Phases renumber by visible position, so deleting e.g. Phase 3 turns
      // "Phase 4 — Close" into "Phase 3 — Close".
      return {
        ...phase,
        name: {
          en: phase.name.en.replace(/^Phase \d+/, `Phase ${phaseIndex + 1}`),
          fr: phase.name.fr.replace(/^Phase \d+/, `Phase ${phaseIndex + 1}`),
        },
        milestones: [...staticMilestones, ...extraMilestones],
      };
    });
  }, [customMilestones, customTasks, taskEdits, milestoneEdits, phaseEdits]);

  const mergedAllMilestones = useMemo(
    () => mergedPhases.flatMap((p) => p.milestones),
    [mergedPhases]
  );

  const mergedCheckpoints = useMemo<RenderCheckpoint[]>(() => {
    return checkpoints.map((cp) => {
      const staticCriteria: RenderCriterion[] = cp.criteria
        .filter((cr) => !criterionEdits[cr.id]?.deleted)
        .map((cr) => ({ ...cr }));
      const extraCriteria: RenderCriterion[] = customCriteria
        .filter((cc) => cc.checkpointId === cp.id)
        .map((cc) => ({ id: cc.id, text: wrap(cc.text), isCustom: true }));
      return { ...cp, criteria: [...staticCriteria, ...extraCriteria] };
    });
  }, [customCriteria, criterionEdits]);

  const itemLabelById = useMemo(() => {
    const map: Record<string, Localized> = {};
    mergedAllMilestones.forEach((m) => m.tasks.forEach((task) => { map[task.id] = task.title; }));
    mergedCheckpoints.forEach((cp) => cp.criteria.forEach((cr) => { map[cr.id] = cr.text; }));
    return map;
  }, [mergedAllMilestones, mergedCheckpoints]);

  const selected = useMemo(
    () => mergedAllMilestones.find((m) => m.id === selectedId) ?? mergedAllMilestones[0],
    [selectedId, mergedAllMilestones]
  );

  const totalTasks = useMemo(
    () => mergedAllMilestones.reduce((n, m) => n + m.tasks.length, 0),
    [mergedAllMilestones]
  );
  const totalDone = useMemo(
    () =>
      countDone(
        progress,
        mergedAllMilestones.flatMap((m) => m.tasks.map((t) => t.id))
      ),
    [progress, mergedAllMilestones]
  );

  const ownerCount = (owner: Owner) =>
    mergedAllMilestones
      .flatMap((m) => m.tasks)
      .filter((t) => {
        const st = progress[t.id];
        const effective = st?.owner ?? t.suggestedOwner;
        return effective === owner && st?.status !== "done";
      }).length;

  const allTaskRows = useMemo(
    () => mergedAllMilestones.flatMap((m) => m.tasks.map((task) => ({ milestone: m, task }))),
    [mergedAllMilestones]
  );

  const contactsByTask = useMemo(() => {
    const map: Record<string, Contact[]> = {};
    contacts.forEach((ct) => {
      (map[ct.taskId] ??= []).push(ct);
    });
    return map;
  }, [contacts]);

  const handleEditTask = useCallback(
    (task: RenderTask, patch: { title: string; detail: string }) =>
      task.isCustom ? updateCustomTask(task.id, patch) : editStaticTask(task.id, patch),
    [updateCustomTask, editStaticTask]
  );

  const handleDeleteTask = useCallback(
    (task: RenderTask) => (task.isCustom ? removeTask(task.id) : deleteStaticTask(task.id)),
    [removeTask, deleteStaticTask]
  );

  const jumpToTask = useCallback(
    (milestoneId: string, taskId: string) => {
      setSelectedId(milestoneId);
      setEditingTaskId(unlocked ? taskId : null);
      requestAnimationFrame(() => {
        const el = document.querySelector(`[data-task-id="${taskId}"]`);
        el?.scrollIntoView({ block: "center" });
      });
    },
    [unlocked]
  );

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
          />
        </div>
      </header>

      <TaskFilterPanel
        locale={locale}
        rows={allTaskRows}
        progress={progress}
        onJump={jumpToTask}
      />

      {/* ============================== BODY ============================== */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(380px,460px)]">
        {/* ------------------------------ MAP ------------------------------ */}
        <section aria-label="Roadmap map">
          {mergedPhases.map((phase, phaseIndex) => {
            const checkpoint = mergedCheckpoints.find((c2) => c2.afterPhase === phase.id);
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
                    <span className="flex items-baseline gap-3">
                      <span className="font-display text-sm font-semibold uppercase tracking-widest text-dim">
                        {t(phase.dates, locale)}
                      </span>
                      {unlocked && (
                        <button
                          onClick={() => {
                            if (window.confirm(c.deleteConfirmPhase)) {
                              if (phase.milestones.some((m) => m.id === selectedId)) {
                                setSelectedId(allMilestones[0].id);
                              }
                              deleteStaticPhase(phase.id);
                            }
                          }}
                          aria-label={c.deletePhase}
                          title={c.deletePhase}
                          className="text-dim hover:text-lime"
                        >
                          ×
                        </button>
                      )}
                    </span>
                  </div>
                  <p className="mt-1 max-w-3xl text-sm text-dim">{t(phase.intent, locale)}</p>
                </div>

                <div className="grid gap-3 pb-3 pt-3 sm:grid-cols-2 xl:grid-cols-3">
                  {phase.milestones.map((m) => (
                    <MilestoneCard
                      key={m.id}
                      milestone={m}
                      locale={locale}
                      active={m.id === selectedId}
                      done={countDone(progress, m.tasks.map((t) => t.id))}
                      unlocked={unlocked}
                      onSelect={() => setSelectedId(m.id)}
                      onDelete={() => {
                        if (window.confirm(c.deleteConfirmMilestone)) {
                          if (selectedId === m.id) setSelectedId(allMilestones[0].id);
                          if (m.isCustom) removeMilestone(m.id);
                          else deleteStaticMilestone(m.id);
                        }
                      }}
                    />
                  ))}
                </div>

                {unlocked && (
                  <div className="pb-8">
                    <AddMilestoneForm locale={locale} phaseId={phase.id} addMilestone={addMilestone} />
                  </div>
                )}

                {checkpoint && (
                  <CheckpointBlock
                    checkpoint={{ ...checkpoint, code: `C${phaseIndex + 1}` }}
                    locale={locale}
                    getState={get}
                    update={update}
                    unlocked={unlocked}
                    addCriterion={addCriterion}
                    removeCriterion={removeCriterion}
                    deleteStaticCriterion={deleteStaticCriterion}
                  />
                )}
              </div>
            );
          })}

          <HistoryPanel locale={locale} itemLabelById={itemLabelById} />
        </section>

        {/* --------------------------- DETAIL PANEL --------------------------- */}
        <aside ref={asideRef} className="lg:sticky lg:top-6 lg:h-fit" aria-label="Milestone detail">
          {selected && <MilestoneDetail
            milestone={selected}
            locale={locale}
            getState={get}
            update={update}
            unlocked={unlocked}
            addTask={addTask}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            editingTaskId={editingTaskId}
            setEditingTaskId={setEditingTaskId}
            contactsByTask={contactsByTask}
            addContacts={addContacts}
            updateContactStatus={updateContactStatus}
            removeContact={removeContact}
          />}
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
}: {
  locale: Locale;
  unlocked: boolean;
  unlocking: boolean;
  unlock: (name: string, password: string) => Promise<boolean>;
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
  unlocked,
  onSelect,
  onDelete,
}: {
  milestone: RenderMilestone;
  locale: Locale;
  active: boolean;
  done: number;
  unlocked: boolean;
  onSelect: () => void;
  onDelete?: () => void;
}) {
  const total = milestone.tasks.length;
  const complete = done === total;
  return (
    <div
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
      {unlocked && onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          aria-label="Delete milestone"
          className="absolute right-2 top-2 text-dim hover:text-lime"
        >
          ×
        </button>
      )}
      <button onClick={onSelect} aria-pressed={active} className="w-full text-left">
        <div className="flex items-baseline justify-between gap-2 pl-2 pr-4">
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
    </div>
  );
}

function AddMilestoneForm({
  locale,
  phaseId,
  addMilestone,
}: {
  locale: Locale;
  phaseId: string;
  addMilestone: (phaseId: string, title: string, goal: string, window: string, track: Milestone["track"]) => Promise<void>;
}) {
  const c = COPY[locale];
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [goal, setGoal] = useState("");
  const [win, setWin] = useState("");
  const [track, setTrack] = useState<Milestone["track"]>("Raise");
  const [saving, setSaving] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="border border-line px-3 py-2 text-xs uppercase tracking-widest text-dim hover:border-lime hover:text-lime"
      >
        {c.addMilestone}
      </button>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        setSaving(true);
        await addMilestone(phaseId, title.trim(), goal.trim(), win.trim(), track);
        setSaving(false);
        setTitle("");
        setGoal("");
        setWin("");
        setOpen(false);
      }}
      className="flex flex-col gap-2 border border-line bg-panel p-4"
    >
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={c.milestoneTitlePlaceholder}
        autoFocus
        className="border border-line bg-ink p-2 text-sm text-mist placeholder:text-dim"
      />
      <input
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        placeholder={c.goalPlaceholder}
        className="border border-line bg-ink p-2 text-sm text-mist placeholder:text-dim"
      />
      <input
        value={win}
        onChange={(e) => setWin(e.target.value)}
        placeholder={c.windowPlaceholder}
        className="border border-line bg-ink p-2 text-sm text-mist placeholder:text-dim"
      />
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] uppercase tracking-widest text-dim">{c.track}</span>
        {TRACK_OPTIONS.map((tr) => (
          <button
            type="button"
            key={tr}
            onClick={() => setTrack(tr)}
            aria-pressed={track === tr}
            className="flex items-center gap-1 border px-2 py-1 text-xs uppercase tracking-wider"
            style={{
              borderColor: track === tr ? trackColors[tr] : undefined,
              color: track === tr ? trackColors[tr] : undefined,
            }}
          >
            <span className="inline-block h-2 w-2" style={{ background: trackColors[tr] }} />
            {t(trackLabels[tr], locale)}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving || !title.trim()}
          className="border border-lime bg-lime px-3 py-2 text-xs font-semibold uppercase tracking-widest text-ink disabled:opacity-50"
        >
          {saving ? "…" : c.save}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="border border-line px-3 py-2 text-xs uppercase tracking-widest text-dim hover:border-mist hover:text-mist"
        >
          {c.cancel}
        </button>
      </div>
    </form>
  );
}

function AddTaskForm({
  locale,
  milestoneId,
  addTask,
}: {
  locale: Locale;
  milestoneId: string;
  addTask: (milestoneId: string, title: string, detail: string, suggestedOwner: Owner) => Promise<void>;
}) {
  const c = COPY[locale];
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [owner, setOwner] = useState<Owner>("Open");
  const [saving, setSaving] = useState(false);

  if (!open) {
    return (
      <li className="p-5">
        <button
          onClick={() => setOpen(true)}
          className="border border-line px-3 py-2 text-xs uppercase tracking-widest text-dim hover:border-lime hover:text-lime"
        >
          {c.addTask}
        </button>
      </li>
    );
  }

  return (
    <li className="p-5">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!title.trim()) return;
          setSaving(true);
          await addTask(milestoneId, title.trim(), detail.trim(), owner);
          setSaving(false);
          setTitle("");
          setDetail("");
          setOwner("Open");
          setOpen(false);
        }}
        className="flex flex-col gap-2"
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={c.taskTitlePlaceholder}
          autoFocus
          className="border border-line bg-ink p-2 text-sm text-mist placeholder:text-dim"
        />
        <input
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          placeholder={c.taskDetailPlaceholder}
          className="border border-line bg-ink p-2 text-sm text-mist placeholder:text-dim"
        />
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] uppercase tracking-widest text-dim">{c.owner}</span>
          {OWNER_OPTIONS.map((o) => (
            <button
              type="button"
              key={o}
              onClick={() => setOwner(o)}
              aria-pressed={owner === o}
              className={`border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
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
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving || !title.trim()}
            className="border border-lime bg-lime px-3 py-2 text-xs font-semibold uppercase tracking-widest text-ink disabled:opacity-50"
          >
            {saving ? "…" : c.save}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="border border-line px-3 py-2 text-xs uppercase tracking-widest text-dim hover:border-mist hover:text-mist"
          >
            {c.cancel}
          </button>
        </div>
      </form>
    </li>
  );
}

function EditTaskForm({
  locale,
  task,
  onEditTask,
  onCancel,
}: {
  locale: Locale;
  task: RenderTask;
  onEditTask: (task: RenderTask, patch: { title: string; detail: string }) => Promise<void>;
  onCancel: () => void;
}) {
  const c = COPY[locale];
  const [title, setTitle] = useState(t(task.title, locale));
  const [detail, setDetail] = useState(task.detail ? t(task.detail, locale) : "");
  const [saving, setSaving] = useState(false);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        setSaving(true);
        await onEditTask(task, { title: title.trim(), detail: detail.trim() });
        setSaving(false);
        onCancel();
      }}
      className="flex flex-col gap-2"
    >
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={c.taskTitlePlaceholder}
        autoFocus
        className="border border-line bg-ink p-2 text-sm text-mist placeholder:text-dim"
      />
      <input
        value={detail}
        onChange={(e) => setDetail(e.target.value)}
        placeholder={c.taskDetailPlaceholder}
        className="border border-line bg-ink p-2 text-sm text-mist placeholder:text-dim"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving || !title.trim()}
          className="border border-lime bg-lime px-3 py-2 text-xs font-semibold uppercase tracking-widest text-ink disabled:opacity-50"
        >
          {saving ? "…" : c.save}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="border border-line px-3 py-2 text-xs uppercase tracking-widest text-dim hover:border-mist hover:text-mist"
        >
          {c.cancel}
        </button>
      </div>
    </form>
  );
}

function TaskContacts({
  locale,
  taskId,
  contacts,
  unlocked,
  addContacts,
  updateContactStatus,
  removeContact,
}: {
  locale: Locale;
  taskId: string;
  contacts: Contact[];
  unlocked: boolean;
  addContacts: (taskId: string, names: string[]) => Promise<void>;
  updateContactStatus: (id: string, status: ContactStatus) => Promise<void>;
  removeContact: (id: string) => Promise<void>;
}) {
  const c = COPY[locale];
  const [open, setOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [adding, setAdding] = useState(false);

  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-pressed={open}
        className={`flex w-full items-center justify-between border px-3 py-2 text-xs font-semibold uppercase tracking-widest ${
          open
            ? "border-lime text-lime"
            : "border-line text-dim hover:border-mist hover:text-mist"
        }`}
      >
        <span>
          {c.contacts}
          {contacts.length > 0 ? ` (${contacts.length})` : ""}
        </span>
        <span>{open ? c.hide : c.show}</span>
      </button>
      {open && (
        <div className="mt-2 flex flex-col gap-2">
          <ul className="flex flex-col gap-1">
            {contacts.length === 0 && <li className="text-xs text-dim">{c.noContacts}</li>}
            {contacts.map((contact) => (
              <li key={contact.id} className="flex items-center gap-2">
                <span className="min-w-0 flex-1 truncate text-sm text-mist">{contact.name}</span>
                <select
                  disabled={!unlocked}
                  value={contact.status}
                  onChange={(e) => updateContactStatus(contact.id, e.target.value as ContactStatus)}
                  className="border border-line bg-ink px-1 py-1 text-xs text-mist disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {CONTACT_STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {contactStatusLabel(s, locale)}
                    </option>
                  ))}
                </select>
                {unlocked && (
                  <button
                    onClick={() => removeContact(contact.id)}
                    aria-label={c.removeContact}
                    className="shrink-0 text-dim hover:text-lime"
                  >
                    ×
                  </button>
                )}
              </li>
            ))}
          </ul>
          {unlocked && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const names = bulkText.split("\n").map((n) => n.trim()).filter(Boolean);
                if (!names.length) return;
                setAdding(true);
                await addContacts(taskId, names);
                setAdding(false);
                setBulkText("");
              }}
              className="flex flex-col gap-2"
            >
              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder={c.addContactsPlaceholder}
                rows={3}
                className="w-full border border-line bg-ink p-2 text-sm text-mist placeholder:text-dim"
              />
              <button
                type="submit"
                disabled={adding || !bulkText.trim()}
                className="self-start border border-lime bg-lime px-3 py-2 text-xs font-semibold uppercase tracking-widest text-ink disabled:opacity-50"
              >
                {adding ? "…" : c.addContactsButton}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

function MilestoneDetail({
  milestone,
  locale,
  getState,
  update,
  unlocked,
  addTask,
  onEditTask,
  onDeleteTask,
  editingTaskId,
  setEditingTaskId,
  contactsByTask,
  addContacts,
  updateContactStatus,
  removeContact,
}: {
  milestone: RenderMilestone;
  locale: Locale;
  getState: ReturnType<typeof useProgress>["get"];
  update: ReturnType<typeof useProgress>["update"];
  unlocked: boolean;
  addTask: (milestoneId: string, title: string, detail: string, suggestedOwner: Owner) => Promise<void>;
  onEditTask: (task: RenderTask, patch: { title: string; detail: string }) => Promise<void>;
  onDeleteTask: (task: RenderTask) => Promise<void>;
  editingTaskId: string | null;
  setEditingTaskId: (id: string | null) => void;
  contactsByTask: Record<string, Contact[]>;
  addContacts: (taskId: string, names: string[]) => Promise<void>;
  updateContactStatus: (id: string, status: ContactStatus) => Promise<void>;
  removeContact: (id: string) => Promise<void>;
}) {
  const c = COPY[locale];
  const done = milestone.tasks.filter((t) => getState(t.id).status === "done").length;
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
          if (editingTaskId === task.id) {
            return (
              <li key={task.id} data-task-id={task.id} className="border-b border-line p-5 last:border-b-0">
                <EditTaskForm
                  locale={locale}
                  task={task}
                  onEditTask={onEditTask}
                  onCancel={() => setEditingTaskId(null)}
                />
              </li>
            );
          }
          return (
            <li key={task.id} data-task-id={task.id} className="border-b border-line p-5 last:border-b-0">
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`block font-medium leading-snug ${
                        st.status === "done"
                          ? "text-dim line-through"
                          : st.status === "in_progress"
                          ? "text-lime"
                          : "text-white"
                      }`}
                    >
                      {t(task.title, locale)}
                    </span>
                    {unlocked && (
                      <span className="flex shrink-0 items-center gap-2">
                        <button
                          onClick={() => setEditingTaskId(task.id)}
                          aria-label="Edit task"
                          className="text-dim hover:text-lime"
                        >
                          ✎
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(c.deleteConfirmTask)) onDeleteTask(task);
                          }}
                          aria-label="Delete task"
                          className="text-dim hover:text-lime"
                        >
                          ×
                        </button>
                      </span>
                    )}
                  </div>
                  {task.detail && (
                    <p className="mt-1 text-sm text-dim">{t(task.detail, locale)}</p>
                  )}

                  <div className="mt-3">
                    <span className="text-[11px] uppercase tracking-widest text-dim">
                      {c.filterByStatus}
                    </span>
                    <div className="mt-1 grid grid-cols-3 gap-1">
                      {STATUS_OPTIONS.map((s) => (
                        <button
                          key={s}
                          disabled={!unlocked}
                          onClick={() => update(task.id, { status: s })}
                          aria-pressed={st.status === s}
                          className={`border px-1 py-1 text-center text-[10px] font-semibold uppercase leading-tight disabled:cursor-not-allowed disabled:opacity-40 ${
                            st.status === s
                              ? "border-lime bg-lime text-ink"
                              : "border-line text-dim hover:border-mist hover:text-mist"
                          }`}
                        >
                          {statusLabel(s, locale)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
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

                  <TaskContacts
                    locale={locale}
                    taskId={task.id}
                    contacts={contactsByTask[task.id] ?? []}
                    unlocked={unlocked}
                    addContacts={addContacts}
                    updateContactStatus={updateContactStatus}
                    removeContact={removeContact}
                  />
                </div>
              </div>
            </li>
          );
        })}
        {unlocked && (
          <AddTaskForm locale={locale} milestoneId={milestone.id} addTask={addTask} />
        )}
      </ul>
    </div>
  );
}

function AddCriterionForm({
  locale,
  checkpointId,
  addCriterion,
}: {
  locale: Locale;
  checkpointId: string;
  addCriterion: (checkpointId: string, text: string) => Promise<void>;
}) {
  const c = COPY[locale];
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs uppercase tracking-widest text-dim hover:text-lime"
      >
        {c.addCriterion}
      </button>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        setSaving(true);
        await addCriterion(checkpointId, text.trim());
        setSaving(false);
        setText("");
        setOpen(false);
      }}
      className="flex flex-wrap items-center gap-2"
    >
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={c.criterionPlaceholder}
        autoFocus
        className="flex-1 border border-line bg-ink p-2 text-sm text-mist placeholder:text-dim"
      />
      <button
        type="submit"
        disabled={saving || !text.trim()}
        className="border border-lime bg-lime px-3 py-2 text-xs font-semibold uppercase tracking-widest text-ink disabled:opacity-50"
      >
        {saving ? "…" : c.save}
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="border border-line px-3 py-2 text-xs uppercase tracking-widest text-dim hover:border-mist hover:text-mist"
      >
        {c.cancel}
      </button>
    </form>
  );
}

function CheckpointBlock({
  checkpoint,
  locale,
  getState,
  update,
  unlocked,
  addCriterion,
  removeCriterion,
  deleteStaticCriterion,
}: {
  checkpoint: RenderCheckpoint;
  locale: Locale;
  getState: ReturnType<typeof useProgress>["get"];
  update: ReturnType<typeof useProgress>["update"];
  unlocked: boolean;
  addCriterion: (checkpointId: string, text: string) => Promise<void>;
  removeCriterion: (id: string) => Promise<void>;
  deleteStaticCriterion: (id: string) => Promise<void>;
}) {
  const c = COPY[locale];
  const total = checkpoint.criteria.length;
  const done = checkpoint.criteria.filter((cr) => getState(cr.id).status === "done").length;

  return (
    <div className="mb-10 border border-lime bg-panel p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-display text-xl font-black italic uppercase text-lime">
          {c.checkpoint} {checkpoint.code}
        </p>
        <div className="flex items-center gap-3">
          <span className="font-display text-sm font-black text-lime">{done}/{total}</span>
          <p className="font-display text-sm font-semibold uppercase tracking-widest text-mist">
            {t(checkpoint.day, locale)}
          </p>
        </div>
      </div>
      <ul className="mt-2 grid gap-1 text-sm text-mist sm:grid-cols-3">
        {checkpoint.criteria.map((crit) => {
          const st = getState(crit.id);
          const isDone = st.status === "done";
          return (
            <li
              key={crit.id}
              className={`flex items-start gap-2 p-1 ${isDone ? "bg-lime/15" : ""}`}
            >
              <input
                id={`crit-${crit.id}`}
                type="checkbox"
                checked={isDone}
                disabled={!unlocked}
                onChange={(e) => update(crit.id, { status: e.target.checked ? "done" : "todo" })}
                className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                aria-label={`Mark "${t(crit.text, locale)}" done`}
              />
              <label
                htmlFor={`crit-${crit.id}`}
                className={`flex-1 cursor-pointer ${isDone ? "text-dim line-through" : ""}`}
              >
                {t(crit.text, locale)}
              </label>
              {unlocked && (
                <button
                  onClick={() => {
                    if (window.confirm(c.deleteConfirmCriterion)) {
                      if (crit.isCustom) removeCriterion(crit.id);
                      else deleteStaticCriterion(crit.id);
                    }
                  }}
                  aria-label="Delete criterion"
                  className="shrink-0 text-dim hover:text-lime"
                >
                  ×
                </button>
              )}
            </li>
          );
        })}
      </ul>
      {unlocked && (
        <div className="mt-3">
          <AddCriterionForm locale={locale} checkpointId={checkpoint.id} addCriterion={addCriterion} />
        </div>
      )}
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

function describeEntry(
  entry: HistoryEntry,
  locale: Locale,
  itemLabelById: Record<string, Localized>
): string {
  if (entry.field === "reset") {
    return locale === "en" ? "reset the entire board" : "a réinitialisé tout le tableau";
  }
  const itemTitle = entry.taskId ? itemLabelById[entry.taskId] : undefined;
  const label = itemTitle ? t(itemTitle, locale) : entry.taskId ?? (locale === "en" ? "a task" : "une tâche");
  switch (entry.field) {
    case "done":
      return entry.value
        ? (locale === "en" ? `marked "${label}" done` : `a marqué « ${label} » complétée`)
        : (locale === "en" ? `reopened "${label}"` : `a rouvert « ${label} »`);
    case "status": {
      const status = entry.value as TaskStatus;
      if (status === "done") return locale === "en" ? `marked "${label}" done` : `a marqué « ${label} » complétée`;
      if (status === "in_progress") return locale === "en" ? `marked "${label}" in development` : `a marqué « ${label} » en développement`;
      return locale === "en" ? `reset "${label}" to not started` : `a remis « ${label} » à non commencée`;
    }
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

function TaskFilterPanel({
  locale,
  rows,
  progress,
  onJump,
}: {
  locale: Locale;
  rows: { milestone: RenderMilestone; task: RenderTask }[];
  progress: ProgressMap;
  onJump: (milestoneId: string, taskId: string) => void;
}) {
  const c = COPY[locale];
  const [open, setOpen] = useState(false);
  const [ownerFilter, setOwnerFilter] = useState<Set<Owner>>(new Set());
  const [statusFilter, setStatusFilter] = useState<Set<TaskStatus>>(new Set());

  const toggleOwner = (o: Owner) =>
    setOwnerFilter((prev) => {
      const next = new Set(prev);
      if (next.has(o)) next.delete(o);
      else next.add(o);
      return next;
    });

  const toggleStatus = (s: TaskStatus) =>
    setStatusFilter((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });

  const filtered = useMemo(
    () =>
      rows.filter(({ task }) => {
        const st = progress[task.id];
        const effectiveOwner = st?.owner ?? task.suggestedOwner;
        const effectiveStatus = st?.status ?? "todo";
        const ownerOk = ownerFilter.size === 0 || ownerFilter.has(effectiveOwner);
        const statusOk = statusFilter.size === 0 || statusFilter.has(effectiveStatus);
        return ownerOk && statusOk;
      }),
    [rows, progress, ownerFilter, statusFilter]
  );

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mb-8 border border-line px-3 py-2 text-xs uppercase tracking-widest text-dim hover:border-lime hover:text-lime"
      >
        {c.filterTasks}
      </button>
    );
  }

  return (
    <div className="mb-8 border border-line bg-panel p-4">
      <div className="flex items-center justify-between">
        <span className="font-display text-xl font-black italic uppercase">{c.filterTasks}</span>
        <button
          onClick={() => setOpen(false)}
          className="text-xs uppercase tracking-widest text-dim hover:text-lime"
        >
          {c.hide}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-[11px] uppercase tracking-widest text-dim">{c.filterByOwner}</span>
        {OWNER_OPTIONS.map((o) => (
          <button
            key={o}
            onClick={() => toggleOwner(o)}
            aria-pressed={ownerFilter.has(o)}
            className={`border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
              ownerFilter.has(o)
                ? "border-lime bg-lime text-ink"
                : "border-line text-dim hover:border-mist hover:text-mist"
            }`}
          >
            {ownerLabel(o, locale)}
          </button>
        ))}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="text-[11px] uppercase tracking-widest text-dim">{c.filterByStatus}</span>
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => toggleStatus(s)}
            aria-pressed={statusFilter.has(s)}
            className={`border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
              statusFilter.has(s)
                ? "border-lime bg-lime text-ink"
                : "border-line text-dim hover:border-mist hover:text-mist"
            }`}
          >
            {statusLabel(s, locale)}
          </button>
        ))}
      </div>

      <p className="mt-3 text-xs uppercase tracking-widest text-dim">{c.matchingTasks(filtered.length)}</p>
      <ul className="mt-2 max-h-[420px] overflow-y-auto border-t border-line">
        {filtered.length === 0 && <li className="p-3 text-sm text-dim">{c.noMatchingTasks}</li>}
        {filtered.map(({ milestone, task }) => {
          const st = progress[task.id];
          const owner = st?.owner ?? task.suggestedOwner;
          const status = st?.status ?? "todo";
          return (
            <li key={task.id} className="border-b border-line last:border-b-0">
              <button
                onClick={() => onJump(milestone.id, task.id)}
                className="flex w-full items-baseline justify-between gap-2 p-3 text-left hover:text-lime"
              >
                <span className="text-sm">
                  <span className="text-dim">{milestone.code} · </span>
                  {t(task.title, locale)}
                </span>
                <span className="shrink-0 text-xs uppercase tracking-widest text-dim">
                  {ownerLabel(owner, locale)} · {statusLabel(status, locale)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function HistoryPanel({
  locale,
  itemLabelById,
}: {
  locale: Locale;
  itemLabelById: Record<string, Localized>;
}) {
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
                {describeEntry(entry, locale, itemLabelById)}
              </span>
              <span className="shrink-0 text-xs text-dim">{timeAgo(entry.at, locale)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
