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
import { db, ensureAnonymousAuth } from "./firebase";
import { getSavedActorName } from "./useProgress";

export type ContactStatus =
  | "not_contacted"
  | "intro_done"
  | "in_discussion"
  | "yes"
  | "no"
  | "pending";

export interface Contact {
  id: string;
  taskId: string;
  name: string;
  status: ContactStatus;
}

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    const firestore = db;
    if (!firestore) return;
    return onSnapshot(collection(firestore, "contacts"), (snap) => {
      setContacts(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Contact, "id">) })));
    });
  }, []);

  const addContacts = useCallback(async (taskId: string, names: string[]) => {
    const firestore = db;
    if (!firestore) return;
    await ensureAnonymousAuth();
    const actorName = getSavedActorName() ?? "Unknown";
    await Promise.all(
      names
        .map((n) => n.trim())
        .filter(Boolean)
        .map((name) =>
          addDoc(collection(firestore, "contacts"), {
            taskId,
            name,
            status: "not_contacted",
            createdBy: actorName,
            createdAt: serverTimestamp(),
          })
        )
    );
  }, []);

  const updateContactStatus = useCallback(async (id: string, status: ContactStatus) => {
    const firestore = db;
    if (!firestore) return;
    await ensureAnonymousAuth();
    await setDoc(doc(firestore, "contacts", id), { status }, { merge: true });
  }, []);

  const removeContact = useCallback(async (id: string) => {
    const firestore = db;
    if (!firestore) return;
    await deleteDoc(doc(firestore, "contacts", id));
  }, []);

  return { contacts, addContacts, updateContactStatus, removeContact };
}
