"use client";

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-purple-100 via-blue-50 to-teal-100 dark:from-purple-950 dark:via-blue-950 dark:to-teal-950">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,rgba(120,119,198,0.3),transparent)] dark:bg-[radial-gradient(circle_500px_at_50%_200px,rgba(70,69,148,0.3),transparent)]"></div>
      
      {/* Animowane blob'y */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-pink-200/20 dark:bg-pink-600/20 blur-3xl -top-20 -left-20 animate-blob"></div>
      <div className="absolute w-[400px] h-[400px] rounded-full bg-blue-200/20 dark:bg-blue-600/20 blur-3xl top-1/4 left-1/3 animate-blob animation-delay-2000"></div>
      <div className="absolute w-[600px] h-[600px] rounded-full bg-teal-200/20 dark:bg-teal-600/20 blur-3xl top-1/2 left-1/2 animate-blob animation-delay-4000"></div>
      <div className="absolute w-[300px] h-[300px] rounded-full bg-purple-200/20 dark:bg-purple-600/20 blur-3xl bottom-10 right-10 animate-blob animation-delay-3000"></div>
    </div>
  );
}