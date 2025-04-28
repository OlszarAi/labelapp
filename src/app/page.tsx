"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ThemeToggle from '@/components/ui/ThemeToggle';
import AnimatedBackground from '@/components/ui/AnimatedBackground';
import ActionButton from '@/components/ui/ActionButton';

export default function Home() {
  // State for scroll-triggered animations
  const [scrollY, setScrollY] = useState(0);
  
  // Update scroll position
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between relative overflow-hidden">
      {/* Animowane tło */}
      <AnimatedBackground />
      
      {/* Zawartość nakładana na tło */}
      <div className="z-10 flex flex-col items-center w-full">
        {/* Navigation bar with theme toggle */}
        <nav className="w-full flex justify-between items-center py-4 px-6 backdrop-blur-sm bg-white/30 dark:bg-gray-900/30 fixed top-0 z-20">
          <div className="flex items-center">
            <span className="font-bold text-xl text-gray-800 dark:text-white">
              <span className="text-purple-600">Label</span>Generator
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/editor" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              Edytor
            </Link>
            <Link href="/projects" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              Projekty
            </Link>
            <ThemeToggle />
          </div>
        </nav>

        {/* Hero section */}
        <section className="w-full pt-32 pb-16 md:pb-24 px-4 flex flex-col items-center">
          <div className="max-w-5xl mx-auto text-center relative">
            {/* Decorative elements */}
            <div className="absolute -top-16 -left-16 w-32 h-32 bg-purple-200 dark:bg-purple-900/30 rounded-full filter blur-3xl opacity-60 animate-pulse"></div>
            <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-blue-200 dark:bg-blue-900/30 rounded-full filter blur-3xl opacity-60 animate-pulse animation-delay-2000"></div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-800 dark:text-white mb-4 animate-fade-in relative">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600 animate-text relative">
                Label Generator
              </span>
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-purple-400 rounded-full opacity-80 animate-ping"></div>
              <div className="absolute bottom-1 -left-2 w-3 h-3 bg-blue-400 rounded-full opacity-80 animate-ping animation-delay-2000"></div>
            </h1>
            
            <p className="text-lg md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto animate-fade-in-delay">
              Tworzenie profesjonalnych etykiet jeszcze nigdy nie było tak proste!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12 animate-fade-in-delay-2">
              <Link href="/editor" className="w-full sm:w-auto">
                <ActionButton
                  title="Rozpocznij projekt"
                  description="Stwórz swoje pierwsze etykiety"
                  variant="primary"
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
                    </svg>
                  }
                />
              </Link>
              <Link href="/projects" className="w-full sm:w-auto">
                <ActionButton
                  title="Moje projekty"
                  description="Przeglądaj zapisane szablony"
                  variant="secondary"
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                    </svg>
                  }
                />
              </Link>
            </div>
            
            {/* Scroll indicator */}
            <div className="mt-16 animate-bounce opacity-70">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mx-auto text-gray-500 dark:text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
              </svg>
            </div>
          </div>
        </section>

        {/* Feature showcase */}
        <section className="w-full bg-gradient-to-b from-white/90 to-white/70 dark:from-gray-900/90 dark:to-gray-900/70 backdrop-blur-sm py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className={`text-3xl md:text-4xl font-bold text-center mb-16 text-gray-800 dark:text-white transition-all duration-500 ${scrollY > 100 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <span className="relative">
                Co oferuje nasza aplikacja?
                <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
              </span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className={`feature-card backdrop-blur-md bg-white/90 dark:bg-gray-800/90 p-8 rounded-xl shadow-lg hover:shadow-xl border border-gray-100 dark:border-gray-700 transition-all duration-500 transform ${scrollY > 200 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"} group`}>
                <div className="text-purple-500 mb-6 flex justify-center group-hover:scale-110 transition-transform duration-300">
                  <div className="relative">
                    <Image src="/file.svg" alt="Intuicyjny edytor" width={72} height={72} className="relative z-10" />
                    <div className="absolute inset-0 bg-purple-100 dark:bg-purple-900/30 rounded-full blur-xl opacity-70 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white text-center group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Intuicyjny edytor</h3>
                <p className="text-gray-600 dark:text-gray-300 text-center">
                  Projektuj etykiety bez wiedzy technicznej dzięki intuicyjnemu interfejsowi typu drag-and-drop
                </p>
              </div>
              
              {/* Feature 2 */}
              <div className={`feature-card backdrop-blur-md bg-white/90 dark:bg-gray-800/90 p-8 rounded-xl shadow-lg hover:shadow-xl border border-gray-100 dark:border-gray-700 transition-all duration-500 transform ${scrollY > 200 ? "opacity-100 translate-y-0 delay-150" : "opacity-0 translate-y-12"} group`}>
                <div className="text-blue-500 mb-6 flex justify-center group-hover:scale-110 transition-transform duration-300">
                  <div className="relative">
                    <Image src="/window.svg" alt="Szablony" width={72} height={72} className="relative z-10" />
                    <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30 rounded-full blur-xl opacity-70 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white text-center group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Szablony etykiet</h3>
                <p className="text-gray-600 dark:text-gray-300 text-center">
                  Wybieraj spośród gotowych szablonów lub twórz własne, dostosowane do Twoich potrzeb
                </p>
              </div>
              
              {/* Feature 3 */}
              <div className={`feature-card backdrop-blur-md bg-white/90 dark:bg-gray-800/90 p-8 rounded-xl shadow-lg hover:shadow-xl border border-gray-100 dark:border-gray-700 transition-all duration-500 transform ${scrollY > 200 ? "opacity-100 translate-y-0 delay-300" : "opacity-0 translate-y-12"} group`}>
                <div className="text-teal-500 mb-6 flex justify-center group-hover:scale-110 transition-transform duration-300">
                  <div className="relative">
                    <Image src="/globe.svg" alt="Eksport" width={72} height={72} className="relative z-10" />
                    <div className="absolute inset-0 bg-teal-100 dark:bg-teal-900/30 rounded-full blur-xl opacity-70 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white text-center group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">Eksport do PDF</h3>
                <p className="text-gray-600 dark:text-gray-300 text-center">
                  Generuj etykiety w formacie PDF gotowe do druku lub udostępniania online
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive demo preview */}
        <section className={`w-full py-24 px-4 overflow-hidden relative transition-all duration-700 ${scrollY > 500 ? "opacity-100" : "opacity-0"}`}>
          <div className="max-w-5xl mx-auto relative">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-800 dark:text-white">
              Zobacz edytor w akcji
            </h2>
            
            <div className="relative mx-auto max-w-3xl aspect-video rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 transform hover:scale-[1.01] transition-transform duration-300">
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-100 via-white to-blue-100 dark:from-purple-900/30 dark:via-gray-800 dark:to-blue-900/30 animate-gradient"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4/5 h-4/5 bg-white dark:bg-gray-800 rounded-lg shadow-lg flex flex-col">
                  <div className="h-8 bg-gray-100 dark:bg-gray-700 rounded-t-lg flex items-center px-4">
                    <div className="w-3 h-3 rounded-full bg-red-400 mr-2"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="flex-1 p-4 flex">
                    <div className="w-1/3 bg-gray-50 dark:bg-gray-900 rounded mr-2 p-2">
                      <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                      <div className="w-3/4 h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                      <div className="w-5/6 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                    <div className="w-2/3 bg-blue-50 dark:bg-blue-900/20 rounded flex items-center justify-center">
                      <div className="w-2/3 h-2/3 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded flex items-center justify-center animate-pulse">
                        <span className="text-blue-500 dark:text-blue-400 text-sm">Etykieta</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Link href="/editor" className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 translate-y-0 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <ActionButton 
                    title="Wypróbuj edytor" 
                    variant="primary"
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.688c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 0 1 0 1.953l-7.108 4.062A1.125 1.125 0 0 1 3 16.81V8.688ZM12.75 8.688c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 0 1 0 1.953l-7.108 4.062a1.125 1.125 0 0 1-1.683-.977V8.688Z" />
                      </svg>
                    }
                  />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Call to action */}
        <section className="w-full py-20 px-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className={`text-2xl md:text-3xl font-bold mb-8 text-gray-800 dark:text-white transition-all duration-500 ${scrollY > 800 ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
              Gotowy, by rozpocząć tworzenie profesjonalnych etykiet?
            </h2>
            <div className={`transition-all duration-500 delay-200 ${scrollY > 800 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <Link href="/editor" className="inline-block">
                <ActionButton
                  title="Przejdź do edytora"
                  variant="primary"
                  className="mx-auto max-w-md"
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                    </svg>
                  }
                />
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full py-10 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="font-bold text-xl">
                <span className="text-purple-600">Label</span>Generator
              </span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">© 2025 Label Generator. Wszystkie prawa zastrzeżone.</p>
            </div>
            <div className="flex gap-6">
              <Link href="/editor" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Edytor</Link>
              <Link href="/projects" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Projekty</Link>
              <Link href="#" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Pomoc</Link>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}