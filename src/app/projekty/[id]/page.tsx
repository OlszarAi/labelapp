"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { LabelStorageService, SavedProject, Label } from '@/services/labelStorage';
import { useAuth } from '@/lib/hooks/useAuth';
import { useOptimizedAnimations } from '@/lib/hooks/useOptimizedAnimations';
import LabelPreview from '@/components/labels-legacy/LabelPreview';
import { motion, AnimatePresence } from 'framer-motion';
import LabelsSortingToolbar from '@/components/ui/LabelsSortingToolbar';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;
  
  const [project, setProject] = useState<SavedProject | null>(null);
  const [labels, setLabels] = useState<Label[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  
  // Sorting state
  const [sortBy, setSortBy] = useState<string>('updatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Filter and sort labels
  const sortedLabels = useMemo(() => {
    if (!labels || labels.length === 0) return [];
    
    // Add an optimization flag for large collections
    const isLargeCollection = labels.length > 30;
    
    return [...labels].sort((a, b) => {
      // For text fields like 'name'
      if (sortBy === 'name') {
        const aValue = (a[sortBy as keyof Label] as string) || '';
        const bValue = (b[sortBy as keyof Label] as string) || '';
        const comparison = aValue.localeCompare(bValue);
        return sortDirection === 'asc' ? comparison : -comparison;
      }
      
      // For date fields like 'createdAt' and 'updatedAt'
      const aValue = a[sortBy as keyof Label] as string || '';
      const bValue = b[sortBy as keyof Label] as string || '';
      
      // Compare dates
      const comparison = new Date(aValue).getTime() - new Date(bValue).getTime();
      
      // Apply sort direction
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [labels, sortBy, sortDirection]);
  
  // Use our animation optimization hook
  const animations = useOptimizedAnimations(sortedLabels.length, {
    largeThreshold: 30,   // When to start basic optimizations
    veryLargeThreshold: 50  // When to apply aggressive optimizations
  });
  
  // For backward compatibility with existing code
  const isLargeCollection = animations.isLargeCollection;

  // Fetch project details and labels when component mounts
  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!isAuthenticated) {
        setError('Musisz być zalogowany, aby przeglądać projekty');
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Clear any cached data to ensure fresh results
        LabelStorageService.clearCache();
        
        // Get project details
        const fetchedProject = await LabelStorageService.getProjectById(projectId);
        
        if (!fetchedProject) {
          setError('Nie znaleziono projektu');
          return;
        }
        
        setProject(fetchedProject);
        
        // Get project labels using getSortedLabelsForProject for consistent behavior
        const fetchedLabels = await LabelStorageService.getSortedLabelsForProject(projectId);
        setLabels(fetchedLabels as unknown as Label[]);
      } catch (err) {
        console.error('Error fetching project details:', err);
        setError('Wystąpił błąd podczas pobierania szczegółów projektu');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProjectDetails();
  }, [projectId, isAuthenticated]);

  // Format date for display
  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return 'Nieznana data';
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('pl-PL', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Format date and time for display
  const formatDateTime = (dateString: string | Date | undefined) => {
    if (!dateString) return 'Nieznana data';
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('pl-PL', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper function to get primary content from label elements
  const getPrimaryContent = (label: Label) => {
    const textElements = label.elements.filter(el => 
      el.type === 'text' || el.type === 'product' || el.type === 'company'
    );
    
    if (textElements.length > 0) {
      // Return the first text element's value
      return textElements[0].value || 'Bez tekstu';
    }
    
    return 'Bez zawartości';
  };

  // Create a new label
  const handleCreateNewLabel = async () => {
    try {
      setIsLoading(true);
      
      // Remember current scroll position
      const scrollPosition = window.scrollY;
      
      // Clear cache before creating to ensure we'll get fresh data
      LabelStorageService.clearCache();
      
      // Create new label in project
      const response = await fetch(`${API_URL}/projects/${projectId}/labels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        body: JSON.stringify({
          name: `Nowa etykieta - ${new Date().toLocaleDateString()}`,
          width: 90,
          height: 50,
          elements: []
        }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Błąd podczas tworzenia etykiety: ${response.status}`);
      }
      
      const newLabel = await response.json();
      
      // Get updated labels list with sorting and update both state variables
      const updatedLabels = await LabelStorageService.getSortedLabelsForProject(projectId);
      setLabels(updatedLabels as unknown as Label[]);
      
      // After state update is complete, scroll to the new label
      setTimeout(() => {
        // Find the newly created label and scroll to it
        const newLabelElement = document.getElementById(`label-${newLabel.id}`);
        if (newLabelElement) {
          newLabelElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          // If element not found, restore previous scroll position
          window.scrollTo({ top: scrollPosition });
          console.log('Could not find label element with ID:', `label-${newLabel.id}`);
        }
      }, 300); // Increased timeout to ensure DOM has updated
      
    } catch (error) {
      console.error('Błąd podczas tworzenia nowej etykiety:', error);
      alert('Wystąpił błąd podczas tworzenia nowej etykiety');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-neutral-900 p-4">
        <div className="flex justify-center items-center h-64 flex-col">
          <motion.div 
            className="rounded-full h-16 w-16 relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              className="absolute inset-0 rounded-full border-4 border-indigo-500/30 dark:border-indigo-600/30"
            />
            <motion.div 
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-600 dark:border-t-indigo-400"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            />
            <motion.div 
              className="absolute inset-1 rounded-full border-4 border-transparent border-t-purple-600 dark:border-t-purple-400 opacity-70"
              animate={{ rotate: -360 }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
          <motion.p 
            className="mt-4 text-gray-500 dark:text-gray-400 text-sm font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            Ładowanie etykiet...
          </motion.p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-neutral-900 p-4">
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-8 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <motion.div 
            className="flex items-center text-red-600 dark:text-red-400 mb-6"
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <motion.div
              initial={{ scale: 0.8, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </motion.div>
            <h2 className="text-xl font-semibold">{error || 'Nie udało się wczytać projektu'}</h2>
          </motion.div>
          
          <motion.p
            className="text-gray-600 dark:text-gray-300 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Wystąpił problem podczas próby wczytania danych projektu. Możesz spróbować odświeżyć stronę lub wrócić do listy projektów.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Link 
              href="/projekty"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-md hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Powrót do listy projektów
            </Link>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Helper function to render project icon
  const renderProjectIcon = (iconName?: string) => {
    const defaultIcon = (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    );

    if (!iconName) return defaultIcon;

    switch (iconName) {
      case 'tag':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
          </svg>
        );
      case 'package':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
          </svg>
        );
      case 'barcode':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5Z" />
          </svg>
        );
      case 'qr':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5Z" />
          </svg>
        );
      default:
        return defaultIcon;
    }
  };

  // This comment line now replaces the old optimization variable
  // The isLargeCollection variable is now provided by the useOptimizedAnimations hook

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-neutral-900">
      {/* Modern header with project details */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 dark:from-indigo-800 dark:via-purple-900 dark:to-indigo-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white dark:bg-purple-300 rounded-full opacity-10"></div>
            <div className="absolute left-1/4 -bottom-8 w-64 h-16 bg-white dark:bg-purple-300 rounded-full blur-xl opacity-10"></div>
            <div className="absolute right-1/3 top-1/2 w-20 h-20 bg-white dark:bg-purple-300 rounded-full blur-md opacity-10"></div>
          </div>
          
          {/* Top navigation and back button */}
          <div className="flex items-center justify-between relative z-10 mb-6">
            <Link 
              href="/projekty"
              className="group flex items-center text-white hover:text-indigo-100 transition-colors bg-white/10 hover:bg-white/20 rounded-full pl-2 pr-4 py-1 shadow-md"
            >
              <span className="p-1 rounded-full bg-white/20 mr-2 group-hover:bg-white/30 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </span>
              Wszystkie projekty
            </Link>
            
            <motion.button
              onClick={handleCreateNewLabel}
              className="inline-flex items-center px-4 py-2 border border-white/30 text-sm font-medium rounded-full shadow-sm text-white bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-600 focus:ring-white transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nowa etykieta
            </motion.button>
          </div>
          
          {/* Project title and icon */}
          <div className="flex items-center gap-4 relative z-10">
            <div className="flex items-center justify-center p-3 bg-white/15 rounded-xl shadow-lg">
              <motion.div 
                className="text-white"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <span className="h-10 w-10 block">
                  {renderProjectIcon(project.icon)}
                </span>
              </motion.div>
            </div>
            
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                {project.name}
              </h1>
              
              {project.description && (
                <p className="mt-2 text-indigo-100 dark:text-indigo-200 max-w-3xl">
                  {project.description}
                </p>
              )}
            </div>
          </div>
          
          {/* Project stats */}
          <div className="mt-6 flex flex-wrap md:flex-nowrap items-center gap-4 relative z-10">
            <div className="flex items-center gap-2 bg-white/15 rounded-full px-4 py-1 text-sm text-white">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
              </svg>
              <span>Utworzony: {formatDate(project.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/15 rounded-full px-4 py-1 text-sm text-white">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <span>Ostatnia edycja: {formatDate(project.updatedAt)}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/15 rounded-full px-4 py-1 text-sm text-white">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
              </svg>
              <span>{sortedLabels.length} {sortedLabels.length === 1 ? 'etykieta' : sortedLabels.length >= 2 && sortedLabels.length <= 4 ? 'etykiety' : 'etykiet'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content - Labels List with modern UI */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-indigo-600 dark:text-indigo-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
              </svg>
              Etykiety w projekcie
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Zarządzaj i edytuj etykiety w tym projekcie
            </p>
          </div>
          <motion.button
            onClick={handleCreateNewLabel}
            className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)" }}
            whileTap={{ scale: 0.95 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nowa etykieta
          </motion.button>
        </div>
        
        {labels.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-2 mb-6">
            <LabelsSortingToolbar 
              sortBy={sortBy}
              setSortBy={setSortBy}
              sortDirection={sortDirection}
              setSortDirection={setSortDirection}
            />
          </div>
        )}

        {labels.length === 0 ? (
          <motion.div 
            className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Brak etykiet</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Ten projekt nie zawiera jeszcze żadnych etykiet. Stwórz pierwszą etykietę, aby rozpocząć.</p>
            <div className="mt-6">
              <motion.button 
                onClick={handleCreateNewLabel}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)" }}
                whileTap={{ scale: 0.95 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Stwórz pierwszą etykietę
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            layout={animations.containerProps.layout}
            transition={animations.containerProps.transition}
          >
            <AnimatePresence mode={animations.presenceProps.mode}>
              {sortedLabels.map((label, index) => (
                <motion.div
                  key={label.id}
                  id={`label-${label.id}`}
                  initial={{ 
                    opacity: 0, 
                    y: animations.isVeryLargeCollection ? 5 : animations.isLargeCollection ? 10 : 20 
                  }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ 
                    opacity: 0, 
                    scale: animations.isVeryLargeCollection ? 0.98 : animations.isLargeCollection ? 0.95 : 0.9 
                  }}
                  transition={animations.getItemProps(index).transition}
                  layout={animations.getItemProps(index).layout}
                  layoutId={animations.getItemProps(index).layoutId?.replace('item', `label-card-${label.id}`)}
                >
                  <Link href={`/editor-legacy?projectId=${projectId}&labelId=${label.id}`}>
                    <motion.div 
                      className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 overflow-hidden shadow-md rounded-lg transition-all duration-300 hover:shadow-lg border border-gray-200/50 dark:border-gray-700/50 h-full relative group"
                      whileHover={{ 
                        y: animations.hoverProps.y,
                        boxShadow: animations.isVeryLargeCollection 
                          ? "0 5px 10px -5px rgba(0, 0, 0, 0.1)" 
                          : animations.isLargeCollection 
                            ? "0 10px 20px -5px rgba(0, 0, 0, 0.1)" 
                            : "0 15px 30px -5px rgba(0, 0, 0, 0.1), 0 10px 15px -5px rgba(0, 0, 0, 0.04)",
                        scale: animations.hoverProps.scale,
                        transition: animations.hoverProps.transition
                      }}
                    >
                      {!isLargeCollection && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg pointer-events-none"
                          whileHover={{ 
                            opacity: 0.2,
                            transition: { duration: 0.3 } 
                          }}
                        />
                      )}
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center overflow-hidden relative p-6 border-b border-gray-200 dark:border-gray-700"
                           style={{ backdropFilter: "blur(8px)" }}>
                        <div className="w-full h-[180px] flex items-center justify-center">
                          {label.elements.length > 0 ? (
                            <LabelPreview 
                              label={label} 
                              fitContainer={true}
                              showBorder={true}
                              isInteractive={true}
                              className="shadow-md"
                            />
                          ) : (
                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md p-4 flex items-center justify-center w-full h-full">
                              <span className="text-gray-400 dark:text-gray-500 text-center font-medium">
                                Pusta etykieta
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="px-5 py-4">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className={`text-lg font-semibold ${sortBy === 'name' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-white'} group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1`}>
                            {label.name}
                          </h3>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300">
                            {label.width}×{label.height} mm
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <div className="mb-1 flex justify-between">
                            <span className="font-medium">Elementy:</span>
                            <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                              {label.elements.length} {label.elements.length === 1 ? 'element' : label.elements.length > 1 && label.elements.length < 5 ? 'elementy' : 'elementów'}
                            </span>
                          </div>
                          
                          {label.createdAt && (
                            <div className="flex justify-between mb-1">
                              <span className="font-medium">Utworzono:</span>
                              <span className={sortBy === 'createdAt' ? 'text-indigo-600 dark:text-indigo-400 font-medium' : ''}>
                                {formatDate(label.createdAt)}
                              </span>
                            </div>
                          )}
                          
                          {label.updatedAt && (
                            <div className="flex justify-between mb-1">
                              <span className="font-medium">Ostatnia edycja:</span>
                              <span className={sortBy === 'updatedAt' ? 'text-indigo-600 dark:text-indigo-400 font-medium' : ''}>
                                {formatDateTime(label.updatedAt)}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate font-medium">
                            {getPrimaryContent(label)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {/* Add New Label Card */}
            <motion.div 
              initial={{ opacity: 0, y: animations.isVeryLargeCollection ? 5 : animations.isLargeCollection ? 10 : 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: animations.isVeryLargeCollection ? 0.15 : animations.isLargeCollection ? 0.2 : 0.4, 
                delay: animations.isVeryLargeCollection ? 0 : animations.isLargeCollection ? 0.1 : Math.min(sortedLabels.length * 0.05, 0.5),
                ease: animations.isLargeCollection ? "easeOut" : [0.25, 0.1, 0.25, 1.0]
              }}
              layout={animations.containerProps.layout}
            >
              <motion.div 
                onClick={handleCreateNewLabel}
                className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 overflow-hidden shadow-md rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all duration-300 cursor-pointer flex items-center justify-center h-full"
                whileHover={{ 
                  scale: 1.03, 
                  boxShadow: "0 15px 30px -5px rgba(0, 0, 0, 0.1), 0 10px 15px -5px rgba(0, 0, 0, 0.04)",
                  borderColor: "rgba(99, 102, 241, 0.6)",
                  y: -7
                }}
                whileTap={{ scale: 0.97 }}
              >
                <div className="p-8 text-center">
                  <motion.div 
                    className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-lg"
                    whileHover={{ 
                      rotate: 90,
                      scale: 1.1,
                      boxShadow: "0 0 15px rgba(99, 102, 241, 0.5)"
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </motion.div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Dodaj nową etykietę</h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Stwórz nową etykietę w projekcie
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
