import React, { useState } from 'react';
import {
  Tile,
  Button,
  Tag,
  Modal,
  TextInput,
  TextArea,
  RadioButtonGroup,
  RadioButton,
  Checkbox,
  Dropdown,
} from '@carbon/react';
import {
  Add,
  UserFollow,
  CheckmarkFilled,
  Idea,
  Events,
  Group,
  LogoSlack,
  Share,
} from '@carbon/icons-react';
import {
  useGrowthOpportunities,
  GrowthOpportunity,
  PeerOpportunity,
  OppAudience,
} from '../../context/GrowthOpportunities';
import './GrowthOpps.scss';

// Team roster for the "Forward to DR" dropdown
const DR_NAMES = ['Priya Sharma', 'Rohan Gupta', 'Aditya Rao', 'Ananya Krishnan', 'Vikram Nair', 'Kavya Reddy', 'Arjun Mehta', 'Sneha Iyer'];

const audienceLabel = (a: OppAudience) =>
  a === 'team' ? 'Whole team (my chain)' :
  a === 'peer-managers' ? 'Peer Managers' :
  'Direct Reportee (DR)';

const audienceTagType = (a: OppAudience) =>
  a === 'team' ? 'blue' : a === 'peer-managers' ? 'purple' : 'teal';

const initials = (name: string) =>
  name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

// ─────────────────────────────────────────────── Created-by-me card ──────────
const CreatedOppCard: React.FC<{
  o: GrowthOpportunity;
  pick: string;
  onPick: (v: string) => void;
  onPropose: () => void;
}> = ({ o, pick, onPick, onPropose }) => (
  <Tile className="opp-card">
    <div className="opp-card__top">
      <span className="opp-card__icon"><Idea size={18} /></span>
      <div className="opp-card__title-wrap">
        <p className="opp-card__title">{o.title}</p>
        <div className="opp-card__meta">
          <Tag type={audienceTagType(o.audience)} size="sm">
            {o.audience === 'team' ? <Group size={12} /> : o.audience === 'peer-managers' ? <Share size={12} /> : <Events size={12} />}
            &nbsp;{audienceLabel(o.audience)}
          </Tag>
          <span className="opp-card__date">Opened {o.createdAt}</span>
        </div>
      </div>
    </div>

    <p className="opp-card__desc">{o.description}</p>

    <div className="opp-card__interested">
      <span className="opp-card__interested-label">Interested ({o.interested.length})</span>
      {o.interested.length === 0 ? (
        <span className="opp-card__none">No one has raised their hand yet.</span>
      ) : (
        <div className="opp-card__chips">
          {o.interested.map((m) => (
            <span key={m} className={`opp-chip${o.proposed === m ? ' opp-chip--proposed' : ''}`}>
              <span className="opp-chip__avatar">{initials(m)}</span>
              {m}
              {o.proposed === m && <CheckmarkFilled size={12} />}
            </span>
          ))}
        </div>
      )}
    </div>

    {o.proposed ? (
      <div className="opp-card__proposed">
        <CheckmarkFilled size={16} />
        <span>You proposed <strong>{o.proposed}</strong> for this initiative.</span>
      </div>
    ) : o.interested.length > 0 ? (
      <div className="opp-card__propose">
        <Dropdown
          id={`propose-${o.id}`}
          size="md"
          label="Select an interested member"
          titleText=""
          hideLabel
          items={o.interested}
          selectedItem={pick || null}
          onChange={({ selectedItem }: { selectedItem: string | null }) => onPick(selectedItem || '')}
        />
        <Button kind="primary" size="md" renderIcon={UserFollow} disabled={!pick} onClick={onPropose}>
          Propose
        </Button>
      </div>
    ) : null}
  </Tile>
);

