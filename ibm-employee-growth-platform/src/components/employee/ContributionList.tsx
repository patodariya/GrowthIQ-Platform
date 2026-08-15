import React from 'react';
import { Tag, Link } from '@carbon/react';
import { Checkmark } from '@carbon/icons-react';
import { Contribution } from '../../types';
import './ContributionList.scss';

interface ContributionListProps {
  contributions: Contribution[];
  showAll?: boolean;
}

const ContributionList: React.FC<ContributionListProps> = ({ 
  contributions, 
  showAll = false 
}) => {
  const displayedContributions = showAll ? contributions : contributions.slice(0, 3);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'Critical Impact':
        return 'red';
      case 'High Impact':
        return 'purple';
      case 'Medium Impact':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
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

  return (
    <div className="contribution-list">
      <div className="contribution-list__header">
        <h3>Recent Contributions</h3>
        {!showAll && (
          <Link href="/contributions" size="sm">
            View all →
          </Link>
        )}
      </div>
      
      <div className="contribution-list__items">
        {displayedContributions.map((contribution) => (
          <div key={contribution.id} className="contribution-item">
            <div className="contribution-item__indicator" />
            
            <div className="contribution-item__content">
              <div className="contribution-item__header">
                <p className="contribution-item__title">{contribution.title}</p>
                {contribution.verified && (
                  <div className="contribution-item__verified">
                    <Checkmark size={16} />
                    <span>Verified</span>
                  </div>
                )}
              </div>
              
              <div className="contribution-item__meta">
                <Tag type={getCategoryColor(contribution.category)} size="sm">
                  {contribution.category}
                </Tag>
                <Tag type={getImpactColor(contribution.impact)} size="sm">
                  {contribution.impact}
                </Tag>
                <span className="contribution-item__date">{contribution.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContributionList;

// Made with Bob
