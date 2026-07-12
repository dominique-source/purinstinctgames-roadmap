"use client";

import { useCallback, useEffect, useState } from "react";
import type { Owner } from "./roadmap";

export interface TaskState {
  owner: Owner | null;
  done: boolean;
  notes: string;
}

export type ProgressMap = Record<string, TaskState>;

const KEY = "purinstinct-roadmap-v1";
const EMPTY: TaskState = { owner: null, done: false, notes: "" };

function load(): ProgressMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ProgressMap) : {};
  } catch {
    return {};
  }
}

export function useProgress() {
  const [progress, setProgress] = useState<ProgressMap>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setProgress(load());
    setReady(true);
  }, []);

  const update = useCallback((taskId: string, patch: Partial<TaskState>) => {
    setProgress((prev) => {
      const next: ProgressMap = {
        ...prev,
        [taskId]: { ...EMPTY, ...prev[taskId], ...patch },
      };
      try {
        window.localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* storage unavailable — keep in memory */
      }
      return next;
    });
  }, []);

  const get = useCallback(
    (taskId: string): TaskState => progress[taskId] ?? EMPTY,
    [progress]
  );

  const reset = useCallback(() => {
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      /* noop */
    }
    setProgress({});
  }, []);

  return { ready, progress, get, update, reset };
}

export function countDone(progress: ProgressMap, taskIds: string[]): number {
  return taskIds.reduce((n, id) => n + (progress[id]?.done ? 1 : 0), 0);
}