// ─────────────────────────────────────────────── Received-from-peer card ─────
const PeerOppCard: React.FC<{
  o: PeerOpportunity;
  pick: string;
  onPick: (v: string) => void;
  onForward: (target: string) => void;
}> = ({ o, pick, onPick, onForward }) => {
  const [showDrPicker, setShowDrPicker] = useState(false);
  return (
    <Tile className="opp-card opp-card--peer">
      <div className="opp-card__top">
        <span className="opp-card__icon opp-card__icon--peer"><Share size={18} /></span>
        <div className="opp-card__title-wrap">
          <p className="opp-card__title">{o.title}</p>
          <div className="opp-card__meta">
            <Tag type="purple" size="sm">
              <Share size={12} />&nbsp;From peer
            </Tag>
            <span className="opp-card__date">Received {o.receivedAt}</span>
          </div>
        </div>
      </div>

      <p className="opp-card__desc">{o.description}</p>

      <div className="opp-card__from-peer">
        <span className="opp-card__from-label">Shared by</span>
        <span className="opp-card__from-name">{o.fromPeer}</span>
      </div>

      {o.forwardedTo ? (
        <div className="opp-card__proposed opp-card__proposed--forwarded">
          <CheckmarkFilled size={16} />
          <span>Forwarded to <strong>{o.forwardedTo}</strong></span>
        </div>
      ) : (
        <div className="opp-card__forward-actions">
          {/* Primary — entire team */}
          <Button
            kind="primary"
            size="md"
            renderIcon={Group}
            onClick={() => onForward('Entire Team')}
          >
            Pass to Entire Team
          </Button>
          {/* Secondary — specific DR */}
          {!showDrPicker ? (
            <Button
              kind="tertiary"
              size="md"
              renderIcon={UserFollow}
              onClick={() => setShowDrPicker(true)}
            >
              Pass to specific DR
            </Button>
          ) : (
            <div className="opp-card__dr-picker">
              <Dropdown
                id={`forward-${o.id}`}
                size="md"
                label="Select a DR"
                titleText=""
                hideLabel
                items={DR_NAMES}
                selectedItem={pick || null}
                onChange={({ selectedItem }: { selectedItem: string | null }) => onPick(selectedItem || '')}
              />
              <Button
                kind="primary"
                size="md"
                renderIcon={UserFollow}
                disabled={!pick}
                onClick={() => onForward(pick)}
              >
                Confirm
              </Button>
              <Button kind="ghost" size="md" onClick={() => { setShowDrPicker(false); onPick(''); }}>
                Cancel
              </Button>
            </div>
          )}
        </div>
      )}
    </Tile>
  );
};

