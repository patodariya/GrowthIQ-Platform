import React from 'react';
import { Modal, Button } from '@carbon/react';
import { Renew } from '@carbon/icons-react';
import './SettingsModal.scss';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReset: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onReset }) => {
  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the prototype? This will reload the page and reset all interactions to their default state.')) {
      onReset();
    }
  };

  return (
    <Modal
      open={isOpen}
      onRequestClose={onClose}
      modalHeading="Settings"
      modalLabel="Prototype Settings"
      primaryButtonText="Close"
      onRequestSubmit={onClose}
      size="sm"
      passiveModal
    >
      <div className="settings-modal">
        <div className="settings-modal__section">
          <h4 className="settings-modal__section-title">Prototype Controls</h4>
          <p className="settings-modal__section-desc">
            Use this button to reset all interactions and return the prototype to its initial state.
            This is useful when demonstrating to stakeholders.
          </p>
          
          <Button
            kind="danger"
            renderIcon={Renew}
            onClick={handleReset}
            className="settings-modal__reset-button"
          >
            Reset Prototype
          </Button>
          
          <div className="settings-modal__info">
            <p className="settings-modal__info-title">What gets reset:</p>
            <ul className="settings-modal__info-list">
              <li>All button clicks and interactions</li>
              <li>Form inputs and selections</li>
              <li>Navigation state</li>
              <li>Notification read status</li>
              <li>Modal and panel states</li>
            </ul>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;

// Made with Bob
