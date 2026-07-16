"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  addDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { db, ensureAnonymousAuth } from "./firebase";
import { getSavedActorName } from "./useProgress";

export const FOCUS_SLOTS = 3;

export interface FocusSlot {
  id: string;
  date: string;
  slot: number;
  text: string;
}

export interface DerailedItem {
  id: string;
  date: string;
  text: string;
  createdBy: string;
  at: Date | null;
}

// Local date (not UTC) — the team works in one timezone, so this is simpler
// and more predictable than dealing with Firestore server timestamps here.
export function todayKey(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function useDailyFocus() {
  const [allSlots, setAllSlots] = useState<FocusSlot[]>([]);
  const [allDerailed, setAllDerailed] = useState<DerailedItem[]>([]);
  const today = todayKey();

  useEffect(() => {
    const firestore = db;
    if (!firestore) return;
    const unsubSlots = onSnapshot(collection(firestore, "focusSlots"), (snap) => {
      setAllSlots(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<FocusSlot, "id">) })));
    });
    const unsubDerailed = onSnapshot(collection(firestore, "derailedTasks"), (snap) => {
      setAllDerailed(
        snap.docs.map((d) => {
          const data = d.data();
          const at = data.at as Timestamp | undefined;
          return {
            id: d.id,
            date: data.date as string,
            text: data.text as string,
            createdBy: (data.createdBy as string) ?? "Unknown",
            at: at ? at.toDate() : null,
          };
        })
      );
    });
    return () => {
      unsubSlots();
      unsubDerailed();
    };
  }, []);

  const slots = useMemo(
    () =>
      Array.from({ length: FOCUS_SLOTS }, (_, i) => allSlots.find((s) => s.date === today && s.slot === i)),
    [allSlots, today]
  );

  const derailed = useMemo(
    () =>
      allDerailed
        .filter((d) => d.date === today)
        .sort((a, b) => (a.at?.getTime() ?? 0) - (b.at?.getTime() ?? 0)),
    [allDerailed, today]
  );

  const setFocusText = useCallback(
    async (slot: number, text: string) => {
      const firestore = db;
      if (!firestore) return;
      await ensureAnonymousAuth();
      const id = `${today}_${slot}`;
      if (!text.trim()) {
        await deleteDoc(doc(firestore, "focusSlots", id));
        return;
      }
      await setDoc(
        doc(firestore, "focusSlots", id),
        {
          date: today,
          slot,
          text,
          updatedBy: getSavedActorName() ?? "Unknown",
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    },
    [today]
  );

  const addDerailed = useCallback(
    async (text: string) => {
      const firestore = db;
      if (!firestore || !text.trim()) return;
      await ensureAnonymousAuth();
      await addDoc(collection(firestore, "derailedTasks"), {
        date: today,
        text: text.trim(),
        createdBy: getSavedActorName() ?? "Unknown",
        at: serverTimestamp(),
      });
    },
    [today]
  );

  const removeDerailed = useCallback(async (id: string) => {
    const firestore = db;
    if (!firestore) return;
    await deleteDoc(doc(firestore, "derailedTasks", id));
  }, []);

  return { today, slots, derailed, setFocusText, addDerailed, removeDerailed };
}
