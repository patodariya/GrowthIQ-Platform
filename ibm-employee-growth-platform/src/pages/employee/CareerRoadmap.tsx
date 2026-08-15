import React, { useState, useEffect } from 'react';
import { Tile, Tag, Link, ProgressBar, InlineNotification, Tabs, TabList, Tab, TabPanels, TabPanel, Loading } from '@carbon/react';
import { Light, ArrowUpRight, Renew } from '@carbon/icons-react';
import CareerProgressionChart from '../../components/employee/CareerProgressionChart';
import IndustryBadges from '../../components/employee/IndustryBadges';
import CourseCard from '../../components/employee/CourseCard';
import MySkills from '../../components/employee/MySkills';
import SkillsPortfolioPieChart from '../../components/employee/SkillsPortfolioPieChart';
import SkillCategoriesAccordion from '../../components/employee/SkillCategoriesAccordion';
import { SkillCategory, Course, IndustryBadge, YourCareerSkillsData, SkillProficiencyLevel, MySkillsData } from '../../types';
import { fetchYourCareerSkills, getFallbackYourCareerData, convertToCourses, YC_ENABLED, fetchMySkills, getFallbackMySkills, updateSkillProficiency } from '../../services/yourCareer';
import './CareerRoadmap.scss';

interface Quarter {
  label: string;
  contributions: string;
  impact: string;
  note: string;
  highlight?: boolean;
}

const QUARTERS: Quarter[] = [
  { label: 'Q1 2026', contributions: '11', impact: '640', note: 'Focused on client Outcomes' },
  { label: 'Q2 2026', contributions: '13', impact: '700', note: '+ Published CoP asset (Skills)' },
  { label: 'Q3 2026', contributions: '14', impact: '762', note: '+ Led studio initiative (Leadership)', highlight: true },
];

interface Opportunity {
  tag: string;
  match: string;
  title: string;
  description: string;
  timing: string;
  cta: string;
}

const OPPORTUNITIES: Opportunity[] = [
  {
    tag: 'Skills',
    match: '94% match',
    title: 'Design Community of Practice Contributor',
    description:
      'Publish a reusable asset or point-of-view in your CoP — deepens your T-shape Skills dimension.',
    timing: 'Rolling admissions',
    cta: 'Join CoP',
  },
  {
    tag: 'Behaviors',
    match: '88% match',
    title: 'India iX Studio Ambassador',
    description:
      'Represent the studio at an IBM initiative — internal or external — to strengthen your Behaviors dimension.',
    timing: 'Aug 15, 2026',
    cta: 'Submit Proposal',
  },
  {
    tag: 'Leadership',
    match: '91% match',
    title: 'Studio Initiative Lead',
    description:
      'Lead a studio initiative that drives strategic client & IBM outcomes — strengthens your Leadership dimension, your biggest readiness gap.',
    timing: 'Starts Sep 2026',
    cta: 'Express Interest',
  },
];

// Tag colour per iX dimension (matches the rest of the app).
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

interface FocusArea {
  label: string;
  gap: number;
  score: number; // current, out of the 85 Band 8 threshold
  action: string;
}

const FOCUS_AREAS: FocusArea[] = [
  {
    label: 'Leadership',
    gap: 15,
    score: 70,
    action: 'Lead a studio initiative that drives strategic client & IBM outcomes',
  },
  {
    label: 'Behaviors',
    gap: 3,
    score: 82,
    action: 'Contribute to a CoP initiative and represent the studio at an IBM event',
  },
];

