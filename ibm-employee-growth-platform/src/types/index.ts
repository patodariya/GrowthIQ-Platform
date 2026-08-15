// Core types for IBM Employee Growth Platform

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'employee' | 'manager';
  initials: string;
}

export interface Contribution {
  id: string;
  title: string;
  description: string;
  // iX India Design Goals 2025 dimensions.
  category: 'Outcomes' | 'Skills' | 'Behaviors' | 'Leadership' | 'Client Success';
  impact: 'Low Impact' | 'Medium Impact' | 'High Impact' | 'Critical Impact';
  date: string;
  verified: boolean;
  verifiedBy?: string;
  /** Supporting artifacts (e.g. "Figma file", "Usability report"). */
  evidence?: string[];
  /** True for steady-state metrics pulled from IBM systems of record
   *  (YourLearning / MyScore) — scored at a lower weight than standout work. */
  system?: boolean;
}

// Recognition/feedback ingested from Slack or Outlook by the AI agent, then
// reviewed by the employee and routed through manager approval before it
// becomes a verified Contribution.
export type DetectedSource = 'slack' | 'outlook';

export type DetectedStatus =
  | 'detected' // AI fetched it; awaiting employee review
  | 'pending_manager' // employee approved; sent to manager
  | 'approved' // manager approved; now a verified contribution
  | 'dismissed'; // employee rejected it

export interface DetectedContribution {
  id: string;
  source: DetectedSource;
  from: string; // "Sarah K." / "priya.n@retailco.com"
  channel: string; // "#design-kudos" / "Re: Checkout launch"
  receivedAt: string; // "Jul 1, 2026"
  rawMessage: string; // original text the employee reads/verifies
  title: string; // AI-polished contribution title
  category: Contribution['category'];
  impact: Contribution['impact'];
  summary: string; // 1-line why-it-matters
  aiExtracted: boolean; // true = ICA produced it, false = heuristic fallback
  edited?: boolean; // true once the employee has manually edited the draft
  status: DetectedStatus;
}

export interface MetricCard {
  id: string;
  title: string;
  value: string | number;
  subtitle: string;
  trend?: string;
  icon: string;
  /** Shown in a hover tooltip: how the metric is collected/calculated. */
  info?: string;
}

// Scores (0-100) across the iX India Design Goals dimensions.
export interface SkillProfile {
  outcomes: number;
  skills: number;
  behaviors: number;
  leadership: number;
  clientSuccess: number;
}

export interface Recognition {
  id: string;
  from: string;
  fromInitials: string;
  message: string;
  date: string;
  isManager: boolean;
}

export interface ChartDataPoint {
  month: string;
  contributions: number;
}

export interface CareerInsight {
  type: 'nudge' | 'recommendation' | 'milestone';
  title: string;
  message: string;
  icon?: string;
}

// Skills Learning Path Types
export type BadgeLevel = 'Jumpstart' | 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

export interface Course {
  id: string;
  title: string;
  description: string;
  duration: string; // e.g., "2 hours", "1 week"
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  provider: string; // e.g., "IBM Skills", "Coursera"
  url: string; // Link to IBM MyLearning
  completed: boolean;
  completedDate?: string;
  progress?: number; // 0-100
}

export interface SkillPath {
  id: string;
  name: string;
  category: 'Core' | 'Parallel'; // Core = deep dive, Parallel = complementary
  description: string;
  relevance: number; // 0-100 match percentage
  currentLevel: BadgeLevel;
  targetLevel: BadgeLevel;
  overallProgress: number; // 0-100
  courses: Course[];
  estimatedTime: string; // e.g., "3 months"
  icon?: string;
}

export interface SkillCategory {
  name: string;
  percentage: number;
  color: string;
  skills: string[];
}

export interface BadgeProgress {
  level: BadgeLevel;
  completed: boolean;
  coursesRequired: number;
  coursesCompleted: number;
  unlockDate?: string;
}

export interface IndustryBadge {
  industry: string;
  currentLevel: BadgeLevel;
  targetLevel: BadgeLevel;
  progress: number;
  description: string;
}

// YourCareer@IBM API Types
export interface YourCareerSkillRecommendation {
  id: string;
  skillName: string;
  skillCategory?: string;
  proficiencyLevel?: string;
  recommendationReason?: string;
  learningResources?: YourCareerLearningResource[];
  priority?: 'High' | 'Medium' | 'Low';
  estimatedTimeToAcquire?: string;
}

export interface YourCareerLearningResource {
  id: string;
  title: string;
  type: 'Course' | 'Certification' | 'Learning Path' | 'Badge';
  provider: string;
  url: string;
  duration?: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  description?: string;
}

export interface YourCareerSkillsData {
  employeeId: string;
  recommendations: YourCareerSkillRecommendation[];
  lastUpdated: string;
}

// Skill Proficiency Scale (0-5)
export type SkillProficiencyLevel = 0 | 1 | 2 | 3 | 4 | 5;

export const SKILL_PROFICIENCY_LABELS: Record<SkillProficiencyLevel, string> = {
  0: 'No Skill',
  1: 'Entry',
  2: 'Foundation',
  3: 'Experienced',
  4: 'Expert',
  5: 'Thought Leader',
};

export interface SkillProficiency {
  id: string;
  skillName: string;
  category: string;
  proficiencyLevel: SkillProficiencyLevel;
  lastUpdated?: string;
  source: 'yourcareer' | 'manual';
  specialty?: string; // Primary job role specialty
  focusArea?: string; // e.g., "Agentic AI Interface Design and Collaboration"
  assessmentLevel?: string; // Skill ability assessment
}

export interface MySkillsData {
  employeeId: string;
  skills: SkillProficiency[];
  lastSynced: string;
}

// Made with Bob
