import React, { useState } from 'react';
import { Tile, TextInput, TextArea, Button, InlineNotification, Tag } from '@carbon/react';
import { Gift, CheckmarkFilled, Trophy, StarFilled } from '@carbon/icons-react';
import { BiWActivity } from '../../services/biw';
import './RecognitionBadges.scss';

interface Badge {
  emoji: string;
  title: string;
  earned: string | null; // "Jun 2026" or null if not yet earned
}

const BADGES: Badge[] = [
  { emoji: '🏆', title: 'Impact Champion', earned: 'Jun 2026' },
  { emoji: '💡', title: 'Innovation Leader', earned: 'Jun 2026' },
  { emoji: '🎓', title: 'Mentor', earned: 'May 2026' },
  { emoji: '🔥', title: 'Streak Master', earned: 'Apr 2026' },
  { emoji: '🤝', title: 'Team Player', earned: null },
  { emoji: '🚀', title: 'Delivery Ace', earned: null },
];

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  'Recognition Received': { bg: '#d9fbde', color: '#0e6027' },
  'Points Deposited':     { bg: '#edf5ff', color: '#0043ce' },
};

interface RecognitionBadgesProps {
  activities: BiWActivity[];
  activitiesLoading?: boolean;
}

const RecognitionBadges: React.FC<RecognitionBadgesProps> = ({ activities, activitiesLoading }) => {
  const earnedCount = BADGES.filter((b) => b.earned).length;

  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const send = () => {
    if (!recipient.trim() || !message.trim()) return;
    setSent(true);
    setRecipient('');
    setMessage('');
  };

  // Summary stats derived from real / sample activity feed
  const totalPoints = activities.reduce((sum, a) => sum + (a.points ?? 0), 0);
  const recognitionCount = activities.filter((a) => a.type === 'Recognition Received').length;
  const pointsCount = activities.filter((a) => a.type === 'Points Deposited').length;
  // Cap feed to 4; remainder accessible via View all link
  const visibleFeed = activities.slice(0, 4);
  const hasMorFeed = activities.length > 4;

  return (
    <div className="recognition-tab">

      {/* ── Row 1: Summary stat cards ─────────────────────────────────────── */}
      <div className="recognition-tab__stats">
        <div className="rec-stat">
          <Trophy size={20} className="rec-stat__icon rec-stat__icon--green" />
          <div>
            <p className="rec-stat__value">{recognitionCount}</p>
            <p className="rec-stat__label">Recognitions Received</p>
          </div>
        </div>
        <div className="rec-stat">
          <StarFilled size={20} className="rec-stat__icon rec-stat__icon--blue" />
          <div>
            <p className="rec-stat__value">{totalPoints.toLocaleString()}</p>
            <p className="rec-stat__label">Total Points</p>
          </div>
        </div>
        <div className="rec-stat">
          <Gift size={20} className="rec-stat__icon rec-stat__icon--purple" />
          <div>
            <p className="rec-stat__value">{pointsCount}</p>
            <p className="rec-stat__label">Points Deposits</p>
          </div>
        </div>
        <div className="rec-stat">
          <CheckmarkFilled size={20} className="rec-stat__icon rec-stat__icon--gold" />
          <div>
            <p className="rec-stat__value">{earnedCount}/{BADGES.length}</p>
            <p className="rec-stat__label">Badges Earned</p>
          </div>
        </div>
      </div>

      {/* ── Row 2: Recent Recognition feed (full-width) ───────────────────── */}
      <Tile className="dashboard-card recognition-tab__feed-tile">
        <div className="recognition-feed__head">
          <h3 className="recognition-feed__title">Recent Recognition</h3>
          {totalPoints > 0 && (
            <span className="recognition-feed__points-badge">
              {totalPoints.toLocaleString()} pts total
            </span>
          )}
        </div>

        {activitiesLoading && (
          <p className="recognition-feed__loading">Loading activity feed…</p>
        )}

        {!activitiesLoading && activities.length === 0 && (
          <p className="recognition-feed__empty">No recognitions yet this period.</p>
        )}

        {!activitiesLoading && activities.length > 0 && (
          <div className="recognition-feed__list">
            {visibleFeed.map((a) => {
              const typeStyle = TYPE_COLORS[a.type] ?? { bg: '#f4f4f4', color: '#525252' };
              return (
                <div key={a.id} className="rec-feed-item">
                  <div
                    className="rec-feed-item__avatar"
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

                  <div className="rec-feed-item__body">
                    <div className="rec-feed-item__top">
                      <span className="rec-feed-item__from">{a.from}</span>
                      {a.isManager && (
                        <Tag type="blue" size="sm" className="rec-feed-item__manager-tag">
                          Manager
                        </Tag>
                      )}
                      <span className="rec-feed-item__date">{a.date}</span>
                    </div>

                    <div className="rec-feed-item__meta">
                      <span
                        className="rec-feed-item__type-tag"
                        style={{ background: typeStyle.bg, color: typeStyle.color }}
                      >
                        {a.type}
                      </span>
                      {a.points !== undefined && a.points > 0 && (
                        <span className="rec-feed-item__points">+{a.points.toLocaleString()} pts</span>
                      )}
                    </div>

                    <p className="rec-feed-item__message">"{a.message}"</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!activitiesLoading && activities.length > 0 && (
          <div className="recognition-feed__footer">
            {hasMorFeed && (
              <span className="recognition-feed__count">
                +{activities.length - 4} more recognitions
              </span>
            )}
            <a
              href="https://thanksibm.recognition-now.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="recognition-feed__view-all"
            >
              View all on ThanksBIW →
            </a>
          </div>
        )}
      </Tile>

      {/* ── Row 3: Badges + Give Recognition side by side ────────────────── */}
      <div className="recognition-tab__bottom">
        {/* Badges & Milestones */}
        <Tile className="dashboard-card">
          <h3 className="recognition-tab__section-title">Badges &amp; Milestones</h3>
          <p className="recognition-tab__subtitle">
            {earnedCount} of {BADGES.length} badges earned
          </p>

          <div className="badge-grid">
            {BADGES.map((b) => (
              <div
                key={b.title}
                className={`badge ${b.earned ? 'badge--earned' : 'badge--locked'}`}
              >
                {b.earned && <CheckmarkFilled size={16} className="badge__check" />}
                <span className="badge__emoji" aria-hidden>
                  {b.emoji}
                </span>
                <p className="badge__title">{b.title}</p>
                <p className="badge__status">
                  {b.earned ? `Earned ${b.earned}` : 'Not yet earned'}
                </p>
              </div>
            ))}
          </div>
        </Tile>

        {/* Give Recognition */}
        <Tile className="dashboard-card give-recognition">
          <h3 className="recognition-tab__section-title">Give Recognition</h3>

          {sent && (
            <InlineNotification
              kind="success"
              lowContrast
              title="Recognition sent!"
              subtitle="Your teammate will see it in their inbox."
              onClose={() => setSent(false)}
              className="give-recognition__toast"
            />
          )}

          <TextInput
            id="rec-recipient"
            labelText="Recipient"
            placeholder="Search colleague…"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
          <TextArea
            id="rec-message"
            labelText="Message"
            placeholder="Share what made an impact…"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="give-recognition__message"
          />
          <Button
            kind="primary"
            renderIcon={Gift}
            onClick={send}
            disabled={!recipient.trim() || !message.trim()}
            className="give-recognition__send"
          >
            Send Recognition
          </Button>
        </Tile>
      </div>
    </div>
  );
};

export default RecognitionBadges;

// Made with Bob
