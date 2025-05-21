"use client";

import { useState, useEffect, useCallback, memo } from "react";

const ThemeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Effect to detect preferences on component mount
  useEffect(() => {
    setIsMounted(true);
    
    if (typeof window !== 'undefined') {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    }
  }, []);

  // Function to toggle theme with animation - optimized with useCallback
  const toggleTheme = useCallback(() => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    // Update document class
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    
    // Reset animation state after transition completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 800);
  }, [isDarkMode, isAnimating]);

  // Don't render button until we check preferences
  // to avoid UI flickering
  if (!isMounted) {
    return null;
  }

  return (
    <button
      onClick={toggleTheme}
      disabled={isAnimating}
      className={`relative overflow-hidden p-2 rounded-full transition-all duration-500 ${
        isDarkMode
          ? "bg-gradient-to-b from-indigo-800 to-violet-900 text-yellow-300"
          : "bg-gradient-to-b from-blue-100 to-indigo-100 text-blue-600"
      } shadow-lg ${isAnimating ? "scale-90" : "hover:scale-105"}`}
      aria-label={isDarkMode ? "Przełącz na jasny motyw" : "Przełącz na ciemny motyw"}
    >
      {/* Glowing backdrop in dark mode */}
      <div className={`absolute inset-0 bg-indigo-400/10 dark:bg-indigo-400/30 rounded-full blur-xl transition-opacity duration-500 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}></div>
      
      {/* Inner content with icons */}
      <div className="relative z-10 w-6 h-6">
        {/* Sun icon */}
        <div
          className={`absolute inset-0 transition-all duration-700 transform ${
            isDarkMode ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
          </svg>
        </div>
        
        {/* Moon icon */}
        <div
          className={`absolute inset-0 transition-all duration-700 transform ${
            isDarkMode ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      
      {/* Stars appearing animation in dark mode */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute top-1 right-1 w-1 h-1 rounded-full bg-yellow-200 transition-opacity duration-500 ${isDarkMode ? 'opacity-100' : 'opacity-0'} delay-300`}></div>
        <div className={`absolute bottom-1 left-2 w-0.5 h-0.5 rounded-full bg-yellow-200 transition-opacity duration-500 ${isDarkMode ? 'opacity-100' : 'opacity-0'} delay-500`}></div>
        <div className={`absolute top-2 left-1 w-0.5 h-0.5 rounded-full bg-yellow-200 transition-opacity duration-500 ${isDarkMode ? 'opacity-100' : 'opacity-0'} delay-100`}></div>
      </div>
      
      {/* Visual feedback effect when clicking */}
      <span className={`absolute inset-0 rounded-full bg-white opacity-0 ${isAnimating ? 'animate-ping' : ''}`}></span>
    </button>
  );
}

// Export as a memoized component to prevent unnecessary re-renders
export default memo(ThemeToggle);