const fs = require('fs');
const path = require('path');

console.log('Starting ConfirmationModal.tsx fix script');

// Define paths
const modalPath = path.join(__dirname, 'src', 'components', 'modals', 'ConfirmationModal.tsx');
const backupPath = path.join(__dirname, 'src', 'components', 'modals', 'ConfirmationModal.tsx.backup');

// Define the clean content
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

try {
  console.log(`Checking if file exists: ${modalPath}`);
  
  if (fs.existsSync(modalPath)) {
    console.log('File exists, creating backup...');
    
    // Create backup
    try {
      fs.copyFileSync(modalPath, backupPath);
      console.log(`Backup created at: ${backupPath}`);
    } catch (err) {
      console.error('Error creating backup:', err);
    }
    
    // Delete the original file
    try {
      fs.unlinkSync(modalPath);
      console.log('Original file deleted');
    } catch (err) {
      console.error('Error deleting original file:', err);
    }
  } else {
    console.log('File does not exist, creating new one');
  }
  
  // Write clean content
  fs.writeFileSync(modalPath, cleanContent, 'utf8');
  console.log('Clean content written to file');
  
  // Verify content
  const newContent = fs.readFileSync(modalPath, 'utf8');
  if (newContent === cleanContent) {
    console.log('File content verified successfully!');
  } else {
    console.error('File content verification failed!');
    console.log('Expected length:', cleanContent.length);
    console.log('Actual length:', newContent.length);
  }
  
} catch (err) {
  console.error('Error in fix script:', err);
}
