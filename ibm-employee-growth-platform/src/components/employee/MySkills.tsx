import React, { useState } from 'react';
import { SkillProficiency, SkillProficiencyLevel, SKILL_PROFICIENCY_LABELS } from '../../types';
import './MySkills.scss';

interface MySkillsProps {
  skills: SkillProficiency[];
  onSkillUpdate: (skillId: string, newLevel: SkillProficiencyLevel) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  lastSynced?: string;
}

const MySkills: React.FC<MySkillsProps> = ({
  skills,
  onSkillUpdate,
  onRefresh,
  isLoading = false,
  lastSynced,
}) => {
  const [editingSkills, setEditingSkills] = useState<Record<string, number>>({});

  const handleSliderChange = (skillId: string, value: string) => {
    const numValue = parseInt(value, 10);
    setEditingSkills(prev => ({ ...prev, [skillId]: numValue }));
  };

  const handleSliderRelease = (skillId: string) => {
    const newLevel = editingSkills[skillId];
    if (newLevel !== undefined) {
      onSkillUpdate(skillId, newLevel as SkillProficiencyLevel);
    }
  };

  const getCurrentLevel = (skill: SkillProficiency): number => {
    return editingSkills[skill.id] !== undefined 
      ? editingSkills[skill.id] 
      : skill.proficiencyLevel;
  };

  const getLevelLabel = (level: number): string => {
    return SKILL_PROFICIENCY_LABELS[level as SkillProficiencyLevel];
  };

  return (
    <div className="my-skills">
      <div className="my-skills__list">
        {skills.map((skill) => {
          const currentLevel = getCurrentLevel(skill);
          
          return (
            <div key={skill.id} className="skill-item">
              <div className="skill-item__header">
                <span className="skill-item__name">{skill.skillName}</span>
              </div>
              
              <div className="skill-item__proficiency">
                <div className="skill-item__slider-wrapper">
                  <div className="skill-item__slider-container">
                    <input
                      type="range"
                      min="0"
                      max="5"
                      step="1"
                      value={currentLevel}
                      onChange={(e) => handleSliderChange(skill.id, e.target.value)}
                      onMouseUp={() => handleSliderRelease(skill.id)}
                      onTouchEnd={() => handleSliderRelease(skill.id)}
                      className="skill-item__slider"
                      aria-label={`Proficiency level for ${skill.skillName}`}
                    />
                    <div className="skill-item__scale-labels">
                      <span>0</span>
                      <span>1</span>
                      <span>2</span>
                      <span>3</span>
                      <span>4</span>
                      <span>5</span>
                    </div>
                  </div>
                  <div className="skill-item__level-info">
                    <span className="skill-item__level-number">{currentLevel}</span>
                    <span className="skill-item__level-label">{getLevelLabel(currentLevel)}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MySkills;

// Made with Bob
