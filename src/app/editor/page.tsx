"use client";

import { useState, useEffect } from 'react';
import EditorSidebar from '@/components/labels/EditorSidebar';
import LabelEditor from '@/components/labels/LabelEditor';
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
  size?: number;
  value?: string;
  color?: string;
  uuidLength?: number;
}

interface LabelSettings {
  width: number;
  height: number;
  unit: string;
  elements: LabelElement[];
}

export default function EditorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Stan dla wybranego elementu etykiety
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string>('Nowa etykieta');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean | null>(null);
  
  // Początkowe ustawienia etykiety
  const [labelSettings, setLabelSettings] = useState<LabelSettings>({
    width: 90,
    height: 50,
    unit: 'mm',
    elements: []
  });

  // Load project if projectId is provided in URL
  useEffect(() => {
    const projectIdParam = searchParams.get('projectId');
    if (projectIdParam) {
      const savedProject = LabelStorageService.getProjectById(projectIdParam);
      if (savedProject) {
        setProjectId(savedProject.id);
        setProjectName(savedProject.name);
        
        // Extract label settings from saved project
        const { width, height, elements } = savedProject.label;
        setLabelSettings({
          width,
          height,
          unit: 'mm', // Default to mm if not specified in saved project
          elements: elements as LabelElement[] // Type assertion
        });
      }
    }
  }, [searchParams]);

  // Funkcja do eksportu etykiety do PDF
  const handleExportToPDF = async () => {
    try {
      const pdfUrl = await PdfGenerator.generateSingleLabelPdf({
        ...labelSettings,
        name: projectName,
        id: projectId || uuidv4()
      } as Label);
      
      // Utworzenie tymczasowego linka do pobrania PDF
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${projectName.replace(/\s+/g, '_').toLowerCase()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Błąd podczas generowania PDF:', error);
      alert('Wystąpił błąd podczas generowania PDF');
    }
  };

  // Funkcja do zapisania projektu
  const handleSaveProject = () => {
    setIsSaving(true);
    setSaveSuccess(null);
    
    try {
      // Convert label settings to Label type
      const now = new Date();
      const labelToSave: Label = {
        id: projectId || uuidv4(),
        name: projectName,
        width: labelSettings.width,
        height: labelSettings.height,
        elements: labelSettings.elements,
        createdAt: now,
        updatedAt: now
      };
      
      // Save using the service
      const savedProject = LabelStorageService.saveProject(
        projectName,
        labelToSave
      );
      
      // Update projectId if this was a new project
      if (!projectId) {
        setProjectId(savedProject.id);
        // Update URL to include projectId without page refresh
        const newUrl = `${window.location.pathname}?projectId=${savedProject.id}`;
        window.history.pushState({ path: newUrl }, '', newUrl);
      }
      
      setSaveSuccess(true);
      
      // Reset success message after a delay
      setTimeout(() => {
        setSaveSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Błąd podczas zapisywania projektu:', error);
      setSaveSuccess(false);
    } finally {
      setIsSaving(false);
    }
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
      <div id="hs-application-sidebar" className="hs-overlay hs-overlay-open:translate-x-0 -translate-x-full transition-all duration-300 transform hidden fixed top-0 start-0 bottom-0 z-[60] w-64 bg-white border-e border-gray-200 lg:block lg:translate-x-0 lg:end-auto lg:bottom-0 [--overlay-backdrop:static] dark:bg-neutral-800 dark:border-neutral-700">
        <EditorSidebar 
          labelSettings={labelSettings}
          setLabelSettings={setLabelSettings}
          selectedElementId={selectedElementId}
        />
      </div>
      {/* End Sidebar */}

      {/* Content */}
      <div className="w-full pt-10 px-4 sm:px-6 md:px-8 lg:ps-72">
        <div className="max-w-[85rem] mx-auto">
          {/* Nagłówek sekcji */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-6">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="text-2xl font-bold text-gray-800 dark:text-white bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-gray-500 focus:ring-0 dark:hover:border-gray-700 dark:focus:border-gray-600 transition-all"
                  placeholder="Nazwa projektu"
                />
              </div>
              {saveSuccess === true && (
                <span className="text-sm text-green-600 dark:text-green-400 mt-1">Projekt został zapisany</span>
              )}
              {saveSuccess === false && (
                <span className="text-sm text-red-600 dark:text-red-400 mt-1">Błąd podczas zapisywania</span>
              )}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleSaveProject}
                disabled={isSaving}
                className="py-2 px-4 inline-flex justify-center items-center gap-2 rounded-md border border-transparent font-semibold bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all text-sm dark:bg-neutral-700 dark:hover:bg-neutral-600 dark:focus:ring-offset-gray-800 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-gray-800 dark:text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Zapisywanie...</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                    </svg>
                    <span>Zapisz projekt</span>
                  </>
                )}
              </button>
              <button
                onClick={handleExportToPDF}
                className="py-2 px-4 inline-flex justify-center items-center gap-2 rounded-md border border-transparent font-semibold bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-all text-sm dark:focus:ring-offset-gray-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Eksportuj do PDF
              </button>
            </div>
          </div>

          {/* Edytor etykiet */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 dark:bg-neutral-800 dark:border-neutral-700">
            <LabelEditor
              labelSettings={labelSettings}
              setLabelSettings={setLabelSettings}
              selectedElementId={selectedElementId}
              setSelectedElementId={setSelectedElementId}
            />
          </div>
        </div>
      </div>
      {/* End Content */}
    </div>
  );
}