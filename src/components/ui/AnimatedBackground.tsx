"use client";

import { useEffect, useState } from 'react';

export default function AnimatedBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Update mouse position with some smoothing
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient background - ulepszone tło w trybie ciemnym */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50/30 to-white dark:from-gray-900 dark:via-indigo-950/20 dark:to-gray-900 transition-colors duration-700"></div>
      
      {/* Interactive gradient overlay that reacts to mouse position - poprawione dla trybu ciemnego */}
      <div 
        className="absolute inset-0 bg-[radial-gradient(circle_800px_at_var(--x)_var(--y),rgba(120,119,198,0.15),transparent_70%)] dark:bg-[radial-gradient(circle_800px_at_var(--x)_var(--y),rgba(147,197,253,0.15),transparent_70%)] transition-opacity duration-500"
        style={{ 
          '--x': `${mousePosition.x * 100}%`, 
          '--y': `${mousePosition.y * 100}%` 
        } as React.CSSProperties}
      ></div>
      
      {/* Ulepszone animowane blobs z lepszymi kolorami w trybie ciemnym */}
      <div className="absolute w-[700px] h-[700px] rounded-full bg-purple-100/15 dark:bg-indigo-600/10 blur-3xl -top-[10%] -left-[10%] animate-slow-blob"></div>
      <div className="absolute w-[600px] h-[600px] rounded-full bg-blue-100/15 dark:bg-blue-500/10 blur-3xl top-[30%] left-[40%] animate-slow-blob animation-delay-2000"></div>
      <div className="absolute w-[800px] h-[800px] rounded-full bg-indigo-100/15 dark:bg-violet-500/10 blur-3xl top-[60%] left-[60%] animate-slow-blob animation-delay-4000"></div>
      <div className="absolute w-[500px] h-[500px] rounded-full bg-sky-100/15 dark:bg-sky-500/10 blur-3xl bottom-[5%] right-[5%] animate-slow-blob animation-delay-3000"></div>
      
      {/* Small decorative particles - jaśniejsze w trybie ciemnym */}
      <div className="absolute top-1/4 left-1/3 w-4 h-4 rounded-full bg-purple-400/20 dark:bg-blue-400/40 animate-float"></div>
      <div className="absolute top-3/4 left-2/3 w-3 h-3 rounded-full bg-blue-400/20 dark:bg-indigo-400/40 animate-float animation-delay-2000"></div>
      <div className="absolute top-2/4 left-1/4 w-5 h-5 rounded-full bg-indigo-400/20 dark:bg-violet-400/40 animate-float animation-delay-3000"></div>
      
      {/* Subtle grid effect for depth - jaśniejszy w trybie ciemnym */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:50px_50px] opacity-30"></div>
      
      {/* Dodajemy więcej dynamicznych animowanych elementów */}
      <div className="absolute left-1/4 bottom-1/4 w-32 h-32 rounded-full bg-gradient-to-r from-purple-400/5 to-pink-400/5 dark:from-purple-400/5 dark:to-blue-400/5 blur-xl animate-pulse-slow"></div>
      <div className="absolute right-1/4 top-1/4 w-24 h-24 rounded-full bg-gradient-to-r from-blue-400/5 to-teal-400/5 dark:from-indigo-400/5 dark:to-sky-400/5 blur-xl animate-pulse-slow animation-delay-2000"></div>
      
      {/* Shooting stars efekt w trybie ciemnym */}
      <div className="hidden dark:block absolute w-0.5 h-20 bg-blue-300/40 blur-sm rotate-[30deg] left-[15%] top-[20%] animate-shooting-star"></div>
      <div className="hidden dark:block absolute w-0.5 h-16 bg-purple-300/40 blur-sm rotate-[30deg] left-[75%] top-[40%] animate-shooting-star animation-delay-3000"></div>
    </div>
  );
}