// BIW (biw.cloud) ThanksBIW activity-feed connector.
//
// API endpoint (via proxy): GET /api/biw/activities
//   → proxy/server.js forwards to GET https://api.biw.cloud/v1/activity-feed/activity-feed/search
//   → Auth header (Bearer JWT) is added server-side — the token never ships to the browser.
//
// Real DB columns discovered from the API error response:
//   id, companyId, personId, activityDate, activityType,
//   reward, sender, recipients, description, descriptionLink,
//   recognitionId, orderNumber, recipientId, rewardChoiceId,
//   programId, awardedAt, …
//
// We filter for activityType:
//   "Recognition Received"  — someone sent the employee a recognition
//   "Points Deposited"      — points were credited to the account
//
// When BIW_TOKEN is not set in proxy/.env (or the token is expired) the proxy
// returns 503 and the module falls back to rich sample data so the UI is
// always populated.

// Proxy base — same host as ICA proxy (default http://localhost:3001).
const PROXY_BASE =
  (process.env.REACT_APP_ICA_PROXY_URL ?? 'http://localhost:3001').replace(/\/$/, '');

// ── Public types ────────────────────────────────────────────────────────────

export type BiWActivityType = 'Recognition Received' | 'Points Deposited';

export interface BiWActivity {
  id: string;
  type: BiWActivityType;
  /** Sender name (recognition) or "IBM Points" (points deposit) */
  from: string;
  fromInitials: string;
  /** Formatted date e.g. "Jun 11, 2026" */
  date: string;
  /** Recognition message or deposit description */
  message: string;
  /** Points value when present */
  points?: number;
  isManager: boolean;
}

// ── Raw API shape (real field names from the DB schema) ─────────────────────

interface RawSender {
  id?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  fullName?: string;
  displayName?: string;
}

interface RawReward {
  points?: number;
  amount?: number;
  value?: number;
}

interface RawActivity {
  id?: string;
  activityType?: string;
  activityDate?: string;          // ISO 8601
  awardedAt?: string;             // fallback date
  createdAt?: string;             // final fallback
  sender?: RawSender | string;
  description?: string;           // human-readable message / note
  descriptionLink?: string;
  reward?: RawReward | number;
  // points may live directly on the root in some versions
  points?: number;
  pointsAmount?: number;
}

