"use client";

import { useState, useRef, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface LabelEditorProps {
  labelSettings: any;
  setLabelSettings: (settings: any) => void;
  selectedElementId: string | null;
  setSelectedElementId: (id: string | null) => void;
}

export default function LabelEditor({
  labelSettings,
  setLabelSettings,
  selectedElementId,
  setSelectedElementId
}: LabelEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<boolean>(false);
  const [dragOffset, setDragOffset] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  
  // Stałe dla przeliczników mm/cm na piksele
  const MM_TO_PX = 3.7795275591;
  const CM_TO_PX = 37.795275591;

  // Konwertuj mm/cm na piksele dla wyświetlania w edytorze
  const calculatePixelSize = (size: number, unit: string): number => {
    return unit === 'mm' ? size * MM_TO_PX : size * CM_TO_PX;
  };

  // Auto-zoom na podstawie rozmiaru etykiety
  useEffect(() => {
    if (containerRef.current && editorRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      const labelWidthPx = calculatePixelSize(labelSettings.width, labelSettings.unit);
      const labelHeightPx = calculatePixelSize(labelSettings.height, labelSettings.unit);
      
      // Automatycznie dobierz zoom, aby etykieta dobrze wpasowała się w widok
      // Użyjemy min. 90% dostępnej przestrzeni, ale nie mniej niż 0.5x i nie więcej niż 5x
      const horizontalRatio = (containerWidth * 0.9) / labelWidthPx;
      const verticalRatio = (containerHeight * 0.9) / labelHeightPx;
      let autoZoom = Math.min(horizontalRatio, verticalRatio);
      
      // Małe etykiety wymagają większego powiększenia
      if (labelSettings.width < 30 || labelSettings.height < 30) {
        autoZoom = Math.max(autoZoom, 2.5);
      }
      
      // Ogranicz zakres do sensownych wartości
      autoZoom = Math.max(Math.min(autoZoom, 5), 0.5);
      
      setZoomLevel(autoZoom);
    }
  }, [labelSettings.width, labelSettings.height, labelSettings.unit]);

  // Funkcja do zmiany poziomu powiększenia
  const handleZoomChange = (newZoom: number) => {
    setZoomLevel(Math.max(Math.min(newZoom, 5), 0.5));
  };

  // Obsługa kółka myszy dla zoomowania
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY * -0.01;
      const newZoom = Math.max(Math.min(zoomLevel + delta, 5), 0.5);
      setZoomLevel(newZoom);
    }
  };

  // Obsługa rozpoczęcia przeciągania - zmodyfikowana dla lepszej obsługi zoom
  const handleDragStart = (
    e: React.MouseEvent, 
    elementId: string, 
    elementType: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Wybierz element, jeśli jeszcze nie jest wybrany
    setSelectedElementId(elementId);
    
    // Znajdź wybrany element
    const element = labelSettings.elements.find((el: any) => el.id === elementId);
    if (!element) return;
    
    // Oblicz rzeczywisty offset kliknięcia względem początku elementu
    // z uwzględnieniem aktualnego poziomu powiększenia
    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const clickX = e.clientX - containerRect.left;
      const clickY = e.clientY - containerRect.top;
      
      const elementX = calculatePixelSize(element.x, labelSettings.unit) * zoomLevel;
      const elementY = calculatePixelSize(element.y, labelSettings.unit) * zoomLevel;
      
      setDragOffset({
        x: clickX - elementX,
        y: clickY - elementY
      });
    }
    
    setDragging(true);
  };

  // Obsługa ruchu elementu - zmodyfikowana dla lepszej obsługi zoom
  const handleDrag = (e: MouseEvent) => {
    if (!dragging || !selectedElementId || !containerRef.current) return;
    
    // Oblicz nową pozycję względem kontenera
    const containerRect = containerRef.current.getBoundingClientRect();
    const rawX = e.clientX - containerRect.left - dragOffset.x;
    const rawY = e.clientY - containerRect.top - dragOffset.y;
    
    // Konwertuj piksele z uwzględnieniem zoom na jednostki używane w ustawieniach (mm lub cm)
    const converter = labelSettings.unit === 'mm' ? MM_TO_PX : CM_TO_PX;
    
    const xInUnits = rawX / (converter * zoomLevel);
    const yInUnits = rawY / (converter * zoomLevel);
    
    // Ogranicz pozycję do obszaru etykiety
    const clampedX = Math.max(0, Math.min(labelSettings.width, xInUnits));
    const clampedY = Math.max(0, Math.min(labelSettings.height, yInUnits));
    
    // Aktualizuj pozycję elementu
    const updatedElements = labelSettings.elements.map((element: any) => {
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

  // Obsługa zakończenia przeciągania
  const handleDragEnd = () => {
    setDragging(false);
  };

  // Efekt dodający/usuwający nasłuchiwanie zdarzeń myszy
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
  }, [dragging, selectedElementId, dragOffset, zoomLevel, labelSettings]);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative mb-4">
        {/* Panel narzędziowy */}
        <div className="absolute -top-16 left-0 right-0 flex justify-between items-center">
          {/* Przyciski do wyboru elementu i innych akcji */}
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedElementId(null)}
              className="py-1 px-3 inline-flex justify-center items-center gap-2 rounded-md border font-medium bg-white text-gray-700 shadow-sm align-middle hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-600 transition-all text-sm dark:bg-neutral-700 dark:hover:bg-neutral-600 dark:border-neutral-600 dark:text-neutral-200 dark:hover:text-white dark:focus:ring-offset-neutral-800"
            >
              <span>Odznacz</span>
            </button>
          </div>
          
          {/* Kontrolki zoom */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleZoomChange(zoomLevel - 0.1)}
              className="p-1 rounded-md border font-medium bg-white text-gray-700 shadow-sm align-middle hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-600 transition-all text-sm dark:bg-neutral-700 dark:hover:bg-neutral-600 dark:border-neutral-600 dark:text-neutral-200 dark:hover:text-white dark:focus:ring-offset-neutral-800"
              disabled={zoomLevel <= 0.5}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
              </svg>
            </button>
            
            <span className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
              {Math.round(zoomLevel * 100)}%
            </span>
            
            <button
              onClick={() => handleZoomChange(zoomLevel + 0.1)}
              className="p-1 rounded-md border font-medium bg-white text-gray-700 shadow-sm align-middle hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-600 transition-all text-sm dark:bg-neutral-700 dark:hover:bg-neutral-600 dark:border-neutral-600 dark:text-neutral-200 dark:hover:text-white dark:focus:ring-offset-neutral-800"
              disabled={zoomLevel >= 5}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
            
            <button
              onClick={() => {
                // Auto-fit do rozmiaru widoku
                if (containerRef.current && editorRef.current) {
                  const containerWidth = containerRef.current.clientWidth;
                  const containerHeight = containerRef.current.clientHeight;
                  const labelWidthPx = calculatePixelSize(labelSettings.width, labelSettings.unit);
                  const labelHeightPx = calculatePixelSize(labelSettings.height, labelSettings.unit);
                    
                  const horizontalRatio = (containerWidth * 0.9) / labelWidthPx;
                  const verticalRatio = (containerHeight * 0.9) / labelHeightPx;
                  let autoZoom = Math.min(horizontalRatio, verticalRatio);
                  autoZoom = Math.max(Math.min(autoZoom, 5), 0.5);
                  
                  setZoomLevel(autoZoom);
                }
              }}
              className="py-1 px-2 rounded-md border font-medium bg-white text-gray-700 shadow-sm align-middle hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-600 transition-all text-sm dark:bg-neutral-700 dark:hover:bg-neutral-600 dark:border-neutral-600 dark:text-neutral-200 dark:hover:text-white dark:focus:ring-offset-neutral-800"
            >
              <span className="text-xs">Dopasuj</span>
            </button>
          </div>
        </div>
        
        {/* Kontener edytora etykiety z obsługą kółka myszy */}
        <div 
          ref={containerRef}
          className="relative w-full h-[500px] flex items-center justify-center overflow-auto p-8"
          onWheel={handleWheel}
        >
          {/* Etykieta */}
          <div 
            ref={editorRef}
            style={{
              width: `${calculatePixelSize(labelSettings.width, labelSettings.unit) * zoomLevel}px`,
              height: `${calculatePixelSize(labelSettings.height, labelSettings.unit) * zoomLevel}px`,
              border: '1px dashed #ccc',
              position: 'relative',
              backgroundColor: 'white',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
            }}
            onClick={() => setSelectedElementId(null)}
          >
            {/* Linie pomocnicze */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/2 h-full w-px bg-gray-200 z-10"></div>
              <div className="absolute left-0 top-1/2 w-full h-px bg-gray-200 z-10"></div>
            </div>
            
            {/* Renderowanie elementów */}
            {labelSettings.elements.map((element: any) => {
              const isSelected = selectedElementId === element.id;
              const posX = calculatePixelSize(element.x, labelSettings.unit) * zoomLevel;
              const posY = calculatePixelSize(element.y, labelSettings.unit) * zoomLevel;
              // Domyślny kolor to ciemno szary, jeśli nie został wcześniej określony
              const textColor = element.color || '#333333';
              
              switch (element.type) {
                case 'qrCode':
                  const qrSize = calculatePixelSize(element.width, labelSettings.unit) * zoomLevel;
                  return (
                    <div 
                      key={element.id}
                      className={`absolute cursor-move ${isSelected ? 'outline outline-2 outline-blue-500' : ''}`}
                      style={{
                        left: `${posX}px`,
                        top: `${posY}px`,
                        width: `${qrSize}px`,
                        height: `${qrSize}px`,
                        zIndex: isSelected ? 10 : 1
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
                        <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                  );
                  
                case 'uuidText':
                  return (
                    <div 
                      key={element.id}
                      className={`absolute cursor-move ${isSelected ? 'outline outline-2 outline-blue-500' : ''}`}
                      style={{
                        left: `${posX}px`,
                        top: `${posY}px`,
                        zIndex: isSelected ? 10 : 1,
                        padding: '2px',
                        fontSize: `${element.size * zoomLevel}px`,
                        fontFamily: 'monospace',
                        maxWidth: `${calculatePixelSize(labelSettings.width - element.x, labelSettings.unit) * zoomLevel}px`,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        color: textColor
                      }}
                      onMouseDown={(e) => handleDragStart(e, element.id, element.type)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedElementId(element.id);
                      }}
                    >
                      {element.value}
                      {isSelected && (
                        <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                  );
                  
                case 'company':
                  return (
                    <div 
                      key={element.id}
                      className={`absolute cursor-move ${isSelected ? 'outline outline-2 outline-blue-500' : ''}`}
                      style={{
                        left: `${posX}px`,
                        top: `${posY}px`,
                        zIndex: isSelected ? 10 : 1,
                        padding: '2px',
                        fontSize: `${element.size * zoomLevel}px`,
                        fontWeight: 'bold',
                        maxWidth: `${calculatePixelSize(labelSettings.width - element.x, labelSettings.unit) * zoomLevel}px`,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        color: textColor
                      }}
                      onMouseDown={(e) => handleDragStart(e, element.id, element.type)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedElementId(element.id);
                      }}
                    >
                      {element.value}
                      {isSelected && (
                        <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                  );
                  
                case 'product':
                  return (
                    <div 
                      key={element.id}
                      className={`absolute cursor-move ${isSelected ? 'outline outline-2 outline-blue-500' : ''}`}
                      style={{
                        left: `${posX}px`,
                        top: `${posY}px`,
                        zIndex: isSelected ? 10 : 1,
                        padding: '2px',
                        fontSize: `${element.size * zoomLevel}px`,
                        maxWidth: `${calculatePixelSize(labelSettings.width - element.x, labelSettings.unit) * zoomLevel}px`,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        color: textColor
                      }}
                      onMouseDown={(e) => handleDragStart(e, element.id, element.type)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedElementId(element.id);
                      }}
                    >
                      {element.value}
                      {isSelected && (
                        <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
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
        
        {/* Informacje o wymiarach */}
        <div className="mt-2 text-sm text-center text-gray-500">
          {labelSettings.width} × {labelSettings.height} {labelSettings.unit}
        </div>
      </div>
    </div>
  );
}