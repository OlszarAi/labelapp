'use client';

import { useEffect } from 'react';

export default function PrelineScript() {
  useEffect(() => {
    // Check if window object exists (client-side only)
    if (typeof window !== 'undefined') {
      // Import the Preline library and initialize it properly
      const initPreline = async () => {
        try {
          // Dynamically import the Preline library
          const Preline = await import('preline/preline');
          
          // Check if HSStaticMethods exists before calling autoInit
          if (window.HSStaticMethods) {
            // @ts-ignore
            window.HSStaticMethods.autoInit();
          } else {
            // If HSStaticMethods doesn't exist yet, try initializing Preline directly
            if (Preline && typeof Preline.initComponents === 'function') {
              Preline.initComponents();
            } else {
              console.warn('Preline initialization methods not found');
            }
          }
        } catch (error) {
          console.error('Error initializing Preline:', error);
        }
      };

      // Call once when component is mounted
      initPreline();

      // Re-initialize after route changes
      document.addEventListener('turbo:load', initPreline);
      document.addEventListener('turbo:render', initPreline);

      // Cleanup on unmount
      return () => {
        document.removeEventListener('turbo:load', initPreline);
        document.removeEventListener('turbo:render', initPreline);
      };
    }
  }, []);

  // This component doesn't render anything
  return null;
}