import React from 'react';
import { BiWActivity } from '../../services/biw';
import './RecognitionCard.scss';

const BIW_URL = 'https://thanksibm.recognition-now.io/';

interface RecognitionCardProps {
  activities: BiWActivity[];
  loading?: boolean;
}

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  'Recognition Received': { bg: '#d9fbde', color: '#0e6027' },
  'Points Deposited':     { bg: '#edf5ff', color: '#0043ce' },
};

const RecognitionCard: React.FC<RecognitionCardProps> = ({ activities, loading }) => {
  // Show at most 4 items; remaining are accessible via "View all"
  const visible = activities.slice(0, 4);

  // Calculate total points from visible recognition items (not points deposits)
  const recognitionPoints = visible
    .filter((a) => a.type === 'Recognition Received')
    .reduce((sum, a) => sum + (a.points ?? 0), 0);

  const pointsDeposited = visible
    .filter((a) => a.type === 'Points Deposited')
    .reduce((sum, a) => sum + (a.points ?? 0), 0);

  const totalPoints = recognitionPoints + pointsDeposited;
  const hasMore = activities.length > 4;

  return (
    <div className="recognition-card">
      <div className="recognition-card__head">
        <h3 className="recognition-card__title">Recent Recognition</h3>
        {totalPoints > 0 && (
          <span className="recognition-card__points-total">
            {totalPoints.toLocaleString()} pts
          </span>
        )}
      </div>

      {loading && (
        <p className="recognition-card__loading">Loading activity feed…</p>
      )}

      {!loading && activities.length === 0 && (
        <p className="recognition-card__empty">No recognitions yet this period.</p>
      )}

      {!loading && activities.length > 0 && (
        <>
          <div className="recognition-list">
            {visible.map((a) => {
              const typeStyle = TYPE_COLORS[a.type] ?? { bg: '#f4f4f4', color: '#525252' };
              return (
                <div key={a.id} className="recognition-item">
                  <div className="recognition-item__header">
                    <div
                      className="recognition-item__avatar"
                      style={{
                        background: a.isManager
                          ? '#0f62fe'
                          : a.type === 'Points Deposited'
                          ? '#ff832b'
                          : '#8a3ffc',
                      }}
                    >
                      {a.fromInitials}
                    </div>
                    <div className="recognition-item__info">
                      <span className="recognition-item__from">{a.from}</span>
                      <span className="recognition-item__date">{a.date}</span>
                    </div>
                  </div>

                  <div className="recognition-item__meta">
                    <span
                      className="recognition-item__type-tag"
                      style={{ background: typeStyle.bg, color: typeStyle.color }}
                    >
                      {a.type}
                    </span>
                    {a.points !== undefined && a.points > 0 && (
                      <span className="recognition-item__points">
                        +{a.points.toLocaleString()} pts
                      </span>
                    )}
                  </div>

                  <p className="recognition-item__message">"{a.message}"</p>
                </div>
              );
            })}
          </div>

          <div className="recognition-card__footer">
            {hasMore && (
              <span className="recognition-card__count">
                +{activities.length - 4} more
              </span>
            )}
            <a
              href={BIW_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="recognition-card__view-all"
            >
              View all on ThanksBIW →
            </a>
          </div>
        </>
      )}
    </div>
  );
};

export default RecognitionCard;

// Made with Bob
