"use client";

import { useEffect, useState } from "react";
import { collection, limit, onSnapshot, orderBy, query, Timestamp } from "firebase/firestore";
import { db } from "./firebase";

export interface HistoryEntry {
  id: string;
  taskId: string | null;
  field: string;
  value: unknown;
  actorName: string;
  at: Date | null;
}

export function useHistory(entryLimit = 50) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    const firestore = db;
    if (!firestore) return;
    const q = query(collection(firestore, "history"), orderBy("at", "desc"), limit(entryLimit));
    return onSnapshot(q, (snap) => {
      setEntries(
        snap.docs.map((d) => {
          const data = d.data();
          const at = data.at as Timestamp | undefined;
          return {
            id: d.id,
            taskId: data.taskId ?? null,
            field: data.field,
            value: data.value,
            actorName: data.actorName ?? "Unknown",
            at: at ? at.toDate() : null,
          };
        })
      );
    });
  }, [entryLimit]);

  return entries;
}
