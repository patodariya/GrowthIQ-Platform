import React, { useEffect, useRef, useState } from 'react';
import { Tile, Button, Theme, Modal } from '@carbon/react';
import { Light } from '@carbon/icons-react';
import MetricCard from '../../components/shared/MetricCard';
import ContributionChart from '../../components/employee/ContributionChart';
import ContributionList from '../../components/employee/ContributionList';
import MyContributions from '../../components/employee/MyContributions';
import LogContributionModal from '../../components/employee/LogContributionModal';
import RecognitionBadges from '../../components/employee/RecognitionBadges';
import PendingContributions from '../../components/employee/PendingContributions';
import SkillRadar from '../../components/employee/SkillRadar';
import RecognitionCard from '../../components/employee/RecognitionCard';
import LearningCard from '../../components/employee/LearningCard';
import MyScoreCard from '../../components/employee/MyScoreCard';
import {
  fetchLearningSummary,
  LearningSummary,
  YL_ENABLED,
} from '../../services/yourLearning';
import { fetchMyScore, MyScoreData, MYSCORE_ENABLED } from '../../services/myScore';
import { fetchBiWActivities, BiWActivity, BIW_SAMPLE } from '../../services/biw';
import { deriveSystemContributions } from '../../services/systemContributions';
import { EmployeeReport } from '../../components/shared/ReportViews';
import { EmployeeOpportunities } from '../../components/shared/GrowthOpps';
import { useRecognitionInbox } from '../../hooks/useRecognitionInbox';
import { useTeamApprovals } from '../../context/TeamApprovals';
import {
  MetricCard as MetricCardType,
  Contribution,
  SkillProfile,
  ChartDataPoint,
} from '../../types';
import {
  generateMonthlySummary,
  generateCareerNudge,
  InsightContext,
  ICA_ENABLED,
} from '../../services/ica';
import { computeImpactScore, IMPACT_SCORE_INFO } from '../../services/impactScore';
import './EmployeeDashboard.scss';

// --- static demo data (module scope so the ICA effect has stable deps) ---

const EMPLOYEE = {
  name: 'Aarav',
  role: 'Designer at IBM iX India (Band 7, targeting Band 8)',
  month: 'July 2026',
};

const metrics: MetricCardType[] = [
  {
    id: '1',
    title: 'Contributions This Quarter',
    value: '14',
    subtitle: '+4 vs last quarter',
    icon: 'chart',
    info: 'Verified contributions you have logged this quarter, auto-classified across the iX design dimensions.',
  },
  {
    id: '2',
    title: 'Peer Ranking',
    value: 'Top 12%',
    subtitle: '↑ 4% this quarter',
    icon: 'rank',
    info: 'Where your Impact Score sits among iX designers at your band this quarter.',
  },
  {
    id: '3',
    title: 'Impact Score',
    value: '762', // overridden at runtime by computeImpactScore(myContribs)
    subtitle: 'weighted, 0–1000 index',
    icon: 'star',
    info: IMPACT_SCORE_INFO,
  },
  {
    id: '4',
    title: 'Promotion Readiness',
    value: '74%',
    subtitle: '6% to band bar',
    icon: 'trophy',
    info: 'How close your dimension scores are to the Band 8 bar (85). A readiness signal only — the promotion decision rests with your manager and IBM policy.',
  },
];

const chartData: ChartDataPoint[] = [
  { month: 'Jan', contributions: 3 },
  { month: 'Feb', contributions: 4 },
  { month: 'Mar', contributions: 3 },
  { month: 'Apr', contributions: 4 },
  { month: 'May', contributions: 5 },
  { month: 'Jun', contributions: 5 },
  { month: 'Jul', contributions: 5 },
];

