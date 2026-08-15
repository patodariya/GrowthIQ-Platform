import React, { useState } from 'react';
import { Tile, Tag, ProgressBar, Button, Accordion, AccordionItem } from '@carbon/react';
import { Checkmark, Launch, Book } from '@carbon/icons-react';
import { SkillPath, BadgeLevel, Course } from '../../types';
import './SkillPathCard.scss';

interface SkillPathCardProps {
  skillPath: SkillPath;
  onCourseClick: (course: Course) => void;
}

const BADGE_COLORS: Record<BadgeLevel, string> = {
  Jumpstart: '#8a3ffc',
  Bronze: '#cd7f32',
  Silver: '#c0c0c0',
  Gold: '#ffd700',
  Platinum: '#e5e4e2',
};

const SkillPathCard: React.FC<SkillPathCardProps> = ({ skillPath, onCourseClick }) => {
  const [expanded, setExpanded] = useState(false);

  const completedCourses = skillPath.courses.filter((c) => c.completed).length;
  const totalCourses = skillPath.courses.length;

  const getBadgeProgress = () => {
    const levels: BadgeLevel[] = ['Jumpstart', 'Bronze', 'Silver', 'Gold', 'Platinum'];
    const currentIndex = levels.indexOf(skillPath.currentLevel);
    const targetIndex = levels.indexOf(skillPath.targetLevel);

    return levels.slice(0, targetIndex + 1).map((level, idx) => ({
      level,
      completed: idx <= currentIndex,
      coursesRequired: Math.ceil((totalCourses / (targetIndex + 1)) * (idx + 1)),
      coursesCompleted: idx <= currentIndex ? Math.ceil((totalCourses / (targetIndex + 1)) * (idx + 1)) : completedCourses,
    }));
  };

  return (
    <Tile className="skill-path-card">
      <div className="skill-path-card__header">
        <div className="skill-path-card__title-row">
          <h4 className="skill-path-card__title">{skillPath.name}</h4>
          <Tag
            type={skillPath.category === 'Core' ? 'purple' : 'cyan'}
            size="sm"
          >
            {skillPath.category}
          </Tag>
        </div>
        <p className="skill-path-card__description">{skillPath.description}</p>
        <div className="skill-path-card__meta">
          <span className="skill-path-card__match">{skillPath.relevance}% match</span>
          <span className="skill-path-card__time">
            <Book size={16} />
            {skillPath.estimatedTime}
          </span>
        </div>
      </div>

      <div className="skill-path-card__progress">
        <div className="skill-path-card__progress-header">
          <span className="skill-path-card__progress-label">Overall Progress</span>
          <span className="skill-path-card__progress-value">
            {completedCourses}/{totalCourses} courses · {skillPath.overallProgress}%
          </span>
        </div>
        <ProgressBar
          value={skillPath.overallProgress}
          max={100}
          label="Progress"
          hideLabel
          size="small"
        />
      </div>

      <div className="skill-path-card__badges">
        <p className="skill-path-card__badges-title">Industry Badge Progress</p>
        <div className="skill-path-card__badges-track">
          {getBadgeProgress().map((badge, idx) => (
            <div
              key={badge.level}
              className={`badge-step ${badge.completed ? 'badge-step--completed' : ''}`}
            >
              <div
                className="badge-step__icon"
                style={{
                  backgroundColor: badge.completed ? BADGE_COLORS[badge.level] : '#e0e0e0',
                }}
              >
                {badge.completed && <Checkmark size={16} />}
              </div>
              <span className="badge-step__label">{badge.level}</span>
              {idx < getBadgeProgress().length - 1 && (
                <div className={`badge-step__line ${badge.completed ? 'badge-step__line--completed' : ''}`} />
              )}
            </div>
          ))}
        </div>
        <p className="skill-path-card__badges-status">
          Current: <strong>{skillPath.currentLevel}</strong> → Target: <strong>{skillPath.targetLevel}</strong>
        </p>
      </div>

      <Accordion>
        <AccordionItem
          title={`View ${totalCourses} Courses`}
          open={expanded}
          onHeadingClick={() => setExpanded(!expanded)}
        >
          <div className="skill-path-card__courses">
            {skillPath.courses.map((course) => (
              <div
                key={course.id}
                className={`course-item ${course.completed ? 'course-item--completed' : ''}`}
              >
                <div className="course-item__header">
                  <div className="course-item__title-row">
                    {course.completed && (
                      <Checkmark size={16} className="course-item__check" />
                    )}
                    <h5 className="course-item__title">{course.title}</h5>
                  </div>
                  <Tag type={course.level === 'Beginner' ? 'green' : course.level === 'Intermediate' ? 'blue' : 'red'} size="sm">
                    {course.level}
                  </Tag>
                </div>
                <p className="course-item__description">{course.description}</p>
                <div className="course-item__meta">
                  <span className="course-item__duration">{course.duration}</span>
                  <span className="course-item__provider">{course.provider}</span>
                </div>
                {course.progress !== undefined && !course.completed && (
                  <div className="course-item__progress">
                    <ProgressBar
                      value={course.progress}
                      max={100}
                      label="Course progress"
                      hideLabel
                      size="small"
                    />
                    <span className="course-item__progress-text">{course.progress}% complete</span>
                  </div>
                )}
                {course.completed && course.completedDate && (
                  <p className="course-item__completed">
                    Completed on {course.completedDate}
                  </p>
                )}
                <Button
                  kind={course.completed ? 'tertiary' : 'primary'}
                  size="sm"
                  renderIcon={Launch}
                  onClick={() => onCourseClick(course)}
                >
                  {course.completed ? 'Review Course' : 'Start Learning'}
                </Button>
              </div>
            ))}
          </div>
        </AccordionItem>
      </Accordion>
    </Tile>
  );
};

export default SkillPathCard;

// Made with Bob