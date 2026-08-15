import React, { useState } from 'react';
import {
  Modal,
  TextInput,
  Select,
  SelectItem,
  FileUploaderDropContainer,
  FileUploaderItem,
} from '@carbon/react';
import { Contribution } from '../../types';
import './LogContributionModal.scss';

const CATEGORIES: Contribution['category'][] = [
  'Outcomes',
  'Skills',
  'Behaviors',
  'Leadership',
  'Client Success',
];
const IMPACTS: Contribution['impact'][] = [
  'Low Impact',
  'Medium Impact',
  'High Impact',
  'Critical Impact',
];

const todayLabel = () =>
  new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

interface LogContributionModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (contribution: Contribution) => void;
}

const LogContributionModal: React.FC<LogContributionModalProps> = ({ open, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Contribution['category']>('Outcomes');
  const [impact, setImpact] = useState<Contribution['impact']>('Medium Impact');
  const [files, setFiles] = useState<string[]>([]);

  const reset = () => {
    setTitle('');
    setCategory('Outcomes');
    setImpact('Medium Impact');
    setFiles([]);
  };

  const close = () => {
    reset();
    onClose();
  };

  const submit = () => {
    if (!title.trim()) return;
    onSubmit({
      id: `c${Date.now()}`,
      title: title.trim(),
      description: '',
      category,
      impact,
      date: todayLabel(),
      verified: false, // starts Pending until classified + manager-verified
      evidence: files,
    });
    reset();
  };

  return (
    <Modal
      open={open}
      modalHeading="Log a new contribution"
      modalLabel="My Contributions"
      primaryButtonText="Log contribution"
      secondaryButtonText="Cancel"
      primaryButtonDisabled={!title.trim()}
      onRequestClose={close}
      onRequestSubmit={submit}
    >
      <p className="log-modal__hint">
        New contributions start as <strong>Pending</strong> until they're classified and
        manager-verified.
      </p>

      <TextInput
        id="lc-title"
        labelText="What did you do?"
        placeholder="e.g. Ran a usability study on the onboarding flow"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <div className="log-modal__row">
        <Select
          id="lc-category"
          labelText="Dimension"
          value={category}
          onChange={(e) => setCategory(e.target.value as Contribution['category'])}
        >
          {CATEGORIES.map((c) => (
            <SelectItem key={c} value={c} text={c} />
          ))}
        </Select>
        <Select
          id="lc-impact"
          labelText="Impact"
          value={impact}
          onChange={(e) => setImpact(e.target.value as Contribution['impact'])}
        >
          {IMPACTS.map((i) => (
            <SelectItem key={i} value={i} text={i.replace(' Impact', '')} />
          ))}
        </Select>
      </div>

      <div className="log-modal__upload">
        <p className="cds--label">Evidence — attach screenshots or files</p>
        <FileUploaderDropContainer
          labelText="Drag and drop files here, or click to upload"
          multiple
          accept={['.png', '.jpg', '.jpeg', '.gif', '.pdf']}
          onAddFiles={(_evt: any, data: any) =>
            setFiles((prev) => [
              ...prev,
              ...(data?.addedFiles ?? []).map((f: File) => f.name),
            ])
          }
        />
        <div className="log-modal__files">
          {files.map((name, idx) => (
            <FileUploaderItem
              key={`${name}-${idx}`}
              name={name}
              status="edit"
              onDelete={() => setFiles((prev) => prev.filter((_, i) => i !== idx))}
            />
          ))}
        </div>
      </div>
    </Modal>
  );
};

export default LogContributionModal;

// Made with Bob