// The employee's own contributions (shared by the Overview list and the
// My Contributions table). Includes an example per iX dimension.
const SEED_CONTRIBS: Contribution[] = [
  {
    id: 'c1',
    title: 'Led end-to-end redesign of retail client checkout — 28% conversion lift',
    description: '',
    category: 'Outcomes',
    impact: 'Critical Impact',
    date: 'Jun 28, 2026',
    verified: true,
    evidence: ['Figma file', 'Usability report'],
  },
  {
    id: 'c2',
    title: 'Shipped 40+ design-system components + published a reusable CoP POV',
    description: '',
    category: 'Skills',
    impact: 'High Impact',
    date: 'Jun 22, 2026',
    verified: true,
    evidence: ['Figma library', 'CoP asset'],
  },
  {
    id: 'c3',
    title: 'Led discovery & co-creation workshop initiative with C-suite stakeholders',
    description: '',
    category: 'Leadership',
    impact: 'High Impact',
    date: 'Jun 15, 2026',
    verified: true,
    evidence: ['Miro board', 'Workshop notes'],
  },
  {
    id: 'c4',
    title: 'Grew RetailCo satisfaction to NPS 72 and secured a follow-on engagement',
    description: '',
    category: 'Client Success',
    impact: 'High Impact',
    date: 'Jun 12, 2026',
    verified: true,
    evidence: ['NPS report', 'Signed SOW'],
  },
  {
    id: 'c5',
    title: 'Represented the India iX studio at IBM Design Week — scaling design systems',
    description: '',
    category: 'Behaviors',
    impact: 'Medium Impact',
    date: 'Jun 10, 2026',
    verified: false,
    evidence: ['Slide deck', 'Recording link'],
  },
  {
    id: 'c6',
    title: 'Delivered the banking onboarding revamp — shipped on schedule',
    description: '',
    category: 'Outcomes',
    impact: 'High Impact',
    date: 'Jun 6, 2026',
    verified: true,
    evidence: ['Prototype', 'Launch note'],
  },
  {
    id: 'c7',
    title: 'Improved accessibility across the banking prototype to WCAG AA',
    description: '',
    category: 'Skills',
    impact: 'Medium Impact',
    date: 'Jun 3, 2026',
    verified: true,
    evidence: ['Accessibility audit'],
  },
  {
    id: 'c8',
    title: 'Ran a client feedback workshop — 4.8/5 satisfaction',
    description: '',
    category: 'Client Success',
    impact: 'Medium Impact',
    date: 'May 29, 2026',
    verified: true,
    evidence: ['Feedback summary'],
  },
  {
    id: 'c9',
    title: 'Mentored 2 junior designers through their first client sprint',
    description: '',
    category: 'Leadership',
    impact: 'Medium Impact',
    date: 'May 24, 2026',
    verified: true,
    evidence: ['1:1 notes'],
  },
  {
    id: 'c10',
    title: 'Redesigned the analytics dashboard for FinCo',
    description: '',
    category: 'Outcomes',
    impact: 'High Impact',
    date: 'May 20, 2026',
    verified: true,
    evidence: ['Figma file'],
  },
  {
    id: 'c11',
    title: 'Authored the motion & interaction guidelines for the design system',
    description: '',
    category: 'Skills',
    impact: 'High Impact',
    date: 'May 15, 2026',
    verified: true,
    evidence: ['Guidelines doc'],
  },
  {
    id: 'c12',
    title: 'Organised the studio design-crit series',
    description: '',
    category: 'Behaviors',
    impact: 'Low Impact',
    date: 'May 11, 2026',
    verified: true,
    evidence: ['Crit calendar'],
  },
  {
    id: 'c13',
    title: 'Renewed the FinCo engagement for another quarter',
    description: '',
    category: 'Client Success',
    impact: 'High Impact',
    date: 'May 6, 2026',
    verified: true,
    evidence: ['Signed SOW'],
  },
  {
    id: 'c14',
    title: 'Ran an A/B test on the pricing page — awaiting results',
    description: '',
    category: 'Outcomes',
    impact: 'Medium Impact',
    date: 'May 2, 2026',
    verified: false,
    evidence: ['Test plan'],
  },
];

// Scores across the iX India Design Goals dimensions (Band 8 bar = 85).
const skills: SkillProfile = {
  outcomes: 86,
  skills: 88,
  behaviors: 82,
  leadership: 70,
  clientSuccess: 84,
};

// Built-in copy shown immediately and used as a fallback if ICA is unavailable.
const FALLBACK_SUMMARY =
  'You had an exceptional June. Your checkout redesign drove strong client Outcomes and your ' +
  'design-system POV deepened your Skills, while representing the studio at IBM Design Week lifted ' +
  'your Behaviors. Leadership (70) is your key gap for Band 8 readiness — building it strengthens ' +
  'your case when the promotion conversation happens.';

const FALLBACK_NUDGE =
  'Leading a studio or CoP initiative that drives client & IBM outcomes would strengthen your ' +
  "Leadership dimension — your biggest gap in Band 8 readiness (15 points below the bar).";

