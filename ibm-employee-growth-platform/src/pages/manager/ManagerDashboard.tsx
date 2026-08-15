import React, { useState } from 'react';
import * as Recharts from 'recharts';
import {
  Tile,
  Tag,
  Button,
  Theme,
  Modal,
  Dropdown,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
} from '@carbon/react';
import {
  Light,
  Document,
  View,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  CheckmarkFilled,
  ArrowRight,
} from '@carbon/icons-react';
import MetricCard from '../../components/shared/MetricCard';
import { MetricCard as MetricCardType } from '../../types';
import { useTeamApprovals } from '../../context/TeamApprovals';
import { ManagerOpportunities } from '../../components/shared/GrowthOpps';
import {
  ReviewKitReport,
  PrepKitReport,
  EvidenceReport,
  EvidenceContrib,
} from '../../components/shared/ReportViews';
import { Checkmark as CheckIcon, Close as CloseIcon } from '@carbon/icons-react';
import './ManagerDashboard.scss';

const { BarChart, Bar, XAxis, YAxis, Legend, Tooltip, ResponsiveContainer } =
  Recharts as any;

type ManagerTab = 'overview' | 'contribs' | 'reviews' | 'opps';

const dimColor = (d: string) => {
  switch (d) {
    case 'Outcomes':
      return 'blue';
    case 'Skills':
      return 'purple';
    case 'Behaviors':
      return 'teal';
    case 'Leadership':
      return 'green';
    case 'Client Success':
      return 'cyan';
    default:
      return 'gray';
  }
};

type Status = 'Promotion Ready' | 'On Track' | 'Needs Attention';

interface Member {
  id: string;
  name: string;
  initials: string;
  band: string;
  role: string;
  contributions: number;
  impact: number;
  promo: number;
  status: Status;
  checkinOverdue?: boolean;
  summary: string;
  recent: string;
  recentAgo: string;
}

const TEAM: Member[] = [
  {
    id: 'priya',
    name: 'Priya Sharma',
    initials: 'PS',
    band: 'Band 7',
    role: 'Senior Designer',
    contributions: 18,
    impact: 891,
    promo: 82,
    status: 'Promotion Ready',
    summary:
      'Exceptional quarter. Led 3 high-impact client deliveries with consistent senior scope. Promotion criteria met in 4 of 5 dimensions.',
    recent: 'Shipped the checkout redesign — +28% conversion',
    recentAgo: '2d ago',
  },
  {
    id: 'rohan',
    name: 'Rohan Gupta',
    initials: 'RG',
    band: 'Band 8',
    role: 'Lead Designer',
    contributions: 20,
    impact: 942,
    promo: 91,
    status: 'Promotion Ready',
    summary:
      'Top performer this quarter. Operating at Band 9 scope with design leadership across 2 squads. Recommend advancing the promotion discussion.',
    recent: 'Led the quarterly design review across 3 squads',
    recentAgo: 'Today',
  },
  {
    id: 'aditya',
    name: 'Aditya Rao',
    initials: 'AR',
    band: 'Band 7',
    role: 'Senior Designer',
    contributions: 16,
    impact: 863,
    promo: 84,
    status: 'Promotion Ready',
    summary:
      'Strong, consistent delivery with growing studio influence. Meets the Band 8 bar on Outcomes and Skills.',
    recent: 'Published a point-of-view on scalable design tokens',
    recentAgo: '4d ago',
  },
  {
    id: 'ananya',
    name: 'Ananya Krishnan',
    initials: 'AK',
    band: 'Band 7',
    role: 'Senior Designer',
    contributions: 14,
    impact: 778,
    promo: 71,
    status: 'On Track',
    summary:
      'Strong Behaviors and Leadership signals. A cross-team initiative would accelerate her toward Band 8.',
    recent: 'Ran a design-system workshop for Q3 planning',
    recentAgo: '3d ago',
  },
  {
    id: 'vikram',
    name: 'Vikram Nair',
    initials: 'VN',
    band: 'Band 7',
    role: 'Senior Designer',
    contributions: 15,
    impact: 802,
    promo: 68,
    status: 'On Track',
    summary:
      'Reliable delivery on the banking client. Deepen Leadership by owning an end-to-end initiative next quarter.',
    recent: 'Delivered the onboarding revamp for the banking client',
    recentAgo: '5d ago',
  },
  {
    id: 'kavya',
    name: 'Kavya Reddy',
    initials: 'KR',
    band: 'Band 6',
    role: 'Designer',
    contributions: 12,
    impact: 690,
    promo: 61,
    status: 'On Track',
    summary:
      'Growing quickly in craft and design systems. On a healthy trajectory toward Band 7.',
    recent: 'Built the component library for billing flows',
    recentAgo: '6d ago',
  },
  {
    id: 'arjun',
    name: 'Arjun Mehta',
    initials: 'AM',
    band: 'Band 6',
    role: 'Designer',
    contributions: 14,
    impact: 618,
    promo: 54,
    status: 'Needs Attention',
    checkinOverdue: true,
    summary:
      'Contribution pace has slipped 28% this quarter — only 4 logged since April vs 10 in Q1. Last check-in was 6 weeks ago. Strongest in Skills and Outcomes; Leadership and Behaviors are below Band 6 bar. No critical-impact item this half. Recommend a 1:1 to reset goals and agree on a visible ownership opportunity before end of FY.',
    recent: 'Mentored 2 new hires through onboarding',
    recentAgo: '1w ago',
  },
  {
    id: 'sneha',
    name: 'Sneha Iyer',
    initials: 'SI',
    band: 'Band 8',
    role: 'Lead Designer',
    contributions: 11,
    impact: 692,
    promo: 58,
    status: 'Needs Attention',
    checkinOverdue: true,
    summary:
      'Returned from 14-week parental leave in May; ramp-up is slower than expected. Only 3 contributions logged since return — all medium or low impact. Leadership dimension is significantly below Band 8 expectations (score: 48). Client Success score has dipped from 71 to 62 due to missed stakeholder touchpoints. A realignment 1:1 is overdue. Suggest co-creating a 30-day plan to regain Band 8 leadership visibility.',
    recent: 'Scoped the design vision for the payments platform',
    recentAgo: '2w ago',
  },
];

interface ActionItem {
  text: string;
  cta: string;
}
const ACTION_ITEMS: ActionItem[] = [
  { text: 'Check-in with Arjun Mehta — pace has dropped 28%', cta: 'Schedule 1:1' },
  { text: 'Send recognition to Rohan Gupta for his design-system work', cta: 'Recognize' },
  { text: 'Aditya Rao is ready for promo — start documentation', cta: 'Begin Review' },
  { text: 'Assign Ananya Krishnan a cross-team initiative to close her Leadership gap', cta: 'Assign' },
];

const CONTRIB_BY_MEMBER = [
  { name: 'Priya', Outcomes: 5, Skills: 4, Behaviors: 3, Leadership: 2, 'Client Success': 4 },
  { name: 'Rohan', Outcomes: 5, Skills: 6, Behaviors: 3, Leadership: 4, 'Client Success': 2 },
  { name: 'Aditya', Outcomes: 5, Skills: 4, Behaviors: 3, Leadership: 2, 'Client Success': 2 },
  { name: 'Ananya', Outcomes: 3, Skills: 3, Behaviors: 3, Leadership: 3, 'Client Success': 2 },
  { name: 'Vikram', Outcomes: 4, Skills: 3, Behaviors: 3, Leadership: 2, 'Client Success': 3 },
  { name: 'Kavya', Outcomes: 3, Skills: 3, Behaviors: 2, Leadership: 2, 'Client Success': 2 },
  { name: 'Arjun', Outcomes: 4, Skills: 4, Behaviors: 2, Leadership: 2, 'Client Success': 2 },
  { name: 'Sneha', Outcomes: 3, Skills: 2, Behaviors: 2, Leadership: 2, 'Client Success': 2 },
];
// Distinct Carbon data-viz categorical palette for the stacked bars.
const DIM_SERIES = [
  { key: 'Outcomes',       color: '#3b7ef8' },
  { key: 'Skills',         color: '#7c3aed' },
  { key: 'Behaviors',      color: '#2d6e6e' },
  { key: 'Leadership',     color: '#e85555' },
  { key: 'Client Success', color: '#f5923e' },
];

interface FeedItem {
  id: string;
  initials: string;
  name: string;
  activity: string;
  category: string;
  impact: string;
  date: string;
  verified: boolean;
}
const FEED: FeedItem[] = [
  { id: 'f1', initials: 'RG', name: 'Rohan Gupta', activity: 'Led the quarterly design review across 3 squads', category: 'Leadership', impact: 'Critical Impact', date: 'Today, 9:14 AM', verified: true },
  { id: 'f2', initials: 'AK', name: 'Ananya Krishnan', activity: 'Ran a design-system workshop for Q3 planning (24 attendees)', category: 'Behaviors', impact: 'High Impact', date: 'Yesterday, 3:30 PM', verified: true },
  { id: 'f3', initials: 'PS', name: 'Priya Sharma', activity: 'Shipped the checkout redesign — +28% conversion', category: 'Outcomes', impact: 'Critical Impact', date: 'Jun 29, 2026', verified: true },
  { id: 'f4', initials: 'AR', name: 'Aditya Rao', activity: 'Published a point-of-view on scalable design tokens', category: 'Skills', impact: 'High Impact', date: 'Jun 28, 2026', verified: true },
  { id: 'f5', initials: 'VN', name: 'Vikram Nair', activity: 'Delivered the onboarding revamp for the banking client', category: 'Outcomes', impact: 'High Impact', date: 'Jun 27, 2026', verified: true },
  { id: 'f6', initials: 'KR', name: 'Kavya Reddy', activity: 'Built the component library for billing flows', category: 'Skills', impact: 'Medium Impact', date: 'Jun 26, 2026', verified: false },
  { id: 'f7', initials: 'AM', name: 'Arjun Mehta', activity: 'Mentored 2 new hires through onboarding', category: 'Leadership', impact: 'Medium Impact', date: 'Jun 25, 2026', verified: true },
];

