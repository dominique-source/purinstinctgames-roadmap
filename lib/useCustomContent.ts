"use client";

import { useCallback, useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  addDoc,
  onSnapshot,
  serverTimestamp,
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

export function useCustomContent() {
  const [customMilestones, setCustomMilestones] = useState<CustomMilestone[]>([]);
  const [customTasks, setCustomTasks] = useState<CustomTask[]>([]);

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
    return () => {
      unsubM();
      unsubT();
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

  return { customMilestones, customTasks, addMilestone, addTask, removeMilestone, removeTask };
}