// Friendly labels for the dimension scores we hand to ICA.
const insightContext: InsightContext = {
  name: EMPLOYEE.name,
  role: EMPLOYEE.role,
  month: EMPLOYEE.month,
  metrics: metrics.map((m) => ({ title: m.title, value: m.value, subtitle: m.subtitle })),
  contributions: SEED_CONTRIBS.map((c) => ({
    title: c.title,
    category: c.category,
    impact: c.impact,
  })),
  skills: {
    Outcomes: skills.outcomes,
    Skills: skills.skills,
    Behaviors: skills.behaviors,
    Leadership: skills.leadership,
    'Client Success': skills.clientSuccess,
  },
};

// Last known YourLearning values (real transcript pulled via the proxy). Shown
// immediately and used as a fallback if the live fetch fails / token expires.
const FALLBACK_LEARNING: LearningSummary = {
  learnerName: 'IBM Learner',
  learnerEmail: '',
  think40Level: 1,
  completionHoursThisYear: 62.6,
  completionHoursLastYear: 85.3,
  completions: 832,
  queue: 165,
  totalRecords: 1355,
  badgesTotal: 54,
  badgesThisYear: 4,
  credentialsCompleted: 24,
  recordYears: [2027, 2026, 2025, 2024, 2023, 2022, 2021],
};

// Last known MyScore values (real business scorecard pulled via the proxy).
// Shown immediately and used as a fallback if the session cookie expires.
const FALLBACK_MYSCORE: MyScoreData = {
  historical: [
    { group: 'Chargeable', date: '3Q 2025', value: 96.9 },
    { group: 'Chargeable', date: '4Q 2025', value: 94.4 },
    { group: 'Chargeable', date: '1Q 2026', value: 96.9 },
    { group: 'Chargeable', date: '2Q 2026', value: 109.0 },
    { group: 'Chargeable', date: '3Q 2026', value: 86.30 },
    { group: 'Goal', date: '3Q 2025', value: 96.70 },
    { group: 'Goal', date: '4Q 2025', value: 96.70 },
    { group: 'Goal', date: '1Q 2026', value: 96.73 },
    { group: 'Goal', date: '2Q 2026', value: 96.73 },
    { group: 'Goal', date: '3Q 2026', value: 96.73 },
    { group: 'Attainment', date: 'Prior 4 Quarters', value: 102.6 },
    { group: 'Attainment', date: 'Current Rolling 4 Quarters', value: 99.9 },
  ],
  band: 'Band 7',
  chargeableRolling: 98.3,
  chargeablePrior: 99.3,
  chargeableGoal: 96.73,
  attainmentRolling: 99.9,
  attainmentPrior: 102.6,
  expectations: [
    { name: 'JRS Proficiency', status: 'Met' },
    { name: 'Skills Proficiency', status: 'Met' },
    { name: 'Annual IBM Core Training', status: 'Met' },
  ],
};

type ContentTab = 'overview' | 'contributions' | 'recognition' | 'opps';

