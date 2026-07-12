"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  addDoc,
} from "firebase/firestore";
import type { Owner } from "./roadmap";
import { allMilestones } from "./roadmap";
import { db, ensureAnonymousAuth } from "./firebase";
import { sha256Hex } from "./passcode";

export interface TaskState {
  owner: Owner | null;
  done: boolean;
  notes: string;
}

export type ProgressMap = Record<string, TaskState>;

const EMPTY: TaskState = { owner: null, done: false, notes: "" };
const ACTOR_NAME_KEY = "purinstinct-roadmap-actor";

export function getSavedActorName(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACTOR_NAME_KEY);
}

export function useProgress() {
  const [progress, setProgress] = useState<ProgressMap>({});
  const [ready, setReady] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const uidRef = useRef<string | null>(null);
  const progressRef = useRef<ProgressMap>({});
  progressRef.current = progress;

  useEffect(() => {
    const firestore = db;
    if (!firestore) {
      setAuthError("Firebase is not configured (missing NEXT_PUBLIC_FIREBASE_* env vars).");
      return;
    }
    let unsubTasks: (() => void) | undefined;
    let unsubSession: (() => void) | undefined;

    ensureAnonymousAuth()
      .then((user) => {
        uidRef.current = user.uid;

        unsubTasks = onSnapshot(collection(firestore, "tasks"), (snap) => {
          const next: ProgressMap = {};
          snap.forEach((d) => {
            next[d.id] = { ...EMPTY, ...(d.data() as Partial<TaskState>) };
          });
          setProgress(next);
          setReady(true);
        });

        unsubSession = onSnapshot(
          doc(firestore, "sessions", user.uid),
          (snap) => setUnlocked(snap.exists()),
          () => setUnlocked(false)
        );
      })
      .catch((err) => setAuthError(err.message ?? String(err)));

    return () => {
      unsubTasks?.();
      unsubSession?.();
    };
  }, []);

  const unlock = useCallback(async (name: string, password: string) => {
    const firestore = db;
    if (!firestore) return false;
    setUnlocking(true);
    try {
      const user = await ensureAnonymousAuth();
      const passcodeHash = await sha256Hex(password);
      await setDoc(doc(firestore, "sessions", user.uid), {
        passcodeHash,
        name,
        unlockedAt: serverTimestamp(),
      });
      window.localStorage.setItem(ACTOR_NAME_KEY, name);
      return true;
    } catch {
      return false;
    } finally {
      setUnlocking(false);
    }
  }, []);

  const update = useCallback(async (taskId: string, patch: Partial<TaskState>) => {
    const firestore = db;
    if (!firestore) return;
    const user = await ensureAnonymousAuth();
    const actorName = getSavedActorName() ?? "Unknown";
    const prevState = progressRef.current[taskId] ?? EMPTY;
    const nextState = { ...prevState, ...patch };

    await setDoc(
      doc(firestore, "tasks", taskId),
      { ...nextState, updatedAt: serverTimestamp(), updatedBy: actorName },
      { merge: true }
    );

    const changed = (Object.keys(patch) as (keyof TaskState)[]).filter(
      (k) => prevState[k] !== nextState[k]
    );
    await Promise.all(
      changed.map((field) =>
        addDoc(collection(firestore, "history"), {
          taskId,
          field,
          value: nextState[field],
          actorName,
          actorUid: user.uid,
          at: serverTimestamp(),
        })
      )
    );
  }, []);

  const get = useCallback(
    (taskId: string): TaskState => progress[taskId] ?? EMPTY,
    [progress]
  );

  const reset = useCallback(async () => {
    const firestore = db;
    if (!firestore) return;
    const actorName = getSavedActorName() ?? "Unknown";
    const taskIds = allMilestones.flatMap((m) => m.tasks.map((t) => t.id));
    await Promise.all(taskIds.map((id) => deleteDoc(doc(firestore, "tasks", id))));
    await addDoc(collection(firestore, "history"), {
      taskId: null,
      field: "reset",
      value: true,
      actorName,
      at: serverTimestamp(),
    });
  }, []);

  return { ready, progress, get, update, reset, unlocked, unlocking, unlock, authError };
}

export function countDone(progress: ProgressMap, taskIds: string[]): number {
  return taskIds.reduce((n, id) => n + (progress[id]?.done ? 1 : 0), 0);
}
