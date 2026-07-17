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
  Timestamp,
} from "firebase/firestore";
import { db, ensureAnonymousAuth } from "./firebase";
import { getSavedActorName } from "./useProgress";

export const FOCUS_SLOTS = 3;

// Sprint start (matches SPRINT.range in roadmap.ts) — the earliest day
// worth navigating back to.
export const HISTORY_START_KEY = "2026-07-13";

export interface FocusSlot {
  id: string;
  date: string;
  slot: number;
  text: string;
  done?: boolean;
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

export function shiftDateKey(dateKey: string, deltaDays: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + deltaDays);
  const ny = dt.getFullYear();
  const nm = String(dt.getMonth() + 1).padStart(2, "0");
  const nd = String(dt.getDate()).padStart(2, "0");
  return `${ny}-${nm}-${nd}`;
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

  const slotsForDate = useCallback(
    (date: string) =>
      Array.from({ length: FOCUS_SLOTS }, (_, i) => allSlots.find((s) => s.date === date && s.slot === i)),
    [allSlots]
  );

  const derailedForDate = useCallback(
    (date: string) =>
      allDerailed
        .filter((d) => d.date === date)
        .sort((a, b) => (a.at?.getTime() ?? 0) - (b.at?.getTime() ?? 0)),
    [allDerailed]
  );

  const setFocusText = useCallback(async (date: string, slot: number, text: string) => {
    const firestore = db;
    if (!firestore) return;
    await ensureAnonymousAuth();
    const id = `${date}_${slot}`;
    if (!text.trim()) {
      await deleteDoc(doc(firestore, "focusSlots", id));
      return;
    }
    await setDoc(
      doc(firestore, "focusSlots", id),
      {
        date,
        slot,
        text,
        updatedBy: getSavedActorName() ?? "Unknown",
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }, []);

  const setFocusDone = useCallback(async (date: string, slot: number, done: boolean) => {
    const firestore = db;
    if (!firestore) return;
    await ensureAnonymousAuth();
    await setDoc(
      doc(firestore, "focusSlots", `${date}_${slot}`),
      { date, slot, done, updatedBy: getSavedActorName() ?? "Unknown", updatedAt: serverTimestamp() },
      { merge: true }
    );
  }, []);

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

  return {
    today,
    slotsForDate,
    derailedForDate,
    setFocusText,
    setFocusDone,
    addDerailed,
    removeDerailed,
  };
}
