import React from 'react';
import { Tile, Tag, ProgressBar } from '@carbon/react';
import { Checkmark } from '@carbon/icons-react';
import { BadgeLevel, IndustryBadge } from '../../types';
import './IndustryBadges.scss';

interface IndustryBadgesProps {
  badges: IndustryBadge[];
}

const BADGE_COLORS: Record<BadgeLevel, string> = {
  Jumpstart: '#8a3ffc',
  Bronze: '#cd7f32',
  Silver: '#c0c0c0',
  Gold: '#ffd700',
  Platinum: '#e5e4e2',
};

const IndustryBadges: React.FC<IndustryBadgesProps> = ({ badges }) => {
  const getBadgeProgress = (currentLevel: BadgeLevel, targetLevel: BadgeLevel) => {
    const levels: BadgeLevel[] = ['Jumpstart', 'Bronze', 'Silver', 'Gold', 'Platinum'];
    const currentIndex = levels.indexOf(currentLevel);
    const targetIndex = levels.indexOf(targetLevel);

    return levels.slice(0, targetIndex + 1).map((level, idx) => ({
      level,
      completed: idx <= currentIndex,
    }));
  };

  return (
    <div className="industry-badges">
      <div className="industry-badges__header">
        <h3 className="industry-badges__title">Industry Badge Progression</h3>
        <p className="industry-badges__subtitle">
          Acquire industry-specific badges to demonstrate domain expertise
        </p>
      </div>

      <div className="industry-badges__grid">
        {badges.map((badge) => (
          <Tile key={badge.industry} className="industry-badge-card">
            <div className="industry-badge-card__header">
              <h4 className="industry-badge-card__industry">{badge.industry} Industry</h4>
              <Tag type="blue" size="sm">
                {badge.progress}% Complete
              </Tag>
            </div>
            <p className="industry-badge-card__description">{badge.description}</p>

            <div className="industry-badge-card__progression">
              <div className="badge-track">
                {getBadgeProgress(badge.currentLevel, badge.targetLevel).map((item, idx, arr) => (
                  <React.Fragment key={item.level}>
                    <div className={`badge-node ${item.completed ? 'badge-node--completed' : ''}`}>
                      <div
                        className="badge-node__icon"
                        style={{
                          backgroundColor: item.completed ? BADGE_COLORS[item.level] : '#e0e0e0',
                        }}
                      >
                        {item.completed && <Checkmark size={16} />}
                      </div>
                      <span className="badge-node__label">{item.level}</span>
                    </div>
                    {idx < arr.length - 1 && (
                      <div className={`badge-connector ${item.completed ? 'badge-connector--completed' : ''}`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="industry-badge-card__status">
              <span>Current: <strong>{badge.currentLevel}</strong></span>
              <span>Target: <strong>{badge.targetLevel}</strong></span>
            </div>

            <ProgressBar
              value={badge.progress}
              max={100}
              label="Progress"
              hideLabel
              size="small"
            />
          </Tile>
        ))}
      </div>
    </div>
  );
};

export default IndustryBadges;

// Made with Bob