"use client";

import { QRCodeSVG } from 'qrcode.react';
import { Label } from '@/lib/types/label.types';

interface LabelPreviewProps {
  label: Label;
  className?: string;
}

export default function LabelPreview({ label, className = "" }: LabelPreviewProps) {
  // Stałe do konwersji mm na piksele
  const MM_TO_PX_FACTOR = 2; // Niższy współczynnik konwersji dla podglądu (zoptymalizowane)
  
  // Funkcja konwertująca mm na piksele dla podglądu
  const mmToPx = (mm: number): number => {
    return mm * MM_TO_PX_FACTOR;
  };

  // Funkcja wybierająca optymalny kontrast tekstu
  const getContrastColor = (bgColor?: string): string => {
    if (!bgColor || bgColor === 'transparent') return '#333333';
    
    // Uproszczony algorytm dla kontrastu - dla podglądu wystarczy
    if (bgColor.startsWith('#')) {
      const r = parseInt(bgColor.slice(1, 3), 16);
      const g = parseInt(bgColor.slice(3, 5), 16);
      const b = parseInt(bgColor.slice(5, 7), 16);
      
      return (r * 0.299 + g * 0.587 + b * 0.114) > 186 ? '#333333' : '#ffffff';
    }
    
    return '#333333';
  };

  return (
    <div 
      className={`relative border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden ${className}`}
      style={{
        width: `${mmToPx(label.width)}px`,
        height: `${mmToPx(label.height)}px`,
        position: 'relative',
      }}
    >
      {/* Renderujemy elementy etykiety */}
      {label.elements.map((element) => {
        const posX = mmToPx(element.x);
        const posY = mmToPx(element.y);
        const textColor = element.color || '#333333';
        
        switch (element.type) {
          case 'qrCode':
            const qrSize = mmToPx(element.width || 20);
            return (
              <div 
                key={element.id}
                className="absolute"
                style={{
                  left: `${posX}px`,
                  top: `${posY}px`,
                  width: `${qrSize}px`,
                  height: `${qrSize}px`,
                }}
              >
                <div className="bg-white p-1 h-full w-full flex items-center justify-center">
                  <QRCodeSVG
                    value={element.value || "https://example.com"}
                    size={Math.max(10, qrSize - 4)}
                    bgColor={"#ffffff"}
                    fgColor={element.color || "#333333"}
                    level={"L"}
                    includeMargin={false}
                  />
                </div>
              </div>
            );

          case 'uuidText':
            return (
              <div 
                key={element.id}
                className="absolute truncate"
                style={{
                  left: `${posX}px`,
                  top: `${posY}px`,
                  fontSize: `${element.size ? element.size * 0.7 : 6}px`,
                  fontFamily: 'monospace',
                  maxWidth: `${mmToPx(label.width - element.x)}px`,
                  color: textColor
                }}
              >
                {element.value}
              </div>
            );
            
          case 'company':
            return (
              <div 
                key={element.id}
                className="absolute font-bold truncate"
                style={{
                  left: `${posX}px`,
                  top: `${posY}px`,
                  fontSize: `${element.size ? element.size * 0.7 : 8}px`,
                  fontWeight: 'bold',
                  maxWidth: `${mmToPx(label.width - element.x)}px`,
                  color: textColor
                }}
              >
                {element.value}
              </div>
            );
            
          case 'product':
            return (
              <div 
                key={element.id}
                className="absolute truncate"
                style={{
                  left: `${posX}px`,
                  top: `${posY}px`,
                  fontSize: `${element.size ? element.size * 0.7 : 7}px`,
                  maxWidth: `${mmToPx(label.width - element.x)}px`,
                  color: textColor
                }}
              >
                {element.value}
              </div>
            );
            
          default:
            return null;
        }
      })}
    </div>
  );
}