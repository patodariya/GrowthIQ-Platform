// Service for YourCareer@IBM API integration
// Fetches skill recommendations and learning resources for employees

import {
  YourCareerSkillsData,
  YourCareerSkillRecommendation,
  Course,
  MySkillsData,
  SkillProficiency,
  SkillProficiencyLevel,
  SKILL_PROFICIENCY_LABELS
} from '../types';

const PROXY_URL = (
  process.env.REACT_APP_ICA_PROXY_URL || 'http://localhost:3001'
).replace(/\/$/, '');

// Opt-in switch for YourCareer integration
export const YC_ENABLED = process.env.REACT_APP_YC_ENABLED === 'true';

// Raw API response shape from YourCareer@IBM
interface RawYourCareerResponse {
  data?: {
    recommendations?: Array<{
      skillId?: string;
      skillName?: string;
      category?: string;
      currentProficiency?: string;
      targetProficiency?: string;
      reason?: string;
      priority?: string;
      estimatedTime?: string;
      learningPaths?: Array<{
        id?: string;
        title?: string;
        type?: string;
        provider?: string;
        url?: string;
        duration?: string;
        level?: string;
        description?: string;
      }>;
    }>;
  };
  metadata?: {
    employeeId?: string;
    lastUpdated?: string;
  };
}

// Ideal skill profile for a well-rounded designer (Pie-shaped/T-shaped)
// Technical Skills removed - only recommended if employee has AI/ML courses
const IDEAL_DESIGNER_PROFILE: Record<string, SkillProficiencyLevel> = {
  'UX Design': 4,           // Expert level expected
  'Visual Design': 3,       // Experienced level expected
  'Interaction Design': 3,  // Experienced level expected
  'Design Systems': 3,      // Experienced level expected
  'Leadership': 3,          // Experienced level expected
  'Collaboration': 4,       // Expert level expected
  'Research & Strategy': 3, // Experienced level expected
};

// Check if employee has AI/ML related skills or courses
function hasAIMLBackground(currentSkills: SkillProficiency[]): boolean {
  const aiKeywords = ['ai', 'artificial intelligence', 'machine learning', 'ml', 'deep learning',
                      'neural network', 'generative ai', 'gen ai', 'llm', 'chatgpt', 'prompt engineering'];
  
  return currentSkills.some(skill => {
    const skillLower = skill.skillName.toLowerCase();
    return aiKeywords.some(keyword => skillLower.includes(keyword));
  });
}

// Generate skill recommendations based on gap analysis
function generateSkillRecommendations(currentSkills: SkillProficiency[]): YourCareerSkillRecommendation[] {
  const recommendations: YourCareerSkillRecommendation[] = [];
  
  // Create a map of current skill levels
  const currentSkillMap = new Map<string, number>();
  currentSkills.forEach(skill => {
    currentSkillMap.set(skill.skillName, skill.proficiencyLevel);
  });
  
  // Compare against ideal profile and generate recommendations
  Object.entries(IDEAL_DESIGNER_PROFILE).forEach(([skillName, targetLevel]) => {
    const currentLevel = currentSkillMap.get(skillName) || 0;
    const gap = targetLevel - currentLevel;
    
    // Only recommend if there's a gap of 1 or more levels
    if (gap >= 1) {
      let priority: 'High' | 'Medium' | 'Low' = 'Medium';
      if (gap >= 2) priority = 'High';
      else if (gap === 1 && targetLevel >= 4) priority = 'High';
      else if (gap === 1 && targetLevel <= 2) priority = 'Low';
      
      recommendations.push({
        id: `rec-${skillName.toLowerCase().replace(/\s+/g, '-')}`,
        skillName,
        skillCategory: 'Design',
        proficiencyLevel: SKILL_PROFICIENCY_LABELS[currentLevel as SkillProficiencyLevel],
        recommendationReason: `Your current level is ${SKILL_PROFICIENCY_LABELS[currentLevel as SkillProficiencyLevel]}. Target level for designers is ${SKILL_PROFICIENCY_LABELS[targetLevel]}.`,
        priority,
        estimatedTimeToAcquire: gap >= 2 ? '3-6 months' : '1-3 months',
        learningResources: [],
      });
    }
  });
  
  // Add AI/ML recommendations only if employee has AI background
  if (hasAIMLBackground(currentSkills)) {
    recommendations.push({
      id: 'rec-ai-code-generation',
      skillName: 'AI Code Generation',
      skillCategory: 'Technical Skills',
      proficiencyLevel: 'No Skill',
      recommendationReason: 'Enhance your design workflow with AI-powered code generation tools. Based on your AI/ML background, this will help you prototype faster.',
      priority: 'Medium',
      estimatedTimeToAcquire: '1-2 months',
      learningResources: [],
    });
    
    recommendations.push({
      id: 'rec-ai-design-tools',
      skillName: 'AI Design Tools',
      skillCategory: 'Technical Skills',
      proficiencyLevel: 'No Skill',
      recommendationReason: 'Learn to leverage AI tools for design automation, image generation, and rapid prototyping.',
      priority: 'Medium',
      estimatedTimeToAcquire: '1-2 months',
      learningResources: [],
    });
  }
  
  // Sort by priority (High > Medium > Low) and then by gap size
  recommendations.sort((a, b) => {
    const priorityOrder: Record<string, number> = { 'High': 0, 'Medium': 1, 'Low': 2 };
    return priorityOrder[a.priority!] - priorityOrder[b.priority!];
  });
  
  return recommendations;
}

