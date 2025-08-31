// Fix ConfirmationModal.tsx
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'modals', 'ConfirmationModal.tsx');

// The clean content for the file
const cleanContent = `import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmButtonText: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Reusable confirmation modal component
 */
const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmButtonText,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel}></div>
      
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 max-w-md w-11/12 shadow-2xl">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-6">{message}</p>
        
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
          >
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;`;

// Write the clean content to the file
fs.writeFileSync(filePath, cleanContent, 'utf8');
console.log('Fixed ConfirmationModal.tsx');
