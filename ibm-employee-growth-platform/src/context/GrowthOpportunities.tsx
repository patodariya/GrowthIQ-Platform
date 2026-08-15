import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

// A stretch/growth initiative a manager opens up to their team. Employees can
// express interest; the manager then proposes one of the interested members.
// This shared store closes the loop between the Manager and Employee views.
export type OppAudience = 'team' | 'directs' | 'peer-managers';

export interface GrowthOpportunity {
  id: string;
  title: string;
  description: string;
  audience: OppAudience;
  createdBy: string;
  createdAt: string;
  interested: string[]; // member names who raised their hand
  proposed?: string;    // member the manager put forward
  // peer-received fields
  fromPeer?: string;    // peer manager name who shared this
  forwardedTo?: string; // DR name this was forwarded to
}

// Opportunities shared by peer managers — static seed, displayed read-only
// in the "Received from Peers" tab. Manager can forward them to a DR.
export interface PeerOpportunity {
  id: string;
  title: string;
  description: string;
  fromPeer: string;
  receivedAt: string;
  forwardedTo?: string;
}

interface GrowthOpportunitiesValue {
  opportunities: GrowthOpportunity[];
  peerOpportunities: PeerOpportunity[];
  addOpportunity: (o: {
    title: string;
    description: string;
    audience: OppAudience;
  }) => void;
  expressInterest: (id: string, member: string) => void;
  withdrawInterest: (id: string, member: string) => void;
  proposeMember: (id: string, member: string) => void;
  forwardPeerOpp: (id: string, drName: string) => void;
}

const STORAGE_KEY = 'growthiq.opportunities.v1';

// Seeded so both views have content on first load. Interested names come from
// the manager's roster so the propose flow is demoable immediately.
const SEED: GrowthOpportunity[] = [
  {
    id: 'opp-1',
    title: 'Lead Studio Initiative',
    description:
      'Own the India iX design-system studio for a quarter — set the craft bar, run weekly crits, and mentor two designers. A visible Leadership stretch that maps directly to Band 8 scope.',
    audience: 'team',
    createdBy: 'You',
    createdAt: 'Jul 8, 2026',
    interested: ['Priya Sharma', 'Kavya Reddy'],
  },
  {
    id: 'opp-2',
    title: 'Client Discovery Sprint Lead',
    description:
      'Facilitate a 2-week discovery sprint with a new retail client — lead stakeholder workshops and shape the problem framing. Strengthens Client Success and stakeholder facilitation.',
    audience: 'directs',
    createdBy: 'You',
    createdAt: 'Jul 6, 2026',
    interested: ['Ananya Krishnan'],
  },
];

// Seed peer opportunities — received from other managers who shared with 'peer-managers'.
const PEER_SEED: PeerOpportunity[] = [
  {
    id: 'peer-opp-1',
    title: 'AI Product Design Residency',
    description:
      'A 4-week embedded residency with the IBM Research AI team — co-design next-gen AI interaction patterns. Shared by the Mumbai studio manager. Strong fit for senior designers looking to build depth in AI-native UX.',
    fromPeer: 'Neha Joshi (Mumbai Studio)',
    receivedAt: 'Jul 7, 2026',
  },
  {
    id: 'peer-opp-2',
    title: 'Cross-Studio Design Systems Guild',
    description:
      'A recurring cross-studio working group to align design-system tokens, patterns and governance across 4 India studios. Leadership and Skills stretch — ideal for designers ready for Band 8 scope.',
    fromPeer: 'Rahul Desai (Pune Studio)',
    receivedAt: 'Jul 5, 2026',
  },
];

const PEER_STORAGE_KEY = 'growthiq.peer-opportunities.v1';

function load(): GrowthOpportunity[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as GrowthOpportunity[];
  } catch {
    /* ignore */
  }
  return SEED;
}

function loadPeer(): PeerOpportunity[] {
  try {
    const raw = localStorage.getItem(PEER_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as PeerOpportunity[];
  } catch {
    /* ignore */
  }
  return PEER_SEED;
}

const Ctx = createContext<GrowthOpportunitiesValue | null>(null);

export const GrowthOpportunitiesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [opportunities, setOpportunities] = useState<GrowthOpportunity[]>(load);
  const [peerOpportunities, setPeerOpportunities] = useState<PeerOpportunity[]>(loadPeer);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(opportunities));
    } catch {
      /* storage unavailable — non-fatal */
    }
  }, [opportunities]);

  useEffect(() => {
    try {
      localStorage.setItem(PEER_STORAGE_KEY, JSON.stringify(peerOpportunities));
    } catch {
      /* storage unavailable — non-fatal */
    }
  }, [peerOpportunities]);

  const addOpportunity = useCallback(
    (o: { title: string; description: string; audience: OppAudience }) => {
      const item: GrowthOpportunity = {
        id: `opp-${opportunities.length + 1}-${o.title.slice(0, 6).replace(/\s/g, '')}`,
        title: o.title.trim(),
        description: o.description.trim(),
        audience: o.audience,
        createdBy: 'You',
        createdAt: 'Jul 9, 2026',
        interested: [],
      };
      setOpportunities((prev) => [item, ...prev]);
    },
    [opportunities.length]
  );

  const expressInterest = useCallback((id: string, member: string) => {
    setOpportunities((prev) =>
      prev.map((o) =>
        o.id === id && !o.interested.includes(member)
          ? { ...o, interested: [...o.interested, member] }
          : o
      )
    );
  }, []);

  const withdrawInterest = useCallback((id: string, member: string) => {
    setOpportunities((prev) =>
      prev.map((o) =>
        o.id === id
          ? {
              ...o,
              interested: o.interested.filter((m) => m !== member),
              proposed: o.proposed === member ? undefined : o.proposed,
            }
          : o
      )
    );
  }, []);

  const proposeMember = useCallback((id: string, member: string) => {
    setOpportunities((prev) =>
      prev.map((o) => (o.id === id ? { ...o, proposed: member } : o))
    );
  }, []);

  const forwardPeerOpp = useCallback((id: string, drName: string) => {
    setPeerOpportunities((prev) =>
      prev.map((o) => (o.id === id ? { ...o, forwardedTo: drName } : o))
    );
  }, []);

  const value = useMemo(
    () => ({
      opportunities,
      peerOpportunities,
      addOpportunity,
      expressInterest,
      withdrawInterest,
      proposeMember,
      forwardPeerOpp,
    }),
    [opportunities, peerOpportunities, addOpportunity, expressInterest, withdrawInterest, proposeMember, forwardPeerOpp]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export function useGrowthOpportunities(): GrowthOpportunitiesValue {
  const ctx = useContext(Ctx);
  if (!ctx)
    throw new Error('useGrowthOpportunities must be used within GrowthOpportunitiesProvider');
  return ctx;
}
