"use client";

import { useCallback, useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  addDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import type { Milestone, Owner } from "./roadmap";
import { db, ensureAnonymousAuth } from "./firebase";
import { getSavedActorName } from "./useProgress";

export interface CustomMilestone {
  id: string;
  phaseId: string;
  title: string;
  goal: string;
  window: string;
  track: Milestone["track"];
}

export interface CustomTask {
  id: string;
  milestoneId: string;
  title: string;
  detail?: string;
  suggestedOwner: Owner;
}

export interface CustomCriterion {
  id: string;
  checkpointId: string;
  text: string;
}

export interface TaskEdit {
  id: string;
  title?: string;
  detail?: string;
  deleted?: boolean;
}

export interface StaticEdit {
  id: string;
  deleted?: boolean;
}

export function useCustomContent() {
  const [customMilestones, setCustomMilestones] = useState<CustomMilestone[]>([]);
  const [customTasks, setCustomTasks] = useState<CustomTask[]>([]);
  const [customCriteria, setCustomCriteria] = useState<CustomCriterion[]>([]);
  const [taskEdits, setTaskEdits] = useState<Record<string, TaskEdit>>({});
  const [milestoneEdits, setMilestoneEdits] = useState<Record<string, StaticEdit>>({});
  const [criterionEdits, setCriterionEdits] = useState<Record<string, StaticEdit>>({});
  const [phaseEdits, setPhaseEdits] = useState<Record<string, StaticEdit>>({});

  useEffect(() => {
    const firestore = db;
    if (!firestore) return;
    const unsubM = onSnapshot(collection(firestore, "customMilestones"), (snap) => {
      setCustomMilestones(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<CustomMilestone, "id">) }))
      );
    });
    const unsubT = onSnapshot(collection(firestore, "customTasks"), (snap) => {
      setCustomTasks(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<CustomTask, "id">) }))
      );
    });
    const unsubC = onSnapshot(collection(firestore, "customCriteria"), (snap) => {
      setCustomCriteria(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<CustomCriterion, "id">) }))
      );
    });
    const unsubE = onSnapshot(collection(firestore, "taskEdits"), (snap) => {
      const map: Record<string, TaskEdit> = {};
      snap.forEach((d) => {
        map[d.id] = { id: d.id, ...(d.data() as Omit<TaskEdit, "id">) };
      });
      setTaskEdits(map);
    });
    const unsubME = onSnapshot(collection(firestore, "milestoneEdits"), (snap) => {
      const map: Record<string, StaticEdit> = {};
      snap.forEach((d) => {
        map[d.id] = { id: d.id, ...(d.data() as Omit<StaticEdit, "id">) };
      });
      setMilestoneEdits(map);
    });
    const unsubCE = onSnapshot(collection(firestore, "criterionEdits"), (snap) => {
      const map: Record<string, StaticEdit> = {};
      snap.forEach((d) => {
        map[d.id] = { id: d.id, ...(d.data() as Omit<StaticEdit, "id">) };
      });
      setCriterionEdits(map);
    });
    const unsubPE = onSnapshot(collection(firestore, "phaseEdits"), (snap) => {
      const map: Record<string, StaticEdit> = {};
      snap.forEach((d) => {
        map[d.id] = { id: d.id, ...(d.data() as Omit<StaticEdit, "id">) };
      });
      setPhaseEdits(map);
    });
    return () => {
      unsubM();
      unsubT();
      unsubC();
      unsubE();
      unsubME();
      unsubCE();
      unsubPE();
    };
  }, []);

  const addMilestone = useCallback(
    async (phaseId: string, title: string, goal: string, window: string, track: Milestone["track"]) => {
      const firestore = db;
      if (!firestore) return;
      const user = await ensureAnonymousAuth();
      await addDoc(collection(firestore, "customMilestones"), {
        phaseId,
        title,
        goal,
        window,
        track,
        createdBy: getSavedActorName() ?? "Unknown",
        createdAt: serverTimestamp(),
      });
    },
    []
  );

  const addTask = useCallback(
    async (milestoneId: string, title: string, detail: string, suggestedOwner: Owner) => {
      const firestore = db;
      if (!firestore) return;
      await ensureAnonymousAuth();
      await addDoc(collection(firestore, "customTasks"), {
        milestoneId,
        title,
        ...(detail ? { detail } : {}),
        suggestedOwner,
        createdBy: getSavedActorName() ?? "Unknown",
        createdAt: serverTimestamp(),
      });
    },
    []
  );

  const addCriterion = useCallback(async (checkpointId: string, text: string) => {
    const firestore = db;
    if (!firestore) return;
    await ensureAnonymousAuth();
    await addDoc(collection(firestore, "customCriteria"), {
      checkpointId,
      text,
      createdBy: getSavedActorName() ?? "Unknown",
      createdAt: serverTimestamp(),
    });
  }, []);

  const removeMilestone = useCallback(async (id: string) => {
    const firestore = db;
    if (!firestore) return;
    const orphanTasks = customTasks.filter((t) => t.milestoneId === id);
    await Promise.all(orphanTasks.map((t) => deleteDoc(doc(firestore, "customTasks", t.id))));
    await deleteDoc(doc(firestore, "customMilestones", id));
  }, [customTasks]);

  const removeTask = useCallback(async (id: string) => {
    const firestore = db;
    if (!firestore) return;
    await deleteDoc(doc(firestore, "customTasks", id));
  }, []);

  const removeCriterion = useCallback(async (id: string) => {
    const firestore = db;
    if (!firestore) return;
    await deleteDoc(doc(firestore, "customCriteria", id));
  }, []);

  // Editing a custom task updates its own doc directly.
  const updateCustomTask = useCallback(async (id: string, patch: { title?: string; detail?: string }) => {
    const firestore = db;
    if (!firestore) return;
    await setDoc(doc(firestore, "customTasks", id), patch, { merge: true });
  }, []);

  // Editing/deleting a task from the fixed M1-M12 plan is stored as an
  // overlay in taskEdits/{taskId} (doc id = the static task id) — the
  // original content never changes, only what's rendered.
  const editStaticTask = useCallback(async (id: string, patch: { title?: string; detail?: string }) => {
    const firestore = db;
    if (!firestore) return;
    await ensureAnonymousAuth();
    await setDoc(doc(firestore, "taskEdits", id), patch, { merge: true });
  }, []);

  const deleteStaticTask = useCallback(async (id: string) => {
    const firestore = db;
    if (!firestore) return;
    await ensureAnonymousAuth();
    await setDoc(doc(firestore, "taskEdits", id), { deleted: true }, { merge: true });
  }, []);

  // Soft-deleting a milestone from the fixed M1-M12 plan: mark it deleted in
  // the milestoneEdits overlay and clean up any custom tasks attached to it.
  const deleteStaticMilestone = useCallback(async (id: string) => {
    const firestore = db;
    if (!firestore) return;
    await ensureAnonymousAuth();
    const orphanTasks = customTasks.filter((t) => t.milestoneId === id);
    await Promise.all(orphanTasks.map((t) => deleteDoc(doc(firestore, "customTasks", t.id))));
    await setDoc(doc(firestore, "milestoneEdits", id), { deleted: true }, { merge: true });
  }, [customTasks]);

  const deleteStaticCriterion = useCallback(async (id: string) => {
    const firestore = db;
    if (!firestore) return;
    await ensureAnonymousAuth();
    await setDoc(doc(firestore, "criterionEdits", id), { deleted: true }, { merge: true });
  }, []);

  // Soft-deleting a whole phase: mark it deleted in the phaseEdits overlay
  // and clean up custom milestones attached to it (and their custom tasks).
  // The phase's static milestones and checkpoint are hidden with it.
  const deleteStaticPhase = useCallback(async (id: string) => {
    const firestore = db;
    if (!firestore) return;
    await ensureAnonymousAuth();
    const orphanMilestones = customMilestones.filter((m) => m.phaseId === id);
    const orphanIds = new Set(orphanMilestones.map((m) => m.id));
    const orphanTasks = customTasks.filter((t) => orphanIds.has(t.milestoneId));
    await Promise.all([
      ...orphanTasks.map((t) => deleteDoc(doc(firestore, "customTasks", t.id))),
      ...orphanMilestones.map((m) => deleteDoc(doc(firestore, "customMilestones", m.id))),
    ]);
    await setDoc(doc(firestore, "phaseEdits", id), { deleted: true }, { merge: true });
  }, [customMilestones, customTasks]);

  return {
    customMilestones,
    customTasks,
    customCriteria,
    taskEdits,
    milestoneEdits,
    criterionEdits,
    phaseEdits,
    addMilestone,
    addTask,
    addCriterion,
    removeMilestone,
    removeTask,
    removeCriterion,
    updateCustomTask,
    editStaticTask,
    deleteStaticTask,
    deleteStaticMilestone,
    deleteStaticCriterion,
    deleteStaticPhase,
  };
}
