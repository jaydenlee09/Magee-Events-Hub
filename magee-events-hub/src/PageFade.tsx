import React, { useEffect, useState } from 'react';

const FADE_DURATION = 500; // ms

const PageFade: React.FC = () => {
  const [visible, setVisible] = useState(true); // controls opacity
  const [mounted, setMounted] = useState(true); // controls unmount

  useEffect(() => {
    // Start fade out after a tick
    const fadeTimeout = setTimeout(() => setVisible(false), 10);
    // Unmount after fade duration
    const unmountTimeout = setTimeout(() => setMounted(false), FADE_DURATION + 10);
    return () => {
      clearTimeout(fadeTimeout);
      clearTimeout(unmountTimeout);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] transition-opacity duration-500 pointer-events-none"
      style={{
        backgroundColor: typeof window !== 'undefined' && document.documentElement.classList.contains('dark')
          ? 'black'
          : 'white',
        opacity: visible ? 1 : 0,
      }}
    />
  );
};

export default PageFade; 