const DIMENSIONS = ['Outcomes', 'Skills', 'Behaviors', 'Leadership', 'Client Success'] as const;
interface MatrixRow {
  initials: string;
  name: string;
  band: string;
  scores: Record<string, number>;
  overall: number;
  ready: boolean;
}
const MATRIX: MatrixRow[] = [
  { initials: 'PS', name: 'Priya', band: 'Band 7', scores: { Outcomes: 91, Skills: 85, Behaviors: 82, Leadership: 74, 'Client Success': 86 }, overall: 82, ready: true },
  { initials: 'RG', name: 'Rohan', band: 'Band 8', scores: { Outcomes: 88, Skills: 95, Behaviors: 87, Leadership: 92, 'Client Success': 90 }, overall: 91, ready: true },
  { initials: 'AR', name: 'Aditya', band: 'Band 7', scores: { Outcomes: 88, Skills: 86, Behaviors: 79, Leadership: 70, 'Client Success': 85 }, overall: 84, ready: true },
  { initials: 'AK', name: 'Ananya', band: 'Band 7', scores: { Outcomes: 69, Skills: 72, Behaviors: 81, Leadership: 88, 'Client Success': 74 }, overall: 71, ready: false },
  { initials: 'VN', name: 'Vikram', band: 'Band 7', scores: { Outcomes: 74, Skills: 70, Behaviors: 72, Leadership: 61, 'Client Success': 76 }, overall: 68, ready: false },
  { initials: 'KR', name: 'Kavya', band: 'Band 6', scores: { Outcomes: 63, Skills: 66, Behaviors: 60, Leadership: 52, 'Client Success': 64 }, overall: 61, ready: false },
  { initials: 'AM', name: 'Arjun', band: 'Band 6', scores: { Outcomes: 58, Skills: 62, Behaviors: 55, Leadership: 44, 'Client Success': 56 }, overall: 54, ready: false },
  { initials: 'SI', name: 'Sneha', band: 'Band 8', scores: { Outcomes: 66, Skills: 72, Behaviors: 60, Leadership: 48, 'Client Success': 62 }, overall: 58, ready: false },
];

const scoreClass = (v: number) => (v >= 80 ? 'score--high' : v >= 60 ? 'score--mid' : 'score--low');

const PREP_KITS = [
  {
    name: 'Priya Sharma',
    text: 'Exceptional quarter. Led 3 high-impact client deliveries with consistent senior scope. Promotion criteria met in 4 of 5 dimensions.',
  },
  {
    name: 'Rohan Gupta',
    text: 'Top performer this quarter. Consistently operating at Band 9 scope. Design leadership across 2 squads is well-documented. Recommend advancing promotion discussion.',
  },
  {
    name: 'Aditya Rao',
    text: 'Strong, consistent delivery with growing studio influence. Meets the Band 8 bar on Outcomes and Skills; document Leadership evidence to complete the case.',
  },
];

// Evidence trail backing a promotion case (demo, dimension-tagged).
const EVIDENCE_ITEMS = [
  { dim: 'Outcomes', text: 'Led the retail checkout redesign — +28% conversion' },
  { dim: 'Skills', text: 'Shipped 40+ design-system components + a reusable POV' },
  { dim: 'Behaviors', text: 'Ran a design-system workshop for Q3 planning (24 attendees)' },
  { dim: 'Leadership', text: 'Led the quarterly design review across 3 squads' },
  { dim: 'Client Success', text: 'Grew client NPS to 72 and secured a follow-on engagement' },
];

// PREP_KITS use full names; MATRIX rows use first names — match on the first name.
const matrixFor = (fullName: string) =>
  MATRIX.find((r) => r.name === fullName.split(' ')[0]);

// ── Year-long contribution records per DR ──────────────────────────────────

export interface ContribAttachment {
  name: string;
  type: 'image' | 'pdf';
  /** A placeholder colour used to render a mock preview when no real file URL exists */
  color: string;
}

export interface MemberContrib {
  id: string;
  memberId: string;
  title: string;
  category: 'Outcomes' | 'Skills' | 'Behaviors' | 'Leadership' | 'Client Success';
  impact: 'Low Impact' | 'Medium Impact' | 'High Impact' | 'Critical Impact';
  date: string;       // "MMM D, YYYY"
  month: string;      // "Jan" … "Dec"  (for the yearly chart)
  verified: boolean;
  description?: string;
  originalMessage?: string;
  evidence?: string[];
  attachments?: ContribAttachment[];
}

