"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { LabelStorageService, SavedProject } from '@/services/labelStorage';
import { Label } from '@/lib/types/label.types';
import { useAuth } from '@/lib/hooks/useAuth';
import LabelPreview from '@/components/labels/LabelPreview';
import { motion } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const [project, setProject] = useState<SavedProject | null>(null);
  const [labels, setLabels] = useState<Label[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

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
        
        // Pobierz szczegóły projektu
        const fetchedProject = await LabelStorageService.getProjectById(projectId);
        
        if (!fetchedProject) {
          setError('Nie znaleziono projektu');
          return;
        }
        
        setProject(fetchedProject);
        
        // Pobierz etykiety projektu używając nowej funkcji
        const fetchedLabels = await LabelStorageService.getLabelsForProject(projectId);
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
      
      // Utwórz nową etykietę w projekcie
      const response = await fetch(`${API_URL}/projects/${projectId}/labels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
      
      // Pobierz zaktualizowaną listę etykiet
      const updatedLabels = await LabelStorageService.getLabelsForProject(projectId);
      setLabels(updatedLabels as unknown as Label[]);
      
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
        <div className="flex justify-center items-center h-64">
          <motion.div 
            className="rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-neutral-900 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-w-2xl mx-auto">
          <div className="flex items-center text-red-600 dark:text-red-400 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-xl font-semibold">{error || 'Błąd'}</h2>
          </div>
          <Link 
            href="/projekty"
            className="inline-block mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
          >
            Powrót do listy projektów
          </Link>
        </div>
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

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-neutral-900">
      {/* Header with project details */}
      <div className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link 
              href="/projekty"
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <span className="h-8 w-8">
                {renderProjectIcon(project.icon)}
              </span>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              {project.name}
            </h1>
          </div>
          
          {project.description && (
            <p className="mt-2 text-gray-600 dark:text-gray-300 max-w-3xl">
              {project.description}
            </p>
          )}
          
          <div className="mt-4 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div>
              <span>Utworzony: {formatDate(project.createdAt)}</span>
            </div>
            <div>
              <span>Ostatnia edycja: {formatDate(project.updatedAt)}</span>
            </div>
            <div>
              <span>{labels.length} {labels.length === 1 ? 'etykieta' : labels.length >= 2 && labels.length <= 4 ? 'etykiety' : 'etykiet'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content - Labels List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Etykiety w projekcie</h2>
          <motion.button
            onClick={handleCreateNewLabel}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nowa etykieta
          </motion.button>
        </div>

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
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                whileHover={{ scale: 1.05 }}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {labels.map((label, index) => (
              <motion.div
                key={label.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Link href={`/editor?projectId=${projectId}&labelId=${label.id}`}>
                  <motion.div 
                    className="bg-white dark:bg-gray-800 overflow-hidden shadow-md rounded-lg transition-all duration-300 hover:shadow-lg border border-gray-200/50 dark:border-gray-700/50 h-full"
                    whileHover={{ 
                      y: -5,
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                    }}
                  >
                    <div className="bg-gray-100 dark:bg-gray-900 flex items-center justify-center overflow-hidden relative p-6">
                      <div className="w-full h-[180px] flex items-center justify-center">
                        {label.elements.length > 0 ? (
                          <LabelPreview 
                            label={label} 
                            fitContainer={true}
                            showBorder={true}
                            className="shadow-md transform transition-all duration-300 hover:scale-105"
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
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
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
                            <span>{formatDate(label.createdAt)}</span>
                          </div>
                        )}
                        
                        {label.updatedAt && (
                          <div className="flex justify-between mb-1">
                            <span className="font-medium">Ostatnia edycja:</span>
                            <span>{formatDateTime(label.updatedAt)}</span>
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
            
            {/* Add New Label Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: labels.length * 0.05 }}
            >
              <motion.div 
                onClick={handleCreateNewLabel}
                className="bg-white dark:bg-gray-800 overflow-hidden shadow-md rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors cursor-pointer flex items-center justify-center h-full"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="p-8 text-center">
                  <motion.div 
                    className="h-14 w-14 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mx-auto mb-4"
                    whileHover={{ rotate: 90 }}
                    transition={{ duration: 0.3 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </motion.div>
                  <h3 className="text-base font-medium text-gray-900 dark:text-white">Dodaj nową etykietę</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Stwórz nową etykietę w projekcie
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}