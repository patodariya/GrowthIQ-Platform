// Thin client for the YourLearning (yourlearning.ibm.com) transcript summary.
//
// The browser NEVER holds the personal Bearer token — it lives server-side in
// proxy/.env (YL_TOKEN) and the proxy forwards the GET, adding CORS. If the
// token is missing/expired or the proxy is down, callers fall back to the last
// known values so the card still renders.

const PROXY_URL = (
  process.env.REACT_APP_ICA_PROXY_URL || 'http://localhost:3001'
).replace(/\/$/, '');

// Opt-in switch, mirroring ICA. Set REACT_APP_YL_ENABLED=true to fetch live.
export const YL_ENABLED = process.env.REACT_APP_YL_ENABLED === 'true';

// The IBM Think40 annual learning goal (hours).
export const THINK40_GOAL_HOURS = 40;

export interface LearningSummary {
  learnerName: string;
  learnerEmail: string;
  think40Level: number;
  completionHoursThisYear: number;
  completionHoursLastYear: number;
  completions: number; // all-time yourLearning completions
  queue: number; // items currently in the learning queue
  totalRecords: number;
  badgesTotal: number;
  badgesThisYear: number;
  credentialsCompleted: number;
  recordYears: number[];
}

// Shape of the raw transcript/summary response (only the fields we use).
interface RawSummary {
  data?: {
    learnerCnum?: string;
    think40Status?: { currentYearLevel?: number; previousYearLevel?: number };
    transcriptSummary?: {
      completionHours?: { currentYear?: number; previousYear?: number };
      recordCount?: {
        total?: number;
        yourLearningQueue?: number;
        yourLearningCompletions?: number;
      };
      recordYears?: number[];
    };
    badgeSummary?: {
      recordCount?: { total?: number; issuedCurrentYear?: number };
    };
    credentialSummary?: {
      recordCount?: { yourLearningCompletions?: number };
    };
  };
}

// Decode the "name"/"sub" claims from the (already-server-held) token is not
// possible client-side; the API response identifies the learner by cnum only,
// so we keep a friendly default the proxy owner can rely on.
function map(raw: RawSummary): LearningSummary {
  const d = raw.data || {};
  const ts = d.transcriptSummary || {};
  const rc = ts.recordCount || {};
  const badge = d.badgeSummary?.recordCount || {};
  const cred = d.credentialSummary?.recordCount || {};
  return {
    learnerName: 'IBM Learner',
    learnerEmail: '',
    think40Level: d.think40Status?.currentYearLevel ?? 0,
    completionHoursThisYear: Math.round((ts.completionHours?.currentYear ?? 0) * 10) / 10,
    completionHoursLastYear: Math.round((ts.completionHours?.previousYear ?? 0) * 10) / 10,
    completions: rc.yourLearningCompletions ?? 0,
    queue: rc.yourLearningQueue ?? 0,
    totalRecords: rc.total ?? 0,
    badgesTotal: badge.total ?? 0,
    badgesThisYear: badge.issuedCurrentYear ?? 0,
    credentialsCompleted: cred.yourLearningCompletions ?? 0,
    recordYears: ts.recordYears ?? [],
  };
}

export async function fetchLearningSummary(): Promise<LearningSummary> {
  const res = await fetch(`${PROXY_URL}/api/learning/summary`);
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Learning proxy ${res.status}: ${detail}`);
  }
  const raw = (await res.json()) as RawSummary;
  if (!raw?.data) throw new Error('Learning summary: unexpected shape');
  return map(raw);
}
