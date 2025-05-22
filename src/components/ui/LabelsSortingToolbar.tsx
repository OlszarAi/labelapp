import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { ClockIcon, PencilSquareIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

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
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.4,
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="flex flex-wrap gap-4 mb-6 p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 shadow-sm"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      layout
    >
      <motion.div className="flex items-center" variants={itemVariants}>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-3">
          Sortuj według:
        </span>
        <div className="inline-flex rounded-lg shadow-sm bg-gradient-to-r from-indigo-50/80 to-purple-50/80 dark:from-indigo-950/30 dark:to-purple-950/30 p-0.5">
          <motion.button
            type="button"
            onClick={() => setSortBy('name')}
            className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-l-md ${
              sortBy === 'name'
                ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            } transition-all duration-300 ease-in-out`}
            whileHover={sortBy !== 'name' ? { scale: 1.02, y: -1 } : {}}
            whileTap={{ scale: 0.98 }}
          >
            <DocumentTextIcon className="w-4 h-4 mr-2" />
            Nazwa
            {sortBy === 'name' && (
              <motion.span
                className="absolute inset-0 rounded-l-md ring-2 ring-indigo-500/50 dark:ring-indigo-400/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </motion.button>
          <motion.button
            type="button"
            onClick={() => setSortBy('createdAt')}
            className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
              sortBy === 'createdAt'
                ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            } transition-all duration-300 ease-in-out`}
            whileHover={sortBy !== 'createdAt' ? { scale: 1.02, y: -1 } : {}}
            whileTap={{ scale: 0.98 }}
          >
            <ClockIcon className="w-4 h-4 mr-2" />
            Data utworzenia
            {sortBy === 'createdAt' && (
              <motion.span
                className="absolute inset-0 ring-2 ring-indigo-500/50 dark:ring-indigo-400/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </motion.button>
          <motion.button
            type="button"
            onClick={() => setSortBy('updatedAt')}
            className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-r-md ${
              sortBy === 'updatedAt'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            } transition-all duration-300 ease-in-out`}
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
        whileHover={{ scale: 1.05, y: -1 }}
        whileTap={{ scale: 0.95 }}
        variants={itemVariants}
        className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md 
          ${sortDirection === 'asc' 
          ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md' 
          : 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md'} 
          transition-all duration-300`}
      >
        <AnimatePresence mode="wait" initial={false}>
          {sortDirection === 'asc' ? (
            <motion.div 
              key="ascending"
              className="flex items-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <ArrowUpIcon className="w-4 h-4 mr-2" /> Rosnąco
            </motion.div>
          ) : (
            <motion.div 
              key="descending"
              className="flex items-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <ArrowDownIcon className="w-4 h-4 mr-2" /> Malejąco
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </motion.div>
  );
}