const MEMBER_CONTRIBS: MemberContrib[] = [
  // ── Priya Sharma ──
  { id: 'pc1',  memberId: 'priya',  title: 'Led retail checkout redesign — +28% conversion lift', category: 'Outcomes',       impact: 'Critical Impact', date: 'Jun 28, 2026', month: 'Jun', verified: true,
    description: 'End-to-end redesign of the RetailCo checkout funnel across web and mobile. Reduced drop-off by 28% and cut average checkout time from 4.2 min to 2.6 min. Collaborated with engineering, product, and analytics over 6 weeks.',
    originalMessage: 'Hi James — wanted to log this one formally. We shipped the checkout redesign on Jun 27. Analytics confirmed +28% conversion vs the previous 30-day baseline. The PM (Kavita) also confirmed reduced support tickets by ~18%. Figma file and A/B test report are attached.',
    evidence: ['Figma prototype v3', 'A/B test report (Jun 27)', 'PM sign-off email', 'RetailCo NPS survey'],
    attachments: [
      { name: 'checkout-redesign-v3.png', type: 'image', color: '#d0e2ff' },
      { name: 'ab-test-report.pdf',       type: 'pdf',   color: '#e8daff' },
    ],
  },
  { id: 'pc2',  memberId: 'priya',  title: 'Shipped 40+ design-system components + CoP POV',       category: 'Skills',         impact: 'High Impact',    date: 'Jun 22, 2026', month: 'Jun', verified: true,
    description: 'Authored and shipped 40 production-ready components to the shared Carbon-based design system, including a reusable point-of-view document on token architecture for the IBM iX Community of Practice.',
    originalMessage: 'Logging the design system milestone — 40 components merged into the shared library this quarter. Also published the CoP PoV on token architecture; it got 120 internal reads in the first week. Figma component kit and PoV PDF attached.',
    evidence: ['Figma component kit (Jun 22)', 'CoP PoV document', 'GitHub PR #847'],
    attachments: [
      { name: 'component-kit-preview.png', type: 'image', color: '#9ef0f0' },
      { name: 'token-architecture-pov.pdf', type: 'pdf',  color: '#e8daff' },
    ],
  },
  { id: 'pc3',  memberId: 'priya',  title: 'Led C-suite discovery & co-creation workshop',          category: 'Leadership',     impact: 'High Impact',    date: 'Jun 15, 2026', month: 'Jun', verified: true,
    description: 'Designed and facilitated a full-day discovery and co-creation session with the RetailCo CTO, CMO, and 4 senior PMs. Output: a prioritised opportunity canvas that became the Q3 roadmap foundation.',
    originalMessage: 'The C-suite workshop went really well. 8 attendees including CTO and CMO. We produced a fully prioritised opportunity canvas — the client team called it "the most productive day they had in 2026." Photos and workshop output deck are attached.',
    evidence: ['Workshop agenda & canvas', 'Client testimonial email', 'Opportunity canvas PDF'],
    attachments: [
      { name: 'workshop-canvas.jpg',     type: 'image', color: '#defbe6' },
      { name: 'opportunity-canvas.pdf',  type: 'pdf',   color: '#ffd9be' },
    ],
  },
  { id: 'pc4',  memberId: 'priya',  title: 'Grew RetailCo NPS to 72, secured follow-on SOW',        category: 'Client Success', impact: 'High Impact',    date: 'Jun 12, 2026', month: 'Jun', verified: true,
    description: 'NPS improved from 58 to 72 over the engagement. Used the score improvement as a basis to negotiate and close a follow-on statement of work worth $480K for Q3–Q4.',
    originalMessage: 'Just heard from the RetailCo account team — NPS hit 72 (was 58 at the start of the engagement). The sales lead used our design deliverables in the renewal deck and we signed the follow-on SOW yesterday. Attaching the NPS trend chart and SOW summary.',
    evidence: ['NPS trend report (Q1–Q3)', 'SOW summary (signed)', 'Account team email'],
    attachments: [
      { name: 'nps-trend-chart.png',  type: 'image', color: '#ffd6e8' },
      { name: 'sow-summary.pdf',      type: 'pdf',   color: '#e8daff' },
    ],
  },
  { id: 'pc5',  memberId: 'priya',  title: 'Represented studio at IBM Design Week',                 category: 'Behaviors',      impact: 'Medium Impact',  date: 'Jun 10, 2026', month: 'Jun', verified: false,
    description: 'Presented the retail checkout case study at IBM Design Week (Austin). 120 attendees. Shared learnings on co-creation at scale and accessibility-first delivery.',
    originalMessage: 'Just back from Design Week — presented our checkout case study to ~120 people. Great engagement. Slides and speaker notes are attached. Still waiting on the official event recording link; will update once live.',
    evidence: ['Presentation slides (Design Week)', 'Speaker notes PDF'],
    attachments: [
      { name: 'design-week-slides.png', type: 'image', color: '#ffd9be' },
    ],
  },
  { id: 'pc6',  memberId: 'priya',  title: 'Banking onboarding revamp shipped on schedule',         category: 'Outcomes',       impact: 'High Impact',    date: 'May 28, 2026', month: 'May', verified: true,
    description: 'Delivered the end-to-end onboarding redesign for the banking client 2 days ahead of the contractual deadline. Reduced onboarding completion time by 34% in UAT.',
    originalMessage: 'Shipping the banking onboarding revamp — shipped 2 days early. UAT showed 34% faster completion. Dev handoff deck and UAT report are attached.',
    evidence: ['UAT completion report', 'Dev handoff deck', 'PM acceptance email'],
    attachments: [
      { name: 'onboarding-flow-final.png', type: 'image', color: '#d0e2ff' },
      { name: 'uat-report.pdf',            type: 'pdf',   color: '#9ef0f0' },
    ],
  },
  { id: 'pc7',  memberId: 'priya',  title: 'Improved accessibility to WCAG AA on banking prototype',category: 'Skills',         impact: 'Medium Impact',  date: 'May 18, 2026', month: 'May', verified: true },
  { id: 'pc8',  memberId: 'priya',  title: 'Client feedback workshop — 4.8/5 satisfaction',         category: 'Client Success', impact: 'Medium Impact',  date: 'May 10, 2026', month: 'May', verified: true },
  { id: 'pc9',  memberId: 'priya',  title: 'Mentored 2 junior designers through first client sprint',category: 'Leadership',     impact: 'Medium Impact',  date: 'Apr 24, 2026', month: 'Apr', verified: true },
  { id: 'pc10', memberId: 'priya',  title: 'Redesigned analytics dashboard for FinCo',              category: 'Outcomes',       impact: 'High Impact',    date: 'Apr 15, 2026', month: 'Apr', verified: true },
  { id: 'pc11', memberId: 'priya',  title: 'Authored motion & interaction guidelines',              category: 'Skills',         impact: 'High Impact',    date: 'Mar 28, 2026', month: 'Mar', verified: true },
  { id: 'pc12', memberId: 'priya',  title: 'Organised studio design-crit series (8 sessions)',      category: 'Behaviors',      impact: 'Low Impact',     date: 'Mar 10, 2026', month: 'Mar', verified: true },
  { id: 'pc13', memberId: 'priya',  title: 'Renewed FinCo engagement for Q2',                      category: 'Client Success', impact: 'High Impact',    date: 'Feb 20, 2026', month: 'Feb', verified: true },
  { id: 'pc14', memberId: 'priya',  title: 'A/B test on pricing page — 12% lift',                  category: 'Outcomes',       impact: 'Medium Impact',  date: 'Feb 5, 2026',  month: 'Feb', verified: true },
  { id: 'pc15', memberId: 'priya',  title: 'Completed Enterprise Design Thinking Practitioner',     category: 'Skills',         impact: 'Medium Impact',  date: 'Jan 18, 2026', month: 'Jan', verified: true },
  { id: 'pc16', memberId: 'priya',  title: 'Cross-studio collaboration on accessibility standards', category: 'Behaviors',      impact: 'Medium Impact',  date: 'Jan 8, 2026',  month: 'Jan', verified: true },
  { id: 'pc17', memberId: 'priya',  title: 'Led Q1 design sprint with telecom client',              category: 'Outcomes',       impact: 'High Impact',    date: 'Jan 25, 2026', month: 'Jan', verified: true },
  { id: 'pc18', memberId: 'priya',  title: 'Published reusable workshop facilitation playbook',    category: 'Behaviors',      impact: 'Medium Impact',  date: 'Apr 5, 2026',  month: 'Apr', verified: true },
  // ── Rohan Gupta ──
  { id: 'rc1',  memberId: 'rohan',  title: 'Led quarterly design review across 3 squads',           category: 'Leadership',     impact: 'Critical Impact', date: 'Jul 1, 2026',  month: 'Jul', verified: true },
  { id: 'rc2',  memberId: 'rohan',  title: 'Scaled design system to 120+ tokens',                   category: 'Skills',         impact: 'Critical Impact', date: 'Jun 25, 2026', month: 'Jun', verified: true },
  { id: 'rc3',  memberId: 'rohan',  title: 'Shipped insurance portal — NPS +14 pts',                category: 'Outcomes',       impact: 'High Impact',    date: 'Jun 18, 2026', month: 'Jun', verified: true },
  { id: 'rc4',  memberId: 'rohan',  title: 'Co-authored IBM iX design principles white paper',      category: 'Behaviors',      impact: 'High Impact',    date: 'Jun 10, 2026', month: 'Jun', verified: true },
  { id: 'rc5',  memberId: 'rohan',  title: 'Won new healthcare client through design showcase',      category: 'Client Success', impact: 'Critical Impact', date: 'May 30, 2026', month: 'May', verified: true },
  { id: 'rc6',  memberId: 'rohan',  title: 'Ran band-8 readiness workshop for the squad',           category: 'Leadership',     impact: 'High Impact',    date: 'May 20, 2026', month: 'May', verified: true },
  { id: 'rc7',  memberId: 'rohan',  title: 'Delivered accessibility audit for 3 client products',   category: 'Skills',         impact: 'High Impact',    date: 'May 8, 2026',  month: 'May', verified: true },
  { id: 'rc8',  memberId: 'rohan',  title: 'Secured client expansion via design roadmap',           category: 'Client Success', impact: 'High Impact',    date: 'Apr 22, 2026', month: 'Apr', verified: true },
  { id: 'rc9',  memberId: 'rohan',  title: 'Led AI experience strategy workshop',                   category: 'Outcomes',       impact: 'High Impact',    date: 'Apr 10, 2026', month: 'Apr', verified: true },
  { id: 'rc10', memberId: 'rohan',  title: 'Mentored 3 band-6 designers on system thinking',        category: 'Leadership',     impact: 'Medium Impact',  date: 'Mar 25, 2026', month: 'Mar', verified: true },
  { id: 'rc11', memberId: 'rohan',  title: 'Built reusable research ops framework',                 category: 'Behaviors',      impact: 'High Impact',    date: 'Mar 12, 2026', month: 'Mar', verified: true },
  { id: 'rc12', memberId: 'rohan',  title: 'Designed fintech dashboard — 31% task-completion lift', category: 'Outcomes',       impact: 'High Impact',    date: 'Feb 28, 2026', month: 'Feb', verified: true },
  { id: 'rc13', memberId: 'rohan',  title: 'Presented at external UX conference (300 attendees)',   category: 'Behaviors',      impact: 'High Impact',    date: 'Feb 14, 2026', month: 'Feb', verified: true },
  { id: 'rc14', memberId: 'rohan',  title: 'Documented cross-org design governance model',          category: 'Leadership',     impact: 'Medium Impact',  date: 'Jan 30, 2026', month: 'Jan', verified: true },
  { id: 'rc15', memberId: 'rohan',  title: 'Ran Design Sprint 2.0 with logistics client',           category: 'Outcomes',       impact: 'High Impact',    date: 'Jan 15, 2026', month: 'Jan', verified: true },
  { id: 'rc16', memberId: 'rohan',  title: 'Established team design-review cadence',                category: 'Behaviors',      impact: 'Medium Impact',  date: 'Jan 5, 2026',  month: 'Jan', verified: true },
  { id: 'rc17', memberId: 'rohan',  title: 'Contributed to IBM Design Language evolution',          category: 'Skills',         impact: 'High Impact',    date: 'Jun 2, 2026',  month: 'Jun', verified: true },
  { id: 'rc18', memberId: 'rohan',  title: 'Led co-creation jam with partner ecosystem',            category: 'Client Success', impact: 'High Impact',    date: 'Apr 2, 2026',  month: 'Apr', verified: true },
  { id: 'rc19', memberId: 'rohan',  title: 'Shipped design-ops tooling for 4 squads',              category: 'Skills',         impact: 'Medium Impact',  date: 'Mar 3, 2026',  month: 'Mar', verified: true },
  { id: 'rc20', memberId: 'rohan',  title: 'Produced Q1 design quality retrospective',             category: 'Behaviors',      impact: 'Medium Impact',  date: 'Feb 5, 2026',  month: 'Feb', verified: true },
  // ── Aditya Rao ──
  { id: 'ac1',  memberId: 'aditya', title: 'Published PoV on scalable design tokens',              category: 'Skills',         impact: 'High Impact',    date: 'Jun 28, 2026', month: 'Jun', verified: true },
  { id: 'ac2',  memberId: 'aditya', title: 'Led UX strategy for government portal',                category: 'Outcomes',       impact: 'High Impact',    date: 'Jun 20, 2026', month: 'Jun', verified: true },
  { id: 'ac3',  memberId: 'aditya', title: 'Delivered e-commerce redesign — +19% checkout lift',   category: 'Outcomes',       impact: 'High Impact',    date: 'May 25, 2026', month: 'May', verified: true },
  { id: 'ac4',  memberId: 'aditya', title: 'Co-facilitated studio band-readiness retrospective',   category: 'Leadership',     impact: 'Medium Impact',  date: 'May 12, 2026', month: 'May', verified: true },
  { id: 'ac5',  memberId: 'aditya', title: 'Built scalable icon system for enterprise client',     category: 'Skills',         impact: 'Medium Impact',  date: 'Apr 28, 2026', month: 'Apr', verified: true },
  { id: 'ac6',  memberId: 'aditya', title: 'Led DesignOps process improvement initiative',         category: 'Behaviors',      impact: 'Medium Impact',  date: 'Apr 10, 2026', month: 'Apr', verified: true },
  { id: 'ac7',  memberId: 'aditya', title: 'Grew telecom client relationship to $2M SOW',          category: 'Client Success', impact: 'High Impact',    date: 'Mar 28, 2026', month: 'Mar', verified: true },
  { id: 'ac8',  memberId: 'aditya', title: 'Shipped responsive accessibility overhaul',            category: 'Skills',         impact: 'High Impact',    date: 'Mar 15, 2026', month: 'Mar', verified: true },
  { id: 'ac9',  memberId: 'aditya', title: 'Ran 3 research synthesis workshops',                   category: 'Behaviors',      impact: 'Medium Impact',  date: 'Feb 22, 2026', month: 'Feb', verified: true },
  { id: 'ac10', memberId: 'aditya', title: 'Designed data visualisation system for FinCo',         category: 'Outcomes',       impact: 'High Impact',    date: 'Feb 8, 2026',  month: 'Feb', verified: true },
  { id: 'ac11', memberId: 'aditya', title: 'Completed IBM Design Thinking Lead certification',     category: 'Skills',         impact: 'Medium Impact',  date: 'Jan 25, 2026', month: 'Jan', verified: true },
  { id: 'ac12', memberId: 'aditya', title: 'Mentored band-5 designer to first solo delivery',     category: 'Leadership',     impact: 'Medium Impact',  date: 'Jan 12, 2026', month: 'Jan', verified: true },
  { id: 'ac13', memberId: 'aditya', title: 'Led Q1 client discovery sprint for logistics firm',   category: 'Outcomes',       impact: 'High Impact',    date: 'Jan 6, 2026',  month: 'Jan', verified: true },
  { id: 'ac14', memberId: 'aditya', title: 'Built reusable form component library',               category: 'Skills',         impact: 'High Impact',    date: 'Jun 5, 2026',  month: 'Jun', verified: true },
  { id: 'ac15', memberId: 'aditya', title: 'Secured design partnership with client CTO',           category: 'Client Success', impact: 'High Impact',    date: 'May 5, 2026',  month: 'May', verified: true },
  { id: 'ac16', memberId: 'aditya', title: 'Presented design vision at client QBR',               category: 'Client Success', impact: 'Medium Impact',  date: 'Apr 18, 2026', month: 'Apr', verified: true },
  // ── Ananya Krishnan ──
  { id: 'ak1',  memberId: 'ananya', title: 'Ran design-system workshop for Q3 planning (24 attendees)', category: 'Behaviors',  impact: 'High Impact',    date: 'Jun 30, 2026', month: 'Jun', verified: true },
  { id: 'ak2',  memberId: 'ananya', title: 'Led cross-team accessibility initiative',             category: 'Leadership',     impact: 'High Impact',    date: 'Jun 18, 2026', month: 'Jun', verified: true },
  { id: 'ak3',  memberId: 'ananya', title: 'Designed onboarding flow for SaaS client',            category: 'Outcomes',       impact: 'Medium Impact',  date: 'May 30, 2026', month: 'May', verified: true },
  { id: 'ak4',  memberId: 'ananya', title: 'Built interaction pattern library for design system', category: 'Skills',         impact: 'Medium Impact',  date: 'May 15, 2026', month: 'May', verified: true },
  { id: 'ak5',  memberId: 'ananya', title: 'Facilitated 5-day design sprint for FinTech client',  category: 'Outcomes',       impact: 'High Impact',    date: 'Apr 25, 2026', month: 'Apr', verified: true },
  { id: 'ak6',  memberId: 'ananya', title: 'Organised studio-wide reading group (10 sessions)',   category: 'Behaviors',      impact: 'Low Impact',     date: 'Apr 5, 2026',  month: 'Apr', verified: true },
  { id: 'ak7',  memberId: 'ananya', title: 'Created client journey map for insurance portal',     category: 'Client Success', impact: 'Medium Impact',  date: 'Mar 20, 2026', month: 'Mar', verified: true },
  { id: 'ak8',  memberId: 'ananya', title: 'Led usability study with 12 participants',            category: 'Skills',         impact: 'Medium Impact',  date: 'Mar 8, 2026',  month: 'Mar', verified: true },
  { id: 'ak9',  memberId: 'ananya', title: 'Presented at internal design summit',                 category: 'Behaviors',      impact: 'Medium Impact',  date: 'Feb 20, 2026', month: 'Feb', verified: true },
  { id: 'ak10', memberId: 'ananya', title: 'Shipped mobile app redesign for retail client',       category: 'Outcomes',       impact: 'High Impact',    date: 'Feb 6, 2026',  month: 'Feb', verified: true },
  { id: 'ak11', memberId: 'ananya', title: 'Completed Service Design Thinking course',            category: 'Skills',         impact: 'Medium Impact',  date: 'Jan 20, 2026', month: 'Jan', verified: true },
  { id: 'ak12', memberId: 'ananya', title: 'Co-authored team design standards doc',               category: 'Behaviors',      impact: 'Medium Impact',  date: 'Jan 8, 2026',  month: 'Jan', verified: true },
  { id: 'ak13', memberId: 'ananya', title: 'Supported cross-squad research synthesis',            category: 'Leadership',     impact: 'Medium Impact',  date: 'Jun 5, 2026',  month: 'Jun', verified: false },
  { id: 'ak14', memberId: 'ananya', title: 'Delivered NPS improvement plan for logistics client', category: 'Client Success', impact: 'Medium Impact',  date: 'May 5, 2026',  month: 'May', verified: true },
  // ── Vikram Nair ──
  { id: 'vk1',  memberId: 'vikram', title: 'Delivered banking onboarding revamp on schedule',     category: 'Outcomes',       impact: 'High Impact',    date: 'Jun 27, 2026', month: 'Jun', verified: true },
  { id: 'vk2',  memberId: 'vikram', title: 'Built end-to-end prototype for trade-finance client', category: 'Outcomes',       impact: 'High Impact',    date: 'Jun 10, 2026', month: 'Jun', verified: true },
  { id: 'vk3',  memberId: 'vikram', title: 'Led handoff quality improvement sprint',              category: 'Behaviors',      impact: 'Medium Impact',  date: 'May 25, 2026', month: 'May', verified: true },
  { id: 'vk4',  memberId: 'vikram', title: 'Shipped improved error-handling patterns',            category: 'Skills',         impact: 'Medium Impact',  date: 'May 12, 2026', month: 'May', verified: true },
  { id: 'vk5',  memberId: 'vikram', title: 'Retained banking client through design review',       category: 'Client Success', impact: 'High Impact',    date: 'Apr 28, 2026', month: 'Apr', verified: true },
  { id: 'vk6',  memberId: 'vikram', title: 'Ran design-thinking session for junior team',         category: 'Leadership',     impact: 'Medium Impact',  date: 'Apr 15, 2026', month: 'Apr', verified: true },
  { id: 'vk7',  memberId: 'vikram', title: 'Redesigned payment confirmation flow',                category: 'Outcomes',       impact: 'Medium Impact',  date: 'Mar 20, 2026', month: 'Mar', verified: true },
  { id: 'vk8',  memberId: 'vikram', title: 'Documented component usage guidelines',              category: 'Skills',         impact: 'Low Impact',     date: 'Mar 5, 2026',  month: 'Mar', verified: true },
  { id: 'vk9',  memberId: 'vikram', title: 'Completed IBM AI design fundamentals',               category: 'Skills',         impact: 'Medium Impact',  date: 'Feb 18, 2026', month: 'Feb', verified: true },
  { id: 'vk10', memberId: 'vikram', title: 'Shipped invoice dashboard for FinCo',                category: 'Outcomes',       impact: 'High Impact',    date: 'Feb 5, 2026',  month: 'Feb', verified: true },
  { id: 'vk11', memberId: 'vikram', title: 'Presented research insights at client workshop',      category: 'Client Success', impact: 'Medium Impact',  date: 'Jan 22, 2026', month: 'Jan', verified: true },
  { id: 'vk12', memberId: 'vikram', title: 'Co-led Q1 sprint planning for banking squad',        category: 'Leadership',     impact: 'Low Impact',     date: 'Jan 8, 2026',  month: 'Jan', verified: true },
  { id: 'vk13', memberId: 'vikram', title: 'Built responsive table component for data grids',    category: 'Skills',         impact: 'Medium Impact',  date: 'Jun 2, 2026',  month: 'Jun', verified: false },
  { id: 'vk14', memberId: 'vikram', title: 'Improved client NPS score by 8 points',             category: 'Client Success', impact: 'Medium Impact',  date: 'May 2, 2026',  month: 'May', verified: true },
  { id: 'vk15', memberId: 'vikram', title: 'Facilitated cross-squad design-review session',     category: 'Behaviors',      impact: 'Low Impact',     date: 'Apr 5, 2026',  month: 'Apr', verified: true },
  // ── Kavya Reddy ──
  { id: 'kr1',  memberId: 'kavya',  title: 'Built component library for billing flows',          category: 'Skills',         impact: 'Medium Impact',  date: 'Jun 26, 2026', month: 'Jun', verified: false },
  { id: 'kr2',  memberId: 'kavya',  title: 'Designed billing dashboard for SaaS client',        category: 'Outcomes',       impact: 'Medium Impact',  date: 'Jun 12, 2026', month: 'Jun', verified: true },
  { id: 'kr3',  memberId: 'kavya',  title: 'Ran first solo usability study (8 participants)',    category: 'Skills',         impact: 'Medium Impact',  date: 'May 28, 2026', month: 'May', verified: true },
  { id: 'kr4',  memberId: 'kavya',  title: 'Contributed to design system colour tokens',        category: 'Skills',         impact: 'Low Impact',     date: 'May 12, 2026', month: 'May', verified: true },
  { id: 'kr5',  memberId: 'kavya',  title: 'Assisted Priya on checkout prototype',              category: 'Behaviors',      impact: 'Low Impact',     date: 'Apr 28, 2026', month: 'Apr', verified: true },
  { id: 'kr6',  memberId: 'kavya',  title: 'Shipped onboarding screens for logistics app',      category: 'Outcomes',       impact: 'Medium Impact',  date: 'Apr 10, 2026', month: 'Apr', verified: true },
  { id: 'kr7',  memberId: 'kavya',  title: 'Completed Enterprise Design Thinking badge',        category: 'Skills',         impact: 'Low Impact',     date: 'Mar 25, 2026', month: 'Mar', verified: true },
  { id: 'kr8',  memberId: 'kavya',  title: 'Created micro-copy guidelines for error states',    category: 'Behaviors',      impact: 'Low Impact',     date: 'Mar 10, 2026', month: 'Mar', verified: true },
  { id: 'kr9',  memberId: 'kavya',  title: 'Led show-and-tell for junior cohort',               category: 'Leadership',     impact: 'Low Impact',     date: 'Feb 22, 2026', month: 'Feb', verified: true },
  { id: 'kr10', memberId: 'kavya',  title: 'Improved client presentation deck quality',          category: 'Client Success', impact: 'Low Impact',     date: 'Feb 8, 2026',  month: 'Feb', verified: true },
  { id: 'kr11', memberId: 'kavya',  title: 'Completed Figma Advanced course',                   category: 'Skills',         impact: 'Low Impact',     date: 'Jan 20, 2026', month: 'Jan', verified: true },
  { id: 'kr12', memberId: 'kavya',  title: 'Participated in cross-team design critique',        category: 'Behaviors',      impact: 'Low Impact',     date: 'Jan 6, 2026',  month: 'Jan', verified: true },
  // ── Arjun Mehta ──
  { id: 'am1',  memberId: 'arjun',  title: 'Mentored 2 new hires through onboarding',                        category: 'Leadership',     impact: 'Medium Impact',  date: 'Jun 25, 2026', month: 'Jun', verified: true },
  { id: 'am2',  memberId: 'arjun',  title: 'Improved checkout flow reducing drop-off by 14%',                category: 'Outcomes',       impact: 'Medium Impact',  date: 'Jun 8, 2026',  month: 'Jun', verified: true },
  { id: 'am3',  memberId: 'arjun',  title: 'Contributed 12 reusable components to the shared design library',category: 'Skills',         impact: 'Medium Impact',  date: 'May 20, 2026', month: 'May', verified: false },
  { id: 'am4',  memberId: 'arjun',  title: 'Attended IBM design thinking certification workshop',             category: 'Behaviors',      impact: 'Low Impact',     date: 'May 5, 2026',  month: 'May', verified: true },
  { id: 'am5',  memberId: 'arjun',  title: 'Designed profile settings and notification preference screens',   category: 'Outcomes',       impact: 'Low Impact',     date: 'Apr 20, 2026', month: 'Apr', verified: true },
  { id: 'am6',  memberId: 'arjun',  title: 'Paired with senior designer on 3 complex interaction flows',     category: 'Skills',         impact: 'Low Impact',     date: 'Apr 5, 2026',  month: 'Apr', verified: true },
  { id: 'am7',  memberId: 'arjun',  title: 'Presented live client demo for travel app to 18 stakeholders',   category: 'Client Success', impact: 'Medium Impact',  date: 'Mar 15, 2026', month: 'Mar', verified: true },
  { id: 'am8',  memberId: 'arjun',  title: 'Completed IBM Think40 learning goal ahead of deadline',          category: 'Skills',         impact: 'Low Impact',     date: 'Feb 28, 2026', month: 'Feb', verified: true },
  { id: 'am9',  memberId: 'arjun',  title: 'Redesigned notification system adopted across 2 products',       category: 'Outcomes',       impact: 'Medium Impact',  date: 'Jan 25, 2026', month: 'Jan', verified: true },
  { id: 'am10', memberId: 'arjun',  title: 'Gave feedback in team design review; no follow-up action logged', category: 'Behaviors',     impact: 'Low Impact',     date: 'Jun 18, 2026', month: 'Jun', verified: false },
  { id: 'am11', memberId: 'arjun',  title: 'Documented accessibility guidelines for checkout module',        category: 'Skills',         impact: 'Low Impact',     date: 'Mar 30, 2026', month: 'Mar', verified: true },
  { id: 'am12', memberId: 'arjun',  title: 'Represented squad in cross-team design sync (no output logged)', category: 'Leadership',     impact: 'Low Impact',     date: 'Feb 14, 2026', month: 'Feb', verified: false },
  { id: 'am13', memberId: 'arjun',  title: 'Facilitated team retrospective session',                         category: 'Behaviors',      impact: 'Low Impact',     date: 'Jan 10, 2026', month: 'Jan', verified: true },
  { id: 'am14', memberId: 'arjun',  title: 'Assisted with client requirements gathering for FinTech project', category: 'Client Success', impact: 'Low Impact',    date: 'Jan 6, 2026',  month: 'Jan', verified: false },
  // ── Sneha Iyer ──
  { id: 'si1',  memberId: 'sneha',  title: 'Scoped end-to-end design vision for payments platform relaunch', category: 'Outcomes',       impact: 'High Impact',    date: 'Jun 15, 2026', month: 'Jun', verified: true },
  { id: 'si2',  memberId: 'sneha',  title: 'Facilitated design workshop with 14 payments team members',      category: 'Behaviors',      impact: 'Medium Impact',  date: 'May 28, 2026', month: 'May', verified: true },
  { id: 'si3',  memberId: 'sneha',  title: 'Completed return-to-work ramp-up milestone ahead of schedule',   category: 'Skills',         impact: 'Low Impact',     date: 'May 10, 2026', month: 'May', verified: true },
  { id: 'si4',  memberId: 'sneha',  title: 'Reconnected with 3 client stakeholders to re-establish trust',   category: 'Client Success', impact: 'Medium Impact',  date: 'Apr 25, 2026', month: 'Apr', verified: true },
  { id: 'si5',  memberId: 'sneha',  title: 'Reviewed payments prototype with team — feedback not yet actioned',category: 'Leadership',   impact: 'Medium Impact',  date: 'Apr 10, 2026', month: 'Apr', verified: false },
  { id: 'si6',  memberId: 'sneha',  title: 'Shipped enterprise dashboard v1 before parental leave',          category: 'Outcomes',       impact: 'High Impact',    date: 'Jan 20, 2026', month: 'Jan', verified: true },
  { id: 'si7',  memberId: 'sneha',  title: 'Co-authored team design principles documentation',               category: 'Behaviors',      impact: 'Low Impact',     date: 'Jan 8, 2026',  month: 'Jan', verified: true },
  { id: 'si8',  memberId: 'sneha',  title: 'Led 2-day FinTech client kick-off workshops (pre-leave)',         category: 'Leadership',     impact: 'High Impact',    date: 'Jun 3, 2026',  month: 'Jun', verified: true },
  { id: 'si9',  memberId: 'sneha',  title: 'Joined squad planning session post-return; minimal contribution', category: 'Leadership',    impact: 'Low Impact',     date: 'Jun 20, 2026', month: 'Jun', verified: false },
  { id: 'si10', memberId: 'sneha',  title: 'Reviewed and gave feedback on junior designer portfolio',        category: 'Behaviors',      impact: 'Low Impact',     date: 'May 22, 2026', month: 'May', verified: true },
  { id: 'si11', memberId: 'sneha',  title: 'Set up recurring design critique sessions for payments squad',   category: 'Skills',         impact: 'Medium Impact',  date: 'Jun 28, 2026', month: 'Jun', verified: false },
];

