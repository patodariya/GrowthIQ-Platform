import React from 'react';
import { Tag } from '@carbon/react';
import { Education, Certificate, Badge, Time } from '@carbon/icons-react';
import { LearningSummary, THINK40_GOAL_HOURS } from '../../services/yourLearning';
import './LearningCard.scss';

interface LearningCardProps {
  data: LearningSummary;
  live: boolean; // true = pulled live from YourLearning this session
}

const LearningCard: React.FC<LearningCardProps> = ({ data, live }) => {
  const goalPct = Math.min(
    100,
    Math.round((data.completionHoursThisYear / THINK40_GOAL_HOURS) * 100)
  );
  const goalMet = data.completionHoursThisYear >= THINK40_GOAL_HOURS;

  const stats = [
    {
      icon: <Time size={16} />,
      value: `${data.completionHoursThisYear}h`,
      label: 'Hours this year',
      sub: `${data.completionHoursLastYear}h last year`,
    },
    {
      icon: <Badge size={16} />,
      value: data.badgesThisYear,
      label: 'Badges earned this year',
      sub: `${data.badgesTotal} total`,
    },
    {
      icon: <Certificate size={16} />,
      value: data.credentialsCompleted,
      label: 'Digital credentials',
      sub: 'completed',
    },
    {
      icon: <Education size={16} />,
      value: data.completions,
      label: 'Courses completed',
      sub: `${data.queue} in your queue`,
    },
  ];

  return (
    <div className="learning-card">
      <div className="learning-card__header">
        <div>
          <h3 className="learning-card__title">
            <Education size={18} /> IBM Learning
          </h3>
          <p className="learning-card__source">
            yourlearning.ibm.com · {live ? 'synced live' : 'last synced'}
          </p>
        </div>
        <Tag type={live ? 'green' : 'gray'} size="sm">
          {live ? 'Live' : 'Cached'}
        </Tag>
      </div>

      {/* Think40 progress */}
      <div className="learning-card__think40">
        <div className="learning-card__think40-top">
          <span>
            Think40 goal{data.think40Level ? ` · Level ${data.think40Level}` : ''}
          </span>
          <strong>
            {data.completionHoursThisYear} / {THINK40_GOAL_HOURS}h
            {goalMet && <span className="learning-card__met"> · Goal met 🎉</span>}
          </strong>
        </div>
        <div className="learning-card__bar">
          <div
            className={`learning-card__bar-fill${goalMet ? ' is-met' : ''}`}
            style={{ width: `${goalPct}%` }}
          />
        </div>
      </div>

      <div className="learning-card__stats">
        {stats.map((s) => (
          <div key={s.label} className="learning-stat">
            <span className="learning-stat__icon">{s.icon}</span>
            <div className="learning-stat__body">
              <span className="learning-stat__value">{s.value}</span>
              <span className="learning-stat__label">{s.label}</span>
              <span className="learning-stat__sub">{s.sub}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LearningCard;

// Made with Bob
