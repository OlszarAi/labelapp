"use client";

import AnimatedBackground from "../ui/AnimatedBackground";
import ThemeToggle from "../ui/ThemeToggle";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen">
      <AnimatedBackground />
      
      {/* Header z przyciskiem zmiany motywu */}
      <header className="absolute top-0 right-0 p-4">
        <ThemeToggle />
      </header>
      
      {/* Główna zawartość */}
      {children}
    </div>
  );
}