const DIM_BADGE_COLOR: Record<string, { bg: string; color: string }> = {
  Outcomes:       { bg: '#d0e2ff', color: '#0043ce' },
  Skills:         { bg: '#e8daff', color: '#6929c4' },
  Behaviors:      { bg: '#9ef0f0', color: '#005d5d' },
  Leadership:     { bg: '#ffd6e8', color: '#9f1853' },
  'Client Success':{ bg: '#ffd9be', color: '#8a3800' },
};

const IMPACT_BADGE_COLOR: Record<string, string> = {
  'Critical Impact': '#da1e28',
  'High Impact':     '#ff832b',
  'Medium Impact':   '#f1c21b',
  'Low Impact':      '#42be65',
};

const ManagerDashboard: React.FC = () => {
  const [tab, setTab] = useState<ManagerTab>('overview');
  const [expanded, setExpanded] = useState<string | null>('priya');

  // Toast queue — each entry auto-dismisses after 4 s
  const [toasts, setToasts] = useState<{ id: number; msg: string; kind: 'success' | 'warning' | 'info' }[]>([]);
  const toastCounter = React.useRef(0);
  const addToast = React.useCallback(
    (msg: string, kind: 'success' | 'warning' | 'info' = 'success') => {
      const id = ++toastCounter.current;
      setToasts((prev) => [...prev, { id, msg, kind }]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
    },
    []
  );
  const dismissToast = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));
  const [selectedMember, setSelectedMember] = useState<string>('priya');
  const [catFilter, setCatFilter]       = useState<string>('All');
  const [impactFilter, setImpactFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [quarterFilter, setQuarterFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery]   = useState<string>('');
  const [modal, setModal] = useState<{ label: string; heading: string; body: React.ReactNode } | null>(null);
  const [openEvidence, setOpenEvidence] = useState<string | null>(null);
  // Inline expanded table row
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  // Inline approve / dismiss for pending contributions in Team Contributions tab
  const [approvedIds, setApprovedIds] = useState<Set<string>>(new Set());
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const approveContrib = (id: string, title: string) => {
    setApprovedIds((s) => new Set(s).add(id));
    addToast(`"${title}" approved.`, 'success');
  };
  const dismissContrib = (id: string, title: string) => {
    setDismissedIds((s) => new Set(s).add(id));
    addToast(`"${title}" dismissed.`, 'warning');
  };
  // Attachment lightbox
  const [attachPreview, setAttachPreview] = useState<ContribAttachment | null>(null);
  const { queue, approve, decline, setImpact, setCategory } = useTeamApprovals();

  const IMPACT_LEVELS = ['Low Impact', 'Medium Impact', 'High Impact', 'Critical Impact'];

  const metrics: MetricCardType[] = [
    {
      id: 'm1',
      title: 'Team Contributions (Q3)',
      value: '112',
      subtitle: '↑ 18% vs Q2',
      icon: 'chart',
      info: 'Total verified contributions logged by your 8 Direct Reportee (DR) this quarter, auto-classified across the iX dimensions.',
    },
    {
      id: 'm2',
      title: 'Promotion-Ready Members',
      value: '3 / 8',
      subtitle: 'Priya, Rohan, Aditya',
      icon: 'rank',
      info: 'Direct Reportee (DR) whose readiness scores clear the band bar (85) on the majority of dimensions. Promotion decisions rest with managers and IBM policy.',
    },
    {
      id: 'm3',
      title: 'Need Attention',
      value: '2 / 8',
      subtitle: 'Arjun, Sneha — Need Attention members',
      icon: 'pending',
      info: 'Team members flagged as Needs Attention — falling behind on contributions, impact, or readiness score. Review and act early to keep everyone on track.',
    },
    {
      id: 'm4',
      title: 'Avg. Impact Score',
      value: '788',
      subtitle: '↑ 47 this quarter',
      icon: 'star',
      info: 'Team average Impact Score. Each contribution is scored as impact level (Low 1 · Med 2 · High 4 · Critical 8) × dimension weight (Outcomes & Client Success 1.2, Leadership 1.1, Skills 1.0, Behaviors 0.9) × verification, scaled to a 0–1000 index.',
    },
  ];

  const statusTag = (s: Status) => {
    if (s === 'Promotion Ready') return <span className="mstatus mstatus--ready">Promotion Ready</span>;
    if (s === 'Needs Attention') return <span className="mstatus mstatus--risk">Needs Attention</span>;
    return <span className="mstatus mstatus--ontrack">On Track</span>;
  };

  return (
    <div className="manager-dashboard">
      {/* Header band */}
      <header className="page-header">
        <div className="page-header__inner">
          <p className="page-header__label">Manager Tools</p>
          <h1 className="page-header__title">Team Intelligence Hub</h1>
          <p className="page-header__subtitle">
            Insights, recognition prompts, and performance readiness for your 8 Direct Reportee (DR).
          </p>
        </div>
      </header>

      {/* ── Fixed top-right toast stack ── */}
      {toasts.length > 0 && (
        <div className="mgr-toast-stack" aria-live="polite">
          {toasts.map((t) => (
            <div key={t.id} className={`mgr-toast mgr-toast--${t.kind}`}>
              <span className="mgr-toast__icon">
                {t.kind === 'success' ? '✓' : t.kind === 'warning' ? '⚠' : 'ℹ'}
              </span>
              <span className="mgr-toast__msg">{t.msg}</span>
              <button
                className="mgr-toast__close"
                aria-label="Dismiss"
                onClick={() => dismissToast(t.id)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="page-body">
        {/* Team summary banner */}
        <Theme theme="g100">
          <Tile className="manager-summary">
            <div className="manager-summary__content">
              <div className="manager-summary__icon">
                <Light size={16} />
              </div>
              <div className="manager-summary__text">
                <p className="manager-summary__title">Team Summary — July 2026</p>
                <p className="manager-summary__desc">
                  Your team of 8 logged <strong>112 contributions</strong> this quarter, up 18% from
                  Q1. <strong>3 designers show strong Band-readiness</strong> (Priya, Rohan, Aditya).
                  Arjun Mehta's pace has slipped — a check-in is overdue. A recognition prompt is
                  waiting for Rohan's design-system work.
                </p>
              </div>
            </div>
            <Button
              kind="tertiary"
              size="sm"
              renderIcon={Document}
              onClick={() =>
                setModal({
                  label: 'Manager Tools',
                  heading: 'Team Review Kit — Q3 2026',
                  body: (
                    <ReviewKitReport
                      contribByMember={CONTRIB_BY_MEMBER}
                      dimSeries={DIM_SERIES}
                      matrix={MATRIX}
                    />
                  ),
                })
              }
            >
              Generate Review Kit
            </Button>
          </Tile>
        </Theme>

        {/* Metrics */}
        <div className="manager-dashboard__metrics">
          {metrics.map((m) => (
            <MetricCard key={m.id} metric={m} />
          ))}
        </div>

        {/* Tabs */}
        <div className="gtabs">
          <button
            className={`gtabs__btn ${tab === 'overview' ? 'active' : ''}`}
            onClick={() => setTab('overview')}
          >
            Overview
          </button>
          <button
            className={`gtabs__btn ${tab === 'contribs' ? 'active' : ''}`}
            onClick={() => setTab('contribs')}
          >
            Team Contributions
          </button>
          <button
            className={`gtabs__btn ${tab === 'reviews' ? 'active' : ''}`}
            onClick={() => setTab('reviews')}
          >
            Performance Reviews
          </button>
          <button
            className={`gtabs__btn ${tab === 'opps' ? 'active' : ''}`}
            onClick={() => setTab('opps')}
          >
            Growth Opportunities
          </button>
        </div>

        {tab === 'overview' && (
          <>
          {queue.length > 0 && (
            <Tile className="dashboard-card approvals-card">
              <div className="approvals-card__head">
                <h3 className="manager-dashboard__section-title">Pending Approvals</h3>
                <span className="approvals-card__count">{queue.length} awaiting you</span>
              </div>
              <p className="manager-dashboard__section-sub">
                Contributions your Direct Reportee (DR) sent for sign-off
              </p>
              <div className="approvals">
                {queue.map((a) => {
                  const evidenceOpen = openEvidence === a.id;
                  return (
                    <div key={a.id} className="approval">
                      <div className="approval__body">
                        {/* Header row: avatar + title + close button */}
                        <div className="approval__header">
                          <span className="approval__avatar">{a.initials}</span>
                          <p className="approval__title">{a.title}</p>
                          <button
                            type="button"
                            className="approval__close"
                            aria-label="Decline"
                            onClick={() => {
                              decline(a.id);
                              addToast(`Declined ${a.from}'s contribution.`, 'warning');
                            }}
                          >
                            <CloseIcon size={16} />
                          </button>
                        </div>

                        {/* Meta row: name · category pill · date */}
                        <div className="approval__meta">
                          <span className="approval__from">
                            {a.from}{a.origin === 'self' && ' (you)'}
                          </span>
                          <Tag type={dimColor(a.category)} size="sm">
                            {a.category}
                          </Tag>
                          <span className="approval__date">{a.date}</span>
                        </div>

                        {/* Note */}
                        {a.note && (
                          <div className="approval__note">
                            <span className="approval__note-label">Note</span>
                            <p>{a.note}</p>
                          </div>
                        )}

                        {/* Evidence */}
                        {(a.evidence ?? []).length > 0 && (
                          <div className="approval__evidence">
                            <span className="approval__evidence-label">Evidence</span>
                            <div className="approval__evidence-chips">
                              {(a.evidence ?? []).map((e) => (
                                <span key={e} className="evidence-chip">{e}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* View / hide original message */}
                        {a.rawMessage && (
                          <>
                            <button
                              type="button"
                              className="approval__view"
                              onClick={() => setOpenEvidence(evidenceOpen ? null : a.id)}
                            >
                              {evidenceOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                              {evidenceOpen ? 'Hide original message' : 'View original message'}
                            </button>
                            {evidenceOpen && (
                              <blockquote className="approval__raw">{a.rawMessage}</blockquote>
                            )}
                          </>
                        )}

                        {/* Dimension + Impact dropdowns + Approve */}
                        <div className="approval__edit-row">
                          <div className="approval__edit">
                            <label className="approval__edit-label" htmlFor={`dim-${a.id}`}>Dimension</label>
                            <select
                              id={`dim-${a.id}`}
                              className="approval__select"
                              value={a.category}
                              onChange={(e) => setCategory(a.id, e.target.value as typeof a.category)}
                            >
                              {DIMENSIONS.map((d) => (
                                <option key={d} value={d}>{d}</option>
                              ))}
                            </select>
                          </div>
                          <div className="approval__edit">
                            <label className="approval__edit-label" htmlFor={`impact-${a.id}`}>Impact level</label>
                            <select
                              id={`impact-${a.id}`}
                              className="approval__select"
                              value={a.impact}
                              onChange={(e) => setImpact(a.id, e.target.value as typeof a.impact)}
                            >
                              {IMPACT_LEVELS.map((i) => (
                                <option key={i} value={i}>{i.replace(' Impact', '')}</option>
                              ))}
                            </select>
                          </div>
                          <div className="approval__approve">
                            <Button
                              kind="primary"
                              size="sm"
                              renderIcon={CheckIcon}
                              onClick={() => {
                                approve(a.id);
                                addToast(
                                  `Approved ${a.from}'s contribution — ${a.category}, ${a.impact.replace(' Impact', '')} impact.`,
                                  'success'
                                );
                              }}
                            >
                              Approve
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Tile>
          )}

          <div className="manager-dashboard__content">
            {/* Left: team roster */}
            <div className="manager-dashboard__col">
              <Tile className="dashboard-card roster">
                {TEAM.map((m) => {
                  const open = expanded === m.id;
                  return (
                    <div key={m.id} className={`member-row${open ? ' member-row--open' : ''}`}>
                      <button
                        className="member-row__head"
                        onClick={() => setExpanded(open ? null : m.id)}
                      >
                        <span className="member-row__avatar">{m.initials}</span>
                        <span className="member-row__id">
                          <span className="member-row__name">
                            {m.name}
                            <span className="member-row__band">{m.band}</span>
                            {m.checkinOverdue && (
                              <span className="member-row__overdue">Check-in overdue</span>
                            )}
                          </span>
                          <span className="member-row__role">{m.role}</span>
                        </span>
                        <span className="member-row__stat">
                          <span className="member-row__num">{m.contributions}</span>
                          <span className="member-row__lbl">Contributions</span>
                        </span>
                        <span className="member-row__stat">
                          <span className="member-row__num">{m.impact}</span>
                          <span className="member-row__lbl">Impact Score</span>
                        </span>
                        <span className="member-row__promo">
                          <span className="member-row__bar">
                            <span
                              className={`member-row__fill${m.promo < 60 ? ' member-row__fill--low' : ''}`}
                              style={{ width: `${m.promo}%` }}
                            />
                          </span>
                          <span className="member-row__lbl">{m.promo}% Promo Ready</span>
                        </span>
                        {statusTag(m.status)}
                        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </button>

                      {open && (
                        <div className="member-row__detail">
                          <div className="member-row__summary">
                            <Light size={16} />
                            <p>
                              <strong>Summary:</strong> {m.summary}
                            </p>
                          </div>
                          <p className="member-row__recent">
                            <span>Recent:</span> {m.recent} — {m.recentAgo}
                          </p>
                          <div className="member-row__actions">
                            <Button
                              kind="tertiary"
                              size="sm"
                              onClick={() => addToast(`1:1 scheduled with ${m.name}.`, 'info')}
                            >
                              Schedule Meeting
                            </Button>
                            <Button
                              kind="primary"
                              size="sm"
                              onClick={() => addToast(`Recognition sent to ${m.name}.`, 'success')}
                            >
                              Recognize
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </Tile>
            </div>

            {/* Right: action items + contributions chart */}
            <div className="manager-dashboard__col">
              <Tile className="dashboard-card">
                <h3 className="manager-dashboard__section-title">Action Items</h3>
                <div className="action-items">
                  {ACTION_ITEMS.map((a) => (
                    <div key={a.cta} className="action-item">
                      <span className="action-item__dot" />
                      <div>
                        <p className="action-item__text">{a.text}</p>
                        <button
                          className="action-item__cta"
                          onClick={() => addToast(`${a.cta} — done.`, 'info')}
                        >
                          {a.cta} <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Tile>

              <Tile className="dashboard-card">
                <h3 className="manager-dashboard__section-title">Team Contributions</h3>
                <p className="manager-dashboard__section-sub">By dimension, Q3 2026</p>
                <ResponsiveContainer width="100%" height={340}>
                  <BarChart data={CONTRIB_BY_MEMBER} layout="vertical" margin={{ left: -16, right: 8 }}>
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#525252' }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#525252' }} axisLine={false} tickLine={false} width={70} />
                    <Tooltip contentStyle={{ border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12 }} />
                    {DIM_SERIES.map((s) => (
                      <Bar key={s.key} dataKey={s.key} stackId="a" fill={s.color} radius={0} />
                    ))}
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} iconType="square" />
                  </BarChart>
                </ResponsiveContainer>
              </Tile>
            </div>
          </div>
          </>
        )}

        {tab === 'contribs' && (() => {
          const memberColors = ['#0f62fe','#8a3ffc','#007d79','#fa4d56','#ff832b','#42be65','#1192e8','#d12771'];

          // Per-member summary stats
          const memberStats = TEAM.map((t) => {
            const mc = MEMBER_CONTRIBS.filter((c) => c.memberId === t.id);
            const critCount = mc.filter((c) => c.impact === 'Critical Impact').length;
            const highCount = mc.filter((c) => c.impact === 'High Impact').length;
            return {
              ...t,
              total: mc.length,
              verifiedCount: mc.filter((c) => c.verified).length,
              critCount,
              highCount,
              topCat: (() => {
                const cm: Record<string,number> = {};
                mc.forEach((c) => { cm[c.category] = (cm[c.category]||0)+1; });
                return Object.entries(cm).sort((a,b)=>b[1]-a[1])[0]?.[0] ?? '—';
              })(),
              dimCounts: (['Outcomes','Skills','Behaviors','Leadership','Client Success'] as const).map((d) => ({
                dim: d,
                count: mc.filter((c) => c.category === d).length,
              })),
            };
          });

          const activeMember = TEAM.find((m) => m.id === selectedMember) ?? TEAM[0];
          const activeStat   = memberStats.find((m) => m.id === activeMember.id)!;
          const memberIdx    = TEAM.findIndex((t) => t.id === activeMember.id);
          const accentColor  = memberColors[memberIdx];

          const rawContribs  = MEMBER_CONTRIBS.filter((c) => c.memberId === activeMember.id);
          const maxDimCount  = Math.max(...activeStat.dimCounts.map((d) => d.count), 1);

          // Quarter → months mapping
          const QUARTER_MONTHS: Record<string, string[]> = {
            Q1: ['Jan','Feb','Mar'],
            Q2: ['Apr','May','Jun'],
            Q3: ['Jul','Aug','Sep'],
            Q4: ['Oct','Nov','Dec'],
          };

          const filtered = rawContribs
            .filter((c) => catFilter === 'All' || c.category === catFilter)
            .filter((c) => impactFilter === 'All' || c.impact === impactFilter)
            .filter((c) => {
              if (statusFilter === 'All') return true;
              const isVerified = c.verified || approvedIds.has(c.id);
              const isDismissed = dismissedIds.has(c.id);
              if (statusFilter === 'Verified') return isVerified;
              if (statusFilter === 'Pending') return !isVerified && !isDismissed;
              if (statusFilter === 'Dismissed') return isDismissed;
              return true;
            })
            .filter((c) => quarterFilter === 'All' || QUARTER_MONTHS[quarterFilter]?.includes(c.month))
            .filter((c) => {
              if (!searchQuery.trim()) return true;
              const q = searchQuery.toLowerCase();
              return c.title.toLowerCase().includes(q);
            });

          return (
            <div className="contribs2">
              {/* ── Left roster panel ── */}
              <div className="contribs2__roster">
                {memberStats.map((m, i) => {
                  const active = m.id === selectedMember;
                  return (
                    <button
                      key={m.id}
                      className={`cr-row${active ? ' cr-row--active' : ''}`}
                      style={{ '--cr-accent': memberColors[i] } as any}
                      onClick={() => {
                        setSelectedMember(m.id);
                        setCatFilter('All');
                        setImpactFilter('All');
                        setStatusFilter('All');
                        setQuarterFilter('All');
                        setSearchQuery('');
                      }}
                    >
                      <span className="cr-row__avatar" style={{ background: memberColors[i] }}>
                        {m.initials}
                      </span>
                      <span className="cr-row__info">
                        <span className="cr-row__name">{m.name}</span>
                        <span className="cr-row__meta">{m.band} · {m.total} contribs</span>
                      </span>
                      <span className={`cr-row__status cr-row__status--${m.status === 'Promotion Ready' ? 'ready' : m.status === 'Needs Attention' ? 'risk' : 'track'}`}>
                        {m.status === 'Promotion Ready' ? 'Promo Ready' : m.status === 'Needs Attention' ? 'Needs Attn' : 'On Track'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* ── Right detail panel ── */}
              <div className="contribs2__detail">
              <div className="contribs2__detail-scroll">
                {/* Header */}
                <div className="cd-header">
                  <span className="cd-header__avatar" style={{ background: accentColor }}>{activeMember.initials}</span>
                  <div className="cd-header__info">
                    <div className="cd-header__name-row">
                      <span className="cd-header__name">{activeMember.name}</span>
                      <span className={`cr-row__status cr-row__status--${activeMember.status === 'Promotion Ready' ? 'ready' : activeMember.status === 'Needs Attention' ? 'risk' : 'track'}`}>
                        {activeMember.status}
                      </span>
                    </div>
                    <span className="cd-header__sub">{activeMember.role} · {activeMember.band}</span>
                  </div>
                  {activeMember.status === 'Needs Attention' && (
                    <Button
                      kind="tertiary"
                      size="sm"
                      className="cd-header__schedule-btn"
                      onClick={() => addToast(`1:1 scheduled with ${activeMember.name}.`, 'info')}
                    >
                      Schedule Meeting
                    </Button>
                  )}
                </div>

                {/* Stat tiles */}
                <div className="cd-stats">
                  <div className="cd-stat">
                    <span className="cd-stat__val">{activeStat.total}</span>
                    <span className="cd-stat__lbl">Total Contributions</span>
                  </div>
                  <div className="cd-stat">
                    <span className="cd-stat__val">{activeStat.verifiedCount}</span>
                    <span className="cd-stat__lbl">Verified Contributions</span>
                  </div>
                  <div className="cd-stat">
                    <span className="cd-stat__val cd-stat__val--crit">{activeStat.critCount}</span>
                    <span className="cd-stat__lbl">Critical Impact</span>
                  </div>
                  <div className="cd-stat">
                    <span className="cd-stat__val cd-stat__val--high">{activeStat.highCount}</span>
                    <span className="cd-stat__lbl">High Impact</span>
                  </div>
                </div>

                {/* Dimension mini-chart */}
                <div className="cd-dims">
                  <p className="cd-dims__title">Contributions by Dimension</p>
                  {activeStat.dimCounts.map((d) => {
                    const dimStyle = DIM_BADGE_COLOR[d.dim] ?? { bg: '#f4f4f4', color: '#525252' };
                    return (
                      <div key={d.dim} className="cd-dim-row">
                        <span className="cd-dim-row__label">{d.dim}</span>
                        <div className="cd-dim-row__bar-wrap">
                          <div
                            className="cd-dim-row__bar"
                            style={{ width: `${(d.count / maxDimCount) * 100}%`, background: dimStyle.color }}
                          />
                        </div>
                        <span className="cd-dim-row__count">{d.count}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Search + filter row */}
                <div className="cd-toolbar">
                  <input
                    className="cd-search"
                    type="text"
                    placeholder="Search by title or description…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <select
                    className="contribs-select"
                    value={catFilter}
                    onChange={(e) => setCatFilter(e.target.value)}
                  >
                    <option value="All">All dimensions</option>
                    {(['Outcomes','Skills','Behaviors','Leadership','Client Success'] as const).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <select
                    className="contribs-select"
                    value={impactFilter}
                    onChange={(e) => setImpactFilter(e.target.value)}
                  >
                    <option value="All">All impact</option>
                    <option value="Critical Impact">Critical</option>
                    <option value="High Impact">High</option>
                    <option value="Medium Impact">Medium</option>
                    <option value="Low Impact">Low</option>
                  </select>
                  <select
                    className="contribs-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="All">All status</option>
                    <option value="Verified">Verified</option>
                    <option value="Pending">Pending</option>
                    <option value="Dismissed">Dismissed</option>
                  </select>
                  <select
                    className="contribs-select"
                    value={quarterFilter}
                    onChange={(e) => setQuarterFilter(e.target.value)}
                  >
                    <option value="All">All quarters</option>
                    <option value="Q1">Q1 (Jan–Mar)</option>
                    <option value="Q2">Q2 (Apr–Jun)</option>
                    <option value="Q3">Q3 (Jul–Sep)</option>
                    <option value="Q4">Q4 (Oct–Dec)</option>
                  </select>
                </div>

                <p className="cd-count">{filtered.length} contributions</p>

                {/* Contribution table */}
                <div className="contribs-table-wrap">
                  <table className="contribs-table cd-table">
                    <thead>
                      <tr>
                        <th>Contribution</th>
                        <th>Dimension</th>
                        <th>Impact</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((c) => {
                        const dimStyle = DIM_BADGE_COLOR[c.category] ?? { bg: '#f4f4f4', color: '#525252' };
                        const isOpen = expandedRow === c.id;
                        return (
                          <React.Fragment key={c.id}>
                            <tr
                              className={`cd-table-row${isOpen ? ' cd-table-row--open' : ''}`}
                              onClick={() => setExpandedRow(isOpen ? null : c.id)}
                              style={{ cursor: 'pointer' }}
                            >
                              <td className="contribs-table__title">{c.title}</td>
                              <td>
                                <span className="contribs-badge" style={{ background: dimStyle.bg, color: dimStyle.color, border: `1px solid ${dimStyle.color}22` }}>
                                  {c.category}
                                </span>
                              </td>
                              <td>
                                <span className="contribs-impact-pill" style={{ background: `${IMPACT_BADGE_COLOR[c.impact]}18`, color: IMPACT_BADGE_COLOR[c.impact] }}>
                                  {c.impact.replace(' Impact', '')}
                                </span>
                              </td>
                              <td className="contribs-table__date">{c.date}</td>
                              <td>
                                {c.verified || approvedIds.has(c.id)
                                  ? <span className="contribs-verified"><CheckmarkFilled size={13} /> Verified</span>
                                  : dismissedIds.has(c.id)
                                  ? <span className="contribs-dismissed">Dismissed</span>
                                  : <span className="contribs-pending">Pending</span>
                                }
                              </td>
                              <td className="cd-table__chevron">
                                <span className={`cd-chevron-btn${isOpen ? ' cd-chevron-btn--open' : ''}`}>
                                  <ChevronRight size={16} />
                                </span>
                              </td>
                            </tr>

                            {/* ── Expanded detail row ── */}
                            {isOpen && (
                              <tr className="cr-expand-row">
                                <td colSpan={6} className="cr-expand-row__cell">
                                  <div className="cr-expand">

                                    {/* Description */}
                                    {c.description && (
                                      <div className="cr-expand__section">
                                        <p className="cr-expand__label">Description</p>
                                        <p className="cr-expand__body">{c.description}</p>
                                      </div>
                                    )}

                                    {/* Original message */}
                                    {c.originalMessage && (
                                      <div className="cr-expand__section">
                                        <p className="cr-expand__label">Original message</p>
                                        <blockquote className="cr-expand__message">{c.originalMessage}</blockquote>
                                      </div>
                                    )}

                                    {/* Evidence chips */}
                                    {c.evidence && c.evidence.length > 0 && (
                                      <div className="cr-expand__section">
                                        <p className="cr-expand__label">Evidence</p>
                                        <div className="cr-expand__chips">
                                          {c.evidence.map((e) => (
                                            <span key={e} className="evidence-chip">{e}</span>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Attachments */}
                                    {c.attachments && c.attachments.length > 0 && (
                                      <div className="cr-expand__section">
                                        <p className="cr-expand__label">Attachments</p>
                                        <div className="cr-expand__attachments">
                                          {c.attachments.map((att) => (
                                            <button
                                              key={att.name}
                                              className="cd-attachment"
                                              onClick={(e) => { e.stopPropagation(); setAttachPreview(att); }}
                                              aria-label={`Preview ${att.name}`}
                                            >
                                              <div className="cd-attachment__thumb" style={{ background: att.color }}>
                                                {att.type === 'pdf'
                                                  ? <span className="cd-attachment__pdf-label">PDF</span>
                                                  : <span className="cd-attachment__img-icon">🖼</span>
                                                }
                                              </div>
                                              <span className="cd-attachment__name">{att.name}</span>
                                              <span className="cd-attachment__type">{att.type.toUpperCase()}</span>
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Fallback for contributions with no extra detail */}
                                    {!c.description && !c.originalMessage && !c.evidence && !c.attachments && (
                                      <p className="cr-expand__empty">No additional details logged for this contribution.</p>
                                    )}

                                    {/* Approve / Dismiss — only for pending contributions */}
                                    {!c.verified && !approvedIds.has(c.id) && !dismissedIds.has(c.id) && (
                                      <div className="cr-expand__actions">
                                        <Button
                                          kind="primary"
                                          size="sm"
                                          renderIcon={CheckIcon}
                                          onClick={(e: React.MouseEvent) => { e.stopPropagation(); approveContrib(c.id, c.title); }}
                                        >
                                          Approve
                                        </Button>
                                        <Button
                                          kind="danger--ghost"
                                          size="sm"
                                          renderIcon={CloseIcon}
                                          onClick={(e: React.MouseEvent) => { e.stopPropagation(); dismissContrib(c.id, c.title); }}
                                        >
                                          Dismiss
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                  {filtered.length === 0 && (
                    <p className="contribs-tab__empty">No contributions match the selected filters.</p>
                  )}
                </div>
              </div>{/* /detail-scroll */}

              </div>
            </div>
          );
        })()}

        {tab === 'reviews' && (
          <>
            <div className="prep-kits">
              {PREP_KITS.map((k) => (
                <Tile key={k.name} className="prep-kit">
                  <div className="prep-kit__head">
                    <span className="prep-kit__label">
                      <Light size={14} /> Review Prep Kit
                    </span>
                    <span className="mstatus mstatus--ready">Promotion Ready</span>
                  </div>
                  <p className="prep-kit__name">{k.name}</p>
                  <p className="prep-kit__text">{k.text}</p>
                  <div className="prep-kit__actions">
                    <Button
                      kind="primary"
                      size="sm"
                      renderIcon={Document}
                      onClick={() => {
                        const name = k.name;
                        const mx = matrixFor(name);
                        const teamMember = TEAM.find((t) => t.name === name);
                        const scores = mx?.scores ?? {};
                        const memberContribs: EvidenceContrib[] = MEMBER_CONTRIBS
                          .filter((c) => c.memberId === mx?.name?.toLowerCase())
                          .map((c) => ({ id: c.id, title: c.title, category: c.category, impact: c.impact, date: c.date, verified: c.verified, description: c.description }));
                        setModal({
                          label: 'Promotion Prep Kit',
                          heading: `${name} — Promotion Case`,
                          body: (
                            <PrepKitReport
                              name={name}
                              band={mx?.band ?? 'Band 7'}
                              overall={mx?.overall ?? 82}
                              scores={scores}
                              text={k.text}
                              impactScore={teamMember?.impact ?? 0}
                              contribs={memberContribs}
                            />
                          ),
                        });
                      }}
                    >
                      Generate Prep Kit
                    </Button>
                  </div>
                </Tile>
              ))}
            </div>

            <Tile className="dashboard-card">
              <h3 className="manager-dashboard__section-title">Promotion Readiness Matrix</h3>
              <p className="manager-dashboard__section-sub">
                Readiness scores across the iX growth dimensions
              </p>
              <Table size="lg" useZebraStyles={false}>
                <TableHead>
                  <TableRow>
                    <TableHeader>Designer</TableHeader>
                    {DIMENSIONS.map((d) => (
                      <TableHeader key={d}>{d}</TableHeader>
                    ))}
                    <TableHeader>Overall</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {MATRIX.map((r) => (
                    <TableRow key={r.name}>
                      <TableCell>
                        <div className="member">
                          <span className="member__avatar">{r.initials}</span>
                          <span>
                            <span className="member__name">{r.name}</span>
                            <span className="matrix__band">{r.band}</span>
                          </span>
                        </div>
                      </TableCell>
                      {DIMENSIONS.map((d) => (
                        <TableCell key={d}>
                          <div className="score">
                            <span className={`score__bar ${scoreClass(r.scores[d])}`}>
                              <span style={{ width: `${r.scores[d]}%` }} />
                            </span>
                            <span className={`score__val ${scoreClass(r.scores[d])}`}>
                              {r.scores[d]}
                            </span>
                          </div>
                        </TableCell>
                      ))}
                      <TableCell>
                        <span className={`score__overall ${scoreClass(r.overall)}`}>{r.overall}%</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Tile>
          </>
        )}

        {tab === 'opps' && (
          <Tile className="dashboard-card">
            <ManagerOpportunities />
          </Tile>
        )}
      </div>

      {/* ── Attachment Lightbox ── */}
      {attachPreview && (
        <div className="cd-lightbox" onClick={() => setAttachPreview(null)}>
          <div className="cd-lightbox__box" onClick={(e) => e.stopPropagation()}>
            <div className="cd-lightbox__head">
              <span className="cd-lightbox__name">{attachPreview.name}</span>
              <button
                className="cd-lightbox__close"
                aria-label="Close"
                onClick={() => setAttachPreview(null)}
              >
                ✕
              </button>
            </div>
            <div className="cd-lightbox__body">
              {attachPreview.type === 'image' ? (
                <div className="cd-lightbox__img-mock" style={{ background: attachPreview.color }}>
                  <span className="cd-lightbox__mock-label">
                    Image Preview<br />
                    <small>{attachPreview.name}</small>
                  </span>
                </div>
              ) : (
                <div className="cd-lightbox__pdf-mock" style={{ background: attachPreview.color }}>
                  <div className="cd-lightbox__pdf-icon">PDF</div>
                  <span className="cd-lightbox__mock-label">
                    {attachPreview.name}
                  </span>
                  <p className="cd-lightbox__pdf-note">
                    PDF preview — in production this would render the actual document.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Modal
        open={!!modal}
        passiveModal
        modalLabel={modal?.label}
        modalHeading={modal?.heading}
        onRequestClose={() => setModal(null)}
        className="report-modal"
      >
        {modal?.body}
      </Modal>
    </div>
  );
};

export default ManagerDashboard;

// Made with Bob
