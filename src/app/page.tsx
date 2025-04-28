"use client";

import { useState, useEffect } from "react";

export default function Home() {
  // Stan dla motywu (jasny/ciemny)
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Efekt do wykrywania preferencji systemowych przy montowaniu komponentu
  useEffect(() => {
    // Sprawdź czy użytkownik ma ustawiony ciemny motyw w systemie
    if (typeof window !== 'undefined') {
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDarkMode);
      
      // Nasłuchuj zmian w preferencjach systemowych
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        setIsDarkMode(e.matches);
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  // Funkcja do przełączania motywu
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      {/* Animowane tło z gradientem */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-purple-100 via-blue-50 to-teal-100 dark:from-purple-900 dark:via-blue-950 dark:to-teal-900 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,rgba(120,119,198,0.3),transparent)]"></div>
        <div className="absolute w-[500px] h-[500px] rounded-full bg-pink-200/20 dark:bg-pink-700/20 blur-3xl -top-20 -left-20 animate-blob"></div>
        <div className="absolute w-[400px] h-[400px] rounded-full bg-blue-200/20 dark:bg-blue-700/20 blur-3xl top-1/4 left-1/3 animate-blob animation-delay-2000"></div>
        <div className="absolute w-[600px] h-[600px] rounded-full bg-teal-200/20 dark:bg-teal-700/20 blur-3xl top-1/2 left-1/2 animate-blob animation-delay-4000"></div>
      </div>

      {/* Przycisk zmiany motywu */}
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-white/20 dark:bg-black/20 backdrop-blur-sm hover:bg-white/30 dark:hover:bg-black/30 transition-all shadow-lg"
        >
          {isDarkMode ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
            </svg>
          )}
        </button>
      </div>

      {/* Główna zawartość */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8 text-center">
        <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-teal-500 dark:from-purple-400 dark:via-blue-400 dark:to-teal-300 bg-clip-text text-transparent mb-6 animate-text">
          Label Generator
        </h1>
        
        <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-12 max-w-lg">
          Aplikacja do generowania etykiet.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Niestandardowy przycisk "Stwórz etykiety" */}
          <button className="relative px-8 py-4 overflow-hidden font-semibold rounded-full bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
            <span className="relative z-10">Stwórz etykiety</span>
            <span className="absolute inset-0 bg-gradient-to-r from-teal-400 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></span>
          </button>
          
          {/* Przycisk "Import" */}
          <button className="px-8 py-4 font-semibold text-gray-700 dark:text-gray-300 border-2 border-gray-400 dark:border-gray-600 rounded-full hover:bg-white/20 dark:hover:bg-black/20 backdrop-blur-sm transition-all duration-300 hover:border-purple-500 dark:hover:border-purple-400">
            Import
          </button>
        </div>
      </main>
    </div>
  );
}
