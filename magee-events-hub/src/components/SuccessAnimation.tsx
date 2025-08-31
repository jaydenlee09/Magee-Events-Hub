import { useState, useEffect } from 'react';

interface SuccessAnimationProps {
  isVisible?: boolean;
  onComplete?: () => void;
}

const SuccessAnimation = ({ isVisible = false, onComplete = () => {} }: SuccessAnimationProps) => {
  const [showCheckmark, setShowCheckmark] = useState(false);

  // Main animation sequence
  useEffect(() => {
    if (isVisible) {
      // Show checkmark with slight delay
      const checkmarkTimer = setTimeout(() => {
        setShowCheckmark(true);
      }, 300);

      return () => {
        clearTimeout(checkmarkTimer);
      };
    } else {
      // Reset animation state
      setShowCheckmark(false);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Dark overlay with blur effect */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
      
      {/* Success Card */}
      <div 
        className="relative z-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden transform transition-all duration-500"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 30px rgba(0, 0, 0, 0.1)',
          animation: 'scaleIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}
      >
        {/* Top accent gradient bar with modern subtle animation */}
        <div className="h-1.5 bg-gradient-to-r from-red-400 via-red-500 to-red-600 w-full relative overflow-hidden">
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent" 
               style={{
                 animation: 'shimmer 2s infinite',
                 backgroundSize: '200% 100%',
               }}
          ></div>
        </div>
        
        <div className="px-8 py-10 sm:px-10 sm:py-12">
          <div className="text-center">
            {/* Success Circle with Checkmark */}
            <div className="relative w-32 h-32 mx-auto mb-10">
              {/* Outer decorative glow effects */}
              <div className="absolute inset-0 -z-10">
                <div className={`
                  absolute -inset-10 bg-gradient-to-r from-red-400/10 via-red-500/15 to-red-600/10 rounded-full blur-3xl transform transition-all duration-1500 ease-out
                  ${showCheckmark ? 'scale-100 opacity-70' : 'scale-0 opacity-0'}
                `}></div>
                <div className={`
                  absolute -inset-6 bg-gradient-to-r from-red-400/15 via-red-500/20 to-red-600/15 rounded-full blur-2xl transform transition-all duration-1200 ease-out delay-100
                  ${showCheckmark ? 'scale-100 opacity-80' : 'scale-0 opacity-0'}
                `}></div>
              </div>
              
              {/* Main success circle */}
              <div className={`
                relative w-full h-full rounded-full bg-gradient-to-br from-red-400 to-red-500 
                shadow-2xl shadow-red-500/30 transform transition-all duration-700 ease-out
                ${showCheckmark ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}
              `}
                style={{
                  animation: showCheckmark ? 'successPop 0.65s cubic-bezier(0.22, 1, 0.36, 1) forwards' : 'none'
                }}
              >
                {/* Subtle animated background pulse */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-300/50 to-red-500/50 opacity-0"
                     style={{animation: 'gentlePulse 4s ease-in-out infinite 0.5s'}} />
                
                {/* Modern inner gloss effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/30 via-white/10 to-transparent"></div>
                
                {/* Checkmark with enhanced animation */}
                <svg 
                  className="absolute inset-0 w-full h-full p-3.5" 
                  viewBox="0 0 24 24" 
                  fill="none"
                >
                  {/* Checkmark highlight base */}
                  <path
                    d="M7 13l3 3 7-7"
                    stroke="rgba(255,255,255,0.4)"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`
                      transition-all duration-700 ease-out delay-100
                      ${showCheckmark ? 'opacity-100' : 'opacity-0'}
                    `}
                    style={{
                      strokeDasharray: 30,
                      strokeDashoffset: showCheckmark ? 0 : 30,
                      transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s, opacity 0.6s ease-out 0.1s',
                      filter: 'blur(1px)'
                    }}
                  />
                  
                  {/* Main checkmark */}
                  <path
                    d="M7 13l3 3 7-7"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`
                      transition-all duration-700 ease-out delay-200
                      ${showCheckmark ? 'opacity-100' : 'opacity-0'}
                    `}
                    style={{
                      strokeDasharray: 30,
                      strokeDashoffset: showCheckmark ? 0 : 30,
                      transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s, opacity 0.6s ease-out 0.2s'
                    }}
                  />
                </svg>
              </div>
            </div>
            
            {/* Success message with enhanced typography */}
            <h2 
              className="text-3xl sm:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-200"
              style={{
                animation: 'slideInUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards',
                opacity: 0,
                transform: 'translateY(20px)',
                animationDelay: '0.4s'
              }}
            >
              Event Submitted!
            </h2>
            
            <p 
              className="text-gray-600 dark:text-gray-300 text-base sm:text-lg leading-relaxed mb-10"
              style={{
                animation: 'slideInUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards',
                opacity: 0,
                transform: 'translateY(15px)',
                animationDelay: '0.6s'
              }}
            >
              Your event has been successfully submitted and will be reviewed by an administrator. You'll be notified once it's approved!
            </p>
            
            {/* Enhanced button with better hover effects */}
            <button
              onClick={onComplete}
              className="px-10 py-3.5 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold shadow-lg shadow-red-500/25 transition-all duration-300 hover:shadow-red-500/40 focus:outline-none focus:ring-2 focus:ring-red-400 group relative overflow-hidden"
              style={{
                animation: 'slideInUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards',
                opacity: 0,
                transform: 'translateY(15px)',
                animationDelay: '0.8s'
              }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Continue
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              
              {/* Enhanced hover background effect */}
              <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-red-600 via-red-500 to-red-700 transform scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-500"></div>
              
              {/* Button highlight effect */}
              <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-white/20 to-transparent"></div>
            </button>
          </div>
        </div>
      </div>
      
      {/* Add animation styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scaleIn {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes slideInUp {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes successPop {
          0% { transform: scale(0.8); }
          40% { transform: scale(1.1); }
          70% { transform: scale(0.95); }
          100% { transform: scale(1); }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        @keyframes shimmerEffect {
          0% { transform: translateX(-100%) rotate(-45deg); }
          100% { transform: translateX(100%) rotate(-45deg); }
        }
        
        @keyframes gentlePulse {
          0%, 100% { opacity: 0; }
          50% { opacity: 0.4; }
        }
      `}} />
    </div>
  );
};

export default SuccessAnimation; 