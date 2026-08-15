import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Contribution } from '../types';

// A contribution awaiting a manager's sign-off. `origin: 'self'` items were sent
// by the logged-in employee (via their Recognition Inbox); `origin: 'team'`
// items were submitted by a direct report. This shared store is what closes the
// loop between the employee "send to manager" action and the manager's queue.
export interface TeamApproval {
  id: string;
  inboxId?: string; // the employee inbox item id, for reflecting the result back
  from: string;
  initials: string;
  title: string;
  category: Contribution['category'];
  impact: Contribution['impact'];
  date: string;
  origin: 'team' | 'self';
  /** Supporting artifacts the manager can review before approving. */
  evidence?: string[];
  /** A short note/context from the submitter the manager reviews before signing off. */
  note?: string;
  /** Original recognition text (for items surfaced from the employee's inbox). */
  rawMessage?: string;
}

interface TeamApprovalsValue {
  queue: TeamApproval[];
  submitFromEmployee: (item: Omit<TeamApproval, 'origin'>) => void;
  approve: (id: string) => void;
  decline: (id: string) => void;
  /** Manager can adjust the impact level after reviewing the evidence. */
  setImpact: (id: string, impact: Contribution['impact']) => void;
  /** Manager can re-classify the dimension before approving. */
  setCategory: (id: string, category: Contribution['category']) => void;
  /** inboxIds the manager has approved — the employee view reflects these back. */
  approvedInboxIds: string[];
}

// Seeded with a couple of real direct-report submissions so the manager's queue
// is never empty during a demo.
const SEED: TeamApproval[] = [
  {
    id: 'team-1',
    from: 'Kavya Reddy',
    initials: 'KR',
    title: 'Redesigned the settings information architecture',
    category: 'Skills',
    impact: 'High Impact',
    date: 'Jul 3, 2026',
    origin: 'team',
    evidence: ['Figma file', 'IA audit doc', 'Before/after screens'],
    note: 'Reworked the settings IA after usability testing flagged users could not find notification and privacy controls. New structure cut task time by ~40% in the follow-up test.',
    rawMessage: 'Hey, wanted to flag the settings IA overhaul I shipped this week. Ran two rounds of usability testing — users were struggling to find notification and privacy settings in the old structure. I reworked the whole hierarchy and the follow-up test showed a ~40% drop in task completion time. Figma file, audit doc, and before/after screens are all attached.',
  },
  {
    id: 'team-2',
    from: 'Vikram Nair',
    initials: 'VN',
    title: 'Ran a moderated usability test round with 6 users',
    category: 'Outcomes',
    impact: 'Medium Impact',
    date: 'Jul 2, 2026',
    origin: 'team',
    evidence: ['Test recording', 'Findings report'],
    note: 'Moderated 6 sessions on the checkout prototype. Surfaced 3 critical drop-off points that fed directly into the redesign backlog for next sprint.',
    rawMessage: 'Completed the moderated usability test round for the checkout prototype — ran 6 sessions this week. We uncovered 3 critical drop-off points that weren\'t visible in the analytics. All findings are in the report and I\'ve already added them to next sprint\'s backlog. Recording and findings doc attached for your review.',
  },
];

const TeamApprovalsContext = createContext<TeamApprovalsValue | null>(null);

export const TeamApprovalsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [queue, setQueue] = useState<TeamApproval[]>(SEED);
  const [approvedInboxIds, setApprovedInboxIds] = useState<string[]>([]);

  const submitFromEmployee = useCallback((item: Omit<TeamApproval, 'origin'>) => {
    setQueue((prev) =>
      prev.some((q) => q.id === item.id) ? prev : [{ ...item, origin: 'self' }, ...prev]
    );
  }, []);

  const approve = useCallback((id: string) => {
    setQueue((prev) => {
      const item = prev.find((q) => q.id === id);
      if (item?.origin === 'self' && item.inboxId) {
        setApprovedInboxIds((ids) => (ids.includes(item.inboxId!) ? ids : [...ids, item.inboxId!]));
      }
      return prev.filter((q) => q.id !== id);
    });
  }, []);

  const decline = useCallback((id: string) => {
    setQueue((prev) => prev.filter((q) => q.id !== id));
  }, []);

  const setImpact = useCallback((id: string, impact: Contribution['impact']) => {
    setQueue((prev) => prev.map((q) => (q.id === id ? { ...q, impact } : q)));
  }, []);

  const setCategory = useCallback((id: string, category: Contribution['category']) => {
    setQueue((prev) => prev.map((q) => (q.id === id ? { ...q, category } : q)));
  }, []);

  const value = useMemo(
    () => ({
      queue,
      submitFromEmployee,
      approve,
      decline,
      setImpact,
      setCategory,
      approvedInboxIds,
    }),
    [queue, submitFromEmployee, approve, decline, setImpact, setCategory, approvedInboxIds]
  );

  return <TeamApprovalsContext.Provider value={value}>{children}</TeamApprovalsContext.Provider>;
};

export function useTeamApprovals(): TeamApprovalsValue {
  const ctx = useContext(TeamApprovalsContext);
  if (!ctx) throw new Error('useTeamApprovals must be used within TeamApprovalsProvider');
  return ctx;
}
