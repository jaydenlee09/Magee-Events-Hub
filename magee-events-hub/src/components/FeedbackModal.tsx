import React, { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase/firebase';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Feedback Modal Component
 * Allows users to submit feedback for the application
 */
const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [feedback, setFeedback] = useState('');
  const [feedbackEmail, setFeedbackEmail] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState<string | null>(null);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackStatus(null);
    
    if (!feedback.trim()) {
      setFeedbackStatus("Please enter your feedback.");
      return;
    }
    
    try {
      await addDoc(collection(db, "feedback"), {
        feedback,
        email: feedbackEmail,
        submittedAt: new Date(),
      });
      setFeedback("");
      setFeedbackEmail("");
      setFeedbackStatus("Thank you for your feedback!");
    } catch (error) {
      setFeedbackStatus("Failed to send feedback. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-lg p-4 animate-fadeIn">
      <div className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-3xl shadow-2xl max-w-lg w-full mx-auto overflow-hidden animate-scaleIn border border-white/20 dark:border-gray-700/50">
        {/* Close button */}
        <button
          className="absolute top-4 right-4 z-10 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full w-8 h-8 flex items-center justify-center text-gray-500 dark:text-gray-400 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
          onClick={() => { onClose(); setFeedbackStatus(null); }}
          aria-label="Close feedback modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
          </svg>
        </button>
        
        {/* Header with icon */}
        <div className="bg-gradient-to-r from-blue-400 to-cyan-400 dark:from-blue-500 dark:to-cyan-600 px-6 pt-10 pb-12">
          <div className="flex justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-full h-16 w-16 flex items-center justify-center shadow-lg transform -translate-y-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400 dark:text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10c0 4.418-3.582 8-8 8s-8-3.582-8-8 3.582-8 8-8 8 3.582 8 8zm-8-3a1 1 0 00-1 1v2a1 1 0 102 0V8a1 1 0 00-1-1zm0 6a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <h2 className="text-center text-xl font-bold text-white mt-2">Send Feedback</h2>
        </div>
        
        {/* Content */}
        <div className="px-6 py-6 -mt-6 bg-white dark:bg-gray-800 rounded-t-3xl">
          <p className="text-gray-600 dark:text-gray-300 text-sm text-center mb-6">
            Help us improve by sharing your thoughts
          </p>
          
          <form onSubmit={handleFeedbackSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Your Feedback
              </label>
              <div className="relative">
                <textarea
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-700"
                  placeholder="Share your thoughts, suggestions, or concerns..."
                  required
                />
                <div className="absolute bottom-3 right-3 text-gray-400 dark:text-gray-500 text-xs">
                  {feedback.length > 0 ? `${feedback.length} characters` : ''}
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Email (Optional)
              </label>
              <input
                type="email"
                value={feedbackEmail}
                onChange={e => setFeedbackEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700"
                placeholder="your.email@example.com"
              />
            </div>
            
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:translate-y-[-1px] focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800"
            >
              <div className="flex items-center justify-center">
                <span>Send Feedback</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </button>
            
            {feedbackStatus && (
              <div className={`mt-5 p-4 rounded-xl text-center font-medium text-sm flex items-center justify-center ${
                feedbackStatus.startsWith('Thank') 
                  ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                  : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
              }`}>
                <span className={`mr-2 flex-shrink-0 ${feedbackStatus.startsWith('Thank') ? 'text-green-500' : 'text-red-500'}`}>
                  {feedbackStatus.startsWith('Thank') ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                </span>
                {feedbackStatus}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
