// Label Editor component - main editor interface
"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { Label, LabelElement, LabelStorageService } from '@/services/labelStorage';

interface LabelEditorProps {
  labelSettings: {
    width: number;
    height: number;
    unit: string;
    elements: Array<{
      id: string;
      type: string;
      x: number;
      y: number;
      width?: number;
      value?: string;
      size?: number;
      color?: string;
      // Text formatting properties
      bold?: boolean;
      italic?: boolean;
      strikethrough?: boolean;
      fontFamily?: string;
      fontSize?: number;
      properties?: any;
    }>;
  };
  setLabelSettings: (settings: any) => void;
  selectedElementId: string | null;
  setSelectedElementId: (id: string | null) => void;
  projectLabels?: Array<{
    id: string; 
    name: string;
    width: number;
    height: number;
    elements: any[];
    updatedAt: string;
  }>;
  projectId?: string | null;
  labelId?: string | null;
  onLabelSelect?: (labelId: string) => void;
  onCreateNewLabel?: () => void;
  sidebarWidth?: number; // Dodana nowa właściwość dla szerokości sidebara
}

export default function LabelEditor({
  labelSettings,
  setLabelSettings,
  selectedElementId,
  setSelectedElementId,
  projectLabels = [],
  projectId = null,
  labelId = null,
  onLabelSelect = () => {},
  onCreateNewLabel = () => {},
  sidebarWidth = 300 // Domyślna wartość
}: LabelEditorProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  
  const [dragging, setDragging] = useState<boolean>(false);
  const [dragOffset, setDragOffset] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isGridVisible, setIsGridVisible] = useState<boolean>(true);
  const [isRulersVisible, setIsRulersVisible] = useState<boolean>(true);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStartPosition, setPanStartPosition] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  const [viewPosition, setViewPosition] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  const [isLabelPanelCollapsed, setIsLabelPanelCollapsed] = useState<boolean>(false);
  const [isLabelListCollapsed, setIsLabelListCollapsed] = useState<boolean>(true);
  
  // Stałe dla przeliczników mm/cm na piksele
  const MM_TO_PX = 3.7795275591;
  const CM_TO_PX = 37.795275591;

  // Konwertuj mm/cm na piksele dla wyświetlania w edytorze
  const calculatePixelSize = (size: number, unit: string): number => {
    return unit === 'mm' ? size * MM_TO_PX : size * CM_TO_PX;
  };

  // Auto-zoom na podstawie rozmiaru etykiety przy pierwszym załadowaniu
  useEffect(() => {
    if (containerRef.current && workspaceRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      const labelWidthPx = calculatePixelSize(labelSettings.width, labelSettings.unit);
      const labelHeightPx = calculatePixelSize(labelSettings.height, labelSettings.unit);
      
      const horizontalRatio = (containerWidth * 0.8) / labelWidthPx;
      const verticalRatio = (containerHeight * 0.8) / labelHeightPx;
      let autoZoom = Math.min(horizontalRatio, verticalRatio);
      
      if (labelSettings.width < 30 || labelSettings.height < 30) {
        autoZoom = Math.max(autoZoom, 2.5);
      }
      
      autoZoom = Math.max(Math.min(autoZoom, 5), 0.5);
      setZoomLevel(autoZoom);
      
      // Ustaw początkową pozycję widoku, aby etykieta była na środku
      centerWorkspaceView();
    }
  }, []);

  // Centrowanie widoku na etykiecie
  const centerWorkspaceView = () => {
    if (containerRef.current && workspaceRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      const labelWidthPx = calculatePixelSize(labelSettings.width, labelSettings.unit) * zoomLevel;
      const labelHeightPx = calculatePixelSize(labelSettings.height, labelSettings.unit) * zoomLevel;
      
      // Oblicz środek kontenera minus połowa rozmiaru etykiety
      const centerX = (containerWidth - labelWidthPx) / 2;
      const centerY = (containerHeight - labelHeightPx) / 2;
      
      setViewPosition({ x: centerX, y: centerY });
    }
  };

  // Obsługa przewijania i zoomowania kółkiem myszy
  const handleWheel = (e: React.WheelEvent) => {
    // Zawsze zapobiegaj domyślnemu działaniu przewijania strony
    e.preventDefault();
    e.stopPropagation();
    
    // Obsługa zoom z klawiszem Ctrl/Cmd
    if (e.ctrlKey || e.metaKey) {
      // Zatrzymujemy domyślny zoom całej strony
      e.preventDefault();
      e.stopPropagation();
      
      const delta = e.deltaY * -0.002;
      const newZoom = Math.max(Math.min(zoomLevel + delta * zoomLevel, 10), 0.1);
      
      // Obliczamy punkt, na którym jest kursor myszy w koordynatach etykiety
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return;
      
      const mouseX = e.clientX - containerRect.left;
      const mouseY = e.clientY - containerRect.top;
      
      // Obliczamy przesunięcie względem wcześniejszej pozycji viewPosition
      const scaleChange = newZoom / zoomLevel;
      
      // Nowa pozycja to stara + (mousePointer - stara) * (1 - scaleChange)
      const newViewPositionX = viewPosition.x + (mouseX - viewPosition.x) * (1 - scaleChange);
      const newViewPositionY = viewPosition.y + (mouseY - viewPosition.y) * (1 - scaleChange);
      
      setZoomLevel(newZoom);
      setViewPosition({ x: newViewPositionX, y: newViewPositionY });
    }
    // Standardowe przewijanie - zawsze przesuwaj obszar roboczy (nie tylko z Shift)
    else {
      setViewPosition(prev => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY
      }));
    }
  };

  // Obsługa rozpoczęcia przesuwania obszaru roboczego (panning)
  const handlePanStart = (e: React.MouseEvent) => {
    if (e.button === 1 || e.button === 0 && e.altKey) { // Środkowy przycisk myszy lub Alt+lewy przycisk
      e.preventDefault();
      setIsPanning(true);
      setPanStartPosition({ x: e.clientX, y: e.clientY });
    }
  };
  
  // Obsługa przesuwania obszaru roboczego (panning)
  const handlePan = (e: MouseEvent) => {
    if (!isPanning) return;
    
    const deltaX = e.clientX - panStartPosition.x;
    const deltaY = e.clientY - panStartPosition.y;
    
    setViewPosition(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));
    
    setPanStartPosition({ x: e.clientX, y: e.clientY });
  };
  
  // Obsługa zakończenia przesuwania obszaru roboczego (panning)
  const handlePanEnd = () => {
    setIsPanning(false);
  };

  // Nasłuchiwanie zdarzeń myszy dla przesuwania obszaru roboczego
  useEffect(() => {
    if (isPanning) {
      window.addEventListener('mousemove', handlePan);
      window.addEventListener('mouseup', handlePanEnd);
    } else {
      window.removeEventListener('mousemove', handlePan);
      window.removeEventListener('mouseup', handlePanEnd);
    }
    
    return () => {
      window.removeEventListener('mousemove', handlePan);
      window.removeEventListener('mouseup', handlePanEnd);
    };
  }, [isPanning, panStartPosition]);

  // Funkcja do zmiany poziomu powiększenia z przycisków
  const handleZoomChange = (newZoom: number) => {
    const clampedZoom = Math.max(Math.min(newZoom, 10), 0.1);
    const oldZoom = zoomLevel;
    const zoomRatio = clampedZoom / oldZoom;
    
    // Znajdź środek widocznego obszaru
    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const centerX = containerRect.width / 2;
      const centerY = containerRect.height / 2;
      
      // Obliczamy nową pozycję widoku, aby utrzymać obiekt w centrum
      const newViewPositionX = viewPosition.x + (centerX - viewPosition.x) * (1 - zoomRatio);
      const newViewPositionY = viewPosition.y + (centerY - viewPosition.y) * (1 - zoomRatio);
      
      setZoomLevel(clampedZoom);
      setViewPosition({ x: newViewPositionX, y: newViewPositionY });
    } else {
      setZoomLevel(clampedZoom);
    }
  };

  // Obsługa rozpoczęcia przeciągania elementu
  const handleDragStart = (
    e: React.MouseEvent, 
    elementId: string, 
    elementType: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    
    setSelectedElementId(elementId);
    
    const element = labelSettings.elements.find((el) => el.id === elementId);
    if (!element) return;
    
    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const clickX = e.clientX - containerRect.left;
      const clickY = e.clientY - containerRect.top;
      
      // Oblicz pozycję elementu w pikselach, uwzględniając zoom i przesunięcie widoku
      const elementX = viewPosition.x + calculatePixelSize(element.x, labelSettings.unit) * zoomLevel;
      const elementY = viewPosition.y + calculatePixelSize(element.y, labelSettings.unit) * zoomLevel;
      
      setDragOffset({
        x: clickX - elementX,
        y: clickY - elementY
      });
    }
    
    setDragging(true);
  };

  // Obsługa ruchu elementu
  const handleDrag = (e: MouseEvent) => {
    if (!dragging || !selectedElementId || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const rawX = e.clientX - containerRect.left - dragOffset.x;
    const rawY = e.clientY - containerRect.top - dragOffset.y;
    
    // Obliczamy pozycję względem widoku i zoomu
    const adjustedX = rawX - viewPosition.x;
    const adjustedY = rawY - viewPosition.y;
    
    const converter = labelSettings.unit === 'mm' ? MM_TO_PX : CM_TO_PX;
    
    const xInUnits = adjustedX / (converter * zoomLevel);
    const yInUnits = adjustedY / (converter * zoomLevel);
    
    const clampedX = Math.max(0, Math.min(labelSettings.width, xInUnits));
    const clampedY = Math.max(0, Math.min(labelSettings.height, yInUnits));
    
    const updatedElements = labelSettings.elements.map((element) => {
      if (element.id === selectedElementId) {
        return {
          ...element,
          x: parseFloat(clampedX.toFixed(1)),
          y: parseFloat(clampedY.toFixed(1))
        };
      }
      return element;
    });
    
    setLabelSettings({
      ...labelSettings,
      elements: updatedElements
    });
  };

  // Obsługa zakończenia przeciągania elementu
  const handleDragEnd = () => {
    setDragging(false);
  };

  // Nasłuchiwanie zdarzeń myszy dla przeciągania elementu
  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleDrag);
      window.addEventListener('mouseup', handleDragEnd);
    } else {
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('mouseup', handleDragEnd);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('mouseup', handleDragEnd);
    };
  }, [dragging, selectedElementId, dragOffset, zoomLevel, viewPosition, labelSettings]);

  // Generuj znaczniki dla linijek
  const generateRulerMarks = (dimension: 'width' | 'height') => {
    const size = dimension === 'width' ? labelSettings.width : labelSettings.height;
    const isVertical = dimension === 'height';
    
    // Określ, ile jednostek na podziałkę w zależności od poziou przybliżenia
    let step = 10;  // Domyślnie co 10 jednostek
    
    if (zoomLevel < 0.8) step = 50;
    else if (zoomLevel < 1.5) step = 20;
    else if (zoomLevel < 3) step = 10;
    else step = 5;
    
    // Obliczanie zakresu widocznych znaczników
    const markCount = Math.ceil(size / step) + 1;
    
    return Array.from({ length: markCount }, (_, index) => {
      const position = index * step;
      if (position > size) return null;
      
      const pixelPos = calculatePixelSize(position, labelSettings.unit) * zoomLevel;
      
      return (
        <div 
          key={`${dimension}-mark-${position}`}
          className="absolute flex items-center justify-center text-[9px] text-gray-600"
          style={{
            [isVertical ? 'top' : 'left']: `${pixelPos}px`,
            [isVertical ? 'left' : 'top']: '0',
            width: isVertical ? '100%' : '1px',
            height: isVertical ? '1px' : '100%',
          }}
        >
          {/* Podziałka */}
          <div 
            className={`absolute ${isVertical ? 'w-2 h-px' : 'h-2 w-px'} bg-gray-400`}
            style={{
              [isVertical ? 'right' : 'bottom']: 0
            }}
          ></div>
          
          {/* Wartość co 50 lub 100 jednostek (w zależności od zoom) */}
          {position % (step * 2) === 0 && (
            <span 
              className={`absolute text-[9px] select-none ${isVertical ? '-translate-x-4' : '-translate-y-4'}`}
              style={{
                [isVertical ? 'right' : 'bottom']: '4px',
                color: 'rgba(75, 85, 99)',
              }}
            >
              {position}
            </span>
          )}
        </div>
      );
    }).filter(Boolean);
  };

  // Dodajemy funkcję formatowania daty
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('pl-PL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };
  
  // Funkcja pomocnicza do obsługi wyboru etykiety
  const handleLabelSelect = (labelId: string) => {
    if (typeof onLabelSelect === 'function') {
      onLabelSelect(labelId);
    } else {
      // Fallback - używamy router.push zamiast window.location.replace
      if (projectId) {
        const timestamp = new Date().getTime();
        const url = `/editor-legacy?projectId=${projectId}&labelId=${labelId}&nocache=${timestamp}`;
        console.log(`[DEBUG] Przekierowuję do: ${url}`);
        
        // Używamy pushState aby zachować scroll position
        window.history.pushState({}, '', url);
        
        // Ładujemy dane etykiety bez odświeżania strony
        (async () => {
          try {
            const label = await LabelStorageService.getLabelByIdNoCache(projectId, labelId);
            if (label) {
              setLabelSettings({
                width: label.width,
                height: label.height,
                unit: 'mm',
                elements: label.elements || []
              });
              setSelectedElementId(null);
            }
          } catch (error) {
            console.error('Error loading label:', error);
          }
        })();
      }
    }
  };

  // Funkcja obsługująca tworzenie nowej etykiety
  const handleCreateNewLabel = () => {
    if (typeof onCreateNewLabel === 'function') {
      onCreateNewLabel();
    } else {
      // Fallback - przeładowanie strony bez labelId
      if (projectId) {
        const url = `/editor-legacy?projectId=${projectId}`;
        // Używamy routera zamiast window.location, aby uniknąć pełnego odświeżenia strony
        router.push(url);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full mx-auto bg-white dark:bg-neutral-900 rounded-xl shadow-lg border border-gray-200 dark:border-neutral-800 p-4 mt-2"
      // Dodajemy obsługę wheel na najbardziej zewnętrznym kontenerze, aby przechwycić i zatrzymać event Ctrl+scroll
      onWheel={(e) => {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          e.stopPropagation();
          // Nie obsługujemy tu zoomowania - pozwalamy, aby wewnętrzny handler się tym zajął
        }
      }}
    >
      {/* Pasek narzędziowy */}
      <div className="w-full mb-2">
        <div className="sticky top-0 z-30 flex justify-between items-center bg-white dark:bg-neutral-800 rounded-lg p-2 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedElementId(null)}
              className="py-1 px-3 inline-flex justify-center items-center gap-2 rounded-md border font-medium bg-white text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-600 transition-all text-sm dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 dark:text-white dark:hover:text-white dark:focus:ring-offset-gray-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-cursor" viewBox="0 0 16 16">
                <path d="M14.082 2.182a.5.5 0 0 1 .103.557L8.528 15.467a.5.5 0 0 1-.917-.007L5.57 10.694.803 8.652a.5.5 0 0 1-.006-.916l12.728-5.657a.5.5 0 0 1 .556.103zM2.25 8.184l3.897 1.67a.5.5 0 0 1 .262.263l1.67 3.897L12.743 3.52z"/>
              </svg>
              <span>Odznacz</span>
            </button>
            
            {/* Przycisk ukrywania/wysuwania panelu etykiety */}
            <button
              onClick={() => setIsLabelPanelCollapsed(!isLabelPanelCollapsed)}
              className="py-1 px-3 inline-flex justify-center items-center gap-2 rounded-md border font-medium bg-white text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-600 transition-all text-sm dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 dark:text-white dark:hover:text-white dark:focus:ring-offset-gray-800"
              title={isLabelPanelCollapsed ? "Wysuń panel etykiety" : "Ukryj panel etykiety"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                {isLabelPanelCollapsed ? (
                  <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
                ) : (
                  <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
                )}
              </svg>
              <span>{isLabelPanelCollapsed ? "Wysuń panel" : "Ukryj panel"}</span>
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Przełącznik siatki */}
            <button
              onClick={() => setIsGridVisible(!isGridVisible)}
              className={`p-2 rounded-md border font-medium shadow-sm align-middle hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-600 transition-all text-sm
                ${isGridVisible ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400' : 'bg-white text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'}`}
              title="Pokaż/ukryj siatkę"
            >
              <svg xmlns="http://www.w3.org/0/svg" width="16" height="16" fill="currentColor" className="bi bi-grid" viewBox="0 0 16 16">
                <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zM2.5 2a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zM1 10.5A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3a1.5 1.5 0 0 1-1.5-1.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3z"/>
              </svg>
            </button>

            {/* Przełącznik linijek */}
            <button
              onClick={() => setIsRulersVisible(!isRulersVisible)}
              className={`p-2 rounded-md border font-medium shadow-sm align-middle hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-600 transition-all text-sm
                ${isRulersVisible ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400' : 'bg-white text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'}`}
              title="Pokaż/ukryj linijki"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M1 0a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h5v-1H2v-1h4v-1H4v-1h2v-1H2v-1h4V9H4V8h2V7H2V6h4V2h1v4h1V4h1v2h1V2h1v4h1V1a1 1 0 0 0-1-1H1z"/>
              </svg>
            </button>

            {/* Kontrolki zoom */}
            <div className="ml-4 flex gap-1.5 items-center">
              <button
                onClick={() => handleZoomChange(zoomLevel * 0.8)}
                className="p-1 w-8 h-8 flex items-center justify-center rounded-md border font-medium bg-white text-gray-700 shadow-sm align-middle hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 dark:text-gray-300"
                disabled={zoomLevel <= 0.1}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                </svg>
              </button>
              
              <div className="w-20 text-center">
                <span className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap font-medium">
                  {Math.round(zoomLevel * 100)}%
                </span>
              </div>
              
              <button
                onClick={() => handleZoomChange(zoomLevel * 1.2)}
                className="p-1 w-8 h-8 flex items-center justify-center rounded-md border font-medium bg-white text-gray-700 shadow-sm align-middle hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 dark:text-gray-300"
                disabled={zoomLevel >= 10}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>
            </div>

            {/* Przycisk dopasowania widoku */}
            <button
              onClick={centerWorkspaceView}
              className="ml-2 py-1 px-3 inline-flex justify-center items-center gap-2 rounded-md border font-medium bg-white text-gray-700 shadow-sm align-middle hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 dark:text-gray-300"
              title="Środkuj etykietę w widoku"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M5.828 10.172a.5.5 0 0 0-.707 0l-4.096 4.096V11.5a.5.5 0 0 0-1 0v3.975a.5.5 0 0 0 .5.5H4.5a.5.5 0 0 0 0-1H1.732l4.096-4.096a.5.5 0 0 0 0-.707zm4.344 0a.5.5 0 0 1 .707 0l4.096 4.096V11.5a.5.5 0 1 1 1 0v3.975a.5.5 0 0 1-.5.5H11.5a.5.5 0 0 1 0-1h2.768l-4.096-4.096a.5.5 0 0 1 0-.707zm0-4.344a.5.5 0 0 0 .707 0l4.096-4.096V4.5a.5.5 0 1 0 1 0V.525a.5.5 0 0 0-.5-.5H11.5a.5.5 0 0 0 0 1h2.768l-4.096 4.096a.5.5 0 0 0 0 .707zm-4.344 0a.5.5 0 0 1-.707 0L1.025 1.732V4.5a.5.5 0 0 1-1 0V.525a.5.5 0 0 1 .5-.5H4.5a.5.5 0 0 1 0 1H1.732l4.096 4.096a.5.5 0 0 1 0 .707z"/>
              </svg>
              <span>Dopasuj</span>
            </button>
          </div>
        </div>
      </div>
        
      {/* Obszar roboczy - inspirowany interfejsem Figmy */}
      <div 
        className="relative w-full border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 overflow-hidden rounded-lg shadow-md" 
        style={{ height: '70vh', minHeight: '600px' }}
        onWheel={(e) => {
          // Zawsze zatrzymaj przewijanie strony i obsłuż zdarzenie lokalnie
          e.preventDefault();
          e.stopPropagation();
          
          // Obsługa dla Ctrl+scroll (tylko powiększenie/pomniejszenie)
          // Przekazujemy bezpośrednio do handlera wheel bez dodatkowych sprawdzeń
          handleWheel(e);
        }}
      >
        {/* Linijki (rulers) w stylu Figmy */}
        {isRulersVisible && (
          <>
            {/* Linijka pozioma (góra) */}
            <div className="absolute top-0 left-8 right-0 h-8 bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-700 z-20">
              <div 
                className="absolute top-0 h-full" 
                style={{ 
                  left: `${viewPosition.x}px`,
                  width: `${calculatePixelSize(labelSettings.width, labelSettings.unit) * zoomLevel}px`
                }}
              >
                {generateRulerMarks('width')}
              </div>
            </div>
            
            {/* Linijka pionowa (lewa) */}
            <div className="absolute top-8 left-0 bottom-0 w-8 bg-white dark:bg-neutral-900 border-r border-gray-200 dark:border-neutral-700 z-20">
              <div 
                className="absolute left-0 w-full" 
                style={{ 
                  top: `${viewPosition.y}px`,
                  height: `${calculatePixelSize(labelSettings.height, labelSettings.unit) * zoomLevel}px`
                }}
              >
                {generateRulerMarks('height')}
              </div>
            </div>
            
            {/* Róg linijek */}
            <div className="absolute top-0 left-0 w-8 h-8 bg-white dark:bg-neutral-900 border-b border-r border-gray-200 dark:border-neutral-700 z-30 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 dark:text-gray-500">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              </svg>
            </div>
          </>
        )}
        
        {/* Kontener widoku z obsługą kółka myszy */}
        <div 
          ref={containerRef}
          className={`absolute ${isRulersVisible ? 'top-8 left-8' : 'top-0 left-0'} right-0 bottom-0 overflow-hidden`}
          onWheel={(e) => {
            // Zatrzymaj propagację wydarzenia scrollowania i domyślne zachowanie
            e.preventDefault();
            e.stopPropagation();
            handleWheel(e);
          }}
          onMouseDown={handlePanStart}
          style={{
            cursor: isPanning ? 'grabbing' : (dragging ? 'move' : 'default'),
            backgroundColor: 'rgba(229, 231, 235, 0.6)',
            backgroundImage: 'linear-gradient(45deg, rgba(156, 163, 175, 0.07) 25%, transparent 25%, transparent 50%, rgba(156, 163, 175, 0.07) 50%, rgba(156, 163, 175, 0.07) 75%, transparent 75%, transparent)',
            backgroundSize: '20px 20px',
          }}
        >
          {/* Obszar roboczy z etykietą */}
          <div 
            ref={workspaceRef}
            className="absolute"
            style={{
              transform: `translate(${viewPosition.x}px, ${viewPosition.y}px)`,
              transition: isPanning || dragging ? 'none' : 'transform 0.1s ease-out',
            }}
          >
            {/* Etykieta z cieniem */}
            <div 
              ref={editorRef}
              className="bg-white dark:bg-gray-100 rounded-sm transition-shadow duration-200 hover:shadow-xl"
              style={{
                width: `${calculatePixelSize(labelSettings.width, labelSettings.unit) * zoomLevel}px`,
                height: `${calculatePixelSize(labelSettings.height, labelSettings.unit) * zoomLevel}px`,
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.1)',
              }}
              onClick={() => setSelectedElementId(null)}
            >
              {/* Siatka pomocnicza wewnątrz etykiety */}
              {isGridVisible && (
                <div className="absolute inset-0 pointer-events-none">
                  <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="smallGrid" width={`${5 * zoomLevel}`} height={`${5 * zoomLevel}`} patternUnits="userSpaceOnUse">
                        <path d={`M ${5 * zoomLevel} 0 L 0 0 0 ${5 * zoomLevel}`} fill="none" stroke="rgba(156, 163, 175, 0.15)" strokeWidth="0.5"/>
                      </pattern>
                      <pattern id="largeGrid" width={`${10 * zoomLevel}`} height={`${10 * zoomLevel}`} patternUnits="userSpaceOnUse">
                        <rect width={`${10 * zoomLevel}`} height={`${10 * zoomLevel}`} fill="url(#smallGrid)"/>
                        <path d={`M ${10 * zoomLevel} 0 L 0 0 0 ${10 * zoomLevel}`} fill="none" stroke="rgba(156, 163, 175, 0.3)" strokeWidth="0.8"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#largeGrid)" />
                  </svg>
                </div>
              )}
              
              {/* Linie pomocnicze na środku etykiety */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 h-full w-px bg-blue-200 dark:bg-blue-500/30 z-10"></div>
                <div className="absolute left-0 top-1/2 w-full h-px bg-blue-200 dark:bg-blue-500/30 z-10"></div>
              </div>
              
              {/* Renderowanie elementów etykiety */}
              {labelSettings.elements.map((element) => {
                const isSelected = selectedElementId === element.id;
                const posX = calculatePixelSize(element.x, labelSettings.unit) * zoomLevel;
                const posY = calculatePixelSize(element.y, labelSettings.unit) * zoomLevel;
                const textColor = element.color || '#333333';
                
                // Obsługa różnych typów elementów etykiety
                switch (element.type) {
                  case 'qrCode':
                    const qrSize = calculatePixelSize(element.width || 20, labelSettings.unit) * zoomLevel;
                    return (
                      <div 
                        key={element.id}
                        className={`absolute cursor-move transition-all duration-150 ${
                          isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : 'hover:ring-2 hover:ring-blue-300 hover:ring-offset-1'
                        }`}
                        style={{
                          left: `${posX}px`,
                          top: `${posY}px`,
                          width: `${qrSize}px`,
                          height: `${qrSize}px`,
                          zIndex: isSelected ? 20 : 10,
                          boxShadow: isSelected ? '0 0 0 1px white, 0 0 8px rgba(59, 130, 246, 0.5)' : 'none'
                        }}
                        onMouseDown={(e) => handleDragStart(e, element.id, element.type)}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedElementId(element.id);
                        }}
                      >
                        <div className="bg-white p-1 h-full w-full flex items-center justify-center">
                          <QRCodeSVG
                            value={element.value || "https://example.com"}
                            size={Math.max(10, qrSize - 8)}
                            bgColor={"#ffffff"}
                            fgColor={element.color || "#333333"}
                            level={"L"}
                            includeMargin={false}
                          />
                        </div>
                        {isSelected && (
                          <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-sm"></div>
                        )}
                      </div>
                    );
                    
                  case 'uuidText':
                    return (
                      <span 
                        key={element.id}
                        className={`absolute cursor-move transition-all duration-150 ${
                          isSelected ? 'ring-1 ring-blue-500' : 'hover:ring-1 hover:ring-blue-300'
                        }`}
                        style={{
                          left: `${posX}px`,
                          top: `${posY}px`,
                          width: `${calculatePixelSize(element.width || 50, labelSettings.unit) * zoomLevel}px`,
                          height: `${((element.fontSize || 12) * 1.2) * zoomLevel}px`,
                          zIndex: isSelected ? 20 : 10,
                          padding: 0,
                          margin: 0,
                          fontSize: `${(element.fontSize || 12) * zoomLevel}px`,
                          fontFamily: (element.properties as any)?.fontFamily || 'monospace',
                          fontWeight: (element.properties as any)?.bold ? 'bold' : 'normal',
                          fontStyle: (element.properties as any)?.italic ? 'italic' : 'normal',
                          textDecoration: (element.properties as any)?.strikethrough ? 'line-through' : 'none',
                          maxWidth: `${calculatePixelSize(labelSettings.width - element.x, labelSettings.unit) * zoomLevel}px`,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          color: textColor,
                          backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                          lineHeight: 1,
                          display: 'block',
                          border: 'none',
                          boxSizing: 'content-box',
                          textRendering: 'geometricPrecision',
                          transformOrigin: 'top left',
                        }}
                        onMouseDown={(e) => handleDragStart(e, element.id, element.type)}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedElementId(element.id);
                        }}
                      >
                        {element.value}
                        {isSelected && (
                          <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-sm"></div>
                        )}
                      </span>
                    );
                    
                  case 'company':
                    return (
                      <span 
                        key={element.id}
                        className={`absolute cursor-move transition-all duration-150 ${
                          isSelected ? 'ring-1 ring-blue-500' : 'hover:ring-1 hover:ring-blue-300'
                        }`}
                        style={{
                          left: `${posX}px`,
                          top: `${posY}px`,
                          width: `${calculatePixelSize(element.width || 50, labelSettings.unit) * zoomLevel}px`,
                          height: `${((element.fontSize || 12) * 1.2) * zoomLevel}px`,
                          zIndex: isSelected ? 20 : 10,
                          padding: 0,
                          margin: 0,
                          fontSize: `${(element.fontSize || 12) * zoomLevel}px`,
                          fontFamily: (element.properties as any)?.fontFamily || 'Arial',
                          fontWeight: (element.properties as any)?.bold ? 'bold' : 'normal',
                          fontStyle: (element.properties as any)?.italic ? 'italic' : 'normal',
                          textDecoration: (element.properties as any)?.strikethrough ? 'line-through' : 'none',
                          maxWidth: `${calculatePixelSize(labelSettings.width - element.x, labelSettings.unit) * zoomLevel}px`,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          color: textColor,
                          backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                          lineHeight: 1,
                          display: 'block',
                          border: 'none',
                          boxSizing: 'content-box',
                          textRendering: 'geometricPrecision',
                          transformOrigin: 'top left',
                        }}
                        onMouseDown={(e) => handleDragStart(e, element.id, element.type)}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedElementId(element.id);
                        }}
                      >
                        {element.value}
                        {isSelected && (
                          <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-sm"></div>
                        )}
                      </span>
                    );
                    
                  case 'product':
                    return (
                      <span 
                        key={element.id}
                        className={`absolute cursor-move transition-all duration-150 ${
                          isSelected ? 'ring-1 ring-blue-500' : 'hover:ring-1 hover:ring-blue-300'
                        }`}
                        style={{
                          left: `${posX}px`,
                          top: `${posY}px`,
                          width: `${calculatePixelSize(element.width || 50, labelSettings.unit) * zoomLevel}px`,
                          height: `${((element.fontSize || 12) * 1.2) * zoomLevel}px`,
                          zIndex: isSelected ? 20 : 10,
                          padding: 0,
                          margin: 0,
                          fontSize: `${(element.fontSize || 12) * zoomLevel}px`,
                          fontFamily: (element.properties as any)?.fontFamily || 'Arial',
                          fontWeight: (element.properties as any)?.bold ? 'bold' : 'normal',
                          fontStyle: (element.properties as any)?.italic ? 'italic' : 'normal',
                          textDecoration: (element.properties as any)?.strikethrough ? 'line-through' : 'none',
                          maxWidth: `${calculatePixelSize(labelSettings.width - element.x, labelSettings.unit) * zoomLevel}px`,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          color: textColor,
                          backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                          lineHeight: 1,
                          display: 'block',
                          border: 'none',
                          boxSizing: 'content-box',
                          textRendering: 'geometricPrecision',
                          transformOrigin: 'top left',
                        }}
                        onMouseDown={(e) => handleDragStart(e, element.id, element.type)}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedElementId(element.id);
                        }}
                      >
                        {element.value}
                        {isSelected && (
                          <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-sm"></div>
                        )}
                      </span>
                    );
                    
                  default:
                    return null;
                }
              })}

              {/* Wiadomość, gdy etykieta jest pusta */}
              {labelSettings.elements.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-gray-400 text-sm text-center">
                    Dodaj elementy do etykiety<br />
                    używając opcji po lewej stronie
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Pasek stanu z wymiarami */}
      <div className="w-full flex justify-between items-center text-sm mt-2 text-gray-500 dark:text-gray-400 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="mr-1" viewBox="0 0 16 16">
              <path d="M14.5 1v1h-13V1h13zm0 13v1h-13v-1h13zM2 7.5v1H1v-1h1zm2 0v1H3v-1h1zm2 0v1H5v-1h1zm2 0v1H7v-1h1zm2 0v1H9v-1h1zm2 0v1h-1v-1h1zm2 0v1h-1v-1h1z"/>
              <path d="M9 1.5V2H8v-.5h1zM9 3.5V4H8v-.5h1zM9 5.5V6H8v-.5h1z"/>
            </svg>
            {labelSettings.width} × {labelSettings.height} {labelSettings.unit}
          </span>
          <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="mr-1" viewBox="0 0 16 16">
              <path d="M8 2.5a.5.5 0 0 1 .5.5v1.5H10a.5.5 0 0 1 0 1H8.5V7.5a.5.5 0 0 1-1 0V5.5H6a.5.5 0 0 1 0-1h1.5V3a.5.5 0 0 1 .5-.5z"/>
              <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
            </svg>
            {labelSettings.elements.length} elementów
          </span>
          <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="mr-1" viewBox="0 0 16 16">
              <path d="M6.5 12a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zM13 6.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z"/>
              <path d="M10.344 11.742c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1 6.538 6.538 0 0 1-1.398 1.4z"/>
            </svg>
            {Math.round(zoomLevel * 100)}%
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleZoomChange(zoomLevel * 0.8)}
              className="p-1 w-7 h-7 flex items-center justify-center rounded-md border bg-white text-gray-700 shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 dark:text-gray-300"
              disabled={zoomLevel <= 0.1}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
              </svg>
            </button>
            
            <button
              onClick={() => handleZoomChange(zoomLevel * 1.2)}
              className="p-1 w-7 h-7 flex items-center justify-center rounded-md border bg-white text-gray-700 shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 dark:text-gray-300"
              disabled={zoomLevel >= 10}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
            
            <button
              onClick={centerWorkspaceView}
              className="p-1 w-7 h-7 flex items-center justify-center rounded-md border bg-white text-gray-700 shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 dark:text-gray-300"
              title="Dopasuj widok"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M5.828 10.172a.5.5 0 0 0-.707 0l-4.096 4.096V11.5a.5.5 0 0 0-1 0v3.975a.5.5 0 0 0 .5.5H4.5a.5.5 0 0 0 0-1H1.732l4.096-4.096a.5.5 0 0 0 0-.707zm4.344 0a.5.5 0 0 1 .707 0l4.096 4.096V11.5a.5.5 0 1 1 1 0v3.975a.5.5 0 0 1-.5.5H11.5a.5.5 0 0 1 0-1h2.768l-4.096-4.096a.5.5 0 0 1 0-.707zm0-4.344a.5.5 0 0 0 .707 0l4.096-4.096V4.5a.5.5 0 1 0 1 0V.525a.5.5 0 0 0-.5-.5H11.5a.5.5 0 0 0 0 1h2.768l-4.096 4.096a.5.5 0 0 0 0 .707zm-4.344 0a.5.5 0 0 1-.707 0L1.025 1.732V4.5a.5.5 0 0 1-1 0V.525a.5.5 0 0 1 .5-.5H4.5a.5.5 0 0 1 0 1H1.732l4.096 4.096a.5.5 0 0 1 0 .707z"/>
              </svg>
            </button>
          </div>
          
          <span className="text-xs">Przesuwanie: scroll myszy lub Alt+przeciągnij | Zoom: Ctrl+scroll</span>
        </div>
      </div>
      
      {/* Wysuwany panel z listą etykiet - pojawia się od dołu */}
      <div 
        className={`fixed left-0 bottom-0 z-40 transition-transform duration-300 ease-in-out transform ${isLabelListCollapsed ? 'translate-y-full' : 'translate-y-0'}`}
        style={{ 
          maxHeight: "40vh", 
          width: `calc(100% - ${sidebarWidth}px)`, // Używamy dynamicznej szerokości sidebara
          marginLeft: `${sidebarWidth}px` // Używamy dynamicznej szerokości sidebara
        }}
      >
        <div className="bg-white dark:bg-neutral-800 shadow-lg border border-gray-200 dark:border-neutral-700 rounded-t-xl p-4 mx-4">
          {/* Nagłówek z przyciskiem zamknięcia */}
          <div className="flex justify-between items-center mb-4 sticky top-0 bg-white dark:bg-neutral-800 z-10 pb-2 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Etykiety w projekcie</h3>
            <button
              onClick={() => setIsLabelListCollapsed(true)}
              className="p-1.5 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6a.5.5 0 0 1 .708 0z"/>
              </svg>
            </button>
          </div>
          
          {/* Lista etykiet pobierana z kontekstu aplikacji */}
          <div className="overflow-y-auto" style={{ maxHeight: "calc(40vh - 80px)" }}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {/* Wyświetlamy rzeczywiste etykiety z projektu */}
              {projectLabels && projectLabels.length > 0 ? (
                // Mapowanie rzeczywistych etykiet z projektu
                projectLabels.map((labelItem) => (
                  <div 
                    key={labelItem.id}
                    className={`bg-white dark:bg-gray-800 rounded-lg shadow border-2 ${labelItem.id === labelId ? 'border-indigo-500 dark:border-indigo-500' : 'border-gray-200 dark:border-gray-700'} hover:shadow-lg transition-shadow overflow-hidden cursor-pointer`}
                    onClick={() => handleLabelSelect(labelItem.id)}
                  >
                    <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
                      <h3 className="font-medium text-sm text-gray-900 dark:text-white truncate" title={labelItem.name}>
                        {labelItem.name || 'Bez nazwy'}
                      </h3>
                    </div>
                    <div className="p-3">
                      <div className="aspect-[3/2] rounded mb-2 flex items-center justify-center bg-gray-100 dark:bg-gray-900/20 relative overflow-hidden">
                        {labelItem.elements && labelItem.elements.length > 0 ? (
                          <div className="flex items-center justify-center w-full h-full">
                            <div className="text-xs text-center text-indigo-600 dark:text-indigo-400">
                              {labelItem.elements.length} elementów
                            </div>
                          </div>
                        ) : (
                          <div className="border border-dashed border-gray-300 dark:border-gray-600 rounded w-full h-full flex items-center justify-center">
                            <div className="text-xs text-center text-gray-500 dark:text-gray-400">
                              Pusta etykieta
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>{labelItem.width}x{labelItem.height} mm</span>
                        <span>{formatDate(labelItem.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : projectId ? (
                // Komunikat gdy nie ma etykiet, ale projekt istnieje
                <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
                  Nie znaleziono żadnych etykiet w tym projekcie.
                </div>
              ) : (
                // Komunikat gdy nie wybrano projektu
                <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
                  Wybierz projekt, aby zobaczyć listę etykiet.
                </div>
              )}
              
              {/* Karta do dodawania nowej etykiety - zawsze widoczna gdy mamy projectId */}
              {projectId && (
                <div 
                  onClick={handleCreateNewLabel}
                  className="bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-3 cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors flex items-center justify-center"
                >
                  <div className="text-center">
                    <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-800 dark:text-white">Nowa etykieta</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Przycisk do wysuwania panelu z etykietami - zawsze widoczny na dole ekranu */}
        <button 
          onClick={() => setIsLabelListCollapsed(false)}
          className={`absolute left-1/2 top-0 transform -translate-x-1/2 -translate-y-full bg-white dark:bg-neutral-800 rounded-t-lg shadow-lg border border-gray-200 dark:border-neutral-700 border-b-0 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 z-50 ${isLabelListCollapsed ? 'block' : 'hidden'}`}
        >
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2zm4.5 0v12h3a1.5 1.5 0 0 0 1.5-1.5V2h-4.5zm6 0H14v12a2 2 0 0 1-2 2H8v-1.5h4a1.5 1.5 0 0 0 1.5-1.5V2z"/>
            </svg>
            <span>Pokaż etykiety</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M7.646 2.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 3.707 2.354 9.354a.5.5 0 1 1-.708-.708l6-6a.5.5 0 0 1 .708 0z"/>
            </svg>
          </div>
        </button>
      </div>
    </div>
  );
}