// Sample Skills Data for UX Designer
const SKILL_CATEGORIES: SkillCategory[] = [
  {
    name: 'UX Design (Core)',
    percentage: 45,
    color: '#0f62fe',
    skills: ['User Research', 'Wireframing', 'Prototyping', 'Usability Testing', 'Information Architecture'],
  },
  {
    name: 'Visual Design',
    percentage: 20,
    color: '#8a3ffc',
    skills: ['UI Design', 'Typography', 'Color Theory', 'Design Systems'],
  },
  {
    name: 'Service Design',
    percentage: 15,
    color: '#0072c3',
    skills: ['Journey Mapping', 'Service Blueprints', 'Stakeholder Management'],
  },
  {
    name: 'Motion Graphics',
    percentage: 10,
    color: '#fa4d56',
    skills: ['Animation', 'Micro-interactions', 'After Effects'],
  },
  {
    name: 'Management',
    percentage: 10,
    color: '#198038',
    skills: ['Team Leadership', 'Project Management', 'Mentoring'],
  },
];

// Industry Badge Progress Data
const INDUSTRY_BADGES: IndustryBadge[] = [
  {
    industry: 'Banking',
    currentLevel: 'Bronze',
    progress: 60,
    targetLevel: 'Silver',
    description: 'Financial services expertise for banking sector projects',
  },
  {
    industry: 'Healthcare',
    currentLevel: 'Jumpstart',
    progress: 25,
    targetLevel: 'Bronze',
    description: 'Healthcare industry knowledge and compliance understanding',
  },
  {
    industry: 'Manufacturing',
    currentLevel: 'Jumpstart',
    progress: 15,
    targetLevel: 'Bronze',
    description: 'Manufacturing processes and Industry 4.0 concepts',
  },
];

// UX Design Core Courses
const UX_CORE_COURSES: Course[] = [
  {
    id: 'ux-1',
    title: 'User Research Fundamentals',
    description: 'Learn qualitative and quantitative research methods, user interviews, and data analysis.',
    duration: '3 weeks',
    level: 'Beginner',
    provider: 'IBM Skills',
    url: 'https://yourlearning.ibm.com/activity/PLAN-12345',
    completed: true,
    completedDate: 'May 15, 2026',
  },
  {
    id: 'ux-2',
    title: 'Advanced Prototyping with Figma',
    description: 'Master interactive prototyping, component libraries, and design systems in Figma.',
    duration: '2 weeks',
    level: 'Intermediate',
    provider: 'IBM Skills',
    url: 'https://yourlearning.ibm.com/activity/PLAN-12346',
    completed: true,
    completedDate: 'Jun 10, 2026',
  },
  {
    id: 'ux-3',
    title: 'Usability Testing & Analysis',
    description: 'Conduct effective usability tests, analyze results, and present actionable insights.',
    duration: '2 weeks',
    level: 'Intermediate',
    provider: 'IBM Skills',
    url: 'https://yourlearning.ibm.com/activity/PLAN-12347',
    completed: false,
    progress: 45,
  },
  {
    id: 'ux-4',
    title: 'Information Architecture',
    description: 'Design intuitive navigation systems, taxonomies, and content structures.',
    duration: '3 weeks',
    level: 'Advanced',
    provider: 'IBM Skills',
    url: 'https://yourlearning.ibm.com/activity/PLAN-12348',
    completed: false,
    progress: 0,
  },
];

// Service Design Courses
const SERVICE_DESIGN_COURSES: Course[] = [
  {
    id: 'sd-1',
    title: 'Introduction to Service Design',
    description: 'Understand service design principles, tools, and methodologies.',
    duration: '2 weeks',
    level: 'Beginner',
    provider: 'IBM Skills',
    url: 'https://yourlearning.ibm.com/activity/PLAN-12349',
    completed: true,
    completedDate: 'Jul 5, 2026',
  },
  {
    id: 'sd-2',
    title: 'Journey Mapping Workshop',
    description: 'Create comprehensive customer journey maps and identify pain points.',
    duration: '1 week',
    level: 'Intermediate',
    provider: 'IBM Skills',
    url: 'https://yourlearning.ibm.com/activity/PLAN-12350',
    completed: false,
    progress: 20,
  },
  {
    id: 'sd-3',
    title: 'Service Blueprinting',
    description: 'Design service blueprints that map frontstage and backstage processes.',
    duration: '2 weeks',
    level: 'Intermediate',
    provider: 'IBM Skills',
    url: 'https://yourlearning.ibm.com/activity/PLAN-12351',
    completed: false,
    progress: 60,
  },
];

