/**
 * Add custom tailwind animation classes
 */
export const addCustomStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shine {
      from {
        background-position: 200% center;
      }
    }
    
    @keyframes float {
      0% {
        transform: translateY(0px);
      }
      50% {
        transform: translateY(-8px);
      }
      100% {
        transform: translateY(0px);
      }
    }
    
    @keyframes bounce {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-15px);
      }
    }
    
    .scrollbar-hide::-webkit-scrollbar {
      display: none;
    }
    
    .scrollbar-hide {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    
    .animate-float {
      animation: float 5s ease-in-out infinite;
    }
    
    .animate-pulse-slow {
      animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    
    .animate-shine {
      animation: shine 8s ease-in-out infinite;
    }
    
    .animate-fadeIn {
      animation: fadeIn 0.3s ease-out forwards;
    }
    
    .animate-scaleIn {
      animation: scaleIn 0.3s ease-out forwards;
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    
    @keyframes scaleIn {
      from {
        transform: scale(0.9);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
};

export default addCustomStyles;
