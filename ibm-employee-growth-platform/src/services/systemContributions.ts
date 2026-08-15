// Turn IBM's read-only systems of record (YourLearning + MyScore) into verified
// contributions, classified into the iX design dimensions, so a designer's
// learning and business performance count toward the quarter alongside
// self-logged work and peer recognition.
//
// These are marked `verified` with the source system as evidence — they come
// from authoritative IBM data, not manual entry.

import { Contribution } from '../types';
import { LearningSummary, THINK40_GOAL_HOURS } from './yourLearning';
import { MyScoreData } from './myScore';

const DATE = 'Jul 1, 2026'; // current quarter; systems refresh continuously

export function deriveSystemContributions(
  learning: LearningSummary,
  score: MyScoreData
): Contribution[] {
  const out: Contribution[] = [];

  // --- MyScore: business scorecard ---
  if (score.chargeableRolling != null) {
    const above =
      score.chargeableGoal != null && score.chargeableRolling >= score.chargeableGoal;
    out.push({
      id: 'sys-ms-util',
      title: `Sustained ${score.chargeableRolling}% chargeable utilization (rolling 4Q)${
        above ? ` — above the ${score.chargeableGoal}% goal` : ''
      }`,
      description: 'Business utilization from IBM MyScore.',
      category: 'Outcomes',
      impact: above ? 'High Impact' : 'Medium Impact',
      date: DATE,
      verified: true,
      verifiedBy: 'IBM MyScore',
      evidence: ['IBM MyScore'],
      system: true,
    });
  }

  if (score.attainmentRolling != null) {
    out.push({
      id: 'sys-ms-attain',
      title: `Delivered ${score.attainmentRolling}% delivery attainment (rolling 4Q)`,
      description: 'Delivery attainment from IBM MyScore.',
      category: 'Client Success',
      impact: score.attainmentRolling >= 100 ? 'High Impact' : 'Medium Impact',
      date: DATE,
      verified: true,
      verifiedBy: 'IBM MyScore',
      evidence: ['IBM MyScore'],
      system: true,
    });
  }

  const met = score.expectations.filter((e) => e.status === 'Met');
  if (met.length) {
    out.push({
      id: 'sys-ms-cpe',
      title: `Met all Core Performance Expectations (${met
        .map((e) => e.name.replace(' Proficiency', ''))
        .join(', ')})`,
      description: 'Professional accountability standards from IBM MyScore.',
      category: 'Behaviors',
      impact: 'Medium Impact',
      date: DATE,
      verified: true,
      verifiedBy: 'IBM MyScore',
      evidence: ['IBM MyScore'],
      system: true,
    });
  }

  // --- YourLearning: skill development ---
  if (learning.completionHoursThisYear) {
    const goalMet = learning.completionHoursThisYear >= THINK40_GOAL_HOURS;
    out.push({
      id: 'sys-yl-hours',
      title: `Completed ${learning.completionHoursThisYear}h of learning this year${
        goalMet ? ' — Think40 goal met' : ''
      }`,
      description: 'Learning hours from IBM YourLearning.',
      category: 'Skills',
      impact: goalMet ? 'High Impact' : 'Medium Impact',
      date: DATE,
      verified: true,
      verifiedBy: 'IBM YourLearning',
      evidence: ['IBM YourLearning'],
      system: true,
    });
  }

  if (learning.badgesThisYear) {
    out.push({
      id: 'sys-yl-badges',
      title: `Earned ${learning.badgesThisYear} new IBM digital badge${
        learning.badgesThisYear > 1 ? 's' : ''
      } this year (${learning.badgesTotal} total)`,
      description: 'Digital badges from IBM YourLearning.',
      category: 'Skills',
      impact: 'Medium Impact',
      date: DATE,
      verified: true,
      verifiedBy: 'IBM YourLearning',
      evidence: ['IBM YourLearning'],
      system: true,
    });
  }

  if (learning.credentialsCompleted) {
    out.push({
      id: 'sys-yl-creds',
      title: `Maintained ${learning.credentialsCompleted} active IBM digital credentials`,
      description: 'Digital credentials from IBM YourLearning.',
      category: 'Skills',
      impact: 'Medium Impact',
      date: DATE,
      verified: true,
      verifiedBy: 'IBM YourLearning',
      evidence: ['IBM YourLearning'],
      system: true,
    });
  }

  return out;
}