// Visual Design Courses
const VISUAL_DESIGN_COURSES: Course[] = [
  {
    id: 'vd-1',
    title: 'UI Design Principles',
    description: 'Master layout, hierarchy, spacing, and visual balance in interface design.',
    duration: '2 weeks',
    level: 'Beginner',
    provider: 'IBM Skills',
    url: 'https://yourlearning.ibm.com/activity/PLAN-12352',
    completed: true,
    completedDate: 'Apr 20, 2026',
  },
  {
    id: 'vd-2',
    title: 'Design Systems & Component Libraries',
    description: 'Build and maintain scalable design systems using Carbon Design System.',
    duration: '3 weeks',
    level: 'Intermediate',
    provider: 'IBM Skills',
    url: 'https://yourlearning.ibm.com/activity/PLAN-12353',
    completed: false,
    progress: 60,
  },
  {
    id: 'vd-3',
    title: 'Accessibility in Design',
    description: 'Design inclusive experiences that meet WCAG 2.1 AA standards.',
    duration: '2 weeks',
    level: 'Intermediate',
    provider: 'IBM Skills',
    url: 'https://yourlearning.ibm.com/activity/PLAN-12354',
    completed: false,
    progress: 0,
  },
];

const CareerRoadmap: React.FC = () => {
  const [toast, setToast] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [yourCareerData, setYourCareerData] = useState<YourCareerSkillsData | null>(null);
  const [isLoadingYC, setIsLoadingYC] = useState(false);
  const [ycError, setYcError] = useState<string | null>(null);
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);
  const [mySkillsData, setMySkillsData] = useState<MySkillsData | null>(null);
  const [isLoadingMySkills, setIsLoadingMySkills] = useState(false);
  const [mySkillsError, setMySkillsError] = useState<string | null>(null);
  const [isYCDataLive, setIsYCDataLive] = useState(false);
  const [isMySkillsLive, setIsMySkillsLive] = useState(false);

  // Fetch YourCareer data on component mount
  useEffect(() => {
    const loadYourCareerData = async () => {
      if (!YC_ENABLED) {
        // Use fallback data when integration is disabled
        const fallbackData = getFallbackYourCareerData();
        setYourCareerData(fallbackData);
        setRecommendedCourses(convertToCourses(fallbackData.recommendations));
        setIsYCDataLive(false);
        return;
      }

      setIsLoadingYC(true);
      setYcError(null);

      try {
        // Use a default employee ID for demo purposes
        // In production, this would come from user context/auth
        const data = await fetchYourCareerSkills('0026EM744');
        setYourCareerData(data);
        setRecommendedCourses(convertToCourses(data.recommendations));
        setIsYCDataLive(true);
      } catch (error) {
        console.error('Failed to fetch YourCareer data:', error);
        setYcError('Unable to load skill recommendations. Using fallback data.');
        // Fall back to static data on error
        const fallbackData = getFallbackYourCareerData();
        setYourCareerData(fallbackData);
        setRecommendedCourses(convertToCourses(fallbackData.recommendations));
        setIsYCDataLive(false);
      } finally {
        setIsLoadingYC(false);
      }
    };

    loadYourCareerData();
  }, []);

  // Fetch My Skills data on component mount
  useEffect(() => {
    const loadMySkills = async () => {
      if (!YC_ENABLED) {
        // Use fallback data when integration is disabled
        const fallbackData = getFallbackMySkills();
        setMySkillsData(fallbackData);
        setIsMySkillsLive(false);
        return;
      }

      setIsLoadingMySkills(true);
      setMySkillsError(null);

      try {
        const data = await fetchMySkills('0026EM744');
        setMySkillsData(data);
        setIsMySkillsLive(true);
      } catch (error) {
        console.error('Failed to fetch My Skills data:', error);
        setMySkillsError('Unable to load skill proficiency data. Using fallback data.');
        const fallbackData = getFallbackMySkills();
        setMySkillsData(fallbackData);
        setIsMySkillsLive(false);
      } finally {
        setIsLoadingMySkills(false);
      }
    };

    loadMySkills();
  }, []);

  const handleCourseClick = (course: Course) => {
    window.open(course.url, '_blank');
    setToast(`Opening "${course.title}" in IBM MyLearning...`);
  };

  const handleRefreshYC = async () => {
    if (!YC_ENABLED) return;
    
    setIsLoadingYC(true);
    setYcError(null);

    try {
      const data = await fetchYourCareerSkills('0026EM744');
      setYourCareerData(data);
      setRecommendedCourses(convertToCourses(data.recommendations));
      setIsYCDataLive(true);
      setToast('YourCareer recommendations refreshed successfully');
    } catch (error) {
      setYcError('Failed to refresh recommendations');
      setIsYCDataLive(false);
    } finally {
      setIsLoadingYC(false);
    }
  };

  const handleRefreshMySkills = async () => {
    if (!YC_ENABLED) return;
    
    setIsLoadingMySkills(true);
    setMySkillsError(null);

    try {
      const data = await fetchMySkills('0026EM744');
      setMySkillsData(data);
      setIsMySkillsLive(true);
      setToast('My Skills data refreshed successfully');
    } catch (error) {
      setMySkillsError('Failed to refresh My Skills data');
      setIsMySkillsLive(false);
    } finally {
      setIsLoadingMySkills(false);
    }
  };

  const handleSkillUpdate = async (skillId: string, newLevel: SkillProficiencyLevel) => {
    if (!mySkillsData) return;

    try {
      // Update locally using the pure function
      const updatedSkills = updateSkillProficiency(mySkillsData.skills, skillId, newLevel);
      setMySkillsData({ ...mySkillsData, skills: updatedSkills });

      // In a real implementation, this would also call the API to persist the change
      // await apiClient.updateSkillProficiency(employeeId, skillId, newLevel);
      
    } catch (error) {
      console.error('Failed to update skill:', error);
      // Revert on error
      handleRefreshMySkills();
    }
  };

  return (
    <div className="career-roadmap">
      {/* Header band */}
      <header className="page-header">
        <div className="page-header__inner">
          <p className="page-header__label">Career Development</p>
          <h1 className="page-header__title">Your Career Roadmap</h1>
          <p className="page-header__subtitle">
            Personalized path based on your evidence trail and performance data.
          </p>
        </div>
      </header>

      <div className="page-body">
        <Tabs selectedIndex={selectedTab} onChange={(e) => setSelectedTab(e.selectedIndex)}>
          <TabList aria-label="Career roadmap sections" contained>
            <Tab>Progression & Opportunities</Tab>
            <Tab>Skills Development</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
        {toast && (
          <InlineNotification
            kind="success"
            lowContrast
            title={toast}
            onClose={() => setToast(null)}
            style={{ maxWidth: '100%', marginBottom: '1rem' }}
          />
        )}
        {/* Intro row — aligned to the content grid so the AI suggestion sits
            directly above the right column (matches Figma). */}
        <div className="career-roadmap__intro">
          <div className="career-roadmap__intro-left">
            <h2 className="career-roadmap__path">
              Your readiness for <strong>Band 8</strong> — Designer, IBM iX India
            </h2>
            <p className="career-roadmap__eta">
              Readiness on track · next review window Q1 2027
            </p>
          </div>
          <Tile className="career-roadmap__nudge">
            <Light size={16} />
            <span>
              Leadership is your biggest readiness gap — leading a studio initiative
              that drives client &amp; IBM outcomes would strengthen it. Promotion
              timing is decided by your manager and IBM policy.
            </span>
          </Tile>
        </div>

        {/* Two aligned columns */}
        <div className="career-roadmap__content">
          {/* Left */}
          <div className="career-roadmap__col">
            {/* Career Progression Section */}
            <div className="career-roadmap__section-group">
              <h4 className="career-roadmap__section-group-title">Career Progression Trend</h4>
              <Tile className="dashboard-card">
                <CareerProgressionChart />
              </Tile>
            </div>

            {/* Quarterly Progression Section */}
            <div className="career-roadmap__section-group">
              <h4 className="career-roadmap__section-group-title">Quarterly Progression</h4>
              <Tile className="dashboard-card">
                <div className="quarterly">
                  {QUARTERS.map((q) => (
                    <Tile
                      key={q.label}
                      className={`quarterly__col${q.highlight ? ' quarterly__col--active' : ''}`}
                    >
                      <p className="quarterly__label">{q.label}</p>
                      <p className="quarterly__value">{q.contributions}</p>
                      <p className="quarterly__unit">contributions</p>
                      <p className="quarterly__value quarterly__value--sm">{q.impact}</p>
                      <p className="quarterly__unit">impact score</p>
                      <p className="quarterly__note">{q.note}</p>
                    </Tile>
                  ))}
                </div>
              </Tile>
            </div>
          </div>

          {/* Right */}
          <div className="career-roadmap__col">
            {/* Growth Opportunities Section */}
            <div className="career-roadmap__section-group">
              <h4 className="career-roadmap__section-group-title">Growth Opportunities</h4>
              <Tile className="dashboard-card">
                <div className="opps__head">
                  <Light size={16} className="opps__icon" />
                  <h3 className="career-roadmap__section-title">Growth Opportunities</h3>
                </div>
                <p className="opps__subtitle">Matched to close your Band 8 gaps</p>

                <div className="opps__list">
                  {OPPORTUNITIES.map((o) => (
                    <Tile key={o.title} className="opp">
                      <div className="opp__top">
                        <Tag type={dimColor(o.tag)} size="sm">
                          {o.tag}
                        </Tag>
                        <span className="opp__match">{o.match}</span>
                      </div>
                      <p className="opp__title">{o.title}</p>
                      <p className="opp__desc">{o.description}</p>
                      <div className="opp__footer">
                        <span className="opp__timing">{o.timing}</span>
                        <Link
                          href="#"
                          renderIcon={ArrowUpRight}
                          size="sm"
                          onClick={(e: React.MouseEvent) => {
                            e.preventDefault();
                            setToast(`${o.cta} — request sent for "${o.title}".`);
                          }}
                        >
                          {o.cta}
                        </Link>
                      </div>
                    </Tile>
                  ))}
                </div>
              </Tile>
            </div>

            {/* Focus Areas Section */}
            <div className="career-roadmap__section-group">
              <h4 className="career-roadmap__section-group-title">Focus Areas for Band 8</h4>
              <Tile className="dashboard-card">
                <div className="focus">
                  {FOCUS_AREAS.map((f) => (
                    <div key={f.label} className="focus__item">
                      <div className="focus__row">
                        <span className="focus__label">{f.label}</span>
                        <span className="focus__gap">Gap: {f.gap}</span>
                      </div>
                      <ProgressBar
                        value={f.score}
                        max={85}
                        label={f.label}
                        hideLabel
                        size="small"
                      />
                      <p className="focus__action">{f.action}</p>
                    </div>
                  ))}
                </div>
              </Tile>
            </div>
          </div>
        </div>
            </TabPanel>

            <TabPanel>
              {/* Skills Development Tab */}
              <div className="career-roadmap__skills-section">
                {/* My Career @ IBM - Two Column Layout */}
                <div className="career-roadmap__section-group">
                  <div className="career-roadmap__two-column">
                    {/* Left Column: Skills I Have */}
                    <Tile className="dashboard-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <h3 className="career-roadmap__section-title" style={{ marginBottom: 0 }}>Skills I Have</h3>
                          <Tag
                            type={isMySkillsLive ? 'green' : 'gray'}
                            size="sm"
                          >
                            {isMySkillsLive ? 'Live' : 'Cached'}
                          </Tag>
                        </div>
                        {YC_ENABLED && (
                          <Link
                            href="#"
                            renderIcon={Renew}
                            size="sm"
                            onClick={(e: React.MouseEvent) => {
                              e.preventDefault();
                              handleRefreshMySkills();
                            }}
                            disabled={isLoadingMySkills}
                          >
                            Refresh
                          </Link>
                        )}
                      </div>
                      {mySkillsData?.lastSynced && (
                        <p style={{ fontSize: '0.875rem', color: '#525252', marginBottom: '1rem' }}>
                          Last synced: {new Date(mySkillsData.lastSynced).toLocaleDateString()}
                        </p>
                      )}
                      {isLoadingMySkills ? (
                        <div style={{ padding: '2rem', textAlign: 'center' }}>
                          <Loading description="Loading your skills..." withOverlay={false} />
                        </div>
                      ) : mySkillsData ? (
                        <MySkills
                          skills={mySkillsData.skills}
                          onSkillUpdate={handleSkillUpdate}
                          onRefresh={handleRefreshMySkills}
                          isLoading={isLoadingMySkills}
                          lastSynced={mySkillsData.lastSynced}
                        />
                      ) : (
                        <p style={{ color: '#525252' }}>No skills data available.</p>
                      )}
                    </Tile>

                    {/* Right Column: Personalized Skill Recommendations */}
                    <Tile className="dashboard-card">
                    {isLoadingYC ? (
                      <div style={{ padding: '2rem', textAlign: 'center' }}>
                        <Loading description="Loading skill recommendations..." withOverlay={false} />
                      </div>
                    ) : (
                      <>
                        <div className="opps__head">
                          <Light size={16} className="opps__icon" />
                          <h3 className="career-roadmap__section-title">
                            Skill Gap Analysis & Growth Opportunities
                          </h3>
                        </div>
                        <p className="career-roadmap__skills-subtitle">
                          Analyze your current skill distribution and discover targeted recommendations to advance your career
                        </p>
                        
                        {/* Skills Portfolio Pie Chart and Accordion */}
                        {mySkillsData && mySkillsData.skills.length > 0 && (
                          <>
                            <SkillsPortfolioPieChart
                              skills={mySkillsData.skills}
                              currentRole="UX Designer"
                            />
                            <SkillCategoriesAccordion skills={mySkillsData.skills} />
                          </>
                        )}
                        
                        {yourCareerData && yourCareerData.recommendations.length > 0 ? (
                          <div className="opps__list" style={{ marginTop: '1rem' }}>
                            {yourCareerData.recommendations.map((rec) => (
                              <Tile key={rec.id} className="opp">
                                <div className="opp__top">
                                  <Tag
                                    type={rec.priority === 'High' ? 'red' : rec.priority === 'Medium' ? 'blue' : 'gray'}
                                    size="sm"
                                  >
                                    {rec.priority} Priority
                                  </Tag>
                                  {rec.estimatedTimeToAcquire && (
                                    <span className="opp__match">{rec.estimatedTimeToAcquire}</span>
                                  )}
                                </div>
                                <p className="opp__title">{rec.skillName}</p>
                                <p className="opp__desc">
                                  {rec.recommendationReason || 'Recommended to enhance your skill portfolio'}
                                </p>
                                {rec.proficiencyLevel && (
                                  <p style={{ fontSize: '0.875rem', color: '#525252', marginTop: '0.5rem' }}>
                                    Current Level: <strong>{rec.proficiencyLevel}</strong>
                                  </p>
                                )}
                                {rec.learningResources && rec.learningResources.length > 0 && (
                                  <div className="opp__footer">
                                    <span className="opp__timing">
                                      {rec.learningResources.length} learning resource{rec.learningResources.length > 1 ? 's' : ''} available
                                    </span>
                                  </div>
                                )}
                              </Tile>
                            ))}
                          </div>
                        ) : (
                          <p style={{ marginTop: '1rem', color: '#525252' }}>
                            No skill recommendations available at this time.
                          </p>
                        )}
                      </>
                    )}
                    </Tile>
                  </div>
                </div>

                {/* Section 1: Industry Badge Progression */}
                <div className="career-roadmap__section-group">
                  <h4 className="career-roadmap__section-group-title">Industry Badge Progression</h4>
                  <Tile className="dashboard-card">
                    <p className="career-roadmap__skills-subtitle">
                      Acquire industry-specific badges to demonstrate domain expertise
                    </p>
                    <IndustryBadges badges={INDUSTRY_BADGES} />
                  </Tile>
                </div>

                {/* Section 3: YourCareer Recommended Courses */}
                {recommendedCourses.length > 0 && (
                  <div className="career-roadmap__section-group">
                    <h4 className="career-roadmap__section-group-title">
                      Recommended Learning Paths (YourCareer@IBM)
                    </h4>
                    <Tile className="dashboard-card">
                      <h3 className="career-roadmap__section-title">
                        Personalized Learning Resources
                      </h3>
                      <p className="career-roadmap__skills-subtitle">
                        Curated courses and learning paths based on your skill recommendations
                      </p>
                      <div className="course-grid">
                        {recommendedCourses.slice(0, 6).map((course) => (
                          <CourseCard
                            key={course.id}
                            course={course}
                            onCourseClick={handleCourseClick}
                          />
                        ))}
                      </div>
                    </Tile>
                  </div>
                )}

                {/* Section 4: Core Skills */}
                <div className="career-roadmap__section-group">
                  <h4 className="career-roadmap__section-group-title">Core Skills</h4>
                  <Tile className="dashboard-card">
                    <h3 className="career-roadmap__section-title">Core Skills: UX Design</h3>
                    <p className="career-roadmap__skills-subtitle">
                      Master your primary discipline with these foundational courses
                    </p>
                    <div className="course-grid">
                      {UX_CORE_COURSES.map((course) => (
                        <CourseCard
                          key={course.id}
                          course={course}
                          onCourseClick={handleCourseClick}
                        />
                      ))}
                    </div>
                  </Tile>
                </div>

                {/* Section 5 & 6: Parallel Skills */}
                <div className="career-roadmap__section-group">
                  <h4 className="career-roadmap__section-group-title">Parallel Skills</h4>
                  
                  {/* Service Design */}
                  <Tile className="dashboard-card">
                    <h3 className="career-roadmap__section-title">Parallel Skills: Service Design</h3>
                    <p className="career-roadmap__skills-subtitle">
                      Expand your T-shape with service design capabilities
                    </p>
                    <div className="course-grid">
                      {SERVICE_DESIGN_COURSES.map((course) => (
                        <CourseCard
                          key={course.id}
                          course={course}
                          onCourseClick={handleCourseClick}
                        />
                      ))}
                    </div>
                  </Tile>

                  {/* Visual Design */}
                  <Tile className="dashboard-card">
                    <h3 className="career-roadmap__section-title">Parallel Skills: Visual Design</h3>
                    <p className="career-roadmap__skills-subtitle">
                      Strengthen your visual design capabilities for polished interfaces
                    </p>
                    <div className="course-grid">
                      {VISUAL_DESIGN_COURSES.map((course) => (
                        <CourseCard
                          key={course.id}
                          course={course}
                          onCourseClick={handleCourseClick}
                        />
                      ))}
                    </div>
                  </Tile>
                </div>
              </div>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </div>
    </div>
  );
};

export default CareerRoadmap;

// Made with Bob
