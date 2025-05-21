"use client";

import { useState, useEffect, useRef, useCallback, memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useAuth } from '@/lib/hooks/useAuth';

// Dynamic imports for better code splitting
const ThemeToggle = dynamic(() => import('@/components/ui/ThemeToggle'), {
  ssr: false
});
const AnimatedBackground = dynamic(() => import('@/components/ui/AnimatedBackground'), {
  ssr: false
});
const ActionButton = dynamic(() => import('@/components/ui/ActionButton'));
const AuthModal = dynamic(() => import('@/components/ui/AuthModal'), {
  ssr: false
});

export default function Home() {
  // State for auth modal
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  
  // State for scroll-triggered animations
  const [scrollY, setScrollY] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  
  // References for components
  const userDropdownRef = useRef<HTMLDivElement>(null);
  
  // Auth context
  const { user, isAuthenticated, logout } = useAuth();
  
  // Refs for scroll sections
  const featuresRef = useRef<HTMLDivElement>(null);
  const editorDemoRef = useRef<HTMLDivElement>(null);
  
  // Handle click outside dropdown menu - optimized with useCallback
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
      setUserDropdownOpen(false);
    }
  }, []);
  
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);
  
  // Login handling functions - optimized with useCallback
  const handleOpenLoginModal = useCallback(() => {
    setAuthModalMode('login');
    setAuthModalOpen(true);
  }, []);
  
  const handleOpenRegisterModal = useCallback(() => {
    setAuthModalMode('register');
    setAuthModalOpen(true);
  }, []);
  
  const handleCloseAuthModal = useCallback(() => {
    setAuthModalOpen(false);
  }, []);
  
  // Logout handler - optimized with useCallback
  const handleLogout = useCallback(async () => {
    const success = await logout();
    if (success) {
      setUserDropdownOpen(false);
    }
  }, [logout]);
  
  // User dropdown handler - optimized with useCallback
  const toggleUserDropdown = useCallback(() => {
    setUserDropdownOpen(prev => !prev);
  }, []);
  
  // Smooth scroll function - optimized with useCallback
  const scrollToSection = useCallback((ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      window.scrollTo({
        top: ref.current.offsetTop,
        behavior: 'smooth'
      });
    }
  }, []);
  
  // Update scroll position with throttling for better performance
  useEffect(() => {
    let lastScrollY = 0;
    let ticking = false;
    
    const handleScroll = () => {
      lastScrollY = window.scrollY;
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(lastScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Initial animation and data loading
  useEffect(() => {
    setIsClient(true);
    
    // Display initial animation then set to false
    const timer = setTimeout(() => {
      setInitialLoad(false);
    }, 1500);
    
    // Check theme with a more efficient observer
    if (typeof window !== 'undefined') {
      try {
        const isDark = document.documentElement.classList.contains('dark');
        setIsDarkTheme(isDark);
        
        // Add theme change listener with MutationObserver
        const observer = new MutationObserver((mutations) => {
          for (const mutation of mutations) {
            if (mutation.attributeName === 'class') {
              const isDark = document.documentElement.classList.contains('dark');
              setIsDarkTheme(isDark);
              break; // Exit loop once we've found what we need
            }
          }
        });
        
        observer.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ['class'],
        });
        
        return () => {
          observer.disconnect();
          clearTimeout(timer);
        };
      } catch (error) {
        console.error('Error with theme observer:', error);
      }
    }
    
    return () => clearTimeout(timer);
  }, []);

  // Format date for display - memoized
  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }, []);

  // Calculate opacity based on scroll position for parallax effects
  const heroOpacity = Math.max(0, Math.min(1, 1 - scrollY / 500));
  const scrollIndicatorOpacity = Math.max(0, Math.min(1, 1 - scrollY / 200));

  return (
    <main className="flex min-h-screen flex-col items-center justify-between relative overflow-hidden">
      {/* Animated background */}
      <AnimatedBackground />
      
      {/* Content overlay */}
      <div className="z-10 flex flex-col items-center w-full">
        {/* Sticky navigation bar with theme toggle */}
        <nav className={`w-full flex justify-between items-center py-4 px-6 backdrop-blur-lg bg-white/50 dark:bg-gray-900/50 fixed top-0 z-20 transition-all duration-300 ${scrollY > 50 ? 'shadow-md bg-white/80 dark:bg-gray-900/80' : ''}`}>
          <div className="flex items-center">
            <span className="font-bold text-xl text-gray-800 dark:text-white">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">Label</span>Generator
            </span>
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => scrollToSection(featuresRef)}
              className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              Funkcje
            </button>
            <button 
              onClick={() => scrollToSection(editorDemoRef)}
              className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              Edytor
            </button>
            <Link href="/projekty" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              Projekty
            </Link>
            <Link href="/editor" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              Edytor
            </Link>

            {/* AUTH BUTTONS */}
            {isAuthenticated ? (
              <div className="relative" ref={userDropdownRef}>
                <button 
                  onClick={toggleUserDropdown}
                  className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors py-2 px-3 rounded-lg bg-white/40 dark:bg-indigo-950/40 border border-gray-200/50 dark:border-indigo-500/30"
                >
                  <span className="font-medium">{user?.username}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-4 h-4 transition-transform duration-300 ${userDropdownOpen ? 'rotate-180' : ''}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>

                {/* User Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 py-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-indigo-900/40 z-30 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80">
                    <Link href="/profile" className="block px-4 py-2.5 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-purple-600 dark:hover:text-purple-400">
                      <div className="flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                        Mój profil
                      </div>
                    </Link>
                    <Link href="/projekty" className="block px-4 py-2.5 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-purple-600 dark:hover:text-purple-400">
                      <div className="flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
                        </svg>
                        Moje projekty
                      </div>
                    </Link>
                    <div className="my-1 border-t border-gray-200 dark:border-gray-700"></div>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-400"
                    >
                      <div className="flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                        </svg>
                        Wyloguj
                      </div>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleOpenLoginModal}
                  className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  Logowanie
                </button>
                <button
                  onClick={handleOpenRegisterModal}
                  className="py-2 px-4 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium rounded-lg hover:shadow-lg transition-shadow dark:from-indigo-500 dark:to-blue-500"
                >
                  Rejestracja
                </button>
              </div>
            )}

            {/* Theme toggle with tooltip */}
            <div className="relative group">
              <ThemeToggle />
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {isDarkTheme ? "Light mode" : "Dark mode"}
              </span>
            </div>
          </div>
        </nav>

        {/* Minimalist Hero section with initial loading animation */}
        <section 
          className="w-full h-screen flex flex-col items-center justify-center px-4 transition-opacity duration-1000"
          style={{ opacity: heroOpacity }}
        >
          <div className={`max-w-4xl mx-auto text-center transition-all duration-1000 ${initialLoad ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-800 dark:text-white mb-4 tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600 animate-text dark:from-indigo-400 dark:via-blue-400 dark:to-indigo-400">
                Label Generator
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-200 mb-12 max-w-xl mx-auto opacity-90">
              Aplikacja do generowania etykiet
            </p>
            
            <div className={`flex flex-col sm:flex-row gap-4 justify-center mt-12 transition-all duration-1000 delay-300 ${initialLoad ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0'}`}>
              <Link href="/editor" className="w-full sm:w-auto">
                <ActionButton
                  title="Stwórz etykiety"
                  variant="primary"
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
                    </svg>
                  }
                />
              </Link>
              <Link href="/projekty" className="w-full sm:w-auto">
                <ActionButton
                  title="Import etykiet"
                  variant="secondary"
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                    </svg>
                  }
                />
              </Link>
            </div>
          </div>
          
          {/* Scroll indicator */}
          <div 
            className="absolute bottom-12 animate-scroll-down cursor-pointer transition-opacity duration-300"
            style={{ opacity: scrollIndicatorOpacity }}
            onClick={() => scrollToSection(featuresRef)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mx-auto text-gray-500 dark:text-blue-400/80">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 5.25l-7.5 7.5-7.5-7.5m15 6l-7.5 7.5-7.5-7.5" />
            </svg>
            <span className="text-sm text-gray-500 dark:text-blue-400/80 font-light">Przewiń w dół</span>
          </div>
        </section>

        {/* Features Section with scroll reveal - Lazily loaded out of initial viewport */}
        <section 
          ref={featuresRef}
          className="w-full py-24 px-4 min-h-screen flex items-center"
        >
          <div className="max-w-5xl mx-auto">
            <h2 className={`text-3xl md:text-4xl font-bold text-center mb-24 text-gray-800 dark:text-white transition-all duration-700`}>
              <span className="relative">
                Co oferuje nasza aplikacja?
                <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 dark:from-indigo-400 dark:to-blue-400"></span>
              </span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
              {/* Feature 1 */}
              <div className={`feature-card backdrop-blur-md bg-white/60 dark:bg-indigo-950/40 p-8 rounded-xl shadow-lg border border-gray-100/50 dark:border-indigo-500/20 transition-all duration-700 transform hover:scale-105 group ${scrollY > 300 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}>
                <div className="text-purple-500 dark:text-indigo-400 mb-6 flex justify-center">
                  <div className="relative">
                    <Image src="/file.svg" alt="Intuicyjny edytor" width={72} height={72} className="relative z-10" priority={false} />
                    <div className="absolute inset-0 bg-purple-100 dark:bg-indigo-500/30 rounded-full blur-xl opacity-70 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-indigo-200 text-center group-hover:text-purple-600 dark:group-hover:text-indigo-300 transition-colors">Intuicyjny edytor</h3>
                <p className="text-gray-600 dark:text-indigo-100/80 text-center">
                  Projektuj etykiety bez wiedzy technicznej dzięki prostemu interfejsowi
                </p>
              </div>
              
              {/* Feature 2 */}
              <div className={`feature-card backdrop-blur-md bg-white/60 dark:bg-indigo-950/40 p-8 rounded-xl shadow-lg border border-gray-100/50 dark:border-blue-500/20 transition-all duration-700 transform hover:scale-105 group ${scrollY > 300 ? "opacity-100 translate-y-0 delay-150" : "opacity-0 translate-y-12"}`}>
                <div className="text-blue-500 dark:text-blue-400 mb-6 flex justify-center">
                  <div className="relative">
                    <Image src="/window.svg" alt="Szablony" width={72} height={72} className="relative z-10" priority={false} />
                    <div className="absolute inset-0 bg-blue-100 dark:bg-blue-500/30 rounded-full blur-xl opacity-70 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-blue-200 text-center group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">Szablony etykiet</h3>
                <p className="text-gray-600 dark:text-blue-100/80 text-center">
                  Wybieraj spośród gotowych szablonów lub twórz własne projekty
                </p>
              </div>
              
              {/* Feature 3 */}
              <div className={`feature-card backdrop-blur-md bg-white/60 dark:bg-indigo-950/40 p-8 rounded-xl shadow-lg border border-gray-100/50 dark:border-violet-500/20 transition-all duration-700 transform hover:scale-105 group ${scrollY > 300 ? "opacity-100 translate-y-0 delay-300" : "opacity-0 translate-y-12"}`}>
                <div className="text-teal-500 dark:text-violet-400 mb-6 flex justify-center">
                  <div className="relative">
                    <Image src="/globe.svg" alt="Eksport" width={72} height={72} className="relative z-10" priority={false} />
                    <div className="absolute inset-0 bg-teal-100 dark:bg-violet-500/30 rounded-full blur-xl opacity-70 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-violet-200 text-center group-hover:text-teal-600 dark:group-hover:text-violet-300 transition-colors">Eksport do PDF</h3>
                <p className="text-gray-600 dark:text-violet-100/80 text-center">
                  Generuj etykiety gotowe do druku lub udostępniania online
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Editor Preview Section with optimized rendering */}
        <section
          ref={editorDemoRef} 
          className={`w-full py-32 px-4 min-h-screen flex items-center bg-gradient-to-b from-gray-900/0 via-indigo-950/20 to-gray-900/0 backdrop-blur-sm transition-all duration-700 dark:from-gray-900/0 dark:via-indigo-950/40 dark:to-gray-900/0`}
        >
          <div className="max-w-6xl mx-auto relative">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-20 text-gray-800 dark:text-white">
              <span className="relative">
                Zobacz edytor w akcji
                <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-400 dark:to-indigo-400"></span>
              </span>
            </h2>
            
            <div className={`relative mx-auto max-w-4xl transition-all duration-1000 ${scrollY > 750 ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
              {/* Mockup editor in Mac/Chrome style */}
              <div className="w-full rounded-lg overflow-hidden shadow-2xl border border-gray-200/10 dark:border-indigo-500/10 will-change-transform">
                {/* Browser bar - simplified for better performance */}
                <div className="h-8 bg-gray-800/90 dark:bg-gray-900 rounded-t-lg flex items-center px-2">
                  <div className="w-3 h-3 rounded-full bg-red-400 mr-2"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                
                {/* Editor interface */}
                <div className="bg-indigo-950/90 dark:bg-gray-900/95 aspect-video w-full flex items-center justify-center p-6">
                  <div className="flex w-full h-full">
                    {/* Sidebar */}
                    <div className="w-1/3 h-full bg-indigo-900/70 dark:bg-indigo-950/80 rounded-l-md p-3 flex flex-col gap-3">
                      <div className="w-full h-6 bg-indigo-800/80 dark:bg-indigo-800/60 rounded"></div>
                      <div className="w-3/4 h-6 bg-indigo-800/80 dark:bg-indigo-800/60 rounded"></div>
                      <div className="w-full h-6 bg-indigo-800/80 dark:bg-indigo-800/60 rounded"></div>
                      
                      <div className="mt-4 w-full">
                        <div className="w-full h-8 bg-purple-700/40 dark:bg-purple-800/30 rounded mb-3"></div>
                        <div className="w-full h-8 bg-blue-700/40 dark:bg-blue-800/30 rounded mb-3"></div>
                        <div className="w-full h-8 bg-indigo-700/40 dark:bg-indigo-800/30 rounded"></div>
                      </div>
                    </div>
                    
                    {/* Canvas area */}
                    <div className="w-2/3 h-full bg-gray-800/80 dark:bg-gray-900/80 rounded-r-md flex items-center justify-center">
                      <div className="w-4/5 h-4/5 border-2 border-dashed border-blue-400/40 dark:border-blue-500/40 rounded flex items-center justify-center p-4 relative">
                        
                        {/* Label mock-up */}
                        <div className="absolute w-4/5 h-3/5 bg-blue-100/20 dark:bg-indigo-900/40 rounded-md flex flex-col p-2">
                          {/* Top bars */}
                          <div className="w-full flex">
                            <div className="w-2/3">
                              <div className="h-3 w-full bg-blue-200/30 dark:bg-indigo-400/30 rounded mb-1.5"></div>
                              <div className="h-2 w-2/3 bg-blue-200/30 dark:bg-indigo-400/30 rounded"></div>
                            </div>
                            <div className="w-1/3 flex justify-end">
                              <div className="w-12 h-12 bg-blue-300/30 dark:bg-indigo-300/20 rounded"></div>
                            </div>
                          </div>
                          
                          {/* Middle bars */}
                          <div className="my-auto">
                            <div className="h-2 w-1/2 bg-blue-200/30 dark:bg-indigo-400/30 rounded mb-1.5"></div>
                            <div className="h-2 w-3/4 bg-blue-200/30 dark:bg-indigo-400/30 rounded"></div>
                          </div>
                          
                          {/* Bottom bar */}
                          <div className="mt-auto">
                            <div className="h-2 w-full bg-blue-200/30 dark:bg-indigo-400/30 rounded"></div>
                          </div>
                        </div>
                        
                        {/* Cursor indicator - blinking dot */}
                        <div className="absolute bottom-4 right-4 w-1.5 h-1.5 bg-blue-400/80 dark:bg-blue-400/80 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Button below editor */}
            <div className="text-center mt-12">
              <Link href="/editor">
                <ActionButton 
                  title="Wypróbuj edytor" 
                  variant="primary"
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.688c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 0 1 0 1.953l-7.108 4.062A1.125 1.125 0 0 1 3 16.81V8.688ZM12.75 8.688c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 0 1 0 1.953l-7.108 4.062a1.125 1.125 0 0 1-1.683-.977V8.688Z" />
                    </svg>
                  }
                />
              </Link>
            </div>
          </div>
        </section>

        {/* Footer with slight blur effect */}
        <footer className="w-full py-10 px-4 bg-white/30 dark:bg-indigo-950/30 backdrop-blur-md border-t border-gray-200/50 dark:border-indigo-500/20">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="font-bold text-xl">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500 dark:from-indigo-400 dark:to-blue-400">Label</span>Generator
              </span>
              <p className="text-sm text-gray-600 dark:text-indigo-200/80 mt-2">© 2025 Label Generator. Wszystkie prawa zastrzeżone.</p>
            </div>
            <div className="flex gap-6">
              <Link href="/editor" className="text-gray-600 dark:text-indigo-300 hover:text-purple-600 dark:hover:text-indigo-400 transition-colors">Edytor</Link>
              <Link href="/projekty" className="text-gray-600 dark:text-indigo-300 hover:text-purple-600 dark:hover:text-indigo-400 transition-colors">Projekty</Link>
              <Link href="#" className="text-gray-600 dark:text-indigo-300 hover:text-purple-600 dark:hover:text-indigo-400 transition-colors">Pomoc</Link>
            </div>
          </div>
        </footer>
      </div>

      {/* Auth modal */}
      {authModalOpen && (
        <AuthModal 
          isOpen={authModalOpen} 
          onClose={handleCloseAuthModal} 
          initialMode={authModalMode}
        />
      )}
    </main>
  );
}