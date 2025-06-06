// Label Canvas component for label rendering
"use client";

import { useState, useRef, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Label, LabelElement } from '@/services/labelStorage';

interface LabelCanvasProps {
  label: Label;
  editable?: boolean;
  onElementChange?: (element: LabelElement) => void;
  onElementSelect?: (elementId: string | null) => void;
  className?: string;
}

export default function LabelCanvas({ 
  label, 
  editable = true, 
  onElementChange, 
  onElementSelect, 
  className = "" 
}: LabelCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [scale, setScale] = useState<number>(1); // Skala do wyświetlania

  // Obsługa wyboru elementu
  const handleElementSelect = (elementId: string | null) => {
    setSelectedElementId(elementId);
    if (onElementSelect) {
      onElementSelect(elementId);
    }
  };

  // Konwersja mm do pikseli (zależne od rozdzielczości ekranu)
  const mmToPixels = (mm: number): number => {
    // Przyjmujemy, że 1mm = ~3.7795 pikseli przy 96 DPI
    return mm * 3.7795 * scale;
  };

  return (
    <div 
      className={`relative border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden ${className}`}
      style={{
        width: `${mmToPixels(label.width)}px`,
        height: `${mmToPixels(label.height)}px`,
        position: 'relative',
      }}
      ref={canvasRef}
    >
      {/* Renderowanie elementów etykiety */}
      {label.elements.map((element) => (
        <div
          key={element.id}
          className={`absolute ${selectedElementId === element.id ? 'ring-2 ring-blue-500' : ''} ${editable ? 'cursor-move' : ''}`}
          style={{
            left: `${mmToPixels(element.x)}px`,
            top: `${mmToPixels(element.y)}px`,
            width: `${mmToPixels(element.width || 20)}px`,
            height: `${mmToPixels(element.height || 20)}px`,
            transform: `rotate(${element.rotation || 0}deg)`,
            zIndex: selectedElementId === element.id ? 10 : 1,
          }}
          onClick={() => editable && handleElementSelect(element.id)}
        >
          {/* Renderowanie różnych typów elementów */}
          {(element.type === 'text' || element.type === 'uuidText' || element.type === 'company' || element.type === 'product') && (
            <span 
              style={{
                position: 'absolute',
                padding: 0,
                margin: 0,
                border: 0,
                left: 0,
                top: 0,
                fontSize: `${element.fontSize || (element.properties as any)?.fontSize || 12}px`,
                fontFamily: (element.properties as any)?.fontFamily || 'Arial',
                color: element.color || (element.properties as any)?.color || '#333333',
                fontWeight: (element.properties as any)?.bold ? 'bold' : 'normal',
                fontStyle: (element.properties as any)?.italic ? 'italic' : 'normal',
                textDecoration: (element.properties as any)?.strikethrough ? 'line-through' : 'none',
                maxWidth: `${mmToPixels(element.width || 50)}px`,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                lineHeight: 1,
                boxSizing: 'content-box',
                display: 'block',
                transformOrigin: 'top left',
                fontKerning: 'none',
                letterSpacing: 'normal',
                wordSpacing: 'normal',
                textRendering: 'geometricPrecision',
              }}
            >
              {element.value || ''}
            </span>
          )}
          
          {element.type === 'qrCode' && (
            <div className="absolute top-0 left-0 flex items-center justify-center w-full h-full">
              <QRCodeSVG
                value={element.value || "https://example.com"}
                size={Math.max(10, mmToPixels(element.width || 20) - 8)}
                bgColor={"#ffffff"}
                fgColor={element.color || "#333333"}
                level={"L"}
                includeMargin={false}
              />
            </div>
          )}
          
          {element.type === 'image' && (
            <img 
              src={(element.properties as any).src} 
              alt={(element.properties as any).alt} 
              className="w-full h-full"
              style={{
                objectFit: (element.properties as any).objectFit as any,
              }}
            />
          )}
          
          {element.type === 'shape' && (
            <div 
              className="w-full h-full"
              style={{
                backgroundColor: (element.properties as any).shapeType !== 'line' ? (element.properties as any).fillColor : 'transparent',
                border: (element.properties as any).shapeType !== 'line' ? `${(element.properties as any).strokeWidth}px solid ${(element.properties as any).strokeColor}` : 'none',
                borderRadius: (element.properties as any).shapeType === 'ellipse' ? '50%' : '0',
              }}
            >
              {(element.properties as any).shapeType === 'line' && (
                <div 
                  className="absolute"
                  style={{
                    width: '100%',
                    height: `${(element.properties as any).strokeWidth}px`,
                    backgroundColor: (element.properties as any).strokeColor,
                    top: '50%',
                    transform: 'translateY(-50%)',
                  }}
                />
              )}
            </div>
          )}
          
          {element.type === 'barcode' && (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <div className="text-xs mb-1">
                [{(element.properties as any).barcodeType}] {(element.properties as any).value}
              </div>
              <div className="flex-1 w-full bg-gray-300 flex items-center justify-center">
                {/* W przyszłości tutaj będzie prawdziwy kod kreskowy */}
                <span className="text-xs">Barcode Placeholder</span>
              </div>
              {(element.properties as any).includeText && (
                <div className="text-xs mt-1">{(element.properties as any).value}</div>
              )}
            </div>
          )}
          
          {/* Kontrolki do edycji dla zaznaczonego elementu (gdy jest edytowalny) */}
          {editable && selectedElementId === element.id && (
            <>
              {/* Uchwyt do zmiany rozmiaru */}
              <div className="absolute right-0 bottom-0 w-4 h-4 bg-blue-500 rounded-full cursor-nwse-resize" />
              
              {/* Uchwyt do obracania */}
              <div className="absolute top-0 right-0 w-4 h-4 bg-green-500 rounded-full cursor-crosshair" />
              
              {/* Uchwyt do usuwania */}
              <div className="absolute top-0 left-0 w-4 h-4 bg-red-500 rounded-full cursor-pointer" />
            </>
          )}
        </div>
      ))}

      {/* Opcje zmiany skali */}
      {editable && (
        <div className="absolute bottom-2 right-2 bg-white dark:bg-gray-700 rounded shadow-md p-1 flex">
          <button 
            className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
            onClick={() => setScale(prev => Math.max(0.25, prev - 0.25))}
          >
            -
          </button>
          <span className="mx-1 text-xs">{Math.round(scale * 100)}%</span>
          <button 
            className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
            onClick={() => setScale(prev => Math.min(4, prev + 0.25))}
          >
            +
          </button>
        </div>
      )}
    </div>
  );
}