interface RawResponse {
  // The API wraps results in data[] or rows[] or results[]
  data?: RawActivity[];
  rows?: RawActivity[];
  results?: RawActivity[];
  items?: RawActivity[];
  // pagination metadata (ignored)
  count?: number;
  total?: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function senderName(sender: RawSender | string | undefined): string {
  if (!sender) return 'Colleague';
  if (typeof sender === 'string') return sender;
  const parts = [sender.firstName, sender.lastName].filter(Boolean).join(' ');
  return sender.displayName ?? sender.fullName ?? sender.name ?? (parts || 'Colleague');
}

function pointsValue(raw: RawActivity): number | undefined {
  if (typeof raw.reward === 'number') return raw.reward;
  if (raw.reward && typeof raw.reward === 'object') {
    return raw.reward.points ?? raw.reward.amount ?? raw.reward.value;
  }
  return raw.points ?? raw.pointsAmount;
}

function mapRaw(raw: RawActivity, idx: number): BiWActivity | null {
  const type = (raw.activityType ?? '').trim();
  if (type !== 'Recognition Received' && type !== 'Points Deposited') return null;

  const isPoints = type === 'Points Deposited';
  const from = isPoints ? 'IBM Points' : senderName(raw.sender);
  const dateStr = raw.activityDate ?? raw.awardedAt ?? raw.createdAt ?? '';

  return {
    id: raw.id ?? `biw-${idx}`,
    type: type as BiWActivityType,
    from,
    fromInitials: initials(from),
    date: dateStr ? fmtDate(dateStr) : '',
    message: raw.description ?? (isPoints ? 'Points deposited to your account' : ''),
    points: pointsValue(raw),
    isManager: false,           // API doesn't expose manager flag directly
  };
}

// ── Sample data (used when proxy is unavailable / token not set / expired) ────
// Realistic demo data for Priyanka Atodariya, IBM Consulting, Band 07.

export const BIW_SAMPLE: BiWActivity[] = [
  {
    id: 'biw-r1',
    type: 'Recognition Received',
    from: 'Rohan Mehta',
    fromInitials: 'RM',
    date: 'Aug 12, 2026',
    message: 'Priyanka delivered an outstanding GrowthIQ prototype under a tight deadline — the client was genuinely impressed. This is Band 8 level work.',
    points: 500,
    isManager: false,
  },
  {
    id: 'biw-r2',
    type: 'Recognition Received',
    from: 'Manager',
    fromInitials: 'MG',
    date: 'Aug 6, 2026',
    message: 'Exceptional leadership on the design-system rollout. Priyanka brought the whole team together and set the quality bar for the entire engagement.',
    points: 1000,
    isManager: true,
  },
  {
    id: 'biw-p1',
    type: 'Points Deposited',
    from: 'IBM Points',
    fromInitials: 'IP',
    date: 'Jul 30, 2026',
    message: 'Points deposited for: Design System Contributor badge earned on YourLearning.',
    points: 250,
    isManager: false,
  },
  {
    id: 'biw-r3',
    type: 'Recognition Received',
    from: 'Sneha Kapoor',
    fromInitials: 'SK',
    date: 'Jul 22, 2026',
    message: 'Your help debugging the Carbon component integration saved our sprint. Really appreciate the quick turnaround and clear documentation.',
    points: 300,
    isManager: false,
  },
  {
    id: 'biw-p2',
    type: 'Points Deposited',
    from: 'IBM Points',
    fromInitials: 'IP',
    date: 'Jul 15, 2026',
    message: 'Points deposited for: Think40 annual learning goal — Level 1 completion.',
    points: 150,
    isManager: false,
  },
  {
    id: 'biw-r4',
    type: 'Recognition Received',
    from: 'Arjun Nair',
    fromInitials: 'AN',
    date: 'Jun 28, 2026',
    message: "Priyanka's contribution to the accessibility audit went far beyond scope — the thoroughness raised the bar for the entire consulting team.",
    points: 400,
    isManager: false,
  },
];

// ── Main export ──────────────────────────────────────────────────────────────

export async function fetchBiWActivities(): Promise<BiWActivity[]> {
  let res: Response;
  try {
    // All calls go through the local proxy — the BIW JWT never leaves the server.
    res = await fetch(`${PROXY_BASE}/api/biw/activities`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
  } catch (err) {
    console.warn('[BIW] proxy unreachable — using sample data:', err);
    return BIW_SAMPLE;
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.warn(`[BIW] proxy ${res.status} — using sample data. Body: ${text.slice(0, 200)}`);
    return BIW_SAMPLE;
  }

  let json: RawResponse;
  try {
    json = await res.json();
  } catch {
    console.warn('[BIW] non-JSON response from proxy — using sample data');
    return BIW_SAMPLE;
  }

  const raw: RawActivity[] = json.data ?? json.rows ?? json.results ?? json.items ?? [];

  if (!raw.length) {
    // Empty response — no activity yet; still show sample so UI isn't blank
    console.info('[BIW] empty response — using sample data');
    return BIW_SAMPLE;
  }

  const mapped = raw
    .map((r, i) => mapRaw(r, i))
    .filter((a): a is BiWActivity => a !== null);

  // Always return sample if nothing matched the two target types
  if (!mapped.length) {
    console.info('[BIW] no matching activity types — using sample data');
    return BIW_SAMPLE;
  }

  // Sort by date descending (newest first)
  mapped.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });

  return mapped;
}
