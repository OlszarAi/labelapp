'use client';

import { useEffect, useRef } from 'react';

// Rozszerzenie typu Window o właściwość HSStaticMethods
declare global {
  interface Window {
    HSStaticMethods?: {
      autoInit: () => void;
    }
  }
}

// Rozszerzenie typu modułu Preline
interface PrelineType {
  default: any;
  initComponents?: () => void;
}

export default function PrelineScript() {
  // Use ref to track if initialization has occurred
  const initialized = useRef(false);
  
  useEffect(() => {
    // Check if window object exists (client-side only)
    if (typeof window !== 'undefined' && !initialized.current) {
      // Import the Preline library and initialize it properly
      const initPreline = async () => {
        try {
          // Dynamically import the Preline library with better error handling
          const Preline = await import('preline/preline') as PrelineType;
          
          // Check if HSStaticMethods exists before calling autoInit
          if (window.HSStaticMethods) {
            window.HSStaticMethods.autoInit();
          } else {
            // If HSStaticMethods doesn't exist yet, try initializing Preline directly
            if (Preline && typeof Preline.initComponents === 'function') {
              Preline.initComponents();
            } else {
              console.warn('Preline initialization methods not found');
            }
          }
          
          // Mark as initialized to prevent repeated initializations
          initialized.current = true;
        } catch (error) {
          console.error('Error initializing Preline:', error);
        }
      };

      // Call once when component is mounted
      initPreline();
      
      // Define a more efficient reinit function that only runs if needed
      const reinitPreline = () => {
        if (window.HSStaticMethods) {
          window.HSStaticMethods.autoInit();
        }
      };

      // Re-initialize after route changes, with better event handling
      document.addEventListener('turbo:load', reinitPreline);
      document.addEventListener('turbo:render', reinitPreline);

      // Cleanup on unmount
      return () => {
        document.removeEventListener('turbo:load', reinitPreline);
        document.removeEventListener('turbo:render', reinitPreline);
      };
    }
  }, []);

  // This component doesn't render anything
  return null;
}