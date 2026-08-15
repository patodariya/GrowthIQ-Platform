import { Contribution } from '../types';

// --- Impact Score model -----------------------------------------------------
// The Impact Score is a transparent, tunable rollup of a person's contributions.
// Each contribution scores:
//     impactPoints × dimensionWeight × verificationFactor
// We sum those and multiply by a calibration constant to land on a 0–1000 index.
// Everything below is configuration — change it here and the whole app follows.

// Impact level → points. Non-linear on purpose: a Critical outcome is worth far
// more than a Low one, so it should not be a flat 1/2/3/4.
export const IMPACT_POINTS: Record<Contribution['impact'], number> = {
  'Low Impact': 1,
  'Medium Impact': 2,
  'High Impact': 4,
  'Critical Impact': 8,
};

// Dimension weights (why each — grounded in the iX India Design Goals):
//  - Outcomes / Client Success (1.2): iX is a client consultancy, so delivered
//    client & business value is the north star.
//  - Leadership (1.1): a gating dimension from Band 7+, rewards scope beyond self.
//  - Skills (1.0): baseline craft / T-shape — the neutral-weighted foundation.
//  - Behaviors (0.9): essential and expected, but an enabler rather than a direct
//    value driver.
// These are a product/policy choice (HR/iX would own them) and can differ by band.
export const DIMENSION_WEIGHTS: Record<Contribution['category'], number> = {
  Outcomes: 1.2,
  'Client Success': 1.2,
  Leadership: 1.1,
  Skills: 1.0,
  Behaviors: 0.9,
};

// Unverified work counts at half — it hasn't been confirmed by AI + manager yet.
export const VERIFIED_FACTOR = 1.0;
export const PENDING_FACTOR = 0.5;

// Steady-state metrics pulled from IBM systems of record (YourLearning / MyScore)
// count at a reduced weight: sustained utilization or completed training is
// expected baseline performance, not standout deliverable-level impact.
export const SYSTEM_FACTOR = 0.4;

// Calibration constant that maps the weighted sum onto a ~0–1000 index (tuned so
// a strong quarter lands high without saturating). The score is capped at 1000.
export const IMPACT_SCALE = 15;
export const IMPACT_CAP = 1000;

type Scorable = Pick<Contribution, 'category' | 'impact' | 'verified' | 'system'>;

/** Weighted impact of a single contribution. */
export function contributionImpact(c: Scorable): number {
  const points = IMPACT_POINTS[c.impact] ?? 0;
  const weight = DIMENSION_WEIGHTS[c.category] ?? 1;
  const verification = c.verified ? VERIFIED_FACTOR : PENDING_FACTOR;
  const source = c.system ? SYSTEM_FACTOR : 1;
  return points * weight * verification * source;
}

/** Aggregate Impact Score (0–1000) for a set of contributions. */
export function computeImpactScore(contributions: Scorable[]): number {
  const raw = contributions.reduce((sum, c) => sum + contributionImpact(c), 0);
  return Math.min(IMPACT_CAP, Math.round(raw * IMPACT_SCALE));
}

// Human-readable explanation reused in the metric-card tooltip so the UI and the
// implementation can never drift apart.
export const IMPACT_SCORE_INFO =
  'Sum of each contribution scored as impact level (Low 1 · Med 2 · High 4 · Critical 8) ' +
  '× dimension weight (Outcomes & Client Success 1.2, Leadership 1.1, Skills 1.0, Behaviors 0.9) ' +
  '× verification (verified 1.0, pending 0.5). Steady-state metrics synced from IBM systems ' +
  '(YourLearning / MyScore) count at 0.4×. The total is scaled to a 0–1000 index.';
