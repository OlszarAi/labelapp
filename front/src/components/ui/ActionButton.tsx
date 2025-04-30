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
  // Renderuj zawartość przycisku z tytułem, opisem i ikoną
  const renderContent = () => {
    // Jeśli dostarczono title, description i icon, użyj ich do stworzenia zawartości przycisku
    if (title || description || icon) {
      return (
        <div className="flex items-center space-x-4 relative z-10">
          {icon && (
            <div className={`flex-shrink-0 ${variant === "primary" ? "text-white" : "text-blue-600 dark:text-blue-400"} transform group-hover:scale-110 transition-transform duration-300`}>
              {icon}
            </div>
          )}
          <div className="flex-grow text-left">
            {title && (
              <h3 className={`text-lg font-medium ${variant === "primary" ? "text-white" : "text-gray-800 dark:text-white"} group-hover:translate-x-1 transition-transform duration-300`}>
                {title}
              </h3>
            )}
            {description && (
              <p className={`text-sm ${variant === "primary" ? "text-blue-100/90 dark:text-blue-100/80" : "text-gray-600 dark:text-gray-300"}`}>
                {description}
              </p>
            )}
          </div>
          <div className="flex-shrink-0 transform translate-x-0 group-hover:translate-x-2 transition-transform duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" 
                className={`w-5 h-5 ${variant === "primary" ? "text-white/80" : "text-gray-500 dark:text-gray-300"}`}>
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
        className={`relative px-6 py-4 overflow-hidden font-semibold rounded-xl bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600 bg-size-200 animate-gradient text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group w-full ${className}`}
      >
        {renderContent()}
        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-xl transform -translate-y-full group-hover:translate-y-0"></span>
        
        {/* Efekt podświetlenia przy najechaniu */}
        <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 rounded-xl scale-90 group-hover:scale-100 transition-all duration-300"></span>
        
        {/* Efekt świecących krawędzi w trybie ciemnym */}
        <span className="hidden dark:block absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500 animate-button-glow"></span>
        
        {/* Efekt błysku przesuwający się po przycisku */}
        <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-all duration-1000 ease-in-out"></span>
      </button>
    );
  }
  
  return (
    <button
      onClick={onClick}
      className={`relative px-6 py-4 font-semibold text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-indigo-800/50 rounded-xl hover:border-transparent transition-all duration-300 group w-full overflow-hidden ${className}`}
    >
      {renderContent()}
      
      {/* Tło przycisku z gradientem przy najechaniu */}
      <span className="absolute inset-0 bg-gradient-to-r from-purple-100 via-white to-blue-100 dark:from-gray-800 dark:via-indigo-900/30 dark:to-gray-800 opacity-0 group-hover:opacity-100 transition-all duration-500"></span>
      
      {/* Błyszczący efekt krawędzi */}
      <span className="absolute inset-0 rounded-xl border border-purple-400/0 dark:border-indigo-400/0 group-hover:border-purple-400/50 dark:group-hover:border-indigo-400/30 transition-all duration-300"></span>
      
      {/* Animowany efekt błyszczenia w ciemnym trybie */}
      <span className="hidden dark:block absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 bg-gradient-to-r from-transparent via-indigo-400/10 to-transparent bg-[length:200%_100%] animate-shimmer"></span>
    </button>
  );
}