const EmployeeDashboard: React.FC = () => {
  const [aiSummary, setAiSummary] = useState<string>(FALLBACK_SUMMARY);
  const [aiNudge, setAiNudge] = useState<string>(FALLBACK_NUDGE);
  const [contentTab, setContentTab] = useState<ContentTab>('overview');
  const [reportOpen, setReportOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [myContribs, setMyContribs] = useState<Contribution[]>(SEED_CONTRIBS);
  const [learning, setLearning] = useState<LearningSummary>(FALLBACK_LEARNING);
  const [learningLive, setLearningLive] = useState(false);
  const [myScore, setMyScore] = useState<MyScoreData>(FALLBACK_MYSCORE);
  const [myScoreLive, setMyScoreLive] = useState(false);
  const [biwActivities, setBiwActivities] = useState<BiWActivity[]>(BIW_SAMPLE);
  const [biwLoading, setBiwLoading] = useState(false);

  const logContribution = (c: Contribution) => {
    setMyContribs((prev) => [c, ...prev]);
    setLogOpen(false);
  };

  // Verified contributions pulled from IBM systems of record (YourLearning +
  // MyScore), merged in front of self-logged work so learning and business
  // performance count toward the quarter too.
  const systemContribs = deriveSystemContributions(learning, myScore);
  const quarterContribs = [...systemContribs, ...myContribs];

  // Contributions count and Impact Score are derived from the full quarter list,
  // so both update live when a contribution is logged or the systems refresh.
  const impactScore = computeImpactScore(quarterContribs);
  const displayMetrics = metrics.map((m) =>
    m.id === '1'
      ? { ...m, value: String(quarterContribs.length) }
      : m.id === '3'
      ? { ...m, value: String(impactScore) }
      : m
  );

  // When ICA is enabled (REACT_APP_ICA_ENABLED=true), generate live copy on
  // mount. When it's off, we make NO network calls at all and simply keep the
  // built-in fallback copy — so there's no console noise before ICA is set up.
  useEffect(() => {
    if (!ICA_ENABLED) return;
    let cancelled = false;

    generateMonthlySummary(insightContext)
      .then((text) => {
        if (!cancelled) setAiSummary(text);
      })
      .catch((err) => console.info('[ICA] summary unavailable, using fallback:', err.message));

    generateCareerNudge(insightContext)
      .then((text) => {
        if (!cancelled) setAiNudge(text);
      })
      .catch((err) => console.info('[ICA] nudge unavailable, using fallback:', err.message));

    return () => {
      cancelled = true;
    };
  }, []);

  // Pull the employee's real IBM learning transcript (Think40 hours, badges,
  // credentials) live via the proxy. Falls back to the last known values if the
  // token is missing/expired so the card always renders.
  useEffect(() => {
    if (!YL_ENABLED) return;
    let cancelled = false;
    fetchLearningSummary()
      .then((data) => {
        if (!cancelled) {
          setLearning(data);
          setLearningLive(true);
        }
      })
      .catch((err) =>
        console.info('[YourLearning] live fetch unavailable, using cached values:', err.message)
      );
    return () => {
      cancelled = true;
    };
  }, []);

  // Pull the employee's real IBM MyScore business scorecard (utilization,
  // attainment, Core Performance Expectations) live via the proxy.
  useEffect(() => {
    if (!MYSCORE_ENABLED) return;
    let cancelled = false;
    fetchMyScore()
      .then((data) => {
        if (!cancelled) {
          setMyScore(data);
          setMyScoreLive(true);
        }
      })
      .catch((err) =>
        console.info('[MyScore] live fetch unavailable, using cached values:', err.message)
      );
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch BIW activity-feed (Recognition Received + Points Deposited).
  useEffect(() => {
    let cancelled = false;
    setBiwLoading(true);
    fetchBiWActivities()
      .then((data) => { if (!cancelled) { setBiwActivities(data); setBiwLoading(false); } })
      .catch((err) => {
        console.info('[BIW] activity-feed unavailable, using sample data:', err.message);
        if (!cancelled) setBiwLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  // Recognition ingested from Slack/Outlook, reviewed here and sent on to the
  // manager for approval.
  const {
    inbox,
    approvedContributions,
    syncing,
    sync,
    approveByEmployee,
    markApproved,
    dismiss,
    editItem,
  } = useRecognitionInbox();

  const { submitFromEmployee, approvedInboxIds } = useTeamApprovals();
  const processedApprovals = useRef<Set<string>>(new Set());

  // Employee approves an inbox item -> mark it pending and push it into the
  // manager's approval queue (closes the loop with the Manager view).
  const sendToManager = (id: string) => {
    approveByEmployee(id);
    const item = inbox.find((i) => i.id === id);
    if (item) {
      submitFromEmployee({
        id: `self-${item.id}`,
        inboxId: item.id,
        from: 'Aarav Patel',
        initials: 'AP',
        title: item.title,
        category: item.category,
        impact: item.impact,
        date: item.receivedAt,
        evidence: [
          `${item.source === 'slack' ? 'Slack' : 'Outlook'} · ${item.channel}`,
          `From ${item.from}`,
        ],
        note: item.summary,
        rawMessage: item.rawMessage,
      });
    }
  };

  // When the manager approves one of our items, reflect it back to "verified".
  useEffect(() => {
    approvedInboxIds.forEach((id) => {
      if (!processedApprovals.current.has(id)) {
        processedApprovals.current.add(id);
        markApproved(id);
      }
    });
  }, [approvedInboxIds, markApproved]);

  // Manager-approved recognition shows alongside the employee's contributions,
  // newest first.
  const allContributions = [...approvedContributions, ...quarterContribs];

  return (
    <div className="employee-dashboard">
      {/* Header band */}
      <header className="page-header">
        <div className="page-header__inner">
          <p className="page-header__label">Employee Experience</p>
          <h1 className="page-header__title">Good morning, Aarav 👋</h1>
          <p className="page-header__subtitle">
            You're in the top 12% of designers this quarter — your Q3 momentum is strong. Keep it up!
          </p>
        </div>
      </header>

      <div className="page-body">
      {/* AI Summary */}
      <Theme theme="g100">
        <Tile className="employee-dashboard__ai-summary">
          <div className="ai-summary__content">
            <div className="ai-summary__icon">
              <Light size={16} />
            </div>
            <div className="ai-summary__text">
              <p className="ai-summary__title">Monthly Summary — {EMPLOYEE.month}</p>
              <p className="ai-summary__description">{aiSummary}</p>
            </div>
          </div>
          <Button kind="tertiary" size="sm" onClick={() => setReportOpen(true)}>
            View Full Report →
          </Button>
        </Tile>
      </Theme>

      {/* Metrics Grid */}
      <div className="employee-dashboard__metrics">
        {displayMetrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="gtabs">
        <button
          className={`gtabs__btn ${contentTab === 'overview' ? 'active' : ''}`}
          onClick={() => setContentTab('overview')}
        >
          Overview
        </button>
        <button
          className={`gtabs__btn ${contentTab === 'contributions' ? 'active' : ''}`}
          onClick={() => setContentTab('contributions')}
        >
          My Contributions
        </button>
        <button
          className={`gtabs__btn ${contentTab === 'recognition' ? 'active' : ''}`}
          onClick={() => setContentTab('recognition')}
        >
          Recognition & Badges
        </button>
        <button
          className={`gtabs__btn ${contentTab === 'opps' ? 'active' : ''}`}
          onClick={() => setContentTab('opps')}
        >
          Growth Opportunities
        </button>
      </div>

      {contentTab === 'overview' && (
        /* Main Content — two aligned columns */
        <div className="employee-dashboard__content">
          {/* Left column: trend + inbox + contributions */}
          <div className="employee-dashboard__col">
            <Tile className="dashboard-card">
              <ContributionChart data={chartData} />
            </Tile>
            <Tile className="dashboard-card">
              <PendingContributions
                items={inbox}
                syncing={syncing}
                onSync={sync}
                onLogContribution={() => setLogOpen(true)}
                onApprove={sendToManager}
                onDismiss={dismiss}
                onEdit={editItem}
              />
            </Tile>
            <Tile className="dashboard-card">
              <ContributionList contributions={allContributions} />
            </Tile>
          </div>

          {/* Right column: learning + skills + nudge + recognition */}
          <div className="employee-dashboard__col">
            <Tile className="dashboard-card">
              <LearningCard data={learning} live={learningLive} />
            </Tile>

            <Tile className="dashboard-card">
              <MyScoreCard data={myScore} live={myScoreLive} />
            </Tile>

            <Tile className="dashboard-card">
              <SkillRadar skills={skills} />
            </Tile>

            <Tile className="career-nudge">
              <Light size={20} className="career-nudge__icon" />
              <div>
                <p className="career-nudge__title">Career Nudge</p>
                <p className="career-nudge__message">{aiNudge}</p>
              </div>
            </Tile>

            <Tile className="dashboard-card">
              <RecognitionCard activities={biwActivities} loading={biwLoading} />
            </Tile>
          </div>
        </div>
      )}

      {contentTab === 'contributions' && (
        <MyContributions
          contributions={quarterContribs}
          quarterCount={quarterContribs.length}
          onOpenLog={() => setLogOpen(true)}
        />
      )}

      {contentTab === 'recognition' && (
        <RecognitionBadges activities={biwActivities} activitiesLoading={biwLoading} />
      )}

      {contentTab === 'opps' && (
        <Tile className="dashboard-card">
          <EmployeeOpportunities employeeName="Aarav Patel" />
        </Tile>
      )}
      </div>

      <LogContributionModal
        open={logOpen}
        onClose={() => setLogOpen(false)}
        onSubmit={logContribution}
      />

      <Modal
        open={reportOpen}
        passiveModal
        modalLabel="Growth Report"
        modalHeading={`Monthly Growth Report — ${EMPLOYEE.month}`}
        onRequestClose={() => setReportOpen(false)}
        className="report-modal"
      >
        <EmployeeReport
          name={EMPLOYEE.name}
          month={EMPLOYEE.month}
          summary={aiSummary}
          contribCount={quarterContribs.length}
          impactScore={impactScore}
          peer="Top 12%"
          readiness="74%"
          chartData={chartData}
          skills={skills}
          contributions={quarterContribs}
          myScore={myScore}
          recognitions={biwActivities}
        />
      </Modal>
    </div>
  );
};

export default EmployeeDashboard;

// Made with Bob
