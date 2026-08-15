// Thin client for the IBM MyScore business scorecard.
//
// MyScore has no JSON API — it renders data into an HTML page behind IBM SSO.
// The proxy holds the session cookie (server-side), fetches the page, parses
// the metrics, and returns compact JSON. The browser never sees the cookie.

const PROXY_URL = (
  process.env.REACT_APP_ICA_PROXY_URL || 'http://localhost:3001'
).replace(/\/$/, '');

// Opt-in switch, mirroring ICA / YourLearning.
export const MYSCORE_ENABLED = process.env.REACT_APP_MYSCORE_ENABLED === 'true';

export interface ScorePoint {
  group: 'Chargeable' | 'Goal' | 'Attainment' | string;
  date: string;
  value: number;
}

export interface Expectation {
  name: string;
  status: 'Met' | 'Not Met' | 'Not Applicable' | string;
}

export interface MyScoreData {
  historical: ScorePoint[];
  band: string | null;
  chargeableRolling: number | null;
  chargeablePrior: number | null;
  chargeableGoal: number | null;
  attainmentRolling: number | null;
  attainmentPrior: number | null;
  expectations: Expectation[];
}

export async function fetchMyScore(): Promise<MyScoreData> {
  const res = await fetch(`${PROXY_URL}/api/myscore/metrics`);
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`MyScore proxy ${res.status}: ${detail}`);
  }
  const data = (await res.json()) as MyScoreData;
  if (!Array.isArray(data?.historical)) throw new Error('MyScore: unexpected shape');
  return data;
}

// The per-quarter Chargeable-vs-Goal series (excludes the rolling/prior aggregates),
// shaped for a line chart.
export function quarterlyTrend(data: MyScoreData) {
  const quarters = data.historical
    .filter((p) => p.group === 'Chargeable' && /^\dQ /.test(p.date))
    .map((p) => p.date);
  return quarters.map((q) => ({
    quarter: q,
    Chargeable:
      data.historical.find((p) => p.group === 'Chargeable' && p.date === q)?.value ?? null,
    Goal: data.historical.find((p) => p.group === 'Goal' && p.date === q)?.value ?? null,
  }));
}
