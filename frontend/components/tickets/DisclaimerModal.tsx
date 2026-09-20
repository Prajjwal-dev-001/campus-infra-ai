import React from "react";
import Modal from "../ui/Modal";

export interface DisclaimerModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onClose: () => void;
}

export const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ isOpen, onAccept, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="LPU RMS Maintenance Guidelines & Disclaimer">
      <div className="text-xs text-lpu-gray-dark space-y-2">
        <p>
          1. Please ensure you or an authorized representative is present during the chosen time slot.
        </p>
        <p>
          2. Emergency issues (sparking, gas leakage, elevator entrapment) must be reported to security immediately.
        </p>
        <p>
          3. False complaints or intentional damage may lead to disciplinary action under university hostel rules.
        </p>
      </div>
      <div className="mt-6 flex justify-end space-x-2">
        <button onClick={onClose} className="lpu-btn-secondary text-xs">
          Cancel
        </button>
        <button onClick={onAccept} className="lpu-btn-primary text-xs">
          I Understand & Proceed
        </button>
      </div>
    </Modal>
  );
};

export default DisclaimerModal;
