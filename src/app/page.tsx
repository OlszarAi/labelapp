"use client";

import MainLayout from "@/components/layout/MainLayout";
import ActionButton from "@/components/ui/ActionButton";

export default function Home() {
  return (
    <MainLayout>
      {/* Główna zawartość */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8 text-center">
        <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-teal-500 dark:from-purple-400 dark:via-blue-400 dark:to-teal-300 bg-clip-text text-transparent mb-6 animate-text">
          Label Generator
        </h1>
        
        <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-12 max-w-lg">
          Aplikacja do generowania etykiet.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6">
          <ActionButton variant="primary">Stwórz etykiety</ActionButton>
          <ActionButton variant="secondary">Import</ActionButton>
        </div>
      </main>
    </MainLayout>
  );
}
