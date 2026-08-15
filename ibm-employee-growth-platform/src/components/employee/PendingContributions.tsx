import React, { useState } from 'react';
import { Button, Tag, TextInput, TextArea, Select, SelectItem } from '@carbon/react';
import {
  LogoSlack,
  Email,
  Renew,
  SendAlt,
  Close,
  Edit,
  Checkmark,
  ChevronDown,
  ChevronUp,
  Add,
} from '@carbon/icons-react';
import { DetectedContribution } from '../../types';
import { EditableFields } from '../../hooks/useRecognitionInbox';
import './PendingContributions.scss';

interface PendingContributionsProps {
  items: DetectedContribution[];
  syncing: boolean;
  onSync: () => void;
  onLogContribution: () => void;
  onApprove: (id: string) => void; // employee approves -> sent to manager
  onDismiss: (id: string) => void;
  onEdit: (id: string, changes: EditableFields) => void;
}

const CATEGORIES: DetectedContribution['category'][] = [
  'Outcomes',
  'Skills',
  'Behaviors',
  'Leadership',
  'Client Success',
];
const IMPACTS: DetectedContribution['impact'][] = [
  'Low Impact',
  'Medium Impact',
  'High Impact',
  'Critical Impact',
];

const categoryColor = (c: string) => {
  switch (c) {
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

const impactColor = (i: string) => {
  switch (i) {
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

interface Draft {
  title: string;
  category: DetectedContribution['category'];
  impact: DetectedContribution['impact'];
  summary: string;
}

const PendingContributions: React.FC<PendingContributionsProps> = ({
  items,
  syncing,
  onSync,
  onLogContribution,
  onApprove,
  onDismiss,
  onEdit,
}) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>({
    title: '',
    category: 'Outcomes',
    impact: 'Medium Impact',
    summary: '',
  });

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const startEdit = (item: DetectedContribution) => {
    setDraft({
      title: item.title,
      category: item.category,
      impact: item.impact,
      summary: item.summary,
    });
    setEditingId(item.id);
    // keep the original message visible while editing
    setExpanded((prev) => new Set(prev).add(item.id));
  };

  const saveEdit = () => {
    if (!editingId || !draft.title.trim()) return;
    onEdit(editingId, {
      title: draft.title.trim(),
      category: draft.category,
      impact: draft.impact,
      summary: draft.summary.trim(),
    });
    setEditingId(null);
  };

  const newCount = items.filter((i) => i.status === 'detected').length;

  return (
    <div className="recognition-inbox">
      <div className="recognition-inbox__header">
        <div>
          <h3>
            Recognition Inbox
            {newCount > 0 && <span className="recognition-inbox__badge">{newCount} new</span>}
          </h3>
          <p className="recognition-inbox__subtitle">
            Detected from Slack &amp; Outlook — review, edit, and send for approval
          </p>
        </div>
        <div className="recognition-inbox__actions">
          <Button kind="tertiary" size="sm" renderIcon={Renew} onClick={onSync} disabled={syncing}>
            {syncing ? 'Syncing…' : 'Sync'}
          </Button>
          <Button kind="primary" size="sm" renderIcon={Add} onClick={onLogContribution}>
            Log Contribution
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="recognition-inbox__empty">
          {syncing
            ? 'Checking Slack & Outlook for new recognition…'
            : 'No new recognition detected. Click Sync to check Slack & Outlook.'}
        </div>
      ) : (
        <div className="recognition-inbox__items">
          {items.map((item) => {
            const isOpen = expanded.has(item.id);
            const isPending = item.status === 'pending_manager';
            const isEditing = editingId === item.id;
            return (
              <div key={item.id} className="detected-item">
                <div className="detected-item__top">
                  <span className={`source-badge source-badge--${item.source}`}>
                    {item.source === 'slack' ? <LogoSlack size={14} /> : <Email size={14} />}
                    {item.source === 'slack' ? 'Slack' : 'Outlook'}
                  </span>
                  <span className="detected-item__meta">
                    <span className="detected-item__meta-from">{item.from}</span>
                    <span className="detected-item__meta-channel">{item.channel}</span>
                    <span className="detected-item__meta-date">{item.receivedAt}</span>
                  </span>
                  {!isEditing && item.status === 'detected' && (
                    <span
                      className={`detected-item__ai${item.edited ? ' detected-item__ai--edited' : ''}`}
                    >
                      {item.edited ? 'Edited' : 'Suggested'}
                    </span>
                  )}
                </div>

                {isEditing ? (
                  <div className="detected-item__edit">
                    <TextInput
                      id={`ed-title-${item.id}`}
                      labelText="Contribution"
                      value={draft.title}
                      onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                    />
                    <div className="detected-item__edit-row">
                      <Select
                        id={`ed-cat-${item.id}`}
                        labelText="Dimension"
                        value={draft.category}
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            category: e.target.value as DetectedContribution['category'],
                          }))
                        }
                      >
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c} text={c} />
                        ))}
                      </Select>
                      <Select
                        id={`ed-impact-${item.id}`}
                        labelText="Impact"
                        value={draft.impact}
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            impact: e.target.value as DetectedContribution['impact'],
                          }))
                        }
                      >
                        {IMPACTS.map((i) => (
                          <SelectItem key={i} value={i} text={i.replace(' Impact', '')} />
                        ))}
                      </Select>
                    </div>
                    <TextArea
                      id={`ed-summary-${item.id}`}
                      labelText="Summary"
                      rows={2}
                      value={draft.summary}
                      onChange={(e) => setDraft((d) => ({ ...d, summary: e.target.value }))}
                    />
                  </div>
                ) : (
                  <>
                    <p className="detected-item__title">{item.title}</p>
                    <div className="detected-item__tags">
                      <Tag type={categoryColor(item.category)} size="sm">
                        {item.category}
                      </Tag>
                      <Tag type={impactColor(item.impact)} size="sm">
                        {item.impact}
                      </Tag>
                    </div>
                    <p className="detected-item__summary">{item.summary}</p>
                  </>
                )}

                <button
                  type="button"
                  className="detected-item__toggle"
                  onClick={() => toggle(item.id)}
                >
                  {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  {isOpen ? 'Hide original message' : 'View original message'}
                </button>
                {isOpen && <blockquote className="detected-item__raw">{item.rawMessage}</blockquote>}

                <div className="detected-item__actions">
                  {isPending ? (
                    <span className="detected-item__status">⏳ Awaiting manager approval</span>
                  ) : isEditing ? (
                    <>
                      <Button
                        kind="primary"
                        size="sm"
                        renderIcon={Checkmark}
                        disabled={!draft.title.trim()}
                        onClick={saveEdit}
                      >
                        Save changes
                      </Button>
                      <Button kind="ghost" size="sm" onClick={() => setEditingId(null)}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        kind="primary"
                        size="sm"
                        renderIcon={SendAlt}
                        onClick={() => onApprove(item.id)}
                      >
                        Approve &amp; send to manager
                      </Button>
                      <Button
                        kind="ghost"
                        size="sm"
                        renderIcon={Edit}
                        onClick={() => startEdit(item)}
                      >
                        Edit
                      </Button>
                      <Button
                        kind="ghost"
                        size="sm"
                        renderIcon={Close}
                        onClick={() => onDismiss(item.id)}
                      >
                        Dismiss
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PendingContributions;

// Made with Bob