// Map raw API response to our internal types
function mapYourCareerResponse(raw: RawYourCareerResponse): YourCareerSkillsData {
  const data = raw.data || {};
  const metadata = raw.metadata || {};
  
  const recommendations: YourCareerSkillRecommendation[] = (data.recommendations || []).map((rec) => ({
    id: rec.skillId || `skill-${Math.random().toString(36).substr(2, 9)}`,
    skillName: rec.skillName || 'Unknown Skill',
    skillCategory: rec.category,
    proficiencyLevel: rec.currentProficiency,
    recommendationReason: rec.reason,
    priority: (rec.priority as 'High' | 'Medium' | 'Low') || 'Medium',
    estimatedTimeToAcquire: rec.estimatedTime,
    learningResources: (rec.learningPaths || []).map((lp) => ({
      id: lp.id || `resource-${Math.random().toString(36).substr(2, 9)}`,
      title: lp.title || 'Untitled Resource',
      type: (lp.type as any) || 'Course',
      provider: lp.provider || 'IBM',
      url: lp.url || '#',
      duration: lp.duration,
      level: (lp.level as any) || 'Intermediate',
      description: lp.description,
    })),
  }));

  return {
    employeeId: metadata.employeeId || 'unknown',
    recommendations,
    lastUpdated: metadata.lastUpdated || new Date().toISOString(),
  };
}

// Convert YourCareer learning resources to Course format for UI compatibility
export function convertToCourses(recommendations: YourCareerSkillRecommendation[]): Course[] {
  const courses: Course[] = [];
  
  recommendations.forEach((rec) => {
    rec.learningResources?.forEach((resource) => {
      courses.push({
        id: resource.id,
        title: resource.title,
        description: resource.description || `Learn ${rec.skillName}`,
        duration: resource.duration || 'Self-paced',
        level: resource.level || 'Intermediate',
        provider: resource.provider,
        url: resource.url,
        completed: false,
        progress: 0,
      });
    });
  });
  
  return courses;
}

