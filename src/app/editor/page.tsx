"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import EditorSidebar from '@/components/labels/EditorSidebar';
import LabelEditor from '@/components/labels/LabelEditor';
import LabelPreview from '@/components/labels/LabelPreview';
import { v4 as uuidv4 } from 'uuid';
import { PdfGenerator } from '@/lib/utils/pdfGenerator';
import { Label } from '@/lib/types/label.types';
import { LabelStorageService } from '@/services/labelStorage';
import { useRouter, useSearchParams } from 'next/navigation';

interface LabelElement {
  id: string;
  type: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  size?: number;
  value?: string;
  color?: string;
  uuidLength?: number;
  rotation?: number; // Added rotation property
  properties?: any; // Added properties field
  // Text formatting properties
  bold?: boolean;
  italic?: boolean;
  strikethrough?: boolean;
  fontFamily?: string;
  fontSize?: number;
}

interface LabelSettings {
  width: number;
  height: number;
  unit: string;
  elements: LabelElement[];
}

interface ProjectLabel {
  id: string;
  name: string;
  width: number;
  height: number;
  elements: LabelElement[];
  updatedAt: string;
}

export default function EditorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Stan dla wybranego elementu etykiety
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [labelId, setLabelId] = useState<string | null>(null); // Dodana zmienna dla identyfikatora etykiety
  const [projectName, setProjectName] = useState<string>(''); // Nazwa projektu
  const [labelName, setLabelName] = useState<string>('Nowa etykieta'); // Nazwa etykiety
  const [projectLabels, setProjectLabels] = useState<ProjectLabel[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // Stany do kontrolowania szerokości sidebara
  const [sidebarWidth, setSidebarWidth] = useState<number>(300); // Domyślna szerokość 300px zamiast 256px (w-64)
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const minSidebarWidth = 200; // Minimalna szerokość sidebara
  const maxSidebarWidth = 500; // Maksymalna szerokość sidebara
  
  // Początkowe ustawienia etykiety
  const [labelSettings, setLabelSettings] = useState<LabelSettings>({
    width: 90,
    height: 50,
    unit: 'mm',
    elements: []
  });
  
  // Add auto-save functionality
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Zmodyfikowana funkcja ładowania projektu i etykiety
  useEffect(() => {
    const loadProjectAndLabel = async () => {
      const projectIdParam = searchParams.get('projectId');
      const labelIdParam = searchParams.get('labelId');
      const nameParam = searchParams.get('name');
      
      if (!projectIdParam) return;

      try {
        console.log('[DEBUG] Loading project:', projectIdParam, 'label:', labelIdParam, 'name:', nameParam);
        
        // 1. Wczytaj dane projektu
        const savedProject = await LabelStorageService.getProjectById(projectIdParam);
        if (!savedProject) {
          console.error('Projekt nie został znaleziony');
          return;
        }
        
        setProjectId(savedProject.id);
        setProjectName(savedProject.name);
        
        // 2. Załaduj etykiety projektu z nowej metody (sortowane, z ominięciem cache)
        const labels = await LabelStorageService.getSortedLabelsForProject(projectIdParam);
        
        if (labels && labels.length > 0) {
          const formattedLabels = labels.map(label => ({
            id: label.id,
            name: label.name,
            width: label.width,
            height: label.height,
            elements: label.elements,
            updatedAt: label.updatedAt || new Date().toISOString()
          }));
          setProjectLabels(formattedLabels);
          
          // 3. Jeśli podano labelId, załaduj konkretną etykietę
          if (labelIdParam) {
            // Jeśli podano również nazwę w URL, użyj jej tymczasowo
            if (nameParam) {
              console.log(`[DEBUG] Używam nazwy z URL: ${nameParam}`);
              setLabelName(decodeURIComponent(nameParam));
            }
            
            // Pobierz pełne dane etykiety
            loadSpecificLabel(projectIdParam, labelIdParam);
          } else if (savedProject.label) {
            // Jeśli nie podano labelId, a projekt ma główną etykietę, użyj jej
            setLabelId(savedProject.label.id);
            setLabelName(savedProject.label.name);
            setLabelSettings({
              width: savedProject.label.width,
              height: savedProject.label.height,
              unit: 'mm',
              elements: savedProject.label.elements
            });
          }
        }
      } catch (error) {
        console.error('Error loading project or label:', error);
      }
    };
    
    // Pomocnicza funkcja do ładowania konkretnej etykiety (z ominięciem cache)
    const loadSpecificLabel = async (projectId: string, labelId: string) => {
      try {
        console.log(`[DEBUG] Rozpoczynam ładowanie etykiety - ID: ${labelId}`);

        // Dodatkowe zabezpieczenie - spróbujmy użyć zapisanego ID z localStorage jeśli się zgadza
        const lastClickedId = localStorage.getItem('lastClickedLabelId');
        if (lastClickedId && lastClickedId === labelId) {
          const lastClickedName = localStorage.getItem('lastClickedLabelName');
          if (lastClickedName) {
            console.log(`[DEBUG] Używam nazwy z localStorage: ${lastClickedName}`);
            setLabelName(lastClickedName);
          }
        }
        
        // Używamy nowej metody getLabelByIdNoCache, która zawsze pomija cache
        const label = await LabelStorageService.getLabelByIdNoCache(projectId, labelId);
        
        if (label) {
          console.log(`[DEBUG] Pomyślnie załadowano etykietę: ${label.name}, ID: ${label.id}`);
          
          // Resetujemy stan wybranego elementu
          setSelectedElementId(null);
          
          // Aktualizujemy stan komponentu
          setLabelId(label.id);
          setLabelName(label.name);
          setLabelSettings({
            width: label.width,
            height: label.height,
            unit: 'mm',
            elements: label.elements
          });
        } else {
          console.error('[DEBUG] Nie można załadować etykiety o ID:', labelId);
        }
      } catch (error) {
        console.error('[DEBUG] Błąd podczas ładowania etykiety:', error);
      }
    };
    
    loadProjectAndLabel();
  }, [searchParams]);

  // Obsługa przeciągania sidebara
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    // Oblicz nową szerokość na podstawie pozycji kursora
    const newWidth = e.clientX;
    
    // Ograniczenie szerokości do minimalnej i maksymalnej wartości
    if (newWidth >= minSidebarWidth && newWidth <= maxSidebarWidth) {
      setSidebarWidth(newWidth);
    }
  };

  // Dodaj i usuń listenery gdy zmienia się stan przeciągania
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    
    // Czyszczenie listenerów przy odmontowaniu komponentu
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Auto-save functionality - wyłączony zgodnie z wymaganiem
  // useEffect(() => {
  //   if (!projectId) return;
    
  //   // Clear any existing timeout
  //   if (autoSaveTimeout) {
  //     clearTimeout(autoSaveTimeout);
  //   }
    
  //   const newTimeout = setTimeout(() => {
  //     setSaveStatus('saving');
  //     handleSaveLabel()
  //       .then(() => {
  //         setSaveStatus('saved');
  //         // Hide the "saved" status after 3 seconds
  //         setTimeout(() => {
  //           setSaveStatus('idle');
  //         }, 3000);
  //       })
  //       .catch((error) => {
  //         console.error('Error saving label:', error);
  //         setSaveStatus('error');
  //       });
  //   }, 2000);
    
  //   setAutoSaveTimeout(newTimeout);
    
  //   return () => {
  //     if (newTimeout) clearTimeout(newTimeout);
  //   };
  // }, [labelSettings, projectName, projectId, selectedElementId]);

  // Funkcja do eksportu etykiety do PDF
  const handleExportToPDF = async () => {
    try {
      const pdfLabel: any = {
        ...labelSettings,
        name: labelName,
        id: labelId || uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const pdfUrl = await PdfGenerator.generateSingleLabelPdf(pdfLabel);
      
      // Utworzenie tymczasowego linka do pobrania PDF
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${labelName.replace(/\s+/g, '_').toLowerCase()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Błąd podczas generowania PDF:', error);
      alert('Wystąpił błąd podczas generowania PDF');
    }
  };

  // Funkcja do zapisywania etykiety w projekcie
  const handleSaveLabel = async () => {
    if (!projectId) return;
    
    try {
      setIsSaving(true);
      
      // Przygotowanie danych etykiety z pełnym zestawem właściwości
      const labelData = {
        name: labelName,
        width: labelSettings.width,
        height: labelSettings.height,
        elements: labelSettings.elements.map(element => {
          // Determine if this is a text element
          const isTextElement = ['text', 'uuidText', 'company', 'product'].includes(element.type);
          
          // Prepare properties based on element type
          let properties = element.properties || {};
          
          // For text elements, ensure text formatting properties are included
          if (isTextElement) {
            properties = {
              ...properties,
              bold: properties.bold || false, // Allow bold to be configurable for all elements
              italic: properties.italic || false,
              strikethrough: properties.strikethrough || false,
              fontFamily: properties.fontFamily || 'Arial'
            };
          }
          
          return {
            type: element.type,
            x: element.x,
            y: element.y,
            width: element.width || undefined,
            height: element.height || undefined,
            // Use fontSize for text elements instead of size
            fontSize: isTextElement ? (element.fontSize || element.size || 12) : undefined,
            // Keep size for QR code elements
            size: element.type === 'qrCode' ? element.size || element.width : undefined,
            value: element.value || undefined,
            color: element.color || undefined,
            uuidLength: element.uuidLength || undefined,
            rotation: element.rotation || 0,
            properties: properties
          };
        })
      };
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      
      let response;
      
      // Jeśli mamy labelId, aktualizujemy konkretną etykietę
      if (labelId) {
        // Aktualizacja istniejącej etykiety
        response = await fetch(`${API_URL}/projects/${projectId}/labels/${labelId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          },
          body: JSON.stringify(labelData),
          credentials: 'include'
        });
      } else {
        // Utworzenie nowej etykiety w projekcie
        response = await fetch(`${API_URL}/projects/${projectId}/labels`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          },
          body: JSON.stringify(labelData),
          credentials: 'include'
        });
      }
      
      if (!response.ok) {
        throw new Error(`Błąd podczas zapisywania: ${response.status}`);
      }
      
      // Odświeżenie danych etykiety
      const updatedLabel = await response.json();
      
      // Ustaw labelId jeśli to była nowa etykieta
      if (!labelId && updatedLabel.id) {
        setLabelId(updatedLabel.id);
        // Zaktualizuj URL, aby zawierał labelId bez przeładowania strony
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('labelId', updatedLabel.id);
        window.history.pushState({}, '', newUrl);
      }
      
      // Odśwież listę etykiet w projekcie, używając nowej metody z sortowaniem i bez cache
      const labels = await LabelStorageService.getSortedLabelsForProject(projectId);
      if (labels && labels.length > 0) {
        const formattedLabels = labels.map(label => ({
          id: label.id,
          name: label.name,
          width: label.width,
          height: label.height,
          elements: label.elements,
          updatedAt: label.updatedAt || new Date().toISOString()
        }));
        setProjectLabels(formattedLabels);
      }
      
      // Dodatkowo, załaduj świeżo zaktualizowaną etykietę, aby mieć pewność, że edytor wyświetla aktualne dane
      if (labelId) {
        const refreshedLabel = await LabelStorageService.getLabelByIdNoCache(projectId, labelId);
        if (refreshedLabel) {
          setLabelSettings({
            width: refreshedLabel.width,
            height: refreshedLabel.height,
            unit: 'mm',
            elements: refreshedLabel.elements
          });
          setLabelName(refreshedLabel.name);
        }
      }
      
      setSaveStatus('saved');
      
      // Automatycznie ukryj komunikat po 3 sekundach
      setTimeout(() => {
        if (saveStatus === 'saved') {
          setSaveStatus('idle');
        }
      }, 3000);
      
      return updatedLabel;
      
    } catch (error) {
      console.error('Błąd podczas zapisywania etykiety:', error);
      // Pokazujemy błąd tylko w statusie, bez alertu
      setSaveStatus('error');
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper function to get primary content from label elements
  const getPrimaryContent = (elements: LabelElement[]) => {
    const textElements = elements.filter(el => 
      el.type === 'text' || el.type === 'product' || el.type === 'company'
    );
    
    if (textElements.length > 0) {
      // Return the first text element's value
      return textElements[0].value || 'Bez tekstu';
    }
    
    return 'Bez zawartości';
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-neutral-900">
      {/* ========== MAIN CONTENT ========== */}
      
      {/* Breadcrumb - mobilny widok */}
      <div className="sticky top-0 inset-x-0 z-20 bg-white border-y border-gray-200 px-4 sm:px-6 lg:px-8 lg:hidden dark:bg-neutral-800 dark:border-neutral-700">
        <div className="flex items-center py-2">
          {/* Przycisk nawigacji */}
          <button 
            type="button" 
            className="size-8 flex justify-center items-center gap-x-2 border border-gray-200 text-gray-800 hover:text-gray-500 rounded-lg focus:outline-hidden focus:text-gray-500 disabled:opacity-50 disabled:pointer-events-none dark:border-neutral-700 dark:text-neutral-200 dark:hover:text-neutral-500 dark:focus:text-neutral-500" 
            aria-controls="hs-application-sidebar" 
            data-hs-overlay="#hs-application-sidebar"
          >
            <span className="sr-only">Toggle Navigation</span>
            <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M15 3v18"/><path d="m8 9 3 3-3 3"/></svg>
          </button>
          
          {/* Breadcrumb */}
          <ol className="ms-3 flex items-center whitespace-nowrap">
            <li className="flex items-center text-sm text-gray-800 dark:text-neutral-400">
              Generator Etykiet
              <svg className="shrink-0 mx-3 overflow-visible size-2.5 text-gray-400 dark:text-neutral-500" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 1L10.6869 7.16086C10.8637 7.35239 10.8637 7.64761 10.6869 7.83914L5 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </li>
            <li className="text-sm font-semibold text-gray-800 truncate dark:text-neutral-400" aria-current="page">
              {projectName}
            </li>
          </ol>
        </div>
      </div>
      {/* End Breadcrumb */}

      {/* Sidebar */}
      <div 
        id="hs-application-sidebar" 
        ref={sidebarRef}
        style={{ width: `${sidebarWidth}px` }}
        className="hs-overlay hs-overlay-open:translate-x-0 -translate-x-full transition-all duration-300 transform hidden fixed top-0 start-0 bottom-0 z-[60] bg-white border-e border-gray-200 lg:block lg:translate-x-0 lg:end-auto lg:bottom-0 [--overlay-backdrop:static] dark:bg-neutral-800 dark:border-neutral-700"
      >
        <EditorSidebar 
          labelSettings={labelSettings}
          setLabelSettings={setLabelSettings}
          selectedElementId={selectedElementId}
        />
        
        {/* Uchwyt do zmiany szerokości */}
        <div 
          className="absolute top-0 right-0 bottom-0 w-1 cursor-ew-resize hover:bg-blue-500/50 transition-colors"
          onMouseDown={handleMouseDown}
          title="Przeciągnij, aby zmienić szerokość"
        ></div>
      </div>
      {/* End Sidebar */}

      {/* Content */}
      <div 
        style={{ paddingLeft: `${sidebarWidth}px` }} 
        className="w-full pt-10 px-4 sm:px-6 md:px-8 lg:ps-8 transition-all"
      >
        <div className="max-w-[85rem] mx-auto">
          {/* Nagłówek sekcji z nawigacją */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-6">
            <div className="flex flex-col w-full">
              {/* Breadcrumb navigation */}
              {projectId && (
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                  <Link href="/projekty" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                    Projekty
                  </Link>
                  <svg className="mx-2 overflow-visible size-2.5 text-gray-400 dark:text-neutral-500" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 1L10.6869 7.16086C10.8637 7.35239 10.8637 7.64761 10.6869 7.83914L5 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <Link href={`/projekty/${projectId}`} className="hover:text-indigo-600 dark:hover:text-indigo-400">
                    {projectName}
                  </Link>
                  <svg className="mx-2 overflow-visible size-2.5 text-gray-400 dark:text-neutral-500" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 1L10.6869 7.16086C10.8637 7.35239 10.8637 7.64761 10.6869 7.83914L5 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span>Edytor</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={labelName}
                  onChange={(e) => setLabelName(e.target.value)}
                  className="text-2xl font-bold text-gray-800 dark:text-white bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-gray-500 focus:ring-0 dark:hover:border-gray-700 dark:focus:border-gray-600 transition-all"
                  placeholder="Nazwa etykiety"
                />
                
                {/* Auto-save status indicator */}
                {projectId && (
                  <div className="flex items-center ml-2 text-sm">
                    {saveStatus === 'saving' && (
                      <span className="flex items-center text-amber-600 dark:text-amber-400">
                        <span className="animate-spin inline-block size-3 mr-1 border-[2px] border-current border-t-transparent rounded-full"></span>
                        Zapisywanie...
                      </span>
                    )}
                    {saveStatus === 'saved' && (
                      <span className="flex items-center text-green-600 dark:text-green-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Zapisano
                      </span>
                    )}
                    {saveStatus === 'error' && (
                      <span className="flex items-center text-red-600 dark:text-red-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Błąd zapisu
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              {projectId && (
                <button
                  onClick={handleSaveLabel}
                  disabled={isSaving}
                  className="py-2 px-4 inline-flex justify-center items-center gap-2 rounded-md border border-transparent font-semibold bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 transition-all text-sm dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <span className="animate-spin inline-block size-4 border-[2px] border-current border-t-transparent rounded-full"></span>
                      Zapisywanie...
                    </>
                  ) : (
                    <>
                      <svg className="size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                      Zapisz etykietę
                    </>
                  )}
                </button>
              )}
              
              {/* Przycisk do generowania PDF */}
              <button
                onClick={handleExportToPDF}
                className="py-2 px-4 inline-flex justify-center items-center gap-2 rounded-md border border-transparent font-semibold bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 transition-all text-sm dark:focus:ring-offset-gray-800"
              >
                <svg className="size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 0 0 5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 1 0 5H18"></path><path d="M8 9h8"></path><path d="M8 15h8"></path><path d="M8 4h8"></path><path d="M8 20h8"></path></svg>
                Eksportuj do PDF
              </button>
            </div>
          </div>

          {/* Main editor interface */}
          <LabelEditor 
            labelSettings={labelSettings}
            setLabelSettings={setLabelSettings}
            selectedElementId={selectedElementId}
            setSelectedElementId={setSelectedElementId}
            projectLabels={projectLabels}
            projectId={projectId}
            labelId={labelId}
            sidebarWidth={sidebarWidth}
            onLabelSelect={async (selectedLabelId) => {
              // Resetujemy stan komponentu i aktualizujemy URL bez odświeżania
              const timestamp = new Date().getTime();
              const url = `/editor?projectId=${projectId}&labelId=${selectedLabelId}&nocache=${timestamp}`;
              console.log(`[DEBUG] Przekierowuję do etykiety: ${selectedLabelId}`);
              
              // Aktualizujemy URL bez przeładowania strony
              window.history.pushState({}, '', url);
              
              // Ładujemy dane etykiety
              try {
                setLabelId(selectedLabelId);
                // Make sure projectId and selectedLabelId are both strings (not null)
                if (projectId && selectedLabelId) {
                  const label = await LabelStorageService.getLabelByIdNoCache(projectId, selectedLabelId);
                  if (label) {
                    setLabelName(label.name);
                    setLabelSettings({
                      width: label.width,
                      height: label.height,
                      unit: 'mm',
                      elements: label.elements || []
                    });
                  }
                }
                setSelectedElementId(null);
              } catch (error) {
                console.error('Błąd podczas ładowania etykiety:', error);
              }
            }}
            onCreateNewLabel={() => {
              // Resetujemy stan i aktualizujemy URL bez labelId bez odświeżania strony
              setLabelId(null);
              setLabelName('Nowa etykieta');
              setLabelSettings({
                width: 90,
                height: 50,
                unit: 'mm',
                elements: []
              });
              // Aktualizujemy URL bez przeładowania strony
              if (projectId && typeof projectId === 'string') {
                const url = `/editor?projectId=${projectId}`;
                window.history.pushState({}, '', url);
              }
            }}
          />
          
          {/* Lista etykiet z projektu - tylko jeśli jesteśmy w projekcie */}
          {/* Ukrywamy ten sekcję, ponieważ teraz mamy wysuwaną listę etykiet w LabelEditor */}
          {/*
          {projectId && projectLabels.length > 0 && (
            <div className="mt-8">
          */}
        </div>
      </div>
      {/* End Content */}
    </div>
  );
}