// ─────────────────────────────────────────────────────────── Manager view ────
export const ManagerOpportunities: React.FC = () => {
  const { opportunities, peerOpportunities, addOpportunity, proposeMember, forwardPeerOpp } = useGrowthOpportunities();
  const [activeTab, setActiveTab] = useState<'created' | 'received'>('created');
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [audience, setAudience] = useState<OppAudience>('team');
  const [shareSlack, setShareSlack] = useState(false);
  const [picks, setPicks] = useState<Record<string, string>>({});

  const submit = () => {
    if (!title.trim() || !desc.trim()) return;
    addOpportunity({ title, description: desc, audience });
    setTitle(''); setDesc(''); setAudience('team'); setShareSlack(false); setOpen(false);
  };

  return (
    <div className="growth-opps">
      {/* Header */}
      <div className="growth-opps__head">
        <div>
          <h3 className="manager-dashboard__section-title">Growth Opportunities</h3>
          <p className="manager-dashboard__section-sub">
            Stretch initiatives you've opened or received from peer managers
          </p>
        </div>
        {activeTab === 'created' && (
          <Button kind="primary" size="md" renderIcon={Add} onClick={() => setOpen(true)}>
            New Opportunity
          </Button>
        )}
      </div>

      {/* Tab switcher */}
      <div className="opp-tabs">
        <button
          className={`opp-tab${activeTab === 'created' ? ' opp-tab--active' : ''}`}
          onClick={() => setActiveTab('created')}
        >
          Created by me
          <span className="opp-tab__count">{opportunities.length}</span>
        </button>
        <button
          className={`opp-tab${activeTab === 'received' ? ' opp-tab--active' : ''}`}
          onClick={() => setActiveTab('received')}
        >
          Received from peers
          <span className="opp-tab__count">{peerOpportunities.length}</span>
        </button>
      </div>

      {/* Created by me */}
      {activeTab === 'created' && (
        <div className="opp-list">
          {opportunities.length === 0 && (
            <p className="opp-card__none">No opportunities created yet. Click "New Opportunity" to get started.</p>
          )}
          {opportunities.map((o) => (
            <CreatedOppCard
              key={o.id}
              o={o}
              pick={picks[o.id] || ''}
              onPick={(v) => setPicks((p) => ({ ...p, [o.id]: v }))}
              onPropose={() => proposeMember(o.id, picks[o.id])}
            />
          ))}
        </div>
      )}

      {/* Received from peers */}
      {activeTab === 'received' && (
        <div className="opp-list">
          {peerOpportunities.length === 0 && (
            <p className="opp-card__none">No opportunities shared by peers yet.</p>
          )}
          {peerOpportunities.map((o) => (
            <PeerOppCard
              key={o.id}
              o={o}
              pick={picks[o.id] || ''}
              onPick={(v) => setPicks((p) => ({ ...p, [o.id]: v }))}
              onForward={(target) => forwardPeerOpp(o.id, target)}
            />
          ))}
        </div>
      )}

      {/* New opportunity modal */}
      <Modal
        open={open}
        modalHeading="New Growth Opportunity"
        modalLabel="Growth Opportunities"
        primaryButtonText="Open opportunity"
        secondaryButtonText="Cancel"
        primaryButtonDisabled={!title.trim() || !desc.trim()}
        onRequestClose={() => setOpen(false)}
        onRequestSubmit={submit}
      >
        <div className="opp-form">
          <TextInput
            id="opp-title"
            labelText="Initiative name"
            placeholder="e.g. Lead Studio Initiative"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextArea
            id="opp-desc"
            labelText="What is this initiative about?"
            placeholder="Describe the initiative, the scope, and the growth it offers…"
            rows={4}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
          <RadioButtonGroup
            legendText="Who can see this?"
            name="opp-audience"
            valueSelected={audience}
            onChange={(v: string | number | undefined) => setAudience(v as OppAudience)}
          >
            <RadioButton labelText="Whole team (my chain)" value="team" id="aud-team" />
            <RadioButton labelText="Direct Reportee (DR) only" value="directs" id="aud-directs" />
            <RadioButton labelText="Peer Managers" value="peer-managers" id="aud-peers" />
          </RadioButtonGroup>
          <div className="opp-form__slack">
            <Checkbox
              id="opp-slack"
              labelText={
                <span className="opp-form__slack-label">
                  <LogoSlack size={16} /> Share on Slack channel
                </span>
              }
              checked={shareSlack}
              onChange={(_: any, { checked }: { checked: boolean }) => setShareSlack(checked)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ----------------------------------------------------------------- Employee --

interface EmployeeOpportunitiesProps {
  /** The logged-in employee's name — used for interest + proposal state. */
  employeeName: string;
}

export const EmployeeOpportunities: React.FC<EmployeeOpportunitiesProps> = ({
  employeeName,
}) => {
  const { opportunities, expressInterest, withdrawInterest } = useGrowthOpportunities();

  // Employee sees team-wide opportunities and those opened to direct reports.
  const visible = opportunities;

  return (
    <div className="growth-opps">
      <div className="growth-opps__head">
        <div>
          <h3 className="growth-opps__h">Growth Opportunities</h3>
          <p className="growth-opps__sub">
            Stretch initiatives opened by your manager — raise your hand to be considered
          </p>
        </div>
      </div>

      <div className="opp-list">
        {visible.length === 0 && (
          <p className="opp-card__none">No open opportunities right now. Check back soon.</p>
        )}
        {visible.map((o) => {
          const interested = o.interested.includes(employeeName);
          const proposedYou = o.proposed === employeeName;
          return (
            <Tile key={o.id} className={`opp-card${proposedYou ? ' opp-card--proposed' : ''}`}>
              <div className="opp-card__top">
                <span className="opp-card__icon">
                  <Idea size={18} />
                </span>
                <div className="opp-card__title-wrap">
                  <p className="opp-card__title">{o.title}</p>
                  <div className="opp-card__meta">
                    <Tag type={o.audience === 'team' ? 'blue' : 'teal'} size="sm">
                      {audienceLabel(o.audience)}
                    </Tag>
                    <span className="opp-card__date">
                      From {o.createdBy} · {o.createdAt}
                    </span>
                  </div>
                </div>
              </div>

              <p className="opp-card__desc">{o.description}</p>

              {proposedYou && (
                <div className="opp-card__proposed opp-card__proposed--you">
                  <CheckmarkFilled size={16} />
                  <span>
                    🎉 Your manager <strong>proposed you</strong> for this initiative!
                  </span>
                </div>
              )}

              <div className="opp-card__footer">
                <span className="opp-card__count">
                  {o.interested.length} interested
                </span>
                {interested ? (
                  <div className="opp-card__interest-actions">
                    <span className="opp-card__interested-tag">
                      <CheckmarkFilled size={14} /> Interest submitted
                    </span>
                    <Button
                      kind="ghost"
                      size="sm"
                      onClick={() => withdrawInterest(o.id, employeeName)}
                    >
                      Withdraw
                    </Button>
                  </div>
                ) : (
                  <Button
                    kind="primary"
                    size="sm"
                    renderIcon={UserFollow}
                    onClick={() => expressInterest(o.id, employeeName)}
                  >
                    I'm interested
                  </Button>
                )}
              </div>
            </Tile>
          );
        })}
      </div>
    </div>
  );
};
