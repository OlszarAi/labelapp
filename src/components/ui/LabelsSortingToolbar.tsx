import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { ClockIcon, PencilSquareIcon, DocumentTextIcon, FunnelIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

interface LabelsSortingToolbarProps {
  sortBy: string;
  setSortBy: (value: string) => void;
  sortDirection: 'asc' | 'desc';
  setSortDirection: (value: 'asc' | 'desc') => void;
}

export default function LabelsSortingToolbar({ 
  sortBy, 
  setSortBy,
  sortDirection,
  setSortDirection 
}: LabelsSortingToolbarProps) {
  // For server-side rendering compatibility
  const [isLargeEnvironment, setIsLargeEnvironment] = useState(false);
  
  // Check screen size on client side only
  useEffect(() => {
    setIsLargeEnvironment(window.innerWidth < 1200);
    
    const handleResize = () => {
      setIsLargeEnvironment(window.innerWidth < 1200);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Animation variants - optimized based on environment
  const containerVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: isLargeEnvironment ? 0.2 : 0.4,
        staggerChildren: isLargeEnvironment ? 0.05 : 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="w-full flex flex-wrap md:flex-nowrap justify-between gap-4 p-2 rounded-lg backdrop-blur-sm"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      layout
    >
      <motion.div 
        className="flex items-center bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200/40 dark:border-gray-700/40 px-4 py-2" 
        variants={itemVariants}
      >
        <div className="flex items-center text-indigo-600 dark:text-indigo-400 mr-3">
          <AdjustmentsHorizontalIcon className="w-5 h-5 mr-1.5" />
          <span className="text-sm font-medium">Sortowanie:</span>
        </div>
        <div className="inline-flex rounded-lg shadow-sm bg-gray-100 dark:bg-gray-700/50 p-1">
          <motion.button
            type="button"
            onClick={() => setSortBy('name')}
            className={`relative inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-l-md ${
              sortBy === 'name'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
            } transition-all duration-200 ease-in-out`}
            whileHover={sortBy !== 'name' ? { scale: 1.02 } : {}}
            whileTap={{ scale: 0.98 }}
          >
            <DocumentTextIcon className="w-4 h-4 mr-1" />
            Nazwa
          </motion.button>
          <motion.button
            type="button"
            onClick={() => setSortBy('createdAt')}
            className={`relative inline-flex items-center px-3 py-1.5 text-sm font-medium ${
              sortBy === 'createdAt'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
            } transition-all duration-200 ease-in-out`}
            whileHover={sortBy !== 'createdAt' ? { scale: 1.02 } : {}}
            whileTap={{ scale: 0.98 }}
          >
            <ClockIcon className="w-4 h-4 mr-1" />
            Utworzone
          </motion.button>
          <motion.button
            type="button"
            onClick={() => setSortBy('updatedAt')}
            className={`relative inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-r-md ${
              sortBy === 'updatedAt'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
            } transition-all duration-200 ease-in-out`}
            whileHover={sortBy !== 'updatedAt' ? { scale: 1.02, y: -1 } : {}}
            whileTap={{ scale: 0.98 }}
          >
            <PencilSquareIcon className="w-4 h-4 mr-2" />
            Data edycji
            {sortBy === 'updatedAt' && (
              <motion.span
                className="absolute inset-0 rounded-r-md ring-2 ring-purple-500/50 dark:ring-purple-400/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </motion.button>
        </div>
      </motion.div>

      <motion.button
        type="button"
        onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
        whileHover={{ scale: isLargeEnvironment ? 1.03 : 1.05, y: isLargeEnvironment ? 0 : -1 }}
        whileTap={{ scale: isLargeEnvironment ? 0.97 : 0.95 }}
        variants={itemVariants}
        className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md 
          ${sortDirection === 'asc' 
          ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md' 
          : 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md'} 
          transition-all ${isLargeEnvironment ? 'duration-200' : 'duration-300'}`}
      >
        <AnimatePresence mode="wait" initial={false}>
          {sortDirection === 'asc' ? (
            <motion.div 
              key="ascending"
              className="flex items-center"
              initial={{ opacity: 0, y: isLargeEnvironment ? 5 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: isLargeEnvironment ? -5 : -10 }}
              transition={{ duration: isLargeEnvironment ? 0.15 : 0.2 }}
            >
              <ArrowUpIcon className="w-4 h-4 mr-2" /> Rosnąco
            </motion.div>
          ) : (
            <motion.div 
              key="descending"
              className="flex items-center"
              initial={{ opacity: 0, y: isLargeEnvironment ? 5 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: isLargeEnvironment ? -5 : -10 }}
              transition={{ duration: isLargeEnvironment ? 0.15 : 0.2 }}
            >
              <ArrowDownIcon className="w-4 h-4 mr-2" /> Malejąco
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </motion.div>
  );
}
