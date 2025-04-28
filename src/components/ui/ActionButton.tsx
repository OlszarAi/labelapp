"use client";

interface ActionButtonProps {
  variant: "primary" | "secondary";
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export default function ActionButton({ 
  variant = "primary", 
  children, 
  onClick, 
  className = "" 
}: ActionButtonProps) {
  if (variant === "primary") {
    return (
      <button
        onClick={onClick}
        className={`relative px-8 py-4 overflow-hidden font-semibold rounded-full bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group ${className}`}
      >
        <span className="relative z-10">{children}</span>
        <span className="absolute inset-0 bg-gradient-to-r from-teal-400 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></span>
      </button>
    );
  }
  
  return (
    <button
      onClick={onClick}
      className={`px-8 py-4 font-semibold text-gray-700 dark:text-gray-300 border-2 border-gray-400 dark:border-gray-600 rounded-full hover:bg-white/20 dark:hover:bg-black/20 backdrop-blur-sm transition-all duration-300 hover:border-purple-500 dark:hover:border-purple-400 ${className}`}
    >
      {children}
    </button>
  );
}