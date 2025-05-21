"use client";

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Label } from '@/lib/types/label.types';

interface LabelPreviewProps {
  label: Label;
  className?: string;
  fitContainer?: boolean;
  showBorder?: boolean;
}

export default function LabelPreview({ 
  label, 
  className = "", 
  fitContainer = false,
  showBorder = true
}: LabelPreviewProps) {
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

  // Określenie stosunku szerokości do wysokości
  const aspectRatio = label.width / label.height;

  // Obliczenie szerokości i wysokości w pikselach
  const widthPx = mmToPx(label.width);
  const heightPx = mmToPx(label.height);

  return (
    <div 
      className={`relative ${showBorder ? 'border border-gray-300 dark:border-gray-700' : ''} 
        bg-white dark:bg-gray-800 overflow-hidden ${className} 
        ${fitContainer ? 'w-full h-full' : ''} 
        transition-all duration-300`}
      style={{
        width: fitContainer ? '100%' : `${widthPx}px`,
        height: fitContainer ? '100%' : `${heightPx}px`,
        maxWidth: '100%',
        maxHeight: '100%',
        aspectRatio: fitContainer ? `${aspectRatio}` : 'auto',
        position: 'relative',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
      }}
    >
      {/* Renderujemy elementy etykiety */}
      {label.elements.map((element) => {
        // Obliczamy współczynnik skalowania dla trybu dopasowania do kontenera
        const scaleFactorX = fitContainer ? 1 : 1;
        const scaleFactorY = fitContainer ? 1 : 1;
        
        const posX = mmToPx(element.x) * scaleFactorX;
        const posY = mmToPx(element.y) * scaleFactorY;
        const textColor = element.color || '#333333';
        
        switch (element.type) {
          case 'qrCode':
            const qrSize = mmToPx(element.width || 20) * Math.min(scaleFactorX, scaleFactorY);
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
                <div className="bg-white p-1 h-full w-full flex items-center justify-center rounded-sm">
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
                  maxWidth: `${mmToPx(label.width - element.x) * scaleFactorX}px`,
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
                  maxWidth: `${mmToPx(label.width - element.x) * scaleFactorX}px`,
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
                  maxWidth: `${mmToPx(label.width - element.x) * scaleFactorX}px`,
                  color: textColor
                }}
              >
                {element.value}
              </div>
            );
          
          case 'barcode':
            return (
              <div 
                key={element.id}
                className="absolute truncate flex items-center justify-center"
                style={{
                  left: `${posX}px`,
                  top: `${posY}px`,
                  width: `${mmToPx(element.width || 30) * scaleFactorX}px`,
                  height: `${mmToPx(element.height || 10) * scaleFactorY}px`,
                  backgroundColor: '#ffffff',
                  padding: '1px',
                  borderRadius: '2px'
                }}
              >
                <div className="text-xs text-center">Barcode:{element.value || "12345678"}</div>
              </div>
            );
            
          default:
            return null;
        }
      })}
      
      {/* Dodaj efekt nakładki przy braku elementów */}
      {label.elements.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm font-medium">
          Pusta etykieta
        </div>
      )}
    </div>
  );
}