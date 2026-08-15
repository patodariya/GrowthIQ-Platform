import React from 'react';
import { Accordion, AccordionItem, Tag } from '@carbon/react';
import { SkillProficiency } from '../../types';
import './SkillCategoriesAccordion.scss';

interface SkillCategoryData {
  name: string;
  percentage: number;
  color: string;
  skills: string[];
}

interface SkillCategoriesAccordionProps {
  skills: SkillProficiency[];
}

// Skill category mapping - maps individual skills to broader categories
const SKILL_CATEGORY_MAP: Record<string, { keywords: string[]; color: string }> = {
  'UX Design (Core)': {
    keywords: ['user experience', 'ux', 'ux designer', 'user research', 'usability', 'user testing',
      'wireframing', 'prototyping', 'user journey', 'persona', 'information architecture'],
    color: '#0f62fe' // blue
  },
  'Visual Design': {
    keywords: ['visual design', 'ui design', 'graphic design', 'typography', 'color theory',
      'layout', 'branding', 'illustration', 'iconography', 'design systems'],
    color: '#8a3ffc' // purple
  },
  'Service Design': {
    keywords: ['service design', 'journey mapping', 'service blueprints', 'stakeholder management',
      'customer experience', 'touchpoints'],
    color: '#0f62fe' // blue
  },
  'Motion Graphics': {
    keywords: ['motion graphics', 'animation', 'micro-interactions', 'motion design',
      'transitions', 'gestures', 'after effects'],
    color: '#da1e28' // red
  },
  'Management': {
    keywords: ['management', 'leadership', 'team management', 'mentoring', 'coaching', 'strategic thinking',
      'decision making', 'conflict resolution', 'project management'],
    color: '#198038' // green
  },
};

const SkillCategoriesAccordion: React.FC<SkillCategoriesAccordionProps> = ({ skills }) => {
  // Aggregate skills into categories
  const aggregateSkills = (): SkillCategoryData[] => {
    const categoryData: Record<string, { total: number; count: number; skills: string[] }> = {};
    
    // Initialize categories
    Object.keys(SKILL_CATEGORY_MAP).forEach(category => {
      categoryData[category] = { total: 0, count: 0, skills: [] };
    });
    
    // Map individual skills to categories
    skills.forEach(skill => {
      const skillNameLower = skill.skillName.toLowerCase();
      
      // Check which category this skill belongs to
      for (const [category, config] of Object.entries(SKILL_CATEGORY_MAP)) {
        if (config.keywords.some(keyword => skillNameLower.includes(keyword))) {
          categoryData[category].total += skill.proficiencyLevel;
          categoryData[category].count += 1;
          categoryData[category].skills.push(skill.skillName);
          break; // Only assign to first matching category
        }
      }
    });
    
    // Calculate total proficiency across all categories
    const totalProficiency = Object.values(categoryData).reduce((sum, data) => sum + data.total, 0);
    
    // Create category data with percentages
    const categories: SkillCategoryData[] = [];
    
    Object.entries(categoryData).forEach(([category, data]) => {
      if (data.count > 0) {
        const percentage = totalProficiency > 0 
          ? Math.round((data.total / totalProficiency) * 100)
          : 0;
        
        categories.push({
          name: category,
          percentage,
          color: SKILL_CATEGORY_MAP[category].color,
          skills: data.skills,
        });
      }
    });
    
    // Sort by percentage descending
    return categories.sort((a, b) => b.percentage - a.percentage);
  };

  const categories = aggregateSkills();

  if (categories.length === 0) {
    return (
      <p style={{ color: '#525252', padding: '1rem' }}>
        No skill categories available.
      </p>
    );
  }

  return (
    <div className="skill-categories-accordion">
      <Accordion>
        {categories.map((category, index) => (
          <AccordionItem
            key={category.name}
            title={
              <div className="skill-category-header">
                <div className="skill-category-header__left">
                  <div 
                    className="skill-category-color-dot" 
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="skill-category-name">{category.name}</span>
                </div>
                <span className="skill-category-percentage">{category.percentage}%</span>
              </div>
            }
            open={index === 0} // First item open by default
          >
            <div className="skill-category-content">
              {category.skills.map((skill, idx) => (
                <Tag
                  key={idx}
                  type="gray"
                  size="sm"
                  className="skill-tag"
                >
                  {skill}
                </Tag>
              ))}
            </div>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default SkillCategoriesAccordion;

// Made with Bob
