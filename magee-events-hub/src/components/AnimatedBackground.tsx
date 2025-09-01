import React from 'react';

interface AnimatedBackgroundProps {
  className?: string;
}

/**
 * AnimatedBackground - Simple Radial Gradient
 * 
 * Creates a clean radial gradient background that transitions from white to red.
 * Supports both light and dark modes with theme-specific color palettes.
 * Consistent across all pages of the application.
 */
const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ className = '' }) => {
  return (
    <div className={`fixed inset-0 z-[-1] overflow-hidden pointer-events-none ${className}`}>
      {/* Radial Gradient Background - Light Mode */}
      <div 
        className="absolute inset-0 dark:opacity-0 opacity-100 transition-opacity duration-500"
        style={{
          background: "radial-gradient(125% 125% at 50% 10%, #fff 60%, #f5b2b2ff 85%, #fca5a5 100%)"
        }}
      ></div>
      
      {/* Radial Gradient Background - Dark Mode */}
      <div 
        className="absolute inset-0 dark:opacity-100 opacity-0 transition-opacity duration-500"
        style={{
          background: "radial-gradient(125% 125% at 50% 10%, #1e1e2e 60%, #3f1a1a 85%, #581c1c 100%)"
        }}
      ></div>
      
      {/* Subtle noise texture overlay for added depth */}
      <div 
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      ></div>
    </div>
  );
};

export default AnimatedBackground;