// Fetch skill recommendations from YourCareer@IBM API via proxy
// Now generates recommendations based on comparing employee's skills against ideal designer profile
export async function fetchYourCareerSkills(employeeId: string): Promise<YourCareerSkillsData> {
  try {
    // First, fetch the employee's current skills
    const mySkillsData = await fetchMySkills(employeeId);
    
    // Generate recommendations based on skill gaps
    const recommendations = generateSkillRecommendations(mySkillsData.skills);
    
    return {
      employeeId,
      recommendations,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error generating skill recommendations:', error);
    throw error;
  }
}

// Fallback data when API is unavailable or disabled
export function getFallbackYourCareerData(): YourCareerSkillsData {
  return {
    employeeId: 'fallback',
    recommendations: [
      {
        id: 'skill-1',
        skillName: 'Advanced UX Research',
        skillCategory: 'UX Design',
        proficiencyLevel: 'Intermediate',
        recommendationReason: 'Strengthen your research capabilities for senior roles',
        priority: 'High',
        estimatedTimeToAcquire: '3 months',
        learningResources: [
          {
            id: 'res-1',
            title: 'Advanced User Research Methods',
            type: 'Course',
            provider: 'IBM Skills',
            url: 'https://yourlearning.ibm.com',
            duration: '4 weeks',
            level: 'Advanced',
            description: 'Master advanced qualitative and quantitative research techniques',
          },
        ],
      },
      {
        id: 'skill-2',
        skillName: 'Design Systems Architecture',
        skillCategory: 'Visual Design',
        proficiencyLevel: 'Beginner',
        recommendationReason: 'Build scalable design systems for enterprise applications',
        priority: 'Medium',
        estimatedTimeToAcquire: '2 months',
        learningResources: [
          {
            id: 'res-2',
            title: 'Enterprise Design Systems',
            type: 'Learning Path',
            provider: 'IBM Skills',
            url: 'https://yourlearning.ibm.com',
            duration: '6 weeks',
            level: 'Intermediate',
            description: 'Create and maintain design systems at scale',
          },
        ],
      },
    ],
    lastUpdated: new Date().toISOString(),
  };
}

// Skill category mapping - maps individual skills to broader categories
const SKILL_CATEGORY_MAP: Record<string, string[]> = {
  'UX Design': [
    'user experience', 'ux', 'ux designer', 'user research', 'usability', 'user testing',
    'wireframing', 'prototyping', 'user journey', 'persona', 'information architecture'
  ],
  'Visual Design': [
    'visual design', 'ui design', 'graphic design', 'typography', 'color theory',
    'layout', 'branding', 'illustration', 'iconography'
  ],
  'Interaction Design': [
    'interaction design', 'animation', 'micro-interactions', 'motion design',
    'transitions', 'gestures'
  ],
  'Design Systems': [
    'design system', 'design systems', 'component library', 'pattern library', 'style guide',
    'design tokens', 'accessibility'
  ],
  'Leadership': [
    'leadership', 'team management', 'mentoring', 'coaching', 'strategic thinking',
    'decision making', 'conflict resolution'
  ],
  'Collaboration': [
    'collaboration', 'communication', 'stakeholder management', 'presentation',
    'facilitation', 'workshop'
  ],
  'Technical Skills': [
    'html', 'css', 'javascript', 'react', 'figma', 'sketch', 'adobe',
    'front-end', 'responsive design', 'web development'
  ],
  'Research & Strategy': [
    'research', 'research & strategy', 'strategy', 'analysis', 'data', 'insights', 'competitive analysis',
    'market research', 'user insights'
  ],
};

// Aggregate individual skills into broader categories
function aggregateSkills(individualSkills: SkillProficiency[]): SkillProficiency[] {
  const categoryScores: Record<string, { total: number; count: number; skills: string[] }> = {};
  
  // Initialize categories
  Object.keys(SKILL_CATEGORY_MAP).forEach(category => {
    categoryScores[category] = { total: 0, count: 0, skills: [] };
  });
  
  // Map individual skills to categories
  individualSkills.forEach(skill => {
    const skillNameLower = skill.skillName.toLowerCase();
    let matched = false;
    
    // Check which category this skill belongs to
    for (const [category, keywords] of Object.entries(SKILL_CATEGORY_MAP)) {
      if (keywords.some(keyword => skillNameLower.includes(keyword))) {
        categoryScores[category].total += skill.proficiencyLevel;
        categoryScores[category].count += 1;
        categoryScores[category].skills.push(skill.skillName);
        matched = true;
        break; // Only assign to first matching category
      }
    }
  });
  
  // Create aggregated skills with average proficiency
  const aggregatedSkills: SkillProficiency[] = [];
  
  Object.entries(categoryScores).forEach(([category, data]) => {
    if (data.count > 0) {
      const avgLevel = Math.round(data.total / data.count) as SkillProficiencyLevel;
      aggregatedSkills.push({
        id: `agg-${category.toLowerCase().replace(/\s+/g, '-')}`,
        skillName: category,
        category: 'Aggregated Skills',
        proficiencyLevel: avgLevel,
        lastUpdated: new Date().toISOString(),
        source: 'yourcareer',
        specialty: `Based on ${data.count} skill${data.count > 1 ? 's' : ''}: ${data.skills.slice(0, 3).join(', ')}${data.skills.length > 3 ? '...' : ''}`,
      });
    }
  });
  
  return aggregatedSkills;
}

// Fetch skill proficiency data from YourCareer@IBM API via proxy
export async function fetchMySkills(employeeId: string): Promise<MySkillsData> {
  try {
    const res = await fetch(`${PROXY_URL}/api/yourcareer/myskills/${employeeId}`);
    
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new Error(`YourCareer proxy ${res.status}: ${detail}`);
    }
    
    const raw = (await res.json()) as any;
    
    // Collect all individual skills first
    const individualSkills: SkillProficiency[] = [];
    
    // Use actual API field names from discreteSkills endpoint
    // API returns: { data: [ { skillId, skillName, assessedLevel, inferredLevel, ... } ] }
    if (raw.data && Array.isArray(raw.data)) {
      raw.data.forEach((skill: any) => {
        // Only include skills that are relevant to the employee's job role
        const isRelevantToRole = skill.isCore || skill.isCurrent;
        
        if (skill.skillName && isRelevantToRole) {
          individualSkills.push({
            id: skill.skillId || `skill-${Math.random().toString(36).substr(2, 9)}`,
            skillName: skill.skillName,
            category: skill.isCore ? 'Core Skills' : skill.isCurrent ? 'Current Skills' : 'General',
            proficiencyLevel: mapProficiencyLevel(skill.assessedLevel || skill.inferredLevel || 0),
            lastUpdated: skill.lastAssessedDate || skill.lastUpdateDate || new Date().toISOString(),
            source: 'yourcareer',
            specialty: skill.skillDescription,
            assessmentLevel: skill.assessmentState,
          });
        }
      });
    }
    
    // Aggregate individual skills into broader categories
    const aggregatedSkills = aggregateSkills(individualSkills);
    
    return {
      employeeId,
      skills: aggregatedSkills,
      lastSynced: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching My Skills data:', error);
    throw error;
  }
}

// Map various proficiency level formats to our 0-5 scale
function mapProficiencyLevel(level: any): SkillProficiencyLevel {
  if (typeof level === 'number') {
    return Math.min(5, Math.max(0, Math.round(level))) as SkillProficiencyLevel;
  }
  
  const levelStr = String(level).toLowerCase();
  
  // Map common proficiency level names to 0-5 scale
  const levelMap: Record<string, SkillProficiencyLevel> = {
    'none': 0,
    'no skill': 0,
    'entry': 1,
    'beginner': 1,
    'foundation': 2,
    'intermediate': 2,
    'experienced': 3,
    'advanced': 3,
    'expert': 4,
    'proficient': 4,
    'thought leader': 5,
    'master': 5,
  };
  
  return levelMap[levelStr] || 2; // Default to Foundation
}

// Fallback data when API is unavailable or disabled
export function getFallbackMySkills(): MySkillsData {
  return {
    employeeId: 'fallback',
    skills: [
      {
        id: 'skill-1',
        skillName: 'UX Design',
        category: 'Design',
        proficiencyLevel: 3,
        lastUpdated: new Date().toISOString(),
        source: 'yourcareer',
      },
      {
        id: 'skill-2',
        skillName: 'User Research',
        category: 'Research',
        proficiencyLevel: 3,
        lastUpdated: new Date().toISOString(),
        source: 'yourcareer',
      },
      {
        id: 'skill-3',
        skillName: 'Prototyping',
        category: 'Design',
        proficiencyLevel: 4,
        lastUpdated: new Date().toISOString(),
        source: 'yourcareer',
      },
      {
        id: 'skill-4',
        skillName: 'Visual Design',
        category: 'Design',
        proficiencyLevel: 2,
        lastUpdated: new Date().toISOString(),
        source: 'yourcareer',
      },
      {
        id: 'skill-5',
        skillName: 'Service Design',
        category: 'Design',
        proficiencyLevel: 2,
        lastUpdated: new Date().toISOString(),
        source: 'yourcareer',
      },
      {
        id: 'skill-6',
        skillName: 'Design Systems',
        category: 'Design',
        proficiencyLevel: 3,
        lastUpdated: new Date().toISOString(),
        source: 'yourcareer',
      },
    ],
    lastSynced: new Date().toISOString(),
  };
}

// Update skill proficiency level (local state management)
export function updateSkillProficiency(
  skills: SkillProficiency[],
  skillId: string,
  newLevel: SkillProficiencyLevel
): SkillProficiency[] {
  return skills.map((skill) =>
    skill.id === skillId
      ? { ...skill, proficiencyLevel: newLevel, source: 'manual' as const, lastUpdated: new Date().toISOString() }
      : skill
  );
}

// Made with Bob