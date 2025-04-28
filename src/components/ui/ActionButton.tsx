"use client";

interface ActionButtonProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  variant?: "primary" | "secondary";
  children?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export default function ActionButton({ 
  title,
  description,
  icon,
  variant = "primary", 
  children, 
  onClick, 
  className = "" 
}: ActionButtonProps) {
  // Renderuj zawartość przycisku z tytułem, opisem i ikoną, jeśli są dostarczone
  const renderContent = () => {
    // Jeśli dostarczono title, description i icon, użyj ich do stworzenia zawartości przycisku
    if (title || description || icon) {
      return (
        <div className="flex items-center space-x-4 relative z-10">
          {icon && (
            <div className="flex-shrink-0 text-blue-500 dark:text-blue-400 transform group-hover:scale-110 transition-transform duration-300">
              {icon}
            </div>
          )}
          <div className="flex-grow text-left">
            {title && <h3 className="text-lg font-medium text-gray-800 dark:text-white group-hover:translate-x-1 transition-transform duration-300">{title}</h3>}
            {description && <p className="text-gray-600 dark:text-gray-300">{description}</p>}
          </div>
          <div className="flex-shrink-0 transform translate-x-0 group-hover:translate-x-2 transition-transform duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-400 dark:text-gray-200">
              <path fillRule="evenodd" d="M12.97 3.97a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 1 1-1.06-1.06l6.22-6.22H3a.75.75 0 0 1 0-1.5h16.19l-6.22-6.22a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      );
    }
    
    // W przeciwnym razie użyj children
    return <span className="relative z-10">{children}</span>;
  };

  if (variant === "primary") {
    return (
      <button
        onClick={onClick}
        className={`relative px-6 py-4 overflow-hidden font-semibold rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group w-full ${className}`}
      >
        {renderContent()}
        <span className="absolute inset-0 bg-gradient-to-r from-teal-400 to-blue-600 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-xl transform group-hover:translate-y-0 translate-y-full"></span>
        <span className="absolute inset-0 bg-black/10 dark:bg-white/5 opacity-0 group-hover:opacity-100 rounded-xl scale-90 group-hover:scale-100 transition-all duration-300"></span>
      </button>
    );
  }
  
  return (
    <button
      onClick={onClick}
      className={`relative px-6 py-4 font-semibold text-gray-700 dark:text-gray-300 border-2 border-gray-400 dark:border-gray-600 rounded-xl transition-all duration-300 group w-full overflow-hidden ${className}`}
    >
      <span className="relative z-10">{renderContent()}</span>
      <span className="absolute inset-0 bg-gradient-to-r from-purple-100 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 opacity-0 group-hover:opacity-100 transition-all duration-500 transform -translate-x-full group-hover:translate-x-0"></span>
      <span className="absolute inset-0 border-2 border-purple-500 dark:border-purple-400 rounded-xl opacity-0 group-hover:opacity-100 scale-105 group-hover:scale-100 transition-all duration-300"></span>
    </button>
  );
}