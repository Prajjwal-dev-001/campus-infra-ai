import React from "react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
        {title && <h3 className="text-lg font-bold mb-4">{title}</h3>}
        {children}
        <button onClick={onClose} className="mt-4 text-sm text-gray-500 hover:text-gray-700">
          Close
        </button>
      </div>
    </div>
  );
};

export default Modal;
