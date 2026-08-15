import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Contribution,
  DetectedContribution,
  DetectedStatus,
} from '../types';
import { fetchRecognitionMessages } from '../services/connectors';
import { extractContribution } from '../services/ica';

// Bump the version to reset every browser's persisted inbox to its default
// (detected) state — clears items that were left in "pending_manager".
const STORAGE_KEY = 'growthiq.recognitionInbox.v2';

function loadPersisted(): { items: DetectedContribution[]; existed: boolean } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { items: [], existed: false };
    return { items: JSON.parse(raw) as DetectedContribution[], existed: true };
  } catch {
    return { items: [], existed: false };
  }
}

export interface RecognitionInbox {
  /** Items awaiting employee review or manager approval. */
  inbox: DetectedContribution[];
  /** Manager-approved items, mapped to verified Contributions. */
  approvedContributions: Contribution[];
  syncing: boolean;
  sync: () => Promise<void>;
  approveByEmployee: (id: string) => void;
  /** Called when the manager approves the item in their queue (reflect-back). */
  markApproved: (id: string) => void;
  dismiss: (id: string) => void;
  /** Employee-editable fields for a detected item before it's sent. */
  editItem: (id: string, changes: EditableFields) => void;
  reset: () => void;
}

export type EditableFields = Partial<
  Pick<DetectedContribution, 'title' | 'category' | 'impact' | 'summary'>
>;

export function useRecognitionInbox(): RecognitionInbox {
  const initial = useRef(loadPersisted()).current;
  const [items, setItems] = useState<DetectedContribution[]>(initial.items);
  const [syncing, setSyncing] = useState(false);

  // Mirror items into a ref so sync() reads the latest without a stale closure.
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const syncingRef = useRef(false);
  const didAutoSync = useRef(false);

  // Persist on every change.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage unavailable — non-fatal */
    }
  }, [items]);

  const sync = useCallback(async () => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    setSyncing(true);
    try {
      const messages = await fetchRecognitionMessages();
      const seen = new Set(itemsRef.current.map((i) => i.id));
      const fresh = messages.filter((m) => !seen.has(m.id));
      const detected = await Promise.all(
        fresh.map(async (m): Promise<DetectedContribution> => {
          const ex = await extractContribution(m);
          return {
            id: m.id,
            source: m.source,
            from: m.from,
            channel: m.channel,
            receivedAt: m.receivedAt,
            rawMessage: m.text,
            title: ex.title,
            category: ex.category,
            impact: ex.impact,
            summary: ex.summary,
            aiExtracted: ex.aiExtracted,
            status: 'detected',
          };
        })
      );
      if (detected.length) setItems((prev) => [...detected, ...prev]);
    } finally {
      syncingRef.current = false;
      setSyncing(false);
    }
  }, []);

  // Auto-sync once on the very first visit so the demo isn't empty. Guarded so
  // reloads (which have persisted state) don't re-spend tokens.
  useEffect(() => {
    if (!initial.existed && !didAutoSync.current) {
      didAutoSync.current = true;
      void sync();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setStatus = useCallback((id: string, status: DetectedStatus) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status } : i))
    );
  }, []);

  const approveByEmployee = useCallback(
    (id: string) => setStatus(id, 'pending_manager'),
    [setStatus]
  );
  const markApproved = useCallback(
    (id: string) => setStatus(id, 'approved'),
    [setStatus]
  );
  const dismiss = useCallback(
    (id: string) => setStatus(id, 'dismissed'),
    [setStatus]
  );

  // Let the employee correct the drafted fields before sending. Manual edits
  // flip the badge from "Suggested" to "Edited" so it's clear who owns the wording.
  const editItem = useCallback((id: string, changes: EditableFields) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...changes, edited: true } : i))
    );
  }, []);
  const reset = useCallback(() => {
    didAutoSync.current = false;
    setItems([]);
  }, []);

  const inbox = items.filter(
    (i) => i.status === 'detected' || i.status === 'pending_manager'
  );

  const approvedContributions: Contribution[] = items
    .filter((i) => i.status === 'approved')
    .map((i) => ({
      id: `rec-${i.id}`,
      title: i.title,
      description: i.summary,
      category: i.category,
      impact: i.impact,
      date: i.receivedAt,
      verified: true,
      verifiedBy: i.from,
    }));

  return {
    inbox,
    approvedContributions,
    syncing,
    sync,
    approveByEmployee,
    markApproved,
    dismiss,
    editItem,
    reset,